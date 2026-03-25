create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type public.profile_role as enum ('brand', 'creator', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_invite_status') then
    create type public.platform_invite_status as enum ('pending', 'redeemed', 'expired', 'revoked');
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type public.campaign_status as enum ('draft', 'live', 'paused', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_match_status') then
    create type public.campaign_match_status as enum ('matched', 'hidden', 'expired');
  end if;

  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum ('submitted', 'accepted', 'rejected', 'withdrawn');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type public.notification_status as enum ('unread', 'read');
  end if;

  if not exists (select 1 from pg_type where typname = 'email_job_status') then
    create type public.email_job_status as enum ('pending', 'processing', 'sent', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_event_type') then
    create type public.platform_event_type as enum (
      'creator_invited_to_platform',
      'creator_activated_account',
      'campaign_published',
      'campaign_matched_to_creator',
      'creator_applied_to_campaign',
      'brand_accepted_application',
      'brand_rejected_application',
      'message_sent'
    );
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'creator',
  email text not null,
  full_name text,
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email_matches boolean not null default true,
  email_applications boolean not null default true,
  email_decisions boolean not null default true,
  email_messages boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null,
  product_type text not null,
  website text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  email text not null unique,
  status text not null default 'active',
  display_name text,
  application_source text not null default 'google_form',
  application_notes text,
  creator_profile_seed jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.profile_role not null default 'creator',
  invite_code_hash text not null unique,
  status public.platform_invite_status not null default 'pending',
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  creator_profile_seed jsonb not null default '{}'::jsonb,
  created_by_admin uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  status public.campaign_status not null default 'live',
  title text not null,
  description text not null,
  product_type text not null,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  creator_slots integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_matches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.campaign_match_status not null default 'matched',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  matched_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, creator_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  status public.application_status not null default 'submitted',
  note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, creator_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, brand_id, creator_id)
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  event_type public.platform_event_type not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  subject_type text not null,
  subject_id uuid,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.activity_events(id) on delete cascade,
  type public.platform_event_type not null,
  title text not null,
  body text not null,
  status public.notification_status not null default 'unread',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.activity_events(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  template text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text,
  status public.email_job_status not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists email_jobs_dedupe_key_unique
  on public.email_jobs (dedupe_key)
  where dedupe_key is not null;

create index if not exists campaigns_brand_id_idx on public.campaigns (brand_id);
create index if not exists campaign_matches_creator_id_idx on public.campaign_matches (creator_id);
create index if not exists applications_campaign_id_idx on public.applications (campaign_id);
create index if not exists applications_creator_id_idx on public.applications (creator_id);
create index if not exists conversations_brand_creator_idx on public.conversations (brand_id, creator_id);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at desc);
create index if not exists notifications_profile_status_idx on public.notifications (profile_id, status, created_at desc);
create index if not exists email_jobs_status_scheduled_idx on public.email_jobs (status, scheduled_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_brand_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.brands where profile_id = auth.uid();
$$;

create or replace function public.current_creator_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.creators where profile_id = auth.uid();
$$;

create or replace function public.normalize_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(raw_code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.hash_invite_code(raw_code text)
returns text
language sql
immutable
as $$
  select encode(digest(public.normalize_invite_code(raw_code), 'sha256'), 'hex');
$$;

create or replace function public.generate_invite_code()
returns text
language sql
volatile
as $$
  select upper(encode(gen_random_bytes(5), 'hex'));
$$;

create or replace function public.notification_copy(
  event_type public.platform_event_type,
  campaign_title text default null
)
returns table(title text, body text)
language plpgsql
immutable
as $$
begin
  case event_type
    when 'creator_invited_to_platform' then
      return query select 'Your creator invite is ready', 'Use your invite code to activate your UGC Hits account.';
    when 'creator_activated_account' then
      return query select 'Creator account activated', 'The creator finished invite redemption and can now access the platform.';
    when 'campaign_published' then
      return query select 'Campaign published', coalesce(campaign_title, 'Your campaign is now live.');
    when 'campaign_matched_to_creator' then
      return query select 'New matched campaign', coalesce(campaign_title, 'A campaign has been matched to your profile.');
    when 'creator_applied_to_campaign' then
      return query select 'New creator application', coalesce(campaign_title, 'A creator applied to your campaign.');
    when 'brand_accepted_application' then
      return query select 'Application accepted', coalesce(campaign_title, 'A brand accepted your application.');
    when 'brand_rejected_application' then
      return query select 'Application update', coalesce(campaign_title, 'A brand updated your application.');
    when 'message_sent' then
      return query select 'New message', coalesce(campaign_title, 'You have a new message in UGC Hits.');
    else
      return query select 'Platform update', 'There is a new update in your UGC Hits workspace.';
  end case;
end;
$$;

create or replace function public.email_template_for_event(event_type public.platform_event_type)
returns text
language sql
immutable
as $$
  select case event_type
    when 'creator_invited_to_platform' then 'platform_invite'
    when 'campaign_matched_to_creator' then 'campaign_matched'
    when 'creator_applied_to_campaign' then 'new_application_received'
    when 'brand_accepted_application' then 'application_accepted'
    when 'brand_rejected_application' then 'application_rejected'
    when 'message_sent' then 'new_message'
    else 'platform_update'
  end;
$$;

create or replace function public.log_activity_event(
  p_event_type public.platform_event_type,
  p_actor_profile_id uuid,
  p_subject_type text,
  p_subject_id uuid,
  p_campaign_id uuid default null,
  p_application_id uuid default null,
  p_conversation_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created_event_id uuid;
begin
  insert into public.activity_events (
    event_type,
    actor_profile_id,
    subject_type,
    subject_id,
    campaign_id,
    application_id,
    conversation_id,
    metadata
  )
  values (
    p_event_type,
    p_actor_profile_id,
    p_subject_type,
    p_subject_id,
    p_campaign_id,
    p_application_id,
    p_conversation_id,
    p_metadata
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function public.queue_notification_and_email(
  p_event_id uuid,
  p_event_type public.platform_event_type,
  p_recipient_profile_id uuid,
  p_email text,
  p_payload jsonb default '{}'::jsonb,
  p_dedupe_key text default null,
  p_skip_email boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  copy_record record;
  created_notification_id uuid;
  prefs public.notification_preferences;
  should_email boolean;
begin
  select * into copy_record
  from public.notification_copy(p_event_type, p_payload ->> 'campaign_title');

  insert into public.notifications (profile_id, event_id, type, title, body)
  values (
    p_recipient_profile_id,
    p_event_id,
    p_event_type,
    copy_record.title,
    copy_record.body
  )
  returning id into created_notification_id;

  select * into prefs
  from public.notification_preferences
  where profile_id = p_recipient_profile_id;

  should_email := not p_skip_email and (
    case
      when p_event_type = 'campaign_matched_to_creator' then coalesce(prefs.email_matches, true)
      when p_event_type = 'creator_applied_to_campaign' then coalesce(prefs.email_applications, true)
      when p_event_type in ('brand_accepted_application', 'brand_rejected_application') then coalesce(prefs.email_decisions, true)
      when p_event_type = 'message_sent' then coalesce(prefs.email_messages, true)
      when p_event_type = 'creator_invited_to_platform' then true
      else false
    end
  );

  if should_email then
    insert into public.email_jobs (
      event_id,
      notification_id,
      profile_id,
      email,
      template,
      subject,
      payload,
      dedupe_key
    )
    values (
      p_event_id,
      created_notification_id,
      p_recipient_profile_id,
      p_email,
      public.email_template_for_event(p_event_type),
      copy_record.title,
      p_payload,
      p_dedupe_key
    )
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;

  return created_notification_id;
end;
$$;

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
  conversation_id uuid;
  brand_profile_id uuid;
  creator_profile_id uuid;
begin
  select id into conversation_id
  from public.conversations
  where campaign_id = p_campaign_id
    and brand_id = p_brand_id
    and creator_id = p_creator_id;

  if conversation_id is null then
    insert into public.conversations (campaign_id, brand_id, creator_id)
    values (p_campaign_id, p_brand_id, p_creator_id)
    returning id into conversation_id;
  end if;

  select profile_id into brand_profile_id from public.brands where id = p_brand_id;
  select profile_id into creator_profile_id from public.creators where id = p_creator_id;

  insert into public.conversation_participants (conversation_id, profile_id, last_read_at)
  values
    (conversation_id, brand_profile_id, timezone('utc', now())),
    (conversation_id, creator_profile_id, timezone('utc', now()))
  on conflict (conversation_id, profile_id) do update
    set last_read_at = coalesce(public.conversation_participants.last_read_at, excluded.last_read_at);

  return conversation_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email, full_name, avatar_url, last_seen_at)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.profile_role, 'creator'),
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    timezone('utc', now())
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        last_seen_at = timezone('utc', now());

  insert into public.notification_preferences (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.bootstrap_first_admin()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  profile_record public.profiles;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'An admin already exists';
  end if;

  insert into public.profiles (id, role, email, last_seen_at)
  values (current_id, 'admin', public.current_user_email(), timezone('utc', now()))
  on conflict (id) do update
    set role = 'admin',
        email = excluded.email,
        last_seen_at = timezone('utc', now())
  returning * into profile_record;

  insert into public.notification_preferences (profile_id)
  values (current_id)
  on conflict (profile_id) do nothing;

  return profile_record;
end;
$$;

create or replace function public.sync_profile_role(
  requested_role public.profile_role,
  requested_full_name text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  profile_record public.profiles;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, role, email, full_name, last_seen_at)
  values (
    current_id,
    requested_role,
    public.current_user_email(),
    requested_full_name,
    timezone('utc', now())
  )
  on conflict (id) do update
    set role = case
        when public.profiles.role = 'admin' then public.profiles.role
        when public.profiles.role = requested_role then public.profiles.role
        when requested_role = 'brand' and not exists (
          select 1 from public.creators where profile_id = current_id
        ) then requested_role
        when requested_role = 'creator' and not exists (
          select 1 from public.brands where profile_id = current_id
        ) then requested_role
        else public.profiles.role
      end,
        email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        last_seen_at = timezone('utc', now())
  returning * into profile_record;

  insert into public.notification_preferences (profile_id)
  values (current_id)
  on conflict (profile_id) do nothing;

  return profile_record;
end;
$$;

create or replace function public.admin_create_platform_invite(
  invitee_email text,
  creator_seed jsonb default '{}'::jsonb,
  expires_in_days integer default 14
)
returns table(
  invite_id uuid,
  email text,
  invite_code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_event_id uuid;
  raw_code text;
  code_hash text;
  expiry timestamptz := timezone('utc', now()) + make_interval(days => greatest(expires_in_days, 1));
  admin_email text;
  invite_record public.platform_invites;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can create invites';
  end if;

  raw_code := public.generate_invite_code();
  code_hash := public.hash_invite_code(raw_code);

  insert into public.platform_invites (
    email,
    role,
    invite_code_hash,
    status,
    expires_at,
    creator_profile_seed,
    created_by_admin
  )
  values (
    lower(invitee_email),
    'creator',
    code_hash,
    'pending',
    expiry,
    creator_seed,
    auth.uid()
  )
  returning * into invite_record;

  created_event_id := public.log_activity_event(
    'creator_invited_to_platform',
    auth.uid(),
    'platform_invite',
    invite_record.id,
    null,
    null,
    null,
    jsonb_build_object(
      'invite_email', lower(invitee_email),
      'invite_code', raw_code
    )
  );

  perform public.queue_notification_and_email(
    created_event_id,
    'creator_invited_to_platform',
    auth.uid(),
    lower(invitee_email),
    jsonb_build_object(
      'invite_code', raw_code,
      'invite_email', lower(invitee_email),
      'invite_id', invite_record.id,
      'expires_at', expiry
    )
  );

  return query
  select invite_record.id, lower(invitee_email), raw_code, expiry;
end;
$$;

create or replace function public.admin_revoke_platform_invite(invite_id uuid)
returns public.platform_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.platform_invites;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can revoke invites';
  end if;

  update public.platform_invites
  set status = 'revoked',
      updated_at = timezone('utc', now())
  where id = invite_id
  returning * into invite_record;

  if invite_record.id is null then
    raise exception 'Invite not found';
  end if;

  return invite_record;
end;
$$;

create or replace function public.redeem_platform_invite(invite_code text)
returns public.creators
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  invite_record public.platform_invites;
  creator_record public.creators;
  created_event_id uuid;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into invite_record
  from public.platform_invites
  where invite_code_hash = public.hash_invite_code(invite_code)
    and email = public.current_user_email()
    and status = 'pending'
    and expires_at > timezone('utc', now())
  limit 1;

  if invite_record.id is null then
    raise exception 'Invite is invalid or expired';
  end if;

  perform public.sync_profile_role('creator');

  insert into public.creators (
    profile_id,
    email,
    status,
    display_name,
    creator_profile_seed
  )
  values (
    current_id,
    invite_record.email,
    'active',
    coalesce((select full_name from public.profiles where id = current_id), split_part(invite_record.email, '@', 1)),
    invite_record.creator_profile_seed
  )
  on conflict (email) do update
    set profile_id = excluded.profile_id,
        status = 'active',
        creator_profile_seed = public.creators.creator_profile_seed || excluded.creator_profile_seed
  returning * into creator_record;

  update public.platform_invites
  set status = 'redeemed',
      redeemed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = invite_record.id;

  created_event_id := public.log_activity_event(
    'creator_activated_account',
    current_id,
    'creator',
    creator_record.id,
    null,
    null,
    null,
    jsonb_build_object('invite_id', invite_record.id)
  );

  return creator_record;
end;
$$;

create or replace function public.create_campaign(
  company_name text,
  brand_product_type text,
  campaign_title text,
  campaign_description text,
  campaign_budget_min numeric default null,
  campaign_budget_max numeric default null,
  campaign_creator_slots integer default 1
)
returns public.campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  brand_record public.brands;
  campaign_record public.campaigns;
  created_event_id uuid;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.sync_profile_role('brand');

  insert into public.brands (profile_id, company_name, product_type)
  values (current_id, company_name, brand_product_type)
  on conflict (profile_id) do update
    set company_name = excluded.company_name,
        product_type = excluded.product_type,
        updated_at = timezone('utc', now())
  returning * into brand_record;

  insert into public.campaigns (
    brand_id,
    created_by_profile_id,
    status,
    title,
    description,
    product_type,
    budget_min,
    budget_max,
    creator_slots
  )
  values (
    brand_record.id,
    current_id,
    'live',
    campaign_title,
    campaign_description,
    brand_product_type,
    campaign_budget_min,
    campaign_budget_max,
    greatest(campaign_creator_slots, 1)
  )
  returning * into campaign_record;

  created_event_id := public.log_activity_event(
    'campaign_published',
    current_id,
    'campaign',
    campaign_record.id,
    campaign_record.id,
    null,
    null,
    jsonb_build_object('campaign_title', campaign_record.title)
  );

  return campaign_record;
end;
$$;

create or replace function public.match_campaign_to_creator(
  target_campaign_id uuid,
  target_creator_id uuid
)
returns public.campaign_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  match_record public.campaign_matches;
  campaign_record public.campaigns;
  creator_record public.creators;
  created_event_id uuid;
begin
  if public.current_profile_role() <> 'admin' then
    raise exception 'Only admins can match campaigns';
  end if;

  select * into campaign_record from public.campaigns where id = target_campaign_id;
  select * into creator_record from public.creators where id = target_creator_id;

  if campaign_record.id is null or creator_record.id is null then
    raise exception 'Campaign or creator not found';
  end if;

  insert into public.campaign_matches (
    campaign_id,
    creator_id,
    status,
    created_by_profile_id
  )
  values (
    target_campaign_id,
    target_creator_id,
    'matched',
    auth.uid()
  )
  on conflict (campaign_id, creator_id) do update
    set status = 'matched',
        created_by_profile_id = auth.uid(),
        matched_at = timezone('utc', now())
  returning * into match_record;

  created_event_id := public.log_activity_event(
    'campaign_matched_to_creator',
    auth.uid(),
    'campaign_match',
    match_record.id,
    target_campaign_id,
    null,
    null,
    jsonb_build_object('campaign_title', campaign_record.title)
  );

  perform public.queue_notification_and_email(
    created_event_id,
    'campaign_matched_to_creator',
    creator_record.profile_id,
    creator_record.email,
    jsonb_build_object(
      'campaign_id', campaign_record.id,
      'campaign_title', campaign_record.title
    )
  );

  return match_record;
end;
$$;

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
  creator_id uuid := public.current_creator_id();
  application_record public.applications;
  campaign_brand_id uuid;
  campaign_title text;
  campaign_record_id uuid;
  owner_profile_id uuid;
  conversation_id uuid;
  created_event_id uuid;
begin
  if current_id is null or creator_id is null then
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
      and cm.creator_id = creator_id
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
    creator_id,
    current_id,
    'submitted',
    application_note
  )
  on conflict (campaign_id, creator_id) do update
    set note = excluded.note,
        status = 'submitted',
        updated_at = timezone('utc', now())
  returning * into application_record;

  conversation_id := public.ensure_conversation(target_campaign_id, campaign_brand_id, creator_id);

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

create or replace function public.accept_application(target_application_id uuid)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  application_record public.applications;
  creator_record public.creators;
  brand_id uuid;
  campaign_title text;
  campaign_id uuid;
  creator_id uuid;
  application_id uuid;
  owner_profile_id uuid;
  conversation_id uuid;
  created_event_id uuid;
begin
  select a.id, a.campaign_id, a.creator_id, c.brand_id, c.title, b.profile_id
  into application_id, campaign_id, creator_id, brand_id, campaign_title, owner_profile_id
  from public.applications a
  join public.campaigns c on c.id = a.campaign_id
  join public.brands b on b.id = c.brand_id
  where a.id = target_application_id;

  if application_id is null then
    raise exception 'Application not found';
  end if;

  if owner_profile_id <> current_id and public.current_profile_role() <> 'admin' then
    raise exception 'Only the owning brand can accept the application';
  end if;

  update public.applications
  set status = 'accepted',
      reviewed_by_profile_id = current_id,
      reviewed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_application_id
  returning * into application_record;

  select * into creator_record from public.creators where id = application_record.creator_id;
  conversation_id := public.ensure_conversation(application_record.campaign_id, brand_id, application_record.creator_id);

  created_event_id := public.log_activity_event(
    'brand_accepted_application',
    current_id,
    'application',
    application_record.id,
    application_record.campaign_id,
    application_record.id,
    conversation_id,
    jsonb_build_object('campaign_title', campaign_title)
  );

  perform public.queue_notification_and_email(
    created_event_id,
    'brand_accepted_application',
    creator_record.profile_id,
    creator_record.email,
    jsonb_build_object(
      'campaign_id', application_record.campaign_id,
      'campaign_title', campaign_title,
      'application_id', application_record.id,
      'conversation_id', conversation_id
    )
  );

  return application_record;
end;
$$;

create or replace function public.reject_application(target_application_id uuid)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  application_record public.applications;
  creator_record public.creators;
  campaign_title text;
  application_id uuid;
  owner_profile_id uuid;
  created_event_id uuid;
begin
  select a.id, c.title, b.profile_id
  into application_id, campaign_title, owner_profile_id
  from public.applications a
  join public.campaigns c on c.id = a.campaign_id
  join public.brands b on b.id = c.brand_id
  where a.id = target_application_id;

  if application_id is null then
    raise exception 'Application not found';
  end if;

  if owner_profile_id <> current_id and public.current_profile_role() <> 'admin' then
    raise exception 'Only the owning brand can reject the application';
  end if;

  update public.applications
  set status = 'rejected',
      reviewed_by_profile_id = current_id,
      reviewed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_application_id
  returning * into application_record;

  select * into creator_record from public.creators where id = application_record.creator_id;

  created_event_id := public.log_activity_event(
    'brand_rejected_application',
    current_id,
    'application',
    application_record.id,
    application_record.campaign_id,
    application_record.id,
    null,
    jsonb_build_object('campaign_title', campaign_title)
  );

  perform public.queue_notification_and_email(
    created_event_id,
    'brand_rejected_application',
    creator_record.profile_id,
    creator_record.email,
    jsonb_build_object(
      'campaign_id', application_record.campaign_id,
      'campaign_title', campaign_title,
      'application_id', application_record.id
    )
  );

  return application_record;
end;
$$;

create or replace function public.send_message(
  target_conversation_id uuid,
  message_body text
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  message_record public.messages;
  conversation_campaign_id uuid;
  conversation_campaign_title text;
  created_event_id uuid;
  recipient record;
  dedupe_window timestamptz;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.conversation_participants
    where conversation_id = target_conversation_id
      and profile_id = current_id
  ) then
    raise exception 'You are not part of this conversation';
  end if;

  select c.campaign_id, campaigns.title
  into conversation_campaign_id, conversation_campaign_title
  from public.conversations c
  join public.campaigns campaigns on campaigns.id = c.campaign_id
  where c.id = target_conversation_id;

  insert into public.messages (conversation_id, sender_profile_id, body)
  values (target_conversation_id, current_id, trim(message_body))
  returning * into message_record;

  update public.conversation_participants
  set last_read_at = timezone('utc', now())
  where conversation_id = target_conversation_id
    and profile_id = current_id;

  created_event_id := public.log_activity_event(
    'message_sent',
    current_id,
    'message',
    message_record.id,
    conversation_campaign_id,
    null,
    target_conversation_id,
    jsonb_build_object('campaign_title', conversation_campaign_title)
  );

  dedupe_window := to_timestamp(floor(extract(epoch from timezone('utc', now())) / 900) * 900);

  for recipient in
    select
      cp.profile_id,
      p.email,
      cp.last_read_at
    from public.conversation_participants cp
    join public.profiles p on p.id = cp.profile_id
    where cp.conversation_id = target_conversation_id
      and cp.profile_id <> current_id
  loop
    perform public.queue_notification_and_email(
      created_event_id,
      'message_sent',
      recipient.profile_id,
      recipient.email,
      jsonb_build_object(
        'conversation_id', target_conversation_id,
        'campaign_id', conversation_campaign_id,
        'campaign_title', conversation_campaign_title,
        'message_preview', left(trim(message_body), 140)
      ),
      'message:' || target_conversation_id || ':' || recipient.profile_id || ':' || dedupe_window::text,
      recipient.last_read_at is not null and recipient.last_read_at > timezone('utc', now()) - interval '2 minutes'
    );
  end loop;

  return message_record;
end;
$$;

create or replace function public.mark_conversation_seen(target_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversation_participants
  set last_read_at = timezone('utc', now())
  where conversation_id = target_conversation_id
    and profile_id = auth.uid();
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute procedure public.set_updated_at();

drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at
  before update on public.brands
  for each row execute procedure public.set_updated_at();

drop trigger if exists creators_set_updated_at on public.creators;
create trigger creators_set_updated_at
  before update on public.creators
  for each row execute procedure public.set_updated_at();

drop trigger if exists platform_invites_set_updated_at on public.platform_invites;
create trigger platform_invites_set_updated_at
  before update on public.platform_invites
  for each row execute procedure public.set_updated_at();

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute procedure public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.brands enable row level security;
alter table public.creators enable row level security;
alter table public.platform_invites enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_matches enable row level security;
alter table public.applications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;
alter table public.email_jobs enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.current_profile_role() = 'admin')
  with check (id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own on public.notification_preferences
  for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own on public.notification_preferences
  for update to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'admin')
  with check (profile_id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists brands_select_related on public.brands;
create policy brands_select_related on public.brands
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or exists (
      select 1
      from public.campaign_matches cm
      join public.campaigns c on c.id = cm.campaign_id
      join public.creators cr on cr.id = cm.creator_id
      where c.brand_id = brands.id
        and cr.profile_id = auth.uid()
    )
  );

drop policy if exists creators_select_related on public.creators;
create policy creators_select_related on public.creators
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or exists (
      select 1
      from public.applications a
      join public.campaigns c on c.id = a.campaign_id
      join public.brands b on b.id = c.brand_id
      where a.creator_id = creators.id
        and b.profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.campaign_matches cm
      join public.campaigns c on c.id = cm.campaign_id
      join public.brands b on b.id = c.brand_id
      where cm.creator_id = creators.id
        and b.profile_id = auth.uid()
    )
  );

drop policy if exists platform_invites_admin_only on public.platform_invites;
create policy platform_invites_admin_only on public.platform_invites
  for all to authenticated
  using (public.current_profile_role() = 'admin')
  with check (public.current_profile_role() = 'admin');

drop policy if exists campaigns_select_related on public.campaigns;
create policy campaigns_select_related on public.campaigns
  for select to authenticated
  using (
    exists (select 1 from public.brands b where b.id = campaigns.brand_id and b.profile_id = auth.uid())
    or public.current_profile_role() = 'admin'
    or exists (
      select 1
      from public.campaign_matches cm
      join public.creators cr on cr.id = cm.creator_id
      where cm.campaign_id = campaigns.id
        and cr.profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.applications a
      join public.creators cr on cr.id = a.creator_id
      where a.campaign_id = campaigns.id
        and cr.profile_id = auth.uid()
    )
  );

drop policy if exists campaign_matches_select_related on public.campaign_matches;
create policy campaign_matches_select_related on public.campaign_matches
  for select to authenticated
  using (
    exists (
      select 1
      from public.creators cr
      where cr.id = campaign_matches.creator_id
        and cr.profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.campaigns c
      join public.brands b on b.id = c.brand_id
      where c.id = campaign_matches.campaign_id
        and b.profile_id = auth.uid()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists applications_select_related on public.applications;
create policy applications_select_related on public.applications
  for select to authenticated
  using (
    exists (
      select 1
      from public.creators cr
      where cr.id = applications.creator_id
        and cr.profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.campaigns c
      join public.brands b on b.id = c.brand_id
      where c.id = applications.campaign_id
        and b.profile_id = auth.uid()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists conversations_select_related on public.conversations;
create policy conversations_select_related on public.conversations
  for select to authenticated
  using (
    exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.profile_id = auth.uid()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists conversation_participants_select_related on public.conversation_participants;
create policy conversation_participants_select_related on public.conversation_participants
  for select to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
        and cp.profile_id = auth.uid()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists messages_select_related on public.messages;
create policy messages_select_related on public.messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id = auth.uid()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists activity_events_select_related on public.activity_events;
create policy activity_events_select_related on public.activity_events
  for select to authenticated
  using (
    actor_profile_id = auth.uid()
    or exists (select 1 from public.notifications n where n.event_id = activity_events.id and n.profile_id = auth.uid())
    or public.current_profile_role() = 'admin'
  );

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'admin')
  with check (profile_id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists email_jobs_admin_only on public.email_jobs;
create policy email_jobs_admin_only on public.email_jobs
  for select to authenticated
  using (public.current_profile_role() = 'admin');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table public.applications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'campaign_matches'
  ) then
    alter publication supabase_realtime add table public.campaign_matches;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
