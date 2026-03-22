create or replace function public.brand_owns_campaign(target_campaign_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.campaigns c
    where c.id = target_campaign_id
      and c.brand_id = public.current_brand_id()
  );
$$;

create or replace function public.brand_can_access_creator(target_creator_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.applications a
    join public.campaigns c on c.id = a.campaign_id
    where a.creator_id = target_creator_id
      and c.brand_id = public.current_brand_id()
  )
  or exists (
    select 1
    from public.campaign_matches cm
    join public.campaigns c on c.id = cm.campaign_id
    where cm.creator_id = target_creator_id
      and c.brand_id = public.current_brand_id()
  );
$$;

create or replace function public.creator_has_campaign_access(target_campaign_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.campaign_matches cm
    where cm.campaign_id = target_campaign_id
      and cm.creator_id = public.current_creator_id()
  )
  or exists (
    select 1
    from public.applications a
    where a.campaign_id = target_campaign_id
      and a.creator_id = public.current_creator_id()
  );
$$;

create or replace function public.creator_can_access_brand(target_brand_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.campaign_matches cm
    join public.campaigns c on c.id = cm.campaign_id
    where c.brand_id = target_brand_id
      and cm.creator_id = public.current_creator_id()
  );
$$;

drop policy if exists brands_select_related on public.brands;
create policy brands_select_related on public.brands
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.creator_can_access_brand(brands.id)
  );

drop policy if exists creators_select_related on public.creators;
create policy creators_select_related on public.creators
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() = 'admin'
    or public.brand_can_access_creator(creators.id)
  );

drop policy if exists campaigns_select_related on public.campaigns;
create policy campaigns_select_related on public.campaigns
  for select to authenticated
  using (
    campaigns.brand_id = public.current_brand_id()
    or public.current_profile_role() = 'admin'
    or public.creator_has_campaign_access(campaigns.id)
  );

drop policy if exists campaign_matches_select_related on public.campaign_matches;
create policy campaign_matches_select_related on public.campaign_matches
  for select to authenticated
  using (
    campaign_matches.creator_id = public.current_creator_id()
    or public.brand_owns_campaign(campaign_matches.campaign_id)
    or public.current_profile_role() = 'admin'
  );

drop policy if exists applications_select_related on public.applications;
create policy applications_select_related on public.applications
  for select to authenticated
  using (
    applications.creator_id = public.current_creator_id()
    or public.brand_owns_campaign(applications.campaign_id)
    or public.current_profile_role() = 'admin'
  );
