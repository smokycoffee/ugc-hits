"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import {
  buildMagicLinkRedirect,
  buildCreatorInviteRedirect,
} from "@/lib/platform/auth-redirects";
import { runMatchCampaignToCreator } from "@/lib/platform/admin-matches";
import {
  buildBrandLoginPath,
  buildBrandOnboardingPath,
  resolveBrandAuthNextPath,
} from "@/lib/platform/brand-onboarding";
import { hashInviteCode } from "@/lib/platform/invite-code";
import { resolveSharedLoginTarget } from "@/lib/platform/login-flow";
import { getLocalizedPath } from "@/lib/platform/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalStringValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key);
  return value || null;
}

function getStringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function getNullableNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLeadCount(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function buildCampaignTitle(companyName: string, campaignType: string) {
  const campaignTypeLabel =
    {
      "ugc-program": "UGC Program",
      "paid-ads": "Paid Ads Campaign",
      "influencer-campaign": "Influencer Campaign",
    }[campaignType] ?? "Campaign";

  return companyName ? `${companyName} ${campaignTypeLabel}` : campaignTypeLabel;
}

function getLocale(formData: FormData): AppLocale {
  const locale = getStringValue(formData, "locale");
  return locale === "en" ? "en" : "pl";
}

export async function sendBrandMagicLink(formData: FormData) {
  const locale = getLocale(formData);
  const email = getStringValue(formData, "email").toLowerCase();
  const companyName = getStringValue(formData, "companyName");
  const productType = getStringValue(formData, "productType");
  const next = getStringValue(formData, "next");
  const admin = createAdminClient();
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("email", email)
    .maybeSingle();
  const target = resolveSharedLoginTarget(locale, {
    next,
    companyName,
    productType,
    existingRole:
      existingProfile?.role === "brand" ||
      existingProfile?.role === "creator" ||
      existingProfile?.role === "admin"
        ? existingProfile.role
        : null,
  });
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildMagicLinkRedirect(
        getAppUrl(),
        locale,
        target.role,
        target.next,
      ),
      data: {
        role: target.role,
      },
    },
  });

  if (error) {
    redirect(
      `${buildBrandLoginPath(locale, {
        companyName,
        productType,
      })}&error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `${buildBrandLoginPath(locale, {
      companyName,
      productType,
    })}&sent=magic-link`,
  );
}

export async function startGoogleBrandLogin(formData: FormData) {
  const locale = getLocale(formData);
  const companyName = getStringValue(formData, "companyName");
  const productType = getStringValue(formData, "productType");
  const next = resolveBrandAuthNextPath(locale, getStringValue(formData, "next"), {
    companyName,
    productType,
  });
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(
        next,
      )}&role=brand`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `${buildBrandLoginPath(locale, {
        companyName,
        productType,
      })}&error=${encodeURIComponent(
        error?.message ?? "Unable to start Google login.",
      )}`,
    );
  }

  redirect(data.url);
}

export async function sendCreatorInviteLink(formData: FormData) {
  const locale = getLocale(formData);
  const email = getStringValue(formData, "email").toLowerCase();
  const inviteCode = getStringValue(formData, "inviteCode");
  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("platform_invites")
    .select("id")
    .eq("email", email)
    .eq("invite_code_hash", await hashInviteCode(inviteCode))
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (inviteError || !invite) {
    redirect(
      `${getLocalizedPath(locale, "/invite")}?error=${encodeURIComponent(
        "Invite code is invalid or expired.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildCreatorInviteRedirect(
        getAppUrl(),
        locale,
        inviteCode,
      ),
      data: {
        role: "creator",
      },
    },
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/invite")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`${getLocalizedPath(locale, "/invite")}?sent=invite-link`);
}

export async function createCampaignAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_campaign", {
    company_name: getStringValue(formData, "companyName"),
    brand_product_type: getStringValue(formData, "productType"),
    campaign_title: getStringValue(formData, "title"),
    campaign_description: getStringValue(formData, "description"),
    campaign_budget_min: Number(getStringValue(formData, "budgetMin") || 0) || null,
    campaign_budget_max: Number(getStringValue(formData, "budgetMax") || 0) || null,
    campaign_creator_slots:
      Number(getStringValue(formData, "creatorSlots") || 1) || 1,
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/dashboard/brand")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/dashboard/brand"));
  redirect(`${getLocalizedPath(locale, "/dashboard/brand")}?created=campaign`);
}

export async function saveBrandOnboardingAction(formData: FormData) {
  const locale = getLocale(formData);
  const companyName = getStringValue(formData, "companyName");
  const productType = getStringValue(formData, "productType");
  const campaignType = getStringValue(formData, "campaignType");
  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_brand_onboarding_campaign", {
    p_company_name: companyName,
    p_brand_product_type: productType,
    p_company_website: getOptionalStringValue(formData, "companyWebsite"),
    p_brand_instagram: getOptionalStringValue(formData, "instagram"),
    p_brand_tiktok: getOptionalStringValue(formData, "tiktok"),
    p_company_logo_asset_name: getOptionalStringValue(formData, "companyLogoName"),
    p_brand_contact_name: getOptionalStringValue(formData, "contactName"),
    p_brand_contact_role: getOptionalStringValue(formData, "role"),
    p_brand_referral_source: getOptionalStringValue(formData, "referralSource"),
    p_campaign_title: buildCampaignTitle(companyName, campaignType),
    p_campaign_description: getStringValue(formData, "campaignDescription"),
    p_campaign_budget_min: getNullableNumber(getStringValue(formData, "budgetMin")),
    p_campaign_budget_max: getNullableNumber(getStringValue(formData, "budgetMax")),
    p_campaign_creator_slots: getLeadCount(getStringValue(formData, "creatorSlots")),
    p_campaign_creator_niches: getStringValues(formData, "creatorNiches"),
    p_campaign_creator_location: getOptionalStringValue(formData, "creatorLocation"),
    p_campaign_creator_age_ranges: getStringValues(formData, "creatorAgeRanges"),
    p_campaign_creator_genders: getStringValues(formData, "creatorGenders"),
    p_campaign_creator_ethnicities: getStringValues(formData, "creatorEthnicities"),
    p_campaign_type: campaignType,
    p_campaign_frequency: getOptionalStringValue(formData, "campaignFrequency"),
    p_campaign_unique_posts:
      getNullableNumber(getStringValue(formData, "uniquePosts")) ?? 1,
    p_campaign_posting_platforms: getStringValues(formData, "postingPlatforms"),
    p_campaign_minimum_follower_count: getOptionalStringValue(
      formData,
      "minimumFollowerCount",
    ),
    p_campaign_includes_paid_usage:
      getStringValue(formData, "includesPaidUsage") === "true",
    p_campaign_inspiration_links: getStringValues(formData, "inspirationLinks"),
  });

  if (error) {
    redirect(
      `${buildBrandOnboardingPath(locale, { companyName, productType })}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/onboarding-brand"));
  revalidatePath(getLocalizedPath(locale, "/dashboard/brand"));
  redirect(`${getLocalizedPath(locale, "/dashboard/brand")}?created=campaign`);
}

export async function applyToCampaignAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_to_campaign", {
    target_campaign_id: getStringValue(formData, "campaignId"),
    application_note: getStringValue(formData, "note"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/dashboard/creator")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/dashboard/creator"));
  redirect(`${getLocalizedPath(locale, "/dashboard/creator")}?applied=1`);
}

export async function acceptApplicationAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_application", {
    target_application_id: getStringValue(formData, "applicationId"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/dashboard/brand")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/dashboard/brand"));
  redirect(`${getLocalizedPath(locale, "/dashboard/brand")}?updated=application`);
}

export async function rejectApplicationAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_application", {
    target_application_id: getStringValue(formData, "applicationId"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/dashboard/brand")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/dashboard/brand"));
  redirect(`${getLocalizedPath(locale, "/dashboard/brand")}?updated=application`);
}

export async function sendMessageAction(formData: FormData) {
  const locale = getLocale(formData);
  const conversationId = getStringValue(formData, "conversationId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_message", {
    target_conversation_id: conversationId,
    message_body: getStringValue(formData, "body"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/messages/${conversationId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/messages/${conversationId}`));
  redirect(getLocalizedPath(locale, `/messages/${conversationId}`));
}

export async function markNotificationReadAction(formData: FormData) {
  const locale = getLocale(formData);
  const notificationId = getStringValue(formData, "notificationId");
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  revalidatePath(getLocalizedPath(locale, "/dashboard/brand"));
  revalidatePath(getLocalizedPath(locale, "/dashboard/creator"));
}

export async function bootstrapFirstAdminAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("bootstrap_first_admin");

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/admin/invites")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/admin/invites"));
  redirect(`${getLocalizedPath(locale, "/admin/invites")}?claimed=admin`);
}

export async function createInviteAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_create_platform_invite", {
    invitee_email: getStringValue(formData, "email"),
    creator_seed: {
      notes: getStringValue(formData, "notes"),
    },
    expires_in_days: Number(getStringValue(formData, "expiresInDays") || 14) || 14,
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/admin/invites")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/admin/invites"));
  redirect(`${getLocalizedPath(locale, "/admin/invites")}?created=invite`);
}

export async function revokeInviteAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_revoke_platform_invite", {
    invite_id: getStringValue(formData, "inviteId"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/admin/invites")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/admin/invites"));
  redirect(`${getLocalizedPath(locale, "/admin/invites")}?revoked=invite`);
}

export async function matchCampaignToCreatorAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  const result = await runMatchCampaignToCreator(
    {
      locale,
      campaignId: getStringValue(formData, "campaignId"),
      creatorId: getStringValue(formData, "creatorId"),
    },
    {
      rpc: async (fn, args) => supabase.rpc(fn, args),
      revalidatePath,
    },
  );

  redirect(result.redirectPath);
}
