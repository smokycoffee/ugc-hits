alter table public.brands
  add column if not exists instagram text,
  add column if not exists tiktok text,
  add column if not exists logo_asset_name text,
  add column if not exists contact_name text,
  add column if not exists contact_role text,
  add column if not exists referral_source text;

alter table public.campaigns
  add column if not exists is_primary boolean not null default false,
  add column if not exists creator_niches text[] not null default '{}'::text[],
  add column if not exists creator_location text,
  add column if not exists creator_age_ranges text[] not null default '{}'::text[],
  add column if not exists creator_genders text[] not null default '{}'::text[],
  add column if not exists creator_ethnicities text[] not null default '{}'::text[],
  add column if not exists campaign_type text,
  add column if not exists campaign_frequency text,
  add column if not exists unique_posts integer,
  add column if not exists posting_platforms text[] not null default '{}'::text[],
  add column if not exists minimum_follower_count text,
  add column if not exists includes_paid_usage boolean not null default false,
  add column if not exists inspiration_links text[] not null default '{}'::text[],
  add column if not exists onboarding_completed_at timestamptz;

with latest_campaigns as (
  select distinct on (brand_id) id, brand_id
  from public.campaigns
  order by brand_id, created_at desc, updated_at desc, id desc
)
update public.campaigns c
set is_primary = true
from latest_campaigns lc
where c.id = lc.id
  and not exists (
    select 1
    from public.campaigns existing
    where existing.brand_id = lc.brand_id
      and existing.is_primary = true
  );

create unique index if not exists campaigns_primary_brand_idx
  on public.campaigns (brand_id)
  where is_primary = true;

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
  primary_exists boolean := false;
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

  select exists(
    select 1
    from public.campaigns
    where brand_id = brand_record.id
      and is_primary = true
  )
  into primary_exists;

  insert into public.campaigns (
    brand_id,
    created_by_profile_id,
    status,
    title,
    description,
    product_type,
    budget_min,
    budget_max,
    creator_slots,
    is_primary
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
    greatest(campaign_creator_slots, 1),
    not primary_exists
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

create or replace function public.upsert_brand_onboarding_campaign(
  p_company_name text,
  p_brand_product_type text,
  p_company_website text default null,
  p_brand_instagram text default null,
  p_brand_tiktok text default null,
  p_company_logo_asset_name text default null,
  p_brand_contact_name text default null,
  p_brand_contact_role text default null,
  p_brand_referral_source text default null,
  p_campaign_title text default null,
  p_campaign_description text default null,
  p_campaign_budget_min numeric default null,
  p_campaign_budget_max numeric default null,
  p_campaign_creator_slots integer default 1,
  p_campaign_creator_niches text[] default null,
  p_campaign_creator_location text default null,
  p_campaign_creator_age_ranges text[] default null,
  p_campaign_creator_genders text[] default null,
  p_campaign_creator_ethnicities text[] default null,
  p_campaign_type text default null,
  p_campaign_frequency text default null,
  p_campaign_unique_posts integer default null,
  p_campaign_posting_platforms text[] default null,
  p_campaign_minimum_follower_count text default null,
  p_campaign_includes_paid_usage boolean default false,
  p_campaign_inspiration_links text[] default null
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
  target_campaign_id uuid;
  created_event_id uuid;
begin
  if current_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.sync_profile_role('brand');

  insert into public.brands (
    profile_id,
    company_name,
    product_type,
    website,
    instagram,
    tiktok,
    logo_asset_name,
    contact_name,
    contact_role,
    referral_source
  )
  values (
    current_id,
    p_company_name,
    p_brand_product_type,
    p_company_website,
    p_brand_instagram,
    p_brand_tiktok,
    p_company_logo_asset_name,
    p_brand_contact_name,
    p_brand_contact_role,
    p_brand_referral_source
  )
  on conflict (profile_id) do update
    set company_name = excluded.company_name,
        product_type = excluded.product_type,
        website = excluded.website,
        instagram = excluded.instagram,
        tiktok = excluded.tiktok,
        logo_asset_name = excluded.logo_asset_name,
        contact_name = excluded.contact_name,
        contact_role = excluded.contact_role,
        referral_source = excluded.referral_source,
        updated_at = timezone('utc', now())
  returning * into brand_record;

  select id
  into target_campaign_id
  from public.campaigns
  where brand_id = brand_record.id
    and is_primary = true
  order by updated_at desc, created_at desc
  limit 1;

  if target_campaign_id is null then
    select id
    into target_campaign_id
    from public.campaigns
    where brand_id = brand_record.id
    order by created_at desc, updated_at desc, id desc
    limit 1;
  end if;

  if target_campaign_id is null then
    insert into public.campaigns (
      brand_id,
      created_by_profile_id,
      status,
      title,
      description,
      product_type,
      budget_min,
      budget_max,
      creator_slots,
      is_primary,
      creator_niches,
      creator_location,
      creator_age_ranges,
      creator_genders,
      creator_ethnicities,
      campaign_type,
      campaign_frequency,
      unique_posts,
      posting_platforms,
      minimum_follower_count,
      includes_paid_usage,
      inspiration_links,
      onboarding_completed_at
    )
    values (
      brand_record.id,
      current_id,
      'live',
      p_campaign_title,
      p_campaign_description,
      p_brand_product_type,
      p_campaign_budget_min,
      p_campaign_budget_max,
      greatest(coalesce(p_campaign_creator_slots, 1), 1),
      true,
      coalesce(p_campaign_creator_niches, '{}'::text[]),
      p_campaign_creator_location,
      coalesce(p_campaign_creator_age_ranges, '{}'::text[]),
      coalesce(p_campaign_creator_genders, '{}'::text[]),
      coalesce(p_campaign_creator_ethnicities, '{}'::text[]),
      p_campaign_type,
      p_campaign_frequency,
      greatest(coalesce(p_campaign_unique_posts, 1), 1),
      coalesce(p_campaign_posting_platforms, '{}'::text[]),
      p_campaign_minimum_follower_count,
      coalesce(p_campaign_includes_paid_usage, false),
      coalesce(p_campaign_inspiration_links, '{}'::text[]),
      timezone('utc', now())
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
  end if;

  update public.campaigns
  set is_primary = false
  where brand_id = brand_record.id
    and id <> target_campaign_id
    and is_primary = true;

  update public.campaigns
  set status = 'live',
      title = p_campaign_title,
      description = p_campaign_description,
      product_type = p_brand_product_type,
      budget_min = p_campaign_budget_min,
      budget_max = p_campaign_budget_max,
      creator_slots = greatest(coalesce(p_campaign_creator_slots, 1), 1),
      is_primary = true,
      creator_niches = coalesce(p_campaign_creator_niches, '{}'::text[]),
      creator_location = p_campaign_creator_location,
      creator_age_ranges = coalesce(p_campaign_creator_age_ranges, '{}'::text[]),
      creator_genders = coalesce(p_campaign_creator_genders, '{}'::text[]),
      creator_ethnicities = coalesce(p_campaign_creator_ethnicities, '{}'::text[]),
      campaign_type = p_campaign_type,
      campaign_frequency = p_campaign_frequency,
      unique_posts = greatest(coalesce(p_campaign_unique_posts, 1), 1),
      posting_platforms = coalesce(p_campaign_posting_platforms, '{}'::text[]),
      minimum_follower_count = p_campaign_minimum_follower_count,
      includes_paid_usage = coalesce(p_campaign_includes_paid_usage, false),
      inspiration_links = coalesce(p_campaign_inspiration_links, '{}'::text[]),
      onboarding_completed_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = target_campaign_id
  returning * into campaign_record;

  return campaign_record;
end;
$$;
