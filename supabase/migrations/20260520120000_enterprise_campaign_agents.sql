create extension if not exists vector;

alter type public.platform_event_type add value if not exists 'enterprise_campaign_created';
alter type public.platform_event_type add value if not exists 'agent_task_completed';
alter type public.platform_event_type add value if not exists 'admin_approval_required';
alter type public.platform_event_type add value if not exists 'creator_offer_sent';
alter type public.platform_event_type add value if not exists 'creator_offer_accepted';
alter type public.platform_event_type add value if not exists 'creator_offer_declined';
alter type public.platform_event_type add value if not exists 'creator_offer_change_requested';
alter type public.platform_event_type add value if not exists 'brief_released';
alter type public.platform_event_type add value if not exists 'deliverable_submitted';
alter type public.platform_event_type add value if not exists 'deliverable_approved';
alter type public.platform_event_type add value if not exists 'deliverable_needs_revision';
alter type public.platform_event_type add value if not exists 'payout_prepared';
alter type public.platform_event_type add value if not exists 'payout_paid';
alter type public.platform_event_type add value if not exists 'payout_marked_paid';
alter type public.platform_event_type add value if not exists 'brand_update_approved';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'enterprise_campaign_status') then
    create type public.enterprise_campaign_status as enum (
      'setup',
      'plan_pending_approval',
      'plan_approved',
      'shortlist_pending_approval',
      'shortlist_approved',
      'offers_pending_approval',
      'offers_sent',
      'roster_finalized',
      'brief_released',
      'deliverables_in_review',
      'payouts_pending_approval',
      'payouts_approved',
      'completed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_agent_run_status') then
    create type public.campaign_agent_run_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_agent_task_type') then
    create type public.campaign_agent_task_type as enum (
      'campaign_planning',
      'creator_vetting',
      'offer_drafting',
      'briefing',
      'deliverable_review',
      'brand_update',
      'payout_prep'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_agent_task_status') then
    create type public.campaign_agent_task_status as enum ('queued', 'running', 'completed', 'failed', 'approved', 'rejected', 'superseded');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_approval_type') then
    create type public.admin_approval_type as enum (
      'approve_campaign_plan',
      'approve_creator_shortlist',
      'approve_offer_batch',
      'approve_final_roster',
      'approve_brief_release',
      'approve_deliverable_review',
      'approve_payout_batch',
      'mark_payouts_paid',
      'approve_brand_update'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_approval_status') then
    create type public.admin_approval_status as enum ('pending', 'approved', 'rejected', 'superseded');
  end if;

  if not exists (select 1 from pg_type where typname = 'enterprise_campaign_creator_status') then
    create type public.enterprise_campaign_creator_status as enum (
      'proposed',
      'shortlisted',
      'offered',
      'accepted',
      'declined',
      'change_requested',
      'backup',
      'removed',
      'completed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'creator_offer_status') then
    create type public.creator_offer_status as enum ('draft', 'pending_admin_approval', 'sent', 'accepted', 'declined', 'change_requested', 'withdrawn', 'expired');
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_deliverable_status') then
    create type public.campaign_deliverable_status as enum ('submitted', 'needs_revision', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'creator_payout_status') then
    create type public.creator_payout_status as enum ('prepared', 'pending_admin_approval', 'approved', 'paid', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_knowledge_source_type') then
    create type public.agent_knowledge_source_type as enum (
      'creator_profile',
      'creator_application_notes',
      'campaign_description',
      'enterprise_requirements',
      'brand_guidelines',
      'offer_template',
      'revision_rules'
    );
  end if;
end
$$;

create table if not exists public.enterprise_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references public.campaigns(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  status public.enterprise_campaign_status not null default 'setup',
  currency text not null default 'GBP' check (currency = 'GBP'),
  total_budget_amount numeric not null default 0 check (total_budget_amount >= 0),
  management_fee_percentage numeric not null default 20 check (management_fee_percentage >= 0 and management_fee_percentage <= 100),
  management_fee_amount numeric not null default 0 check (management_fee_amount >= 0),
  creator_budget_amount numeric not null default 0 check (creator_budget_amount >= 0),
  target_creator_count integer not null default 1 check (target_creator_count > 0),
  planned_offer_amount numeric not null default 0 check (planned_offer_amount >= 0),
  planned_total_creator_commitment numeric not null default 0 check (planned_total_creator_commitment >= 0),
  remaining_creator_budget_amount numeric not null default 0 check (remaining_creator_budget_amount >= 0),
  videos_per_creator_min integer,
  videos_per_creator_max integer,
  starts_on date,
  ends_on date,
  requirements text not null default '',
  brand_guidelines text not null default '',
  approved_campaign_plan jsonb,
  approved_creator_shortlist jsonb,
  approved_offer_batch jsonb,
  approved_final_roster jsonb,
  approved_brief jsonb,
  approved_brand_update jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_agent_runs (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  run_type text not null default 'campaign_director',
  started_by_profile_id uuid references public.profiles(id) on delete set null,
  status public.campaign_agent_run_status not null default 'queued',
  model text,
  embedding_model text,
  dry_run boolean not null default true,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.campaign_agent_runs(id) on delete set null,
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  task_type public.campaign_agent_task_type not null,
  status public.campaign_agent_task_status not null default 'queued',
  requires_admin_approval boolean not null default true,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb,
  retrieved_context_json jsonb not null default '[]'::jsonb,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  risk_flags text[] not null default '{}',
  error_message text,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_approvals (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  approval_type public.admin_approval_type not null,
  status public.admin_approval_status not null default 'pending',
  requested_by_task_id uuid references public.campaign_agent_tasks(id) on delete set null,
  decided_by_profile_id uuid references public.profiles(id) on delete set null,
  snapshot_json jsonb not null,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_campaign_creators (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.enterprise_campaign_creator_status not null default 'proposed',
  score numeric check (score is null or (score >= 0 and score <= 100)),
  reasons text[] not null default '{}',
  risks text[] not null default '{}',
  suggested_offer_amount numeric check (suggested_offer_amount is null or suggested_offer_amount >= 0),
  final_offer_amount numeric check (final_offer_amount is null or final_offer_amount >= 0),
  added_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (enterprise_campaign_id, creator_id)
);

create table if not exists public.creator_offers (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  enterprise_campaign_creator_id uuid references public.enterprise_campaign_creators(id) on delete set null,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.creator_offer_status not null default 'draft',
  currency text not null default 'GBP' check (currency = 'GBP'),
  offer_amount numeric not null check (offer_amount >= 0),
  terms_summary text not null default '',
  deliverables jsonb not null default '[]'::jsonb,
  deadline_summary text not null default '',
  usage_terms_summary text not null default '',
  message_draft text not null default '',
  legal_version text not null default 'enterprise-v1',
  response_note text,
  sent_at timestamptz,
  responded_at timestamptz,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (enterprise_campaign_id, creator_id)
);

create table if not exists public.campaign_deliverables (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  creator_offer_id uuid references public.creator_offers(id) on delete set null,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.campaign_deliverable_status not null default 'submitted',
  title text not null default 'Creator deliverable',
  submitted_url text not null,
  submitted_note text,
  review_notes text,
  revision_request text,
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  enterprise_campaign_id uuid not null references public.enterprise_campaigns(id) on delete cascade,
  creator_offer_id uuid references public.creator_offers(id) on delete set null,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.creator_payout_status not null default 'prepared',
  currency text not null default 'GBP' check (currency = 'GBP'),
  amount numeric not null check (amount >= 0),
  reason text not null default '',
  prepared_by_profile_id uuid references public.profiles(id) on delete set null,
  approved_by_profile_id uuid references public.profiles(id) on delete set null,
  marked_paid_by_profile_id uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agent_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_type public.agent_knowledge_source_type not null,
  source_id uuid,
  enterprise_campaign_id uuid references public.enterprise_campaigns(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  is_active boolean not null default true,
  ingested_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists enterprise_campaigns_brand_id_idx on public.enterprise_campaigns (brand_id);
create index if not exists enterprise_campaigns_status_idx on public.enterprise_campaigns (status);
create index if not exists campaign_agent_runs_campaign_id_idx on public.campaign_agent_runs (enterprise_campaign_id, created_at desc);
create index if not exists campaign_agent_tasks_campaign_id_idx on public.campaign_agent_tasks (enterprise_campaign_id, task_type, created_at desc);
create index if not exists admin_approvals_campaign_id_idx on public.admin_approvals (enterprise_campaign_id, approval_type, created_at desc);
create index if not exists enterprise_campaign_creators_campaign_id_idx on public.enterprise_campaign_creators (enterprise_campaign_id, status);
create index if not exists enterprise_campaign_creators_creator_id_idx on public.enterprise_campaign_creators (creator_id);
create index if not exists creator_offers_campaign_id_idx on public.creator_offers (enterprise_campaign_id, status);
create index if not exists creator_offers_creator_id_idx on public.creator_offers (creator_id, status);
create index if not exists campaign_deliverables_campaign_id_idx on public.campaign_deliverables (enterprise_campaign_id, status);
create index if not exists campaign_deliverables_creator_id_idx on public.campaign_deliverables (creator_id, status);
create index if not exists creator_payouts_campaign_id_idx on public.creator_payouts (enterprise_campaign_id, status);
create index if not exists creator_payouts_creator_id_idx on public.creator_payouts (creator_id, status);
create index if not exists agent_knowledge_documents_campaign_idx on public.agent_knowledge_documents (enterprise_campaign_id, source_type, is_active);
create index if not exists agent_knowledge_documents_creator_idx on public.agent_knowledge_documents (creator_id, source_type, is_active);
create index if not exists agent_knowledge_documents_embedding_idx on public.agent_knowledge_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.enterprise_campaigns enable row level security;
alter table public.campaign_agent_runs enable row level security;
alter table public.campaign_agent_tasks enable row level security;
alter table public.admin_approvals enable row level security;
alter table public.enterprise_campaign_creators enable row level security;
alter table public.creator_offers enable row level security;
alter table public.campaign_deliverables enable row level security;
alter table public.creator_payouts enable row level security;
alter table public.agent_knowledge_documents enable row level security;

drop policy if exists enterprise_campaigns_admin_all on public.enterprise_campaigns;
drop policy if exists enterprise_campaigns_brand_select on public.enterprise_campaigns;
drop policy if exists enterprise_campaigns_creator_select_accepted on public.enterprise_campaigns;
drop policy if exists campaign_agent_runs_admin_all on public.campaign_agent_runs;
drop policy if exists campaign_agent_tasks_admin_all on public.campaign_agent_tasks;
drop policy if exists admin_approvals_admin_all on public.admin_approvals;
drop policy if exists enterprise_campaign_creators_admin_all on public.enterprise_campaign_creators;
drop policy if exists enterprise_campaign_creators_creator_select_own on public.enterprise_campaign_creators;
drop policy if exists creator_offers_admin_all on public.creator_offers;
drop policy if exists creator_offers_creator_select_own on public.creator_offers;
drop policy if exists campaign_deliverables_admin_all on public.campaign_deliverables;
drop policy if exists campaign_deliverables_creator_select_own on public.campaign_deliverables;
drop policy if exists creator_payouts_admin_all on public.creator_payouts;
drop policy if exists creator_payouts_creator_select_own on public.creator_payouts;
drop policy if exists agent_knowledge_documents_admin_all on public.agent_knowledge_documents;
drop policy if exists agent_knowledge_documents_brand_select on public.agent_knowledge_documents;
drop policy if exists agent_knowledge_documents_creator_select_own on public.agent_knowledge_documents;

create policy enterprise_campaigns_admin_all on public.enterprise_campaigns
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy enterprise_campaigns_brand_select on public.enterprise_campaigns
  for select to authenticated using (brand_id = public.current_brand_id());
create policy enterprise_campaigns_creator_select_accepted on public.enterprise_campaigns
  for select to authenticated using (
    exists (
      select 1 from public.enterprise_campaign_creators ecc
      where ecc.enterprise_campaign_id = enterprise_campaigns.id
        and ecc.creator_id = public.current_creator_id()
        and ecc.status in ('accepted', 'completed')
    )
  );

create policy campaign_agent_runs_admin_all on public.campaign_agent_runs
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy campaign_agent_tasks_admin_all on public.campaign_agent_tasks
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy admin_approvals_admin_all on public.admin_approvals
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');

create policy enterprise_campaign_creators_admin_all on public.enterprise_campaign_creators
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy enterprise_campaign_creators_creator_select_own on public.enterprise_campaign_creators
  for select to authenticated using (creator_id = public.current_creator_id());

create policy creator_offers_admin_all on public.creator_offers
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy creator_offers_creator_select_own on public.creator_offers
  for select to authenticated using (creator_id = public.current_creator_id());

create policy campaign_deliverables_admin_all on public.campaign_deliverables
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy campaign_deliverables_creator_select_own on public.campaign_deliverables
  for select to authenticated using (creator_id = public.current_creator_id());

create policy creator_payouts_admin_all on public.creator_payouts
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy creator_payouts_creator_select_own on public.creator_payouts
  for select to authenticated using (creator_id = public.current_creator_id());

create policy agent_knowledge_documents_admin_all on public.agent_knowledge_documents
  for all to authenticated using (public.current_profile_role() = 'admin') with check (public.current_profile_role() = 'admin');
create policy agent_knowledge_documents_brand_select on public.agent_knowledge_documents
  for select to authenticated using (
    source_type in ('campaign_description', 'enterprise_requirements', 'brand_guidelines')
    and brand_id = public.current_brand_id()
  );
create policy agent_knowledge_documents_creator_select_own on public.agent_knowledge_documents
  for select to authenticated using (
    source_type in ('creator_profile', 'creator_application_notes')
    and creator_id = public.current_creator_id()
  );

create or replace function public.match_agent_knowledge_documents(
  query_embedding vector(1536),
  match_count integer default 8,
  filter_enterprise_campaign_id uuid default null,
  filter_creator_id uuid default null,
  filter_source_types text[] default null
)
returns table(
  id uuid,
  enterprise_campaign_id uuid,
  campaign_id uuid,
  brand_id uuid,
  creator_id uuid,
  source_type text,
  title text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.enterprise_campaign_id,
    d.campaign_id,
    d.brand_id,
    d.creator_id,
    d.source_type::text,
    d.title,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.agent_knowledge_documents d
  left join public.creators cr on cr.id = d.creator_id
  where d.is_active = true
    and d.embedding is not null
    and public.current_profile_role() = 'admin'
    and (filter_enterprise_campaign_id is null or d.enterprise_campaign_id = filter_enterprise_campaign_id)
    and (filter_creator_id is null or d.creator_id = filter_creator_id)
    and (filter_source_types is null or d.source_type::text = any(filter_source_types))
    and (d.creator_id is null or coalesce(cr.status, 'inactive') = 'active')
  order by d.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
