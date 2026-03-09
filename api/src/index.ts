import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { orchestrateCampaign, getJobStatus } from './controllers/orchestrator';

const app: Express = express();
const port = parseInt(process.env.PORT || '8080', 10);

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Core Health Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'AdOptimizer Agent API' });
});

// Agent Orchestration Endpoints
app.post('/api/v1/campaigns/orchestrate', orchestrateCampaign);
app.get('/api/v1/campaigns/orchestrate/:jobId', getJobStatus);

// Data Endpoints
import {
  getWorkspace,
  updateWorkspace,
  getCampaigns,
  updateCampaignStatus,
  getExperiments,
  updateExperimentStatus,
  getAudiences,
  reclusterAudience,
  getCreatives
} from './controllers/dataController';

app.get('/api/v1/workspace', getWorkspace);
app.put('/api/v1/workspace/settings', updateWorkspace);
app.get('/api/v1/campaigns', getCampaigns);
app.put('/api/v1/campaigns/:id/status', updateCampaignStatus);
app.get('/api/v1/experiments', getExperiments);
app.put('/api/v1/experiments/:id/status', updateExperimentStatus);
app.get('/api/v1/audiences', getAudiences);
app.post('/api/v1/audiences/recluster', reclusterAudience);
app.get('/api/v1/creatives', getCreatives);

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: AdOptimizer API running at http://localhost:${port}`);
});
