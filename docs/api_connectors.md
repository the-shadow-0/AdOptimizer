# API Connectors & Backend Architecture

The Serverless Node.js backend handles frontend mutations, webhook ingestion, and dispatching commands to the AI agents. It also houses the Ad Platform Connectors.

## Integration Architecture

AdOptimizer uses a standard "Adapter Pattern" for ad platforms. The core orchestrator speaks a universal language (e.g., `DeployAd`, `PauseAd`, `GetSpend`), and the adapters translate this into platform-specific API calls.

### Implemented Adapters
- `MetaAdsAdapter`: Uses Facebook Marketing API to create Campaigns, AdSets, and Ads.
- `GoogleAdsAdapter`: Uses Google Ads API for Search, PMax, and Display network adjustments.
- `TikTokAdsAdapter`: Uses TikTok Marketing API.
- `CloudinaryAdapter`: Handles asset uploads and responsive transformations.

## Example API Routes (Node.js / Express or Next.js API Routes)

### 1. Unified Campaign Creation
**POST `/api/v1/campaigns/orchestrate`**
Triggered by the frontend wizard. Initializes the campaign and enqueues the agent generation jobs.
```javascript
app.post('/api/v1/campaigns/orchestrate', async (req, res) => {
  const { workspaceId, targetRoas, dailyBudget, coreWebsiteUrl } = req.body;
  
  // Save to DB
  const goal = await db.createCampaignGoal({ workspaceId, targetRoas, dailyBudget });
  
  // Enqueue async Agent jobs (No Docker, using Redis/BullMQ)
  await queue.add('agent-orchestrator', { 
    type: 'INITIAL_DISCOVERY',
    goalId: goal.id,
    url: coreWebsiteUrl 
  });
  
  return res.status(202).json({ success: true, goalId: goal.id, status: 'Learning Agents Dispatched' });
});
```

### 2. Internal Webhook: Agent Status Update
**POST `/api/v1/internal/agent-callback`**
The standalone GPU/Ollama instances POST back to the control plane when creatives are successfully generated.
```javascript
app.post('/api/v1/internal/agent-callback', async (req, res) => {
  const { goalId, newCreatives } = req.body;
  
  // Upload images to Cloudinary
  const uploadedAssets = await Promise.all(newCreatives.map(c => cloudinary.upload(c.base64)));
  
  // Save assets to DB
  await db.saveCreatives(goalId, uploadedAssets);
  
  // Trigger Frontend via Pusher/WebSockets
  eventBus.publish(`workspace-${workspaceId}`, 'CREATIVES_READY', uploadedAssets);
  
  res.send('OK');
});
```

### 3. Event Ingestion Pipeline (Attribution)
**POST `/api/v1/events/pixel`**
Ingests first-party pixel fires directly from the user's website to feed the attribution agent.
```javascript
app.post('/api/v1/events/pixel', async (req, res) => {
  const { workspaceId, clientId, eventType, value, platformAdId } = req.body;
  
  // Push to streaming pipeline (e.g. AWS Kinesis / Firehose) to avoid DB lockups
  await kinesis.putRecord({
    StreamName: 'AdOptimizer_Events',
    Data: JSON.stringify({ timestamp: Date.now(), workspaceId, clientId, eventType, value, platformAdId })
  });
  
  res.status(200).send('Logged');
});
```
