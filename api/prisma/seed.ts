import Database from 'better-sqlite3';
import crypto from 'crypto';

const db = new Database('dev.db');

function seed() {
  console.log('Seeding the database with initial mock data via raw SQLite...');

  // 1. Create Workspace
  const workspaceId = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO Workspace (id, name, tier, timezone, currency, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(workspaceId, 'Acme Corp Performance', 'SCALE', 'UTC', 'usd', now, now);

  console.log(`Created Workspace: Acme Corp Performance (${workspaceId})`);

  // 2. Integrations
  const insertIntegration = db.prepare(`
    INSERT INTO Integration (id, workspaceId, platform, accessToken, adAccountId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertIntegration.run(crypto.randomUUID(), workspaceId, 'META', 'mock_meta_token', 'act_123456789', now, now);
  insertIntegration.run(crypto.randomUUID(), workspaceId, 'GOOGLE', 'mock_google_token', '987-654-3210', now, now);

  // 3. Campaign Goals
  const campaignsData = [
    { name: "Q3 Holiday Push", status: "ACTIVE", spend: 4200, roas: 3.2, targetRoas: 3.5, maxCpa: 50, dailyBudgetLimit: 1000 },
    { name: "Retargeting Cart Abandoners", status: "ACTIVE", spend: 1800, roas: 4.5, targetRoas: 4.0, maxCpa: 25, dailyBudgetLimit: 500 },
    { name: "Cold Lookalike Testing", status: "LEARNING", spend: 800, roas: 1.2, targetRoas: 2.0, maxCpa: 60, dailyBudgetLimit: 250 },
    { name: "Spring Collection Preview", status: "PAUSED", spend: 12400, roas: 2.8, targetRoas: 3.0, maxCpa: 45, dailyBudgetLimit: 2000 },
  ];

  const insertCampaign = db.prepare(`
    INSERT INTO CampaignGoal (id, workspaceId, name, targetRoas, maxCpa, dailyBudgetLimit, status, spend, roas, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const campaigns = campaignsData.map(c => {
    const id = crypto.randomUUID();
    insertCampaign.run(id, workspaceId, c.name, c.targetRoas, c.maxCpa, c.dailyBudgetLimit, c.status, c.spend, c.roas, now, now);
    return id;
  });

  // 4. Creative Assets
  const creativesData = [
    { headline: "Stop wasting ad spend on manual tests.", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600", roas: 4.2, status: "WINNING", aiGenerated: 1 },
    { headline: "The AI media buyer that works 24/7.", imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600", roas: 3.8, status: "ACTIVE", aiGenerated: 1 },
    { headline: "Skyrocket your ROAS without touching Ads Manager.", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600", roas: 2.1, status: "LEARNING", aiGenerated: 0 },
    { headline: "Are your creatives fatigued?", imageUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=600", roas: 0.8, status: "FATIGUED", aiGenerated: 1 },
  ];

  const insertCreative = db.prepare(`
    INSERT INTO CreativeAsset (id, workspaceId, imageUrl, headline, bodyCopy, aiGenerated, status, roas, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)
  `);
  const creatives = creativesData.map(c => {
    const id = crypto.randomUUID();
    insertCreative.run(id, workspaceId, c.imageUrl, c.headline, c.aiGenerated, c.status, c.roas, now, now);
    return id;
  });

  // 5. Audiences
  const audiencesData = [
    { name: "High-LTV Cluster (Primary)", size: "450k", performance: "EXCELLENT", roas: 4.8, cpa: 24 },
    { name: "Lookalike: Cart Abandoners 1%", size: "2.1M", performance: "GOOD", roas: 3.2, cpa: 31 },
    { name: "Broad Tech & SaaS Evaluators", size: "14.5M", performance: "LEARNING", roas: 1.9, cpa: 58 },
    { name: "Competitor Engagers (AI Gen)", size: "850k", performance: "DEGRADING", roas: 1.2, cpa: 85 },
  ];

  const insertAudience = db.prepare(`
    INSERT INTO Audience (id, workspaceId, name, size, performance, roas, cpa, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const audiences = audiencesData.map(a => {
    const id = crypto.randomUUID();
    insertAudience.run(id, workspaceId, a.name, a.size, a.performance, a.roas, a.cpa, now, now);
    return id;
  });

  // 6. Experiments
  const experimentsData = [
    { campaignGoalId: campaigns[0], creativeAssetId: creatives[0], audienceId: audiences[0], platform: "Meta", status: "SCALING", spend: 4520, roas: 4.2, cpa: 18.5, trend: "up" },
    { campaignGoalId: campaigns[0], creativeAssetId: creatives[1], audienceId: audiences[1], platform: "Meta", status: "LEARNING", spend: 850, roas: 1.8, cpa: 45.2, trend: "down" },
    { campaignGoalId: campaigns[2], creativeAssetId: creatives[2], audienceId: audiences[2], platform: "TikTok", status: "TERMINATED", spend: 1200, roas: 0.9, cpa: 85.0, trend: "down" },
    { campaignGoalId: campaigns[2], creativeAssetId: creatives[3], audienceId: audiences[3], platform: "Google", status: "SCALING", spend: 8900, roas: 3.8, cpa: 22.1, trend: "up" },
    { campaignGoalId: campaigns[3], creativeAssetId: creatives[0], audienceId: audiences[0], platform: "Meta", status: "ACTIVE", spend: 2100, roas: 2.1, cpa: 32.4, trend: "up" },
  ];

  const insertExperiment = db.prepare(`
    INSERT INTO Experiment (id, campaignGoalId, creativeAssetId, audienceId, platform, status, spend, roas, cpa, trend, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  experimentsData.forEach(e => {
    insertExperiment.run(crypto.randomUUID(), e.campaignGoalId, e.creativeAssetId, e.audienceId, e.platform, e.status, e.spend, e.roas, e.cpa, e.trend, now, now);
  });

  console.log('Database seeded successfully completely bypassing Prisma!');
}

try {
  seed();
} catch (e) {
  console.error("Failed to seed db:", e);
  process.exit(1);
}
