# UI/UX & Brand Identity System

AdOptimizer's platform must feel like a premium, billion-dollar SaaS. It replaces clunky spreadsheets and outdated ad managers with a sleek, intelligent, and highly legible interface.

## Brand Design

- **Brand Personality:** Intelligent, Precision-driven, Trustworthy, Cutting-edge.
- **Brand Values:** Automation over manual labor, Data over intuition, Scale without complexity.
- **Color Palette:**
  - **Primary:** Neon Indigo (`#4F46E5`) — represents AI and intelligence.
  - **Secondary:** Cyber Teal (`#0D9488`) — represents growth and money/ROAS.
  - **Background (Dark Mode Default):** Deep Obsidian (`#0F172A`) for a premium "pro tool" aesthetic.
  - **Surface:** Slate (`#1E293B`) with glassmorphism (translucency + background blur).
  - **Text:** Crisp White (`#F8FAFC`) and Muted Gray (`#94A3B8`).
- **Typography:**
  - **Headers:** `Outfit` (Modern, geometric, tech-forward).
  - **Body text & Data/Numbers:** `Inter` (Highly legible for dense data tables).
  
## Logo Design Concept

- **Concept Name:** The "Optimization Helix"
- **Symbol:** An abstract, continuous loop (infinity symbol or helix) morphing into an upward-trending arrow. 
- **Meaning:** Represents the continuous, autonomous optimization loop (the AI agents) and the ultimate goal: upward growth and scaling returns.
- **Color Scheme:** A smooth horizontal gradient from Cyber Teal to Neon Indigo.
- **Icon Usage:** The standalone helix serves as the app icon and favicon. The wordmark uses the `Outfit` typeface with wide tracking.

## Next.js Frontend Features & Architecture

Built with Next.js 14 (App Router), React, and TailwindCSS.

### Core Views

1. **Campaign Builder Wizard (`/campaigns/new`)**
   - Step-by-step generative UI. User sets the budget, target ROAS, and URLs. The UI dynamically shows the AI brainstorming audiences and creatives in real-time.
2. **Performance Dashboard (`/dashboard`)**
   - High-level executive view. Large KPI cards for Spend, Revenue, True ROAS, and Blended CPA.
   - Real-time animated graph showing the AI adjusting bids throughout the day.
3. **Experiment Monitor (`/experiments`)**
   - A Kanban-style or Table view of thousands of micro-experiments.
   - States: `Learning`, `Scaling (Winner)`, `Terminated (Loser)`.
4. **Creative Studio & Asset Library (`/creatives`)**
   - Masonry grid of AI-generated assets.
   - Performance badges on each image (e.g., "Top 5% CTR").
5. **Audience Explorer (`/audiences`)**
   - 3D cluster visualizations of user segments the AI has discovered.
6. **Budget Simulator (`/tools/simulator`)**
   - Interactive slider to project future revenue based on the Bidding Agent's predictive models.

### Frontend Component Structure

```text
src/
├── components/
│   ├── layout/       (Sidebar, Header, LayoutWrapper)
│   ├── ui/           (Reusable shadcn/ui inspired primitives: Buttons, Inputs, Cards)
│   ├── charts/       (Recharts wrappers for ROAS/CPA curves)
│   ├── generative/   (Skeletons, AI "Thinking" loaders, streaming text components)
│   └── tables/       (DataGrid for campaigns with sorting/virtualization)
├── app/
│   ├── (auth)/       (Login, Onboarding)
│   ├── dashboard/    (Performance Dashboard)
│   ├── campaigns/    (Campaign Builder)
│   ├── experiments/  (Experiment Monitor)
│   └── settings/     (API Integrations, Billing)
├── lib/
│   ├── utils.ts      (Tailwind clsx/merge helpers)
│   └── api.ts        (KY/Axios client pointing to Node.js backend)
```

## UI Style Guide Rules
- **Micro-interactions:** Buttons should have subtle scale transforms and glow effects on hover.
- **Data Densities:** Use toggles for "Comfortable" vs "Compact" table views. Marketers need to see data.
- **Empty States:** Never show a blank page. Empty states should prompt the user to let the AI generate the first iteration.
