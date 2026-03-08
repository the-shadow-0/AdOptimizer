# Database Schema & Data Layer

AdOptimizer relies on a high-throughput relational database (e.g., PostgreSQL natively or AWS Aurora) to store application state, paired with a temporal/analytics schema (e.g., ClickHouse or BigQuery) for event logging.

## Core Relational Schema (PostgreSQL)

### `Workspaces` (Tenants)
- `id` (UUID, PK)
- `name` (String)
- `tier` (Enum: GROWTH, PRO, AGENCY)
- `stripe_customer_id` (String)

### `Integrations`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK)
- `platform` (Enum: META, GOOGLE, TIKTOK, GA4)
- `access_token` (Encrypted String)
- `ad_account_id` (String)

### `Campaign_Goals`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK)
- `name` (String)
- `target_roas` (Decimal)
- `max_cpa` (Decimal)
- `daily_budget_limit` (Decimal)
- `status` (Enum: DRAFT, LEARNING, ACTIVE, PAUSED)

### `Experiments` (Micro-Campaigns)
- `id` (UUID, PK)
- `campaign_goal_id` (UUID, FK)
- `platform_ad_id` (String)
- `creative_asset_id` (UUID, FK)
- `audience_id` (UUID, FK)
- `status` (Enum: DEPLOYED, SCALING, TERMINATED)
- `created_at` (Timestamp)

### `Creative_Assets`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK)
- `image_url` (String - Cloudinary URL)
- `headline` (Text)
- `body_copy` (Text)
- `ai_generated` (Boolean)
- `performance_score` (Decimal)

### `Audiences`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK)
- `platform_audience_id` (String)
- `size` (BigInt)
- `parameters` (JSONB - e.g., age, interests, lookalike seeds)

## Event Pipeline Schema (Analytics / ClickHouse)

Events stream in via the ingestion pipeline from Webhooks and API intervals.

### `Ad_Performance_Logs` (Time-series)
- `timestamp` (DateTime)
- `experiment_id` (UUID)
- `platform` (String)
- `spend` (Decimal)
- `impressions` (Int)
- `clicks` (Int)
- `conversions` (Int)
- `revenue` (Decimal)

### `Attribution_Touchpoints`
- `event_id` (UUID)
- `timestamp` (DateTime)
- `user_fingerprint` (String)
- `experiment_id` (UUID)
- `action_type` (Enum: VIEW, CLICK, ADD_TO_CART, PURCHASE)
- `value` (Decimal)
