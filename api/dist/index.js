"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const orchestrator_1 = require("./controllers/orchestrator");
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '8080', 10);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Core Health Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'AdOptimizer Agent API' });
});
// Agent Orchestration Endpoints
app.post('/api/v1/campaigns/orchestrate', orchestrator_1.orchestrateCampaign);
app.get('/api/v1/campaigns/orchestrate/:jobId', orchestrator_1.getJobStatus);
app.listen(port, '0.0.0.0', () => {
    console.log(`[server]: AdOptimizer API running at http://localhost:${port}`);
});
