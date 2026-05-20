import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const schemaMigration = readFileSync(
  "supabase/migrations/20260520120000_enterprise_campaign_agents.sql",
  "utf8",
);
const workflowMigration = readFileSync(
  "supabase/migrations/20260520121000_enterprise_campaign_workflow_functions.sql",
  "utf8",
);
const activityMigration = readFileSync(
  "supabase/migrations/20260520144000_enterprise_activity_event_triggers.sql",
  "utf8",
);
const notificationMigration = readFileSync(
  "supabase/migrations/20260520144500_enterprise_notification_copy.sql",
  "utf8",
);

test("enterprise schema migration creates source-of-truth tables before workflow functions run", () => {
  for (const table of [
    "enterprise_campaigns",
    "campaign_agent_runs",
    "campaign_agent_tasks",
    "admin_approvals",
    "enterprise_campaign_creators",
    "creator_offers",
    "campaign_deliverables",
    "creator_payouts",
    "agent_knowledge_documents",
  ]) {
    assert.match(schemaMigration, new RegExp(`create table if not exists public\\.${table}`));
  }

  assert.match(schemaMigration, /create extension if not exists vector/);
  assert.match(schemaMigration, /embedding vector\(1536\)/);
  assert.match(schemaMigration, /create or replace function public\.match_agent_knowledge_documents/);
});

test("enterprise schema migration scopes creators to their own offers, deliverables, and payouts", () => {
  assert.match(schemaMigration, /create policy creator_offers_creator_select_own/);
  assert.match(schemaMigration, /creator_id = public\.current_creator_id\(\)/);
  assert.match(schemaMigration, /create policy campaign_deliverables_creator_select_own/);
  assert.match(schemaMigration, /create policy creator_payouts_creator_select_own/);
  assert.doesNotMatch(schemaMigration, /for update to authenticated[\s\S]*creator_id = public\.current_creator_id\(\)/);
});

test("workflow migration blocks irreversible approvals until prior gates are satisfied", () => {
  for (const requiredError of [
    "Offer batch requires pending offer approval",
    "Final roster can only be approved after offers are sent",
    "Brief release requires final roster approval",
    "Payouts can only be marked paid after payout batch approval",
    "Brand update approval requires all payouts to be paid",
  ]) {
    assert.match(workflowMigration, new RegExp(requiredError));
  }

  assert.match(workflowMigration, /status = 'approved'/);
  assert.match(workflowMigration, /status = 'paid'/);
  assert.match(workflowMigration, /public\.current_profile_role\(\) <> 'admin'/);
});

test("enterprise migrations define and log workflow activity events", () => {
  for (const eventType of [
    "enterprise_campaign_created",
    "agent_task_completed",
    "creator_offer_sent",
    "creator_offer_accepted",
    "creator_offer_declined",
    "creator_offer_change_requested",
    "brief_released",
    "deliverable_submitted",
    "deliverable_approved",
    "deliverable_needs_revision",
    "payout_prepared",
    "payout_marked_paid",
    "brand_update_approved",
  ]) {
    assert.match(schemaMigration, new RegExp(`'${eventType}'`));
  }

  assert.match(workflowMigration, /'enterprise_campaign_created'/);
  assert.match(workflowMigration, /'creator_offer_sent'/);
  assert.match(workflowMigration, /'creator_offer_accepted'/);
  assert.match(workflowMigration, /'creator_offer_declined'/);
  assert.match(workflowMigration, /'creator_offer_change_requested'/);
  assert.match(workflowMigration, /'deliverable_submitted'/);
  assert.match(workflowMigration, /'deliverable_approved'/);
  assert.match(workflowMigration, /'deliverable_needs_revision'/);
  assert.match(activityMigration, /'brief_released'/);
  assert.match(activityMigration, /'payout_prepared'/);
  assert.match(activityMigration, /'payout_marked_paid'/);
  assert.match(activityMigration, /'brand_update_approved'/);
  assert.match(activityMigration, /create trigger enterprise_campaigns_activity_events/);
  assert.match(activityMigration, /create trigger creator_payouts_activity_events/);
  assert.match(notificationMigration, /Enterprise offer accepted/);
  assert.match(notificationMigration, /Enterprise brief released/);
  assert.match(notificationMigration, /Payout marked paid/);
  assert.match(notificationMigration, /enterprise_offer_sent/);
});
