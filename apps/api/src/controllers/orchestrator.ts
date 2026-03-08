import { Request, Response } from 'express';
import { CreativeAgent } from '../services/CreativeAgent';

const creativeAgent = new CreativeAgent();

// Memory store for demo purposes (Normally Redis/Postgres)
const memoryStore: Record<string, any> = {};

export async function orchestrateCampaign(req: Request, res: Response) {
  const { workspaceId, targetRoas, url, context } = req.body;
  const jobId = `job_${Date.now()}`;
  
  memoryStore[jobId] = {
    status: 'learning',
    url,
    context,
    results: null
  };

  // Return immediately to the client
  res.status(202).json({
    success: true,
    jobId,
    message: 'Agents dispatched.'
  });

  // Background execution (Orchestrator Loop Mock)
  try {
     const creatives = await creativeAgent.generateAdConcepts(context || "A generic SaaS tool", 3);
     
     // Store the results
     memoryStore[jobId].status = 'completed';
     memoryStore[jobId].results = {
         creatives,
         audiences: [
             { name: "High-LTV Cluster", size: "450k" },
             { name: "Lookalike 1%", size: "2.1M" }
         ]
     };
     console.log(`[Orchestrator] Job ${jobId} completed. Generated ${creatives.length} creatives.`);
  } catch (e) {
     memoryStore[jobId].status = 'failed';
     console.error(`[Orchestrator] Job ${jobId} failed:`, e);
  }
}

export function getJobStatus(req: Request, res: Response) {
    const jobId = req.params.jobId as string;
    const job = memoryStore[jobId];
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
}
