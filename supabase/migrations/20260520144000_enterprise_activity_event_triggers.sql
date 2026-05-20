alter type public.platform_event_type add value if not exists 'agent_task_completed';
alter type public.platform_event_type add value if not exists 'brief_released';
alter type public.platform_event_type add value if not exists 'payout_marked_paid';
alter type public.platform_event_type add value if not exists 'brand_update_approved';

create or replace function public.log_enterprise_campaign_status_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' or new.status = old.status then
    return new;
  end if;

  if new.status = 'brief_released' then
    perform public.log_activity_event(
      'brief_released',
      auth.uid(),
      'enterprise_campaign',
      new.id,
      new.campaign_id,
      null,
      null,
      jsonb_build_object('enterprise_campaign_id', new.id)
    );
  elsif new.status = 'completed' then
    perform public.log_activity_event(
      'brand_update_approved',
      auth.uid(),
      'enterprise_campaign',
      new.id,
      new.campaign_id,
      null,
      null,
      jsonb_build_object('enterprise_campaign_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists enterprise_campaigns_activity_events on public.enterprise_campaigns;
create trigger enterprise_campaigns_activity_events
  after update on public.enterprise_campaigns
  for each row execute function public.log_enterprise_campaign_status_event();

create or replace function public.log_enterprise_payout_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_id_value uuid;
begin
  select campaign_id into campaign_id_value
  from public.enterprise_campaigns
  where id = new.enterprise_campaign_id;

  if tg_op = 'INSERT' and new.status in ('prepared', 'pending_admin_approval') then
    perform public.log_activity_event(
      'payout_prepared',
      auth.uid(),
      'creator_payout',
      new.id,
      campaign_id_value,
      null,
      null,
      jsonb_build_object('enterprise_campaign_id', new.enterprise_campaign_id, 'payout_id', new.id)
    );
  elsif tg_op = 'UPDATE' and old.status <> 'paid' and new.status = 'paid' then
    perform public.log_activity_event(
      'payout_marked_paid',
      auth.uid(),
      'creator_payout',
      new.id,
      campaign_id_value,
      null,
      null,
      jsonb_build_object('enterprise_campaign_id', new.enterprise_campaign_id, 'payout_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists creator_payouts_activity_events on public.creator_payouts;
create trigger creator_payouts_activity_events
  after insert or update on public.creator_payouts
  for each row execute function public.log_enterprise_payout_event();
