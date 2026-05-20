# Enterprise Campaign Multi-Agent System Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully working V1 enterprise campaign operations product with admin-gated manual workflows first, then LLM/RAG-powered agent recommendations on top.

**Architecture:** Extend the existing Next.js/Supabase app with an enterprise campaign layer, admin approval gates, creator offer workflows, deliverable review, manual payout tracking, and a LangGraph-style multi-agent orchestration module. Supabase Postgres remains the source of truth; Supabase pgvector is used only for RAG context.

**Tech Stack:** Next.js, React, TypeScript, Supabase Postgres, Supabase RLS, Supabase pgvector, LangGraph JS, LangChain, OpenAI embeddings, zod, existing platform tests.

---

## Source Of Truth

This file is the implementation source of truth for the enterprise campaign agent system.

The product must ship in two layers:

1. **Manual V1 workflow:** admin and creator dashboards work end-to-end without LLM calls.
2. **LLM/RAG workflow:** agents generate recommendations, drafts, reviews, and payout prep, but every consequential action remains admin-gated.

Agents must never directly finalize creator selections, legal acceptance, brand-facing updates, or payouts.

## Product Outcome

Build an enterprise campaign workflow for managed creator campaigns.

Example campaign:

- Brand budget: `£10,000`
- Management fee: `20%`
- Management fee amount: `£2,000`
- Creator pool: `£8,000`
- Target creators: `10`
- Planned offer: `£600` per creator
- Committed creator payouts: `£6,000`
- Remaining creator budget buffer: `£2,000`
- Expected delivery: `45-60` videos per creator over one month

The finished product must let an admin:

- Create or upgrade a campaign into an enterprise campaign.
- Calculate budget, management fee, creator pool, planned offers, and remaining buffer.
- Generate and approve an agent campaign plan.
- Generate and approve a creator shortlist from existing onboarded creators.
- Generate and approve creator offers.
- Track creator accept, decline, and request-change responses.
- Finalize the creator roster.
- Generate and approve campaign specs/brief.
- Track creator deliverable submissions through manual links.
- Use an agent recommendation to classify submissions as approved or needing revision.
- Prepare payout records.
- Approve and mark payouts paid manually.
- Generate and approve brand progress/completion updates.

Creators must be able to:

- View assigned enterprise offers.
- Accept, decline, or request changes.
- View approved campaign specs.
- Submit deliverable links manually.
- See revision status and payout status.

## Required Setup

Install dependencies in `ugc-hits`:

```bash
npm install langchain @langchain/langgraph @langchain/openai zod
```

Add environment variables:

```bash
OPENAI_API_KEY=
AGENT_MODEL=gpt-4.1-mini
AGENT_EMBEDDING_MODEL=text-embedding-3-small
AGENT_DRY_RUN=true
```

Add a Supabase migration that enables pgvector:

```sql
create extension if not exists vector;
```

Use these defaults unless a later repo inspection proves a better local convention:

- Orchestration: LangGraph JS inside the existing TypeScript stack.
- Retrieval: Supabase pgvector.
- Embeddings: OpenAI `text-embedding-3-small`.
- Model: `gpt-4.1-mini` for V1 cost control.
- Real Stripe transfers: out of scope for V1.
- Google Drive API watcher: out of scope for V1.
- Payouts and uploads: manual status records in V1.

## Milestone 1: Inspect Existing Repo

Before changing product code:

1. Inspect current Supabase migrations and RLS policies.
2. Inspect existing campaign creation, brand dashboard, creator dashboard, admin matching, applications, conversations, notifications, and email job flows.
3. Inspect existing test patterns in `tests/platform`.
4. Confirm where admin routes and creator routes should be extended.
5. Record any plan adjustments in this file if repo reality differs from assumptions.

Acceptance:

- The implementer understands the current source-of-truth tables and server action patterns.
- No product code changes are made before this inspection.

### Milestone 1 Repo Findings

Inspection completed on 2026-05-20 before product code changes.

- Existing data model lives in Supabase migrations under `supabase/migrations`, with core tables `profiles`, `brands`, `creators`, `campaigns`, `campaign_matches`, `applications`, `conversations`, `conversation_participants`, `messages`, `activity_events`, `notifications`, and `email_jobs`.
- Existing writes are primarily Supabase RPCs called from thin server actions in `src/lib/platform/actions.ts`. Enterprise workflow writes should follow that pattern instead of direct page-level mutations.
- Existing role helpers are `current_profile_role()`, `current_brand_id()`, and `current_creator_id()`. Enterprise RLS should reuse these helpers and add table-specific policies.
- Existing admin-only flows use `requireRole(locale, "admin")` in server view-model helpers, e.g. `src/lib/platform/admin-matches.ts`, then render localized routes under `src/app/[locale]/admin/...`.
- Existing creator dashboard data comes from `getCreatorDashboard` in `src/lib/platform/data.ts` and renders under `src/app/[locale]/dashboard/creator/page.tsx`. Enterprise creator offers should be added as dedicated creator routes while preserving this dashboard.
- Existing brand dashboard routes are under `src/app/[locale]/dashboard/brand/...`; brand enterprise visibility should be read-only summary/status where needed, not full operational control.
- Existing notification pattern is `log_activity_event(...)` followed by `queue_notification_and_email(...)`, with `email_jobs.dedupe_key` used to avoid duplicate emails. Enterprise notifications should extend `platform_event_type`, `notification_copy`, and `email_template_for_event`.
- Existing tests are Node `node:test` TypeScript tests under `tests/platform`, compiled through `tsconfig.test.json`, which currently includes only `src/lib/platform/**/*.ts` and `tests/platform/**/*.ts`. Enterprise shared logic should live under `src/lib/platform` unless the test config is intentionally expanded.
- Current dependencies do not include `zod`, `langchain`, `@langchain/langgraph`, or `@langchain/openai`; installing them is required before the LLM/RAG milestones.
- The worktree already contains unrelated deleted historical plan files. Do not restore or modify those unless explicitly requested.

## Milestone 2: Enterprise Data Model

Add database support for enterprise campaign operations.

Create migrations for:

```text
enterprise_campaigns
campaign_agent_runs
campaign_agent_tasks
admin_approvals
enterprise_campaign_creators
creator_offers
campaign_deliverables
creator_payouts
agent_knowledge_documents
```

Minimum table responsibilities:

- `enterprise_campaigns`: budget, fee, target creator count, video counts, planned offer, campaign dates, workflow status.
- `campaign_agent_runs`: each orchestrator run and final status.
- `campaign_agent_tasks`: specialist task input/output, confidence, risk flags, and status.
- `admin_approvals`: immutable snapshots of decisions admins approved/rejected.
- `enterprise_campaign_creators`: proposed, shortlisted, accepted, backup, removed, completed creator state.
- `creator_offers`: offer amount, terms summary, deliverables, legal version, response state.
- `campaign_deliverables`: manual submitted links, review status, review notes.
- `creator_payouts`: manual payout prep, approval, and paid status.
- `agent_knowledge_documents`: source content and vector embeddings for RAG.

Add RLS policies:

- Admins can manage all enterprise campaign data.
- Brands can read only their own enterprise campaign summary/status where appropriate.
- Creators can read only their own offers, deliverables, and payout status.
- No creator can read another creator's offer amount or payout state.

Acceptance:

- Migrations apply cleanly.
- Existing tables and policies remain compatible.
- RLS protects unrelated brands/creators.

## Milestone 3: Shared Types, Schemas, And Budget Math

Add TypeScript types and zod schemas for enterprise campaign workflows and agent outputs.

Implement deterministic helpers for:

- Management fee amount.
- Creator budget amount.
- Planned total creator commitment.
- Remaining creator budget buffer.
- Valid status transitions.
- Admin approval requirements.

Required budget test:

```text
Input: £10,000 total budget, 20% management fee, 10 creators, £600 planned offer
Expected: £2,000 management fee, £8,000 creator pool, £6,000 committed, £2,000 buffer
```

Acceptance:

- Budget math is covered by tests.
- Agent output schemas reject invalid JSON.
- Status transition helpers prevent skipping admin gates.

## Milestone 4: Manual Admin Enterprise Workflow

Add admin routes:

```text
/admin/enterprise-campaigns
/admin/enterprise-campaigns/[campaignId]
```

Build tabs or sections:

```text
Overview
Plan
Creator Shortlist
Offers
Brief
Deliverables
Payouts
Activity
```

Manual workflow must work before LLM calls exist:

1. Admin creates or upgrades a campaign into an enterprise campaign.
2. Admin enters budget, creator count, video count, planned offer, dates, and requirements.
3. Admin manually creates a campaign plan or accepts a placeholder draft.
4. Admin manually selects existing onboarded creators.
5. Admin creates offer batch.
6. Admin approves offer batch.
7. Admin finalizes roster after creator responses.
8. Admin releases brief.
9. Admin reviews deliverables.
10. Admin prepares and marks payouts paid manually.

Acceptance:

- Admin can complete the full enterprise workflow without LLM calls.
- No irreversible state transition can happen without an explicit admin action.
- Activity events record meaningful workflow history.

## Milestone 5: Creator Offer And Delivery Workflow

Add creator routes:

```text
/dashboard/creator/offers
/dashboard/creator/offers/[offerId]
```

Creators must be able to:

- View offer details.
- Accept an offer.
- Decline an offer.
- Request changes with a note.
- View released campaign brief/specs after final roster approval.
- Submit deliverable links manually.
- View review result: submitted, needs revision, approved.
- View payout status: prepared, approved, paid.

Acceptance:

- Creator can only access their own offers.
- Accepted offers update enterprise creator state.
- Declines/request-change responses are visible to admin.
- Deliverable submissions appear in the admin campaign detail page.

## Milestone 6: RAG Storage And Retrieval

Implement ingestion into `agent_knowledge_documents` for:

- Creator profile seed.
- Creator application notes.
- Campaign description and targeting fields.
- Enterprise campaign requirements.
- Brand guidelines/brief text.
- Offer templates.
- Revision/quality rules.

Implement vector search helper using Supabase RPC.

Retrieval rules:

- Creator Vetting Agent retrieves matching creator profile documents and campaign requirements.
- Offer Agent retrieves campaign requirements and approved offer templates.
- Briefing Agent retrieves brand guidelines, campaign requirements, and usage terms.
- Deliverable Review Agent retrieves deliverable specs and revision rules.
- Payout Prep Agent reads structured accepted offers and approved deliverables from Postgres, not vector search.

Acceptance:

- RAG results are inspectable in logs or admin task output.
- Inactive creators are excluded from creator recommendation retrieval.
- Retrieval never replaces structured source-of-truth reads for money or legal state.

## Milestone 7: Agent Orchestration

Add server-only agent modules under a local `src/lib/agents` area.

Implement a LangGraph-style supervisor/subagent architecture:

```text
Campaign Director Agent
  -> Campaign Planning Agent
  -> Creator Vetting Agent
  -> Offer Drafting Agent
  -> Briefing Agent
  -> Deliverable Review Agent
  -> Brand Update Agent
  -> Payout Prep Agent
```

Agents communicate through:

- Durable task rows.
- Structured JSON input/output.
- Shared campaign state.
- Admin approval records.
- Activity events.

Do not implement free-form agent group chat.

Agent contracts:

```ts
type CreatorVettingOutput = {
  recommendedCreators: Array<{
    creatorId: string;
    score: number;
    reasons: string[];
    risks: string[];
    suggestedOfferAmount: number;
  }>;
  backupCreators: Array<{
    creatorId: string;
    score: number;
    reasons: string[];
    risks: string[];
  }>;
  summary: string;
};
```

```ts
type OfferDraftingOutput = {
  offers: Array<{
    creatorId: string;
    amount: number;
    currency: "GBP";
    deliverables: string[];
    deadlineSummary: string;
    usageTermsSummary: string;
    messageDraft: string;
  }>;
  totalCommittedAmount: number;
  remainingCreatorBudget: number;
};
```

```ts
type DeliverableReviewOutput = {
  deliverableId: string;
  recommendedStatus: "approved" | "needs_revision";
  reasons: string[];
  revisionRequestDraft?: string;
  confidence: number;
};
```

```ts
type PayoutPrepOutput = {
  payouts: Array<{
    creatorId: string;
    amount: number;
    currency: "GBP";
    reason: string;
  }>;
  totalPayoutAmount: number;
  requiresAdminApproval: true;
};
```

Acceptance:

- Agent outputs are schema-validated before persistence.
- Failed agent calls store errors without corrupting workflow state.
- Every agent recommendation can be approved or rejected by admin.
- `AGENT_DRY_RUN=true` prevents brand/creator notifications from being sent automatically.

## Milestone 8: Approval Gates

Implement approval gates:

```text
approve_campaign_plan
approve_creator_shortlist
approve_offer_batch
approve_final_roster
approve_brief_release
approve_deliverable_review
approve_payout_batch
mark_payouts_paid
approve_brand_update
```

Rules:

- Each approval stores the exact `snapshot_json` approved by admin.
- Approved snapshots must not be mutated.
- Rejected snapshots can be superseded by a new agent task or manual revision.
- Offers cannot be sent until `approve_offer_batch`.
- Brief cannot be released until `approve_final_roster`.
- Payouts cannot be approved until relevant deliverables are admin-approved.
- Payouts cannot be marked paid unless payout batch is approved.

Acceptance:

- Tests cover blocked transitions.
- Admin UI clearly shows what is pending approval, approved, or rejected.

## Milestone 9: Notifications And Activity

Reuse the existing activity/notification/email pipeline where possible.

Add events for:

- Enterprise campaign created.
- Agent task completed.
- Admin approval required.
- Creator offer sent.
- Creator offer accepted/declined/requested changes.
- Brief released.
- Deliverable submitted.
- Deliverable needs revision.
- Deliverable approved.
- Payout prepared.
- Payout marked paid.
- Brand update approved.

Acceptance:

- Creator dashboard reflects offer and deliverable changes.
- Admin dashboard reflects pending approvals and creator responses.
- Duplicate notifications are avoided through dedupe keys or equivalent local pattern.

## Milestone 10: Final Product Polish

The final product must feel complete, not scaffolded.

Polish requirements:

- Clear admin campaign state.
- Clear creator offer state.
- Empty states for no enterprise campaigns/offers/deliverables.
- Error states for failed agent runs.
- Loading/pending states for long-running agent work.
- Money displayed consistently with currency.
- Risk flags and agent reasoning shown in admin-facing UI.
- No raw JSON shown to normal creators.

Acceptance:

- Admin can understand the next required action on each enterprise campaign.
- Creator can understand exactly what they are being offered and what they need to submit.

## Verification

Run:

```bash
npm run test:platform
npm run lint
npm run build
```

Add tests for:

- Budget math.
- Agent schema validation.
- Creator shortlist approval before offer creation.
- Offer acceptance/decline/request-change.
- Brief release blocked until final roster approval.
- Deliverable review approval gate.
- Payout approval and paid-status gates.
- Creator offer visibility scoped to creator.
- Admin visibility over all enterprise workflow data.
- RAG retrieval excludes inactive creators.

Final manual QA:

1. Create an enterprise campaign with the example budget.
2. Generate or manually create a campaign plan.
3. Approve creator shortlist.
4. Create and approve offers.
5. Accept an offer as a creator.
6. Finalize roster and release brief.
7. Submit a deliverable link.
8. Review it as approved or needs revision.
9. Prepare payout.
10. Approve and mark payout paid.
11. Generate or approve brand completion update.

The goal is complete only when the manual workflow and LLM/RAG workflow both work and verification evidence is available.

## Implementation Constraints

- Preserve existing Next.js/Supabase patterns.
- Preserve existing campaign, application, notification, and admin matching behavior.
- Do not add real Stripe transfers in V1.
- Do not add Google Drive API ingestion in V1.
- Do not let agents perform irreversible actions without admin approval.
- Keep LLM outputs structured and schema-validated.
- Use Postgres for truth; use pgvector only for retrieval context.
- Keep tests focused and close to existing platform test style.

## Completion Report

At the end, provide:

- Summary of implemented milestones.
- Files changed.
- Migrations added.
- Tests added.
- Verification commands and results.
- Any remaining limitations, especially Stripe/Drive manual V1 boundaries.
