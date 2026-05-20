create or replace function public.sync_enterprise_shortlist_pending_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_enterprise_campaign_id uuid;
begin
  if tg_table_name = 'enterprise_campaign_creators' then
    target_enterprise_campaign_id := new.enterprise_campaign_id;
  else
    target_enterprise_campaign_id := new.id;
  end if;

  update public.enterprise_campaigns ec
  set status = 'shortlist_pending_approval',
      updated_at = timezone('utc', now())
  where ec.id = target_enterprise_campaign_id
    and ec.status = 'plan_approved'
    and exists (
      select 1
      from public.enterprise_campaign_creators ecc
      where ecc.enterprise_campaign_id = ec.id
        and ecc.status = 'proposed'
    );

  return new;
end;
$$;

drop trigger if exists enterprise_campaign_creators_sync_shortlist_status on public.enterprise_campaign_creators;
create trigger enterprise_campaign_creators_sync_shortlist_status
  after insert or update of status on public.enterprise_campaign_creators
  for each row execute function public.sync_enterprise_shortlist_pending_status();

drop trigger if exists enterprise_campaigns_sync_shortlist_status on public.enterprise_campaigns;
create trigger enterprise_campaigns_sync_shortlist_status
  after update of status on public.enterprise_campaigns
  for each row
  when (new.status = 'plan_approved')
  execute function public.sync_enterprise_shortlist_pending_status();

update public.enterprise_campaigns ec
set status = 'shortlist_pending_approval',
    updated_at = timezone('utc', now())
where ec.status = 'plan_approved'
  and exists (
    select 1
    from public.enterprise_campaign_creators ecc
    where ecc.enterprise_campaign_id = ec.id
      and ecc.status = 'proposed'
  );
