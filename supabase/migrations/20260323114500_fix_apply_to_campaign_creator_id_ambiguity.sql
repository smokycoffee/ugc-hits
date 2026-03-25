create or replace function public.apply_to_campaign(
  target_campaign_id uuid,
  application_note text default null
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  current_creator_record_id uuid := public.current_creator_id();
  application_record public.applications;
  campaign_brand_id uuid;
  campaign_title text;
  campaign_record_id uuid;
  owner_profile_id uuid;
  conversation_id uuid;
  created_event_id uuid;
begin
  if current_id is null or current_creator_record_id is null then
    raise exception 'Only authenticated creators can apply';
  end if;

  select c.id, c.brand_id, c.title, b.profile_id
  into campaign_record_id, campaign_brand_id, campaign_title, owner_profile_id
  from public.campaigns c
  join public.brands b on b.id = c.brand_id
  where c.id = target_campaign_id;

  if campaign_record_id is null then
    raise exception 'Campaign not found';
  end if;

  if not exists (
    select 1
    from public.campaign_matches cm
    where cm.campaign_id = target_campaign_id
      and cm.creator_id = current_creator_record_id
      and cm.status = 'matched'
  ) then
    raise exception 'Campaign is not matched to this creator';
  end if;

  insert into public.applications (
    campaign_id,
    creator_id,
    created_by_profile_id,
    status,
    note
  )
  values (
    target_campaign_id,
    current_creator_record_id,
    current_id,
    'submitted',
    application_note
  )
  on conflict (campaign_id, creator_id) do update
    set note = excluded.note,
        status = 'submitted',
        updated_at = timezone('utc', now())
  returning * into application_record;

  conversation_id := public.ensure_conversation(
    target_campaign_id,
    campaign_brand_id,
    current_creator_record_id
  );

  created_event_id := public.log_activity_event(
    'creator_applied_to_campaign',
    current_id,
    'application',
    application_record.id,
    target_campaign_id,
    application_record.id,
    conversation_id,
    jsonb_build_object('campaign_title', campaign_title)
  );

  perform public.queue_notification_and_email(
    created_event_id,
    'creator_applied_to_campaign',
    owner_profile_id,
    (select email from public.profiles where id = owner_profile_id),
    jsonb_build_object(
      'campaign_id', campaign_record_id,
      'campaign_title', campaign_title,
      'application_id', application_record.id,
      'conversation_id', conversation_id
    )
  );

  return application_record;
end;
$$;
