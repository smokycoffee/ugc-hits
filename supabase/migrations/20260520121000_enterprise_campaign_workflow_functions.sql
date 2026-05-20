create or replace function public.enterprise_budget_breakdown(
  p_total_budget_amount numeric,
  p_management_fee_percentage numeric,
  p_target_creator_count integer,
  p_planned_offer_amount numeric
)
returns table(
  management_fee_amount numeric,
  creator_budget_amount numeric,
  planned_total_creator_commitment numeric,
  remaining_creator_budget_amount numeric
)
language sql
immutable
as $$
  select
    round(greatest(coalesce(p_total_budget_amount, 0), 0) * greatest(coalesce(p_management_fee_percentage, 0), 0) / 100, 2),
    round(greatest(coalesce(p_total_budget_amount, 0), 0) - (greatest(coalesce(p_total_budget_amount, 0), 0) * greatest(coalesce(p_management_fee_percentage, 0), 0) / 100), 2),
    round(greatest(coalesce(p_target_creator_count, 0), 0) * greatest(coalesce(p_planned_offer_amount, 0), 0), 2),
    round(
      greatest(coalesce(p_total_budget_amount, 0), 0)
      - (greatest(coalesce(p_total_budget_amount, 0), 0) * greatest(coalesce(p_management_fee_percentage, 0), 0) / 100)
      - (greatest(coalesce(p_target_creator_count, 0), 0) * greatest(coalesce(p_planned_offer_amount, 0), 0)),
      2
    );
$$;

create or replace function public.admin_upsert_enterprise_campaign(
  target_campaign_id uuid,
  p_total_budget_amount numeric,
  p_management_fee_percentage numeric default 20,
  p_target_creator_count integer default 10,
  p_planned_offer_amount numeric default 600,
  p_videos_per_creator_min integer default 45,
  p_videos_per_creator_max integer default 60,
  p_starts_on date default null,
  p_ends_on date default null,
  p_requirements text default '',
  p_brand_guidelines text default ''
)
returns public.enterprise_campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_record public.campaigns;
  enterprise_record public.enterprise_campaigns;
  budget_record record;
  created_event_id uuid;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can manage enterprise campaigns';
  end if;

  select * into campaign_record
  from public.campaigns
  where id = target_campaign_id;

  if campaign_record.id is null then
    raise exception 'Campaign not found';
  end if;

  select * into budget_record
  from public.enterprise_budget_breakdown(
    p_total_budget_amount,
    p_management_fee_percentage,
    p_target_creator_count,
    p_planned_offer_amount
  );

  insert into public.enterprise_campaigns (
    campaign_id,
    brand_id,
    created_by_profile_id,
    status,
    total_budget_amount,
    management_fee_percentage,
    management_fee_amount,
    creator_budget_amount,
    target_creator_count,
    planned_offer_amount,
    planned_total_creator_commitment,
    remaining_creator_budget_amount,
    videos_per_creator_min,
    videos_per_creator_max,
    starts_on,
    ends_on,
    requirements,
    brand_guidelines
  )
  values (
    campaign_record.id,
    campaign_record.brand_id,
    auth.uid(),
    'setup',
    greatest(coalesce(p_total_budget_amount, 0), 0),
    greatest(coalesce(p_management_fee_percentage, 20), 0),
    budget_record.management_fee_amount,
    budget_record.creator_budget_amount,
    greatest(coalesce(p_target_creator_count, 10), 1),
    greatest(coalesce(p_planned_offer_amount, 600), 0),
    budget_record.planned_total_creator_commitment,
    greatest(budget_record.remaining_creator_budget_amount, 0),
    greatest(coalesce(p_videos_per_creator_min, 45), 0),
    greatest(coalesce(p_videos_per_creator_max, 60), greatest(coalesce(p_videos_per_creator_min, 45), 0)),
    p_starts_on,
    p_ends_on,
    coalesce(p_requirements, ''),
    coalesce(p_brand_guidelines, '')
  )
  on conflict (campaign_id) do update
    set total_budget_amount = excluded.total_budget_amount,
        management_fee_percentage = excluded.management_fee_percentage,
        management_fee_amount = excluded.management_fee_amount,
        creator_budget_amount = excluded.creator_budget_amount,
        target_creator_count = excluded.target_creator_count,
        planned_offer_amount = excluded.planned_offer_amount,
        planned_total_creator_commitment = excluded.planned_total_creator_commitment,
        remaining_creator_budget_amount = excluded.remaining_creator_budget_amount,
        videos_per_creator_min = excluded.videos_per_creator_min,
        videos_per_creator_max = excluded.videos_per_creator_max,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on,
        requirements = excluded.requirements,
        brand_guidelines = excluded.brand_guidelines,
        updated_at = timezone('utc', now())
  returning * into enterprise_record;

  created_event_id := public.log_activity_event(
    'enterprise_campaign_created',
    auth.uid(),
    'enterprise_campaign',
    enterprise_record.id,
    campaign_record.id,
    null,
    null,
    jsonb_build_object('campaign_title', campaign_record.title)
  );

  return enterprise_record;
end;
$$;

create or replace function public.admin_set_enterprise_plan(
  target_enterprise_campaign_id uuid,
  p_campaign_plan jsonb
)
returns public.enterprise_campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  enterprise_record public.enterprise_campaigns;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can update enterprise campaign plans';
  end if;

  update public.enterprise_campaigns
  set approved_campaign_plan = coalesce(p_campaign_plan, '{}'::jsonb),
      status = 'plan_pending_approval',
      updated_at = timezone('utc', now())
  where id = target_enterprise_campaign_id
  returning * into enterprise_record;

  if enterprise_record.id is null then
    raise exception 'Enterprise campaign not found';
  end if;

  return enterprise_record;
end;
$$;

create or replace function public.admin_add_enterprise_creator(
  target_enterprise_campaign_id uuid,
  target_creator_id uuid,
  p_reasons text[] default '{}'::text[],
  p_risks text[] default '{}'::text[],
  p_score numeric default null,
  p_suggested_offer_amount numeric default null
)
returns public.enterprise_campaign_creators
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_record public.enterprise_campaign_creators;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can shortlist enterprise creators';
  end if;

  insert into public.enterprise_campaign_creators (
    enterprise_campaign_id,
    creator_id,
    status,
    score,
    reasons,
    risks,
    suggested_offer_amount,
    added_by_profile_id
  )
  values (
    target_enterprise_campaign_id,
    target_creator_id,
    'proposed',
    p_score,
    coalesce(p_reasons, '{}'::text[]),
    coalesce(p_risks, '{}'::text[]),
    p_suggested_offer_amount,
    auth.uid()
  )
  on conflict (enterprise_campaign_id, creator_id) do update
    set status = case
          when public.enterprise_campaign_creators.status = 'removed' then 'proposed'::public.enterprise_campaign_creator_status
          else public.enterprise_campaign_creators.status
        end,
        score = excluded.score,
        reasons = excluded.reasons,
        risks = excluded.risks,
        suggested_offer_amount = excluded.suggested_offer_amount,
        updated_at = timezone('utc', now())
  returning * into creator_record;

  update public.enterprise_campaigns
  set status = 'shortlist_pending_approval',
      updated_at = timezone('utc', now())
  where id = target_enterprise_campaign_id
    and status in ('plan_approved', 'shortlist_pending_approval', 'shortlist_approved');

  return creator_record;
end;
$$;

create or replace function public.admin_create_creator_offer(
  target_enterprise_campaign_id uuid,
  target_creator_id uuid,
  p_offer_amount numeric,
  p_terms_summary text,
  p_deliverables jsonb,
  p_deadline_summary text,
  p_usage_terms_summary text,
  p_message_draft text
)
returns public.creator_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_creator_id uuid;
  offer_record public.creator_offers;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can draft enterprise creator offers';
  end if;

  select id into campaign_creator_id
  from public.enterprise_campaign_creators
  where enterprise_campaign_id = target_enterprise_campaign_id
    and creator_id = target_creator_id
    and status in ('shortlisted', 'offered', 'accepted', 'change_requested');

  if campaign_creator_id is null then
    raise exception 'Creator must be approved for shortlist before an offer can be drafted';
  end if;

  insert into public.creator_offers (
    enterprise_campaign_id,
    enterprise_campaign_creator_id,
    creator_id,
    status,
    offer_amount,
    terms_summary,
    deliverables,
    deadline_summary,
    usage_terms_summary,
    message_draft,
    created_by_profile_id
  )
  values (
    target_enterprise_campaign_id,
    campaign_creator_id,
    target_creator_id,
    'pending_admin_approval',
    greatest(coalesce(p_offer_amount, 0), 0),
    coalesce(p_terms_summary, ''),
    coalesce(p_deliverables, '[]'::jsonb),
    coalesce(p_deadline_summary, ''),
    coalesce(p_usage_terms_summary, ''),
    coalesce(p_message_draft, ''),
    auth.uid()
  )
  on conflict (enterprise_campaign_id, creator_id) do update
    set status = 'pending_admin_approval',
        offer_amount = excluded.offer_amount,
        terms_summary = excluded.terms_summary,
        deliverables = excluded.deliverables,
        deadline_summary = excluded.deadline_summary,
        usage_terms_summary = excluded.usage_terms_summary,
        message_draft = excluded.message_draft,
        updated_at = timezone('utc', now())
  returning * into offer_record;

  update public.enterprise_campaigns
  set status = 'offers_pending_approval',
      updated_at = timezone('utc', now())
  where id = target_enterprise_campaign_id;

  return offer_record;
end;
$$;

create or replace function public.admin_save_enterprise_brief(
  target_enterprise_campaign_id uuid,
  p_brief jsonb
)
returns public.enterprise_campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  enterprise_record public.enterprise_campaigns;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can save enterprise briefs';
  end if;

  update public.enterprise_campaigns
  set approved_brief = coalesce(p_brief, '{}'::jsonb),
      updated_at = timezone('utc', now())
  where id = target_enterprise_campaign_id
  returning * into enterprise_record;

  if enterprise_record.id is null then
    raise exception 'Enterprise campaign not found';
  end if;

  return enterprise_record;
end;
$$;

create or replace function public.admin_approve_enterprise_step(
  target_enterprise_campaign_id uuid,
  p_approval_type public.admin_approval_type,
  p_snapshot_json jsonb,
  p_decision_note text default null
)
returns public.admin_approvals
language plpgsql
security definer
set search_path = public
as $$
declare
  approval_record public.admin_approvals;
  campaign_record public.campaigns;
  enterprise_record public.enterprise_campaigns;
  offer_rec record;
  event_id uuid;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can approve enterprise campaign steps';
  end if;

  select ec.*
  into enterprise_record
  from public.enterprise_campaigns ec
  join public.campaigns c on c.id = ec.campaign_id
  where ec.id = target_enterprise_campaign_id;

  if enterprise_record.id is null then
    raise exception 'Enterprise campaign not found';
  end if;

  if p_approval_type = 'approve_campaign_plan' and enterprise_record.status not in ('setup', 'plan_pending_approval') then
    raise exception 'Campaign plan can only be approved from setup or pending plan approval';
  elsif p_approval_type = 'approve_creator_shortlist' and enterprise_record.status <> 'shortlist_pending_approval' then
    raise exception 'Creator shortlist requires pending shortlist approval';
  elsif p_approval_type = 'approve_creator_shortlist' and not exists (
    select 1 from public.enterprise_campaign_creators
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status in ('proposed', 'shortlisted')
  ) then
    raise exception 'Creator shortlist approval requires at least one proposed creator';
  elsif p_approval_type = 'approve_offer_batch' and enterprise_record.status <> 'offers_pending_approval' then
    raise exception 'Offer batch requires pending offer approval';
  elsif p_approval_type = 'approve_offer_batch' and not exists (
    select 1 from public.creator_offers
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'pending_admin_approval'
  ) then
    raise exception 'Offer batch approval requires at least one pending offer';
  elsif p_approval_type = 'approve_final_roster' and enterprise_record.status <> 'offers_sent' then
    raise exception 'Final roster can only be approved after offers are sent';
  elsif p_approval_type = 'approve_final_roster' and not exists (
    select 1 from public.creator_offers
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'accepted'
  ) then
    raise exception 'Final roster approval requires at least one accepted offer';
  elsif p_approval_type = 'approve_brief_release' and enterprise_record.status <> 'roster_finalized' then
    raise exception 'Brief release requires final roster approval';
  elsif p_approval_type = 'approve_brief_release' and coalesce(enterprise_record.approved_brief, '{}'::jsonb) = '{}'::jsonb then
    raise exception 'Brief release requires a saved brief snapshot';
  elsif p_approval_type = 'approve_deliverable_review' and enterprise_record.status <> 'deliverables_in_review' then
    raise exception 'Deliverable review approval requires deliverables in review';
  elsif p_approval_type = 'approve_deliverable_review' and not exists (
    select 1 from public.campaign_deliverables
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'approved'
  ) then
    raise exception 'Deliverable review approval requires at least one approved deliverable';
  elsif p_approval_type = 'approve_payout_batch' and enterprise_record.status <> 'payouts_pending_approval' then
    raise exception 'Payout batch approval requires pending payout approval';
  elsif p_approval_type = 'approve_payout_batch' and not exists (
    select 1 from public.creator_payouts
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'pending_admin_approval'
  ) then
    raise exception 'Payout batch approval requires at least one prepared payout';
  elsif p_approval_type = 'mark_payouts_paid' and enterprise_record.status <> 'payouts_approved' then
    raise exception 'Payouts can only be marked paid after payout batch approval';
  elsif p_approval_type = 'mark_payouts_paid' and not exists (
    select 1 from public.creator_payouts
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'approved'
  ) then
    raise exception 'Mark paid requires at least one approved payout';
  elsif p_approval_type = 'approve_brand_update' and not exists (
    select 1 from public.creator_payouts
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'paid'
  ) then
    raise exception 'Brand update approval requires paid payouts';
  elsif p_approval_type = 'approve_brand_update' and exists (
    select 1 from public.creator_payouts
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status <> 'paid'
  ) then
    raise exception 'Brand update approval requires all payouts to be paid';
  end if;

  insert into public.admin_approvals (
    enterprise_campaign_id,
    approval_type,
    status,
    snapshot_json,
    decision_note,
    decided_by_profile_id,
    decided_at
  )
  values (
    target_enterprise_campaign_id,
    p_approval_type,
    'approved',
    coalesce(p_snapshot_json, '{}'::jsonb),
    p_decision_note,
    auth.uid(),
    timezone('utc', now())
  )
  returning * into approval_record;

  if p_approval_type = 'approve_campaign_plan' then
    update public.enterprise_campaigns
    set status = 'plan_approved',
        approved_campaign_plan = coalesce(p_snapshot_json, approved_campaign_plan),
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'approve_creator_shortlist' then
    update public.enterprise_campaign_creators
    set status = 'shortlisted',
        updated_at = timezone('utc', now())
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'proposed';

    update public.enterprise_campaigns
    set status = 'shortlist_approved',
        approved_creator_shortlist = coalesce(p_snapshot_json, approved_creator_shortlist),
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'approve_offer_batch' then
    update public.creator_offers
    set status = 'sent',
        sent_at = coalesce(sent_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'pending_admin_approval';

    update public.enterprise_campaign_creators
    set status = 'offered',
        updated_at = timezone('utc', now())
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'shortlisted';

    update public.enterprise_campaigns
    set status = 'offers_sent',
        approved_offer_batch = coalesce(p_snapshot_json, approved_offer_batch),
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;

    for offer_rec in
      select co.id, co.creator_id, cr.profile_id, cr.email, c.title
      from public.creator_offers co
      join public.creators cr on cr.id = co.creator_id
      join public.enterprise_campaigns ec on ec.id = co.enterprise_campaign_id
      join public.campaigns c on c.id = ec.campaign_id
      where co.enterprise_campaign_id = target_enterprise_campaign_id
        and co.status = 'sent'
        and co.sent_at > timezone('utc', now()) - interval '2 minutes'
    loop
      event_id := public.log_activity_event(
        'creator_offer_sent',
        auth.uid(),
        'creator_offer',
        offer_rec.id,
        enterprise_record.campaign_id,
        null,
        null,
        jsonb_build_object('campaign_title', offer_rec.title)
      );

      perform public.queue_notification_and_email(
        event_id,
        'creator_offer_sent',
        offer_rec.profile_id,
        offer_rec.email,
        jsonb_build_object('campaign_title', offer_rec.title, 'offer_id', offer_rec.id),
        'enterprise-offer:' || offer_rec.id
      );
    end loop;
  elsif p_approval_type = 'approve_final_roster' then
    update public.enterprise_campaigns
    set status = 'roster_finalized',
        approved_final_roster = coalesce(p_snapshot_json, approved_final_roster),
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'approve_brief_release' then
    update public.enterprise_campaigns
    set status = 'brief_released',
        approved_brief = coalesce(p_snapshot_json, approved_brief),
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'approve_deliverable_review' then
    update public.enterprise_campaigns
    set status = 'payouts_pending_approval',
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'approve_payout_batch' then
    update public.creator_payouts
    set status = 'approved',
        approved_by_profile_id = auth.uid(),
        approved_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status in ('prepared', 'pending_admin_approval');

    update public.enterprise_campaigns
    set status = 'payouts_approved',
        updated_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  elsif p_approval_type = 'mark_payouts_paid' then
    update public.creator_payouts
    set status = 'paid',
        marked_paid_by_profile_id = auth.uid(),
        paid_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where enterprise_campaign_id = target_enterprise_campaign_id
      and status = 'approved';
  elsif p_approval_type = 'approve_brand_update' then
    update public.enterprise_campaigns
    set status = 'completed',
        approved_brand_update = coalesce(p_snapshot_json, approved_brand_update),
        completed_at = timezone('utc', now())
    where id = target_enterprise_campaign_id;
  end if;

  return approval_record;
end;
$$;

create or replace function public.creator_respond_enterprise_offer(
  target_offer_id uuid,
  p_response public.creator_offer_status,
  p_response_note text default null
)
returns public.creator_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  current_creator uuid := public.current_creator_id();
  offer_record public.creator_offers;
  event_type public.platform_event_type;
  event_id uuid;
begin
  if current_creator is null then
    raise exception 'Only creators can respond to enterprise offers';
  end if;

  if p_response not in ('accepted', 'declined', 'change_requested') then
    raise exception 'Unsupported offer response';
  end if;

  update public.creator_offers
  set status = p_response,
      response_note = p_response_note,
      responded_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_offer_id
    and creator_id = current_creator
    and status = 'sent'
  returning * into offer_record;

  if offer_record.id is null then
    raise exception 'Offer not found or no longer open';
  end if;

  update public.enterprise_campaign_creators
  set status = p_response::text::public.enterprise_campaign_creator_status,
      final_offer_amount = offer_record.offer_amount,
      updated_at = timezone('utc', now())
  where id = offer_record.enterprise_campaign_creator_id;

  event_type := case p_response
    when 'accepted' then 'creator_offer_accepted'::public.platform_event_type
    when 'declined' then 'creator_offer_declined'::public.platform_event_type
    else 'creator_offer_change_requested'::public.platform_event_type
  end;

  event_id := public.log_activity_event(
    event_type,
    auth.uid(),
    'creator_offer',
    offer_record.id,
    (select campaign_id from public.enterprise_campaigns where id = offer_record.enterprise_campaign_id),
    null,
    null,
    jsonb_build_object('offer_id', offer_record.id)
  );

  return offer_record;
end;
$$;

create or replace function public.creator_submit_enterprise_deliverable(
  target_offer_id uuid,
  p_title text,
  p_submitted_url text,
  p_submitted_note text default null
)
returns public.campaign_deliverables
language plpgsql
security definer
set search_path = public
as $$
declare
  current_creator uuid := public.current_creator_id();
  offer_record public.creator_offers;
  deliverable_record public.campaign_deliverables;
begin
  if current_creator is null then
    raise exception 'Only creators can submit enterprise deliverables';
  end if;

  select * into offer_record
  from public.creator_offers
  where id = target_offer_id
    and creator_id = current_creator
    and status = 'accepted';

  if offer_record.id is null then
    raise exception 'Accepted offer not found';
  end if;

  if not exists (
    select 1
    from public.enterprise_campaigns
    where id = offer_record.enterprise_campaign_id
      and status in ('brief_released', 'deliverables_in_review', 'payouts_pending_approval')
  ) then
    raise exception 'Brief must be released before deliverables can be submitted';
  end if;

  insert into public.campaign_deliverables (
    enterprise_campaign_id,
    creator_offer_id,
    creator_id,
    title,
    submitted_url,
    submitted_note
  )
  values (
    offer_record.enterprise_campaign_id,
    offer_record.id,
    current_creator,
    coalesce(nullif(trim(p_title), ''), 'Creator deliverable'),
    trim(p_submitted_url),
    p_submitted_note
  )
  returning * into deliverable_record;

  update public.enterprise_campaigns
  set status = 'deliverables_in_review'
  where id = offer_record.enterprise_campaign_id
    and status = 'brief_released';

  perform public.log_activity_event(
    'deliverable_submitted',
    auth.uid(),
    'campaign_deliverable',
    deliverable_record.id,
    (select campaign_id from public.enterprise_campaigns where id = offer_record.enterprise_campaign_id),
    null,
    null,
    jsonb_build_object('deliverable_id', deliverable_record.id)
  );

  return deliverable_record;
end;
$$;

create or replace function public.admin_review_enterprise_deliverable(
  target_deliverable_id uuid,
  p_status public.campaign_deliverable_status,
  p_review_notes text default null,
  p_revision_request text default null
)
returns public.campaign_deliverables
language plpgsql
security definer
set search_path = public
as $$
declare
  deliverable_record public.campaign_deliverables;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can review enterprise deliverables';
  end if;

  if p_status not in ('approved', 'needs_revision', 'rejected') then
    raise exception 'Unsupported deliverable review status';
  end if;

  update public.campaign_deliverables
  set status = p_status,
      review_notes = p_review_notes,
      revision_request = p_revision_request,
      reviewed_by_profile_id = auth.uid(),
      reviewed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_deliverable_id
  returning * into deliverable_record;

  if deliverable_record.id is null then
    raise exception 'Deliverable not found';
  end if;

  perform public.log_activity_event(
    case
      when p_status = 'approved' then 'deliverable_approved'::public.platform_event_type
      when p_status = 'needs_revision' then 'deliverable_needs_revision'::public.platform_event_type
      else 'admin_approval_required'::public.platform_event_type
    end,
    auth.uid(),
    'campaign_deliverable',
    deliverable_record.id,
    (select campaign_id from public.enterprise_campaigns where id = deliverable_record.enterprise_campaign_id),
    null,
    null,
    jsonb_build_object('deliverable_id', deliverable_record.id)
  );

  return deliverable_record;
end;
$$;

create or replace function public.admin_prepare_enterprise_payout(
  target_offer_id uuid,
  p_amount numeric,
  p_reason text default ''
)
returns public.creator_payouts
language plpgsql
security definer
set search_path = public
as $$
declare
  offer_record public.creator_offers;
  payout_record public.creator_payouts;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can prepare enterprise payouts';
  end if;

  select * into offer_record
  from public.creator_offers
  where id = target_offer_id
    and status = 'accepted';

  if offer_record.id is null then
    raise exception 'Accepted offer not found';
  end if;

  if not exists (
    select 1
    from public.campaign_deliverables
    where creator_offer_id = target_offer_id
      and status = 'approved'
  ) then
    raise exception 'At least one approved deliverable is required before payout prep';
  end if;

  insert into public.creator_payouts (
    enterprise_campaign_id,
    creator_offer_id,
    creator_id,
    status,
    amount,
    reason,
    prepared_by_profile_id
  )
  values (
    offer_record.enterprise_campaign_id,
    offer_record.id,
    offer_record.creator_id,
    'pending_admin_approval',
    greatest(coalesce(p_amount, offer_record.offer_amount), 0),
    coalesce(p_reason, ''),
    auth.uid()
  )
  on conflict do nothing;

  select * into payout_record
  from public.creator_payouts
  where creator_offer_id = offer_record.id
  order by created_at desc
  limit 1;

  update public.enterprise_campaigns
  set status = 'payouts_pending_approval'
  where id = offer_record.enterprise_campaign_id;

  return payout_record;
end;
$$;
