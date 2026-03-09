import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { orchestrateCampaign, getJobStatus } from './controllers/orchestrator';
import {
  getWorkspace,
  updateWorkspace,
  getCampaigns,
  updateCampaignStatus,
  getExperiments,
  updateExperimentStatus,
  getAudiences,
  reclusterAudience,
  getCreatives,
  getUser,
  updateUser,
} from './controllers/dataController';

const app: Express = express();
const port = parseInt(process.env.PORT || '8080', 10);

app.use(helmet());
// Allow requests from both Next.js ports
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] }));
app.use(express.json());
app.use(morgan('dev'));

// Core Health Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'AdOptimizer Agent API' });
});

// Agent Orchestration Endpoints
app.post('/api/v1/campaigns/orchestrate', orchestrateCampaign);
app.get('/api/v1/campaigns/orchestrate/:jobId', getJobStatus);

// Workspace Endpoints
app.get('/api/v1/workspace', getWorkspace);
app.put('/api/v1/workspace/settings', updateWorkspace);

// Campaign Endpoints
app.get('/api/v1/campaigns', getCampaigns);
app.put('/api/v1/campaigns/:id/status', updateCampaignStatus);

// Experiment Endpoints
app.get('/api/v1/experiments', getExperiments);
app.put('/api/v1/experiments/:id/status', updateExperimentStatus);

// Audience Endpoints
app.get('/api/v1/audiences', getAudiences);
app.post('/api/v1/audiences/recluster', reclusterAudience);

// Creative Endpoints
app.get('/api/v1/creatives', getCreatives);

// User Profile Endpoints
app.get('/api/v1/user', getUser);
app.put('/api/v1/user', updateUser);

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: AdOptimizer API running at http://localhost:${port}`);
});
