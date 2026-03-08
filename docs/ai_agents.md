# AI Agent Orchestration & Technical Design

The core of AdOptimizer is a multi-agent system orchestrated by an Antigravity-based control loop. The Agents operate autonomously to replace the manual media buying lifecycle.

## Agent Architecture

### 1. Creative Agent (Tool-Using Agent)
- **Role:** Generates ad copy, proposes images, and combats creative fatigue.
- **Tools:** 
  - `generateImage` (DALL-E 3 / Stable Diffusion)
  - `writeCopy` (Gemini 1.5 Pro / GPT-4o)
  - `searchAssetLibrary`
- **Logic Pipeline:**
  1. Receives "creative fatigue" alert from Orchestrator.
  2. Analyzes historically top-performing text/image pairs for the account.
  3. Uses Ollama local models to draft 50 headline variants.
  4. Uses cloud LLM tools to refine the top 5 concept angles.
  5. Generates corresponding imagery and uploads to Cloudinary.

### 2. Audience Agent
- **Role:** Analyzes CRM data and event streams to discover new targeting clusters.
- **Logic Pipeline:**
  1. Pulls highest-LTV users from the data warehouse.
  2. Runs dimensionality reduction to find common attributes.
  3. Pushes lookalike seeds to Facebook/Google APIs.
  4. Scores audiences daily based on predicted CPA.

### 3. Bidding Agent (Reasoning Agent)
- **Role:** Manages budgets and adjusts bids dynamically against auction volatility.
- **Logic Pipeline:**
  1. Reads intra-day ROAS/CPA telemetry.
  2. Predicts end-of-day performance using a probabilistic model.
  3. If CPA < Target, aggressively increase daily budget cap.
  4. If CPA > Target, throttle bids or pause the ad set.

### 4. Experiment Orchestrator Agent
- **Role:** The "CEO" of the loop. Maps the strategy and commands other agents.
- **Logic Pipeline:**
  1. Receives a Campaign Goal from the user UI.
  2. Commands Audience Agent to generate N segments.
  3. Commands Creative Agent to generate M creatives.
  4. Deploys N*M permutations to Ad Platforms.
  5. Terminates statistical losers; promotes winners to core scaling campaigns.

### 5. Attribution Agent
- **Role:** Reconciles multi-touch attribution.
- **Logic Pipeline:**
  1. Ingests GA4 and Ad Platform conversion events.
  2. Uses Markov chains or Shapley values to assign fractional credit to touchpoints.
  3. Computes the "True ROAS" and writes to the analytics warehouse for the Orchestrator to read.

## Pseudocode: Experiment Orchestrator Loop

```javascript
// A scheduled queue job running via BullMQ/Node.js
async function runOrchestratorTick(accountId, campaignGoal) {
  // 1. Fetch current experiment state
  const activeExperiments = await db.getActiveExperiments(accountId);
  
  // 2. Identify statistically significant losers
  for (const exp of activeExperiments) {
    const stats = await attributionAgent.getTrueMetrics(exp.id);
    if (stats.confidence > 0.95 && stats.roas < campaignGoal.minRoas) {
      await apiConnectors.pauseAd(exp.platformAdId);
      await db.markExperimentLost(exp.id);
    } else if (stats.confidence > 0.95 && stats.roas > campaignGoal.targetRoas) {
      // 3. Promote winners
      await biddingAgent.scaleBudget(exp.platformAdId, 1.20); // 20% bump
    }
  }

  // 4. Detect if we need new variants
  const activeCount = await db.countActive(accountId);
  if (activeCount < campaignGoal.desiredConcurrency) {
    const newAudiences = await audienceAgent.generateLookalikes(accountId);
    const newCreatives = await creativeAgent.generateBatch(accountId);
    
    // Deploy combinations
    for (const aud of newAudiences) {
      for (const cre of newCreatives) {
        await apiConnectors.launchAd(accountId, aud, cre);
      }
    }
  }
}
```
