import { Request, Response } from 'express';
import { OllamaAgent } from '../services/OllamaAgent';
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
const ollamaAgent = new OllamaAgent();

// In-memory job status store for polling
const jobStore: Record<string, { status: string; results: any | null }> = {};

export async function orchestrateCampaign(req: Request, res: Response) {
  const { url, targetRoas, dailyBudget, context, workspaceId } = req.body;
  const jobId = `job_${Date.now()}`;

  jobStore[jobId] = { status: 'learning', results: null };

  // Return immediately with the job ID for polling
  res.status(202).json({ success: true, jobId, message: 'Agents dispatched.' });

  // Background orchestration
  (async () => {
    try {
      console.log(`[Orchestrator] Job ${jobId}: Generating creatives via Ollama...`);
      const creatives = await ollamaAgent.generateAdConcepts(
        context || 'A generic SaaS advertising optimization tool',
        3
      );

      // Get or use default workspace ID
      let wsId = workspaceId;
      if (!wsId) {
        const workspace = await prisma.workspace.findFirst();
        wsId = workspace?.id;
      }

      if (!wsId) {
        throw new Error('No workspace found in database. Please run the seed first.');
      }

      // Persist generated creatives to the database
      const savedCreatives = await Promise.all(
        creatives.map(c =>
          prisma.creativeAsset.create({
            data: {
              workspaceId: wsId,
              imageUrl: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600`,
              headline: c.headline,
              bodyCopy: c.bodyCopy,
              aiGenerated: true,
              status: 'LEARNING',
              performanceScore: parseFloat(c.predictedCTR?.replace('%', '') || '0'),
              roas: 0,
            }
          })
        )
      );

      console.log(`[Orchestrator] Job ${jobId}: Saved ${savedCreatives.length} creatives to DB.`);

      // Also persist a new campaign goal from the input
      let newCampaign: any = null;
      if (url && wsId) {
        const name = `AI Campaign - ${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}`;
        newCampaign = await prisma.campaignGoal.create({
          data: {
            workspaceId: wsId,
            name,
            targetRoas: parseFloat(targetRoas || '3.0'),
            maxCpa: 50,
            dailyBudgetLimit: parseFloat(dailyBudget || '1000'),
            status: 'LEARNING',
          }
        });
        console.log(`[Orchestrator] Saved new campaign goal: ${newCampaign.name}`);
      }

      // Return results for UI display (use raw creative objects for rich display)
      jobStore[jobId].status = 'completed';
      jobStore[jobId].results = {
        creatives: creatives.map((c, i) => ({
          ...c,
          id: savedCreatives[i].id,
        })),
        audiences: [
          { name: 'High-LTV Cluster (AI Discovered)', size: '420k' },
          { name: 'Lookalike 1% - Past Converters', size: '2.1M' },
          { name: 'Broad Interest Contextual', size: '8.4M' },
        ],
        campaign: newCampaign,
      };

    } catch (err) {
      jobStore[jobId].status = 'failed';
      console.error(`[Orchestrator] Job ${jobId} failed:`, err);
    }
  })();
}

export function getJobStatus(req: Request, res: Response) {
  const jobId = req.params.jobId as string;
  const job = jobStore[jobId];
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
}
