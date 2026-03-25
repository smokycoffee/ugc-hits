import { cache } from "react";
import { redirect } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import {
  attachInviteCodes,
  type AdminInviteRecord,
  type InviteEmailJobRecord,
} from "@/lib/platform/admin-invites";
import {
  getDashboardPathForRole,
  getLocalizedPath,
} from "@/lib/platform/utils";

export type ProfileRecord = {
  id: string;
  role: "brand" | "creator" | "admin";
  email: string;
  full_name: string | null;
};

export type BrandRecord = {
  id: string;
  profile_id: string;
  company_name: string;
  product_type: string;
  website: string | null;
  instagram: string | null;
  tiktok: string | null;
  logo_asset_name: string | null;
  contact_name: string | null;
  contact_role: string | null;
  referral_source: string | null;
};

export type CampaignSummary = {
  id: string;
  brand_id: string;
  status: string;
  title: string;
  description: string;
  product_type: string;
  budget_min?: string | number | null;
  budget_max?: string | number | null;
  creator_slots?: number | null;
  is_primary?: boolean;
  creator_niches?: string[];
  creator_location?: string | null;
  creator_age_ranges?: string[];
  creator_genders?: string[];
  creator_ethnicities?: string[];
  campaign_type?: string | null;
  campaign_frequency?: string | null;
  unique_posts?: number | null;
  posting_platforms?: string[];
  minimum_follower_count?: string | null;
  includes_paid_usage?: boolean;
  inspiration_links?: string[];
  onboarding_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NotificationSummary = {
  id: string;
  title: string;
  body: string;
  status: "unread" | "read";
  created_at: string;
};

export type BrandApplicationSummary = {
  id: string;
  status: string;
  note: string | null;
  campaign_id: string;
  creators?: {
    display_name?: string | null;
    email?: string | null;
    profile_id?: string | null;
  } | null;
  campaigns?: {
    title?: string | null;
  } | null;
};

export type CreatorMatchSummary = {
  id: string;
  campaign_id: string;
  status: string;
  campaigns?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

export type CreatorApplicationSummary = {
  id: string;
  status: string;
  note: string | null;
  campaign_id: string;
  campaigns?: {
    title?: string | null;
  } | null;
};

export type InviteSummary = AdminInviteRecord;

export type ConversationMessageSummary = {
  id: string;
  body: string;
  created_at: string;
  sender_profile_id: string;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export async function requireSession(locale: AppLocale) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLocalizedPath(locale, "/login"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect(getLocalizedPath(locale, "/login"));
  }

  return { supabase, user, profile: profile as ProfileRecord };
}

export async function requireRole(
  locale: AppLocale,
  expectedRole: "brand" | "creator" | "admin",
) {
  const session = await requireSession(locale);

  if (session.profile.role !== expectedRole) {
    redirect(getDashboardPathForRole(locale, session.profile.role));
  }

  return session;
}

export const getBrandDashboard = cache(async function getBrandDashboard(locale: AppLocale) {
  const { supabase, profile } = await requireRole(locale, "brand");
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (brandError) {
    throw new Error(`Unable to load brand profile: ${brandError.message}`);
  }
  if (campaignsError) {
    throw new Error(`Unable to load campaigns: ${campaignsError.message}`);
  }
  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, status, note, created_at, campaign_id, creator_id, campaigns(title), creators(display_name,email,profile_id)",
    )
    .order("created_at", { ascending: false });
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("status", "unread");
  const brandCampaigns = ((campaigns ?? []) as CampaignSummary[]).filter(
    (campaign) => campaign.brand_id === brand?.id,
  );
  const primaryCampaign =
    brandCampaigns.find((campaign) => campaign.is_primary) ?? brandCampaigns[0] ?? null;

  return {
    profile,
    brand: (brand ?? null) as BrandRecord | null,
    primaryCampaign,
    campaigns: primaryCampaign
      ? brandCampaigns.filter((campaign) => campaign.id !== primaryCampaign.id)
      : brandCampaigns,
    applications: (applications ?? []) as BrandApplicationSummary[],
    notifications: (notifications ?? []) as NotificationSummary[],
    unreadCount: unreadCount ?? 0,
  };
});

export async function getBrandOnboarding(locale: AppLocale) {
  const { supabase, profile } = await requireRole(locale, "brand");
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (brandError) {
    throw new Error(`Unable to load brand onboarding profile: ${brandError.message}`);
  }
  if (campaignsError) {
    throw new Error(`Unable to load brand onboarding campaign: ${campaignsError.message}`);
  }
  const brandCampaigns = ((campaigns ?? []) as CampaignSummary[]).filter(
    (campaign) => campaign.brand_id === brand?.id,
  );
  const primaryCampaign =
    brandCampaigns.find((campaign) => campaign.is_primary) ?? brandCampaigns[0] ?? null;

  return {
    profile,
    brand: (brand ?? null) as BrandRecord | null,
    primaryCampaign,
  };
}

export async function getCreatorDashboard(locale: AppLocale) {
  const { supabase, profile } = await requireRole(locale, "creator");
  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  const { data: matches } = await supabase
    .from("campaign_matches")
    .select("id, status, matched_at, campaign_id, campaigns(title, description, product_type)")
    .order("matched_at", { ascending: false });
  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, note, created_at, campaign_id, campaigns(title)")
    .order("created_at", { ascending: false });
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("status", "unread");

  return {
    profile,
    creator,
    matches: (matches ?? []) as CreatorMatchSummary[],
    applications: (applications ?? []) as CreatorApplicationSummary[],
    notifications: (notifications ?? []) as NotificationSummary[],
    unreadCount: unreadCount ?? 0,
  };
}

export async function getAdminInvites(locale: AppLocale) {
  const { supabase, profile } = await requireSession(locale);
  const { data: invites } = await supabase
    .from("platform_invites")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: emailJobs } = await supabase
    .from("email_jobs")
    .select("created_at, payload")
    .eq("template", "platform_invite")
    .order("created_at", { ascending: false });
  const hasAdminAccess = profile.role === "admin";
  const { count: adminCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  return {
    profile,
    invites: attachInviteCodes(
      (invites ?? []) as InviteSummary[],
      (emailJobs ?? []) as InviteEmailJobRecord[],
    ),
    hasAdminAccess,
    hasAnyAdmin: (adminCount ?? 0) > 0,
  };
}

export async function getConversationPage(
  locale: AppLocale,
  conversationId: string,
) {
  const { supabase, profile } = await requireSession(locale);

  await supabase.rpc("mark_conversation_seen", {
    target_conversation_id: conversationId,
  });

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, campaign_id, brand_id, creator_id, campaigns(title), brands(company_name), creators(display_name)",
    )
    .eq("id", conversationId)
    .maybeSingle();
  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, created_at, sender_profile_id, profiles(full_name, email)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!conversation) {
    redirect(getDashboardPathForRole(locale, profile.role));
  }

  return {
    profile,
    conversation,
    messages: (messages ?? []) as ConversationMessageSummary[],
  };
}
