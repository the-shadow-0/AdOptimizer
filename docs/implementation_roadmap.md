# Implementation Roadmap & Developer Blueprint

This blueprint outlines the immediate steps for the engineering team to bootstrap the AdOptimizer SaaS.

## GitHub Repository Structure

A monorepo (e.g., using Turborepo or Nx) is recommended to share types across the frontend, backend, and agent workers.

```text
AdOptimizer/
├── apps/
│   ├── web/                     # Next.js 14 Frontend UI
│   │   ├── src/app/
│   │   ├── src/components/
│   │   └── tailwind.config.js
│   ├── api/                     # Node.js Serverless Backend (Express/Fastify)
│   │   ├── src/controllers/
│   │   ├── src/routes/
│   │   └── serverless.yml
│   └── agent-orchestrator/      # Node.js background worker (BullMQ)
│       ├── src/agents/          # Audience, Creative, Bidding, Attribution logic
│       └── src/jobs/
├── packages/
│   ├── db/                      # Prisma or Drizzle ORM schema + migrations
│   ├── config/                  # ESLint, Prettier, TSConfig
│   ├── ui/                      # Shared component library (shadcn/ui)
│   └── ad-adapters/             # Standardized integrations for Meta, Google, etc.
├── docs/                        # Architecture and System blueprints
├── README.md
└── package.json                 # Monorepo workspaces
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
1. Initialize the Turborepo monorepo with Next.js, a Node.js API, and a Database package (PostgreSQL via Drizzle ORM).
2. Build the basic Next.js Dashboard UI (mocked metrics).
3. Implement the `MetaAdsAdapter` to read existing ad account data (Read-only OAuth integration).

### Phase 2: The Agentic Loop (Weeks 4-7)
1. Provision the local GPU compute instances. Map IP addresses securely to the `agent-orchestrator` process.
2. Build the Event Ingestion Pipeline (e.g., Kinesis -> ClickHouse) to start recording Meta Ads intraday telemetry.
3. Construct the `Creative Agent` invoking Ollama and DALL-E 3, storing results in Cloudinary.
4. Construct the `Bidding Agent` to listen to telemetry and issue bid adjustments to the Meta API.

### Phase 3: Platform Launch (Weeks 8-10)
1. Complete the "Campaign Builder Wizard" UI connecting the generative flows together.
2. Implement User Authentication and Stripe Billing.
3. Test end-to-end on a real Meta Ad account with a controlled $100/day test budget to observe the agent optimization loop in production.

## Future Product Expansion

Once the core MVP is stable, AdOptimizer will expand its moat into:

1. **Cross-Account Budget Intelligence:** AI moves budget not just across campaigns but across completely different ad platforms (e.g., shifting spend from Google to TikTok when Google CPA jumps).
2. **Predictive Ad Trend Detection:** A globally scanning agent that analyzes viral TikTok/Reels formats and generates equivalent "hook" suggestions for user brands.
3. **Automated Landing Page Generation:** Closing the conversion loop by dynamically creating Next.js landing pages tailored to the user segment that clicked the AI-generated ad.
