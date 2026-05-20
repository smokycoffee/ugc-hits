create or replace function public.notification_copy(
  event_type public.platform_event_type,
  campaign_title text default null
)
returns table(title text, body text)
language plpgsql
immutable
set search_path = public
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
    when 'enterprise_campaign_created' then
      return query select 'Enterprise campaign created', coalesce(campaign_title, 'An enterprise campaign is ready for setup.');
    when 'agent_task_completed' then
      return query select 'Agent recommendations ready', coalesce(campaign_title, 'Campaign Director recommendations are ready for admin review.');
    when 'admin_approval_required' then
      return query select 'Admin approval required', coalesce(campaign_title, 'An enterprise campaign step needs admin approval.');
    when 'creator_offer_sent' then
      return query select 'New enterprise offer', coalesce(campaign_title, 'You have a new enterprise campaign offer to review.');
    when 'creator_offer_accepted' then
      return query select 'Enterprise offer accepted', coalesce(campaign_title, 'A creator accepted an enterprise offer.');
    when 'creator_offer_declined' then
      return query select 'Enterprise offer declined', coalesce(campaign_title, 'A creator declined an enterprise offer.');
    when 'creator_offer_change_requested' then
      return query select 'Offer changes requested', coalesce(campaign_title, 'A creator requested changes to an enterprise offer.');
    when 'brief_released' then
      return query select 'Enterprise brief released', coalesce(campaign_title, 'The enterprise campaign brief is available.');
    when 'deliverable_submitted' then
      return query select 'Deliverable submitted', coalesce(campaign_title, 'A creator submitted a deliverable for review.');
    when 'deliverable_needs_revision' then
      return query select 'Deliverable needs revision', coalesce(campaign_title, 'An enterprise deliverable needs revision.');
    when 'deliverable_approved' then
      return query select 'Deliverable approved', coalesce(campaign_title, 'An enterprise deliverable was approved.');
    when 'payout_prepared' then
      return query select 'Payout prepared', coalesce(campaign_title, 'An enterprise payout is ready for admin approval.');
    when 'payout_marked_paid' then
      return query select 'Payout marked paid', coalesce(campaign_title, 'An enterprise payout was marked paid.');
    when 'payout_paid' then
      return query select 'Payout paid', coalesce(campaign_title, 'An enterprise payout was paid.');
    when 'brand_update_approved' then
      return query select 'Brand update approved', coalesce(campaign_title, 'The enterprise campaign brand update was approved.');
    else
      return query select 'Platform update', 'There is a new update in your UGC Hits workspace.';
  end case;
end;
$$;

create or replace function public.email_template_for_event(event_type public.platform_event_type)
returns text
language sql
immutable
set search_path = public
as $$
  select case event_type
    when 'creator_invited_to_platform' then 'platform_invite'
    when 'campaign_matched_to_creator' then 'campaign_matched'
    when 'creator_applied_to_campaign' then 'new_application_received'
    when 'brand_accepted_application' then 'application_accepted'
    when 'brand_rejected_application' then 'application_rejected'
    when 'message_sent' then 'new_message'
    when 'creator_offer_sent' then 'enterprise_offer_sent'
    when 'brief_released' then 'enterprise_brief_released'
    when 'deliverable_needs_revision' then 'enterprise_deliverable_revision'
    when 'deliverable_approved' then 'enterprise_deliverable_approved'
    when 'payout_marked_paid' then 'enterprise_payout_paid'
    when 'payout_paid' then 'enterprise_payout_paid'
    else 'platform_update'
  end;
$$;
