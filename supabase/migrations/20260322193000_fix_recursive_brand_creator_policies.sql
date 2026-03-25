create or replace function public.current_brand_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select b.id
  from public.brands b
  where b.profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_creator_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select c.id
  from public.creators c
  where c.profile_id = auth.uid()
  limit 1;
$$;

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
      where c.brand_id = brands.id
        and cm.creator_id = public.current_creator_id()
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
      where a.creator_id = creators.id
        and c.brand_id = public.current_brand_id()
    )
    or exists (
      select 1
      from public.campaign_matches cm
      join public.campaigns c on c.id = cm.campaign_id
      where cm.creator_id = creators.id
        and c.brand_id = public.current_brand_id()
    )
  );

drop policy if exists campaigns_select_related on public.campaigns;
create policy campaigns_select_related on public.campaigns
  for select to authenticated
  using (
    campaigns.brand_id = public.current_brand_id()
    or public.current_profile_role() = 'admin'
    or exists (
      select 1
      from public.campaign_matches cm
      where cm.campaign_id = campaigns.id
        and cm.creator_id = public.current_creator_id()
    )
    or exists (
      select 1
      from public.applications a
      where a.campaign_id = campaigns.id
        and a.creator_id = public.current_creator_id()
    )
  );

drop policy if exists campaign_matches_select_related on public.campaign_matches;
create policy campaign_matches_select_related on public.campaign_matches
  for select to authenticated
  using (
    campaign_matches.creator_id = public.current_creator_id()
    or exists (
      select 1
      from public.campaigns c
      where c.id = campaign_matches.campaign_id
        and c.brand_id = public.current_brand_id()
    )
    or public.current_profile_role() = 'admin'
  );

drop policy if exists applications_select_related on public.applications;
create policy applications_select_related on public.applications
  for select to authenticated
  using (
    applications.creator_id = public.current_creator_id()
    or exists (
      select 1
      from public.campaigns c
      where c.id = applications.campaign_id
        and c.brand_id = public.current_brand_id()
    )
    or public.current_profile_role() = 'admin'
  );
