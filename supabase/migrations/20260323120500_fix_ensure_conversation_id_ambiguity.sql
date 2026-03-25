create or replace function public.ensure_conversation(
  p_campaign_id uuid,
  p_brand_id uuid,
  p_creator_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_conversation_id uuid;
  brand_profile_id uuid;
  creator_profile_id uuid;
begin
  select id into current_conversation_id
  from public.conversations
  where campaign_id = p_campaign_id
    and brand_id = p_brand_id
    and creator_id = p_creator_id;

  if current_conversation_id is null then
    insert into public.conversations (campaign_id, brand_id, creator_id)
    values (p_campaign_id, p_brand_id, p_creator_id)
    returning id into current_conversation_id;
  end if;

  select profile_id into brand_profile_id from public.brands where id = p_brand_id;
  select profile_id into creator_profile_id from public.creators where id = p_creator_id;

  insert into public.conversation_participants (conversation_id, profile_id, last_read_at)
  values
    (current_conversation_id, brand_profile_id, timezone('utc', now())),
    (current_conversation_id, creator_profile_id, timezone('utc', now()))
  on conflict (conversation_id, profile_id) do update
    set last_read_at = coalesce(public.conversation_participants.last_read_at, excluded.last_read_at);

  return current_conversation_id;
end;
$$;
