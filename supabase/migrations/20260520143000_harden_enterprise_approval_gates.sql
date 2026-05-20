alter type public.platform_event_type add value if not exists 'agent_task_completed';
alter type public.platform_event_type add value if not exists 'brief_released';
alter type public.platform_event_type add value if not exists 'payout_marked_paid';
alter type public.platform_event_type add value if not exists 'brand_update_approved';

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
