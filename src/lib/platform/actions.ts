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
import { runDryRunCampaignDirector } from "@/lib/agents/enterprise-campaign-agents";
import {
  buildEnterpriseKnowledgeDocuments,
  createEnterpriseEmbedding,
  createDeterministicEmbedding,
  retrieveEnterpriseKnowledge,
} from "@/lib/platform/enterprise-rag";
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

function getRequiredNumberValue(formData: FormData, key: string, fallback: number) {
  const parsed = Number(getStringValue(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getJsonValue(formData: FormData, key: string, fallback: unknown) {
  const raw = getStringValue(formData, key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
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

export async function createEnterpriseCampaignAction(formData: FormData) {
  const locale = getLocale(formData);
  const campaignId = getStringValue(formData, "campaignId");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_upsert_enterprise_campaign", {
    target_campaign_id: campaignId,
    p_total_budget_amount: getRequiredNumberValue(formData, "totalBudgetAmount", 10000),
    p_management_fee_percentage:
      getRequiredNumberValue(formData, "managementFeeRatePercent", 20),
    p_target_creator_count: getRequiredNumberValue(formData, "targetCreatorCount", 10),
    p_videos_per_creator_min: getRequiredNumberValue(formData, "videosPerCreatorMin", 45),
    p_videos_per_creator_max: getRequiredNumberValue(formData, "videosPerCreatorMax", 60),
    p_planned_offer_amount: getRequiredNumberValue(formData, "plannedOfferAmount", 600),
    p_starts_on: getOptionalStringValue(formData, "campaignStartDate"),
    p_ends_on: getOptionalStringValue(formData, "campaignEndDate"),
    p_requirements: getOptionalStringValue(formData, "requirements"),
    p_brand_guidelines: getOptionalStringValue(formData, "brandGuidelines"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, "/admin/enterprise-campaigns")}?error=${encodeURIComponent(error.message)}`,
    );
  }

  const enterpriseId =
    data && typeof data === "object" && "id" in data ? String(data.id) : "";

  revalidatePath(getLocalizedPath(locale, "/admin/enterprise-campaigns"));
  redirect(
    enterpriseId
      ? getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseId}`)
      : `${getLocalizedPath(locale, "/admin/enterprise-campaigns")}?created=1`,
  );
}

export async function saveEnterpriseCampaignPlanAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const planSummary = getStringValue(formData, "planSummary");
  const successCriteria = getStringValue(formData, "successCriteria");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_enterprise_plan", {
    target_enterprise_campaign_id: enterpriseCampaignId,
    p_campaign_plan: {
      summary: planSummary,
      successCriteria,
      savedAt: new Date().toISOString(),
      source: "manual",
    },
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=plan`);
}

export async function addEnterpriseCreatorAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_add_enterprise_creator", {
    target_enterprise_campaign_id: enterpriseCampaignId,
    target_creator_id: getStringValue(formData, "creatorId"),
    p_reasons: [getStringValue(formData, "reason") || "Manually shortlisted by admin"],
    p_risks: [],
    p_score: null,
    p_suggested_offer_amount: getNullableNumber(getStringValue(formData, "suggestedOfferAmount")),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=creator`);
}

export async function createEnterpriseOfferAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const deliverables = getStringValues(formData, "deliverables").length
    ? getStringValues(formData, "deliverables")
    : [getStringValue(formData, "deliverablesText")].filter(Boolean);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_create_creator_offer", {
    target_enterprise_campaign_id: enterpriseCampaignId,
    target_creator_id: getStringValue(formData, "creatorId"),
    p_offer_amount: getRequiredNumberValue(formData, "offerAmount", 600),
    p_terms_summary: getStringValue(formData, "termsSummary"),
    p_deliverables: deliverables,
    p_deadline_summary: getStringValue(formData, "deadlineSummary") || "One month campaign window",
    p_usage_terms_summary: getStringValue(formData, "usageTermsSummary") || getStringValue(formData, "termsSummary"),
    p_message_draft: getOptionalStringValue(formData, "messageDraft"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=offer`);
}

export async function saveEnterpriseBriefAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_enterprise_brief", {
    target_enterprise_campaign_id: enterpriseCampaignId,
    p_brief: {
      title: getStringValue(formData, "briefTitle"),
      body: getStringValue(formData, "briefBody"),
      releasedAt: null,
      source: "manual",
    },
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=brief`);
}

export async function approveEnterpriseStepAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_approve_enterprise_step", {
    target_enterprise_campaign_id: enterpriseCampaignId,
    p_approval_type: getStringValue(formData, "approvalType"),
    p_snapshot_json: getJsonValue(formData, "snapshotJson", {}),
    p_decision_note: getOptionalStringValue(formData, "notes"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?approved=1`);
}

export async function respondEnterpriseOfferAction(formData: FormData) {
  const locale = getLocale(formData);
  const offerId = getStringValue(formData, "offerId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("creator_respond_enterprise_offer", {
    target_offer_id: offerId,
    p_response: getStringValue(formData, "response"),
    p_response_note: getOptionalStringValue(formData, "responseNote"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, "/dashboard/creator/offers"));
  revalidatePath(getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`));
  redirect(`${getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`)}?responded=1`);
}

export async function submitEnterpriseDeliverableAction(formData: FormData) {
  const locale = getLocale(formData);
  const offerId = getStringValue(formData, "offerId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("creator_submit_enterprise_deliverable", {
    target_offer_id: offerId,
    p_title: getStringValue(formData, "title"),
    p_submitted_url: getStringValue(formData, "submittedUrl"),
    p_submitted_note: getOptionalStringValue(formData, "submissionNote"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`));
  redirect(`${getLocalizedPath(locale, `/dashboard/creator/offers/${offerId}`)}?submitted=1`);
}

export async function reviewEnterpriseDeliverableAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_enterprise_deliverable", {
    target_deliverable_id: getStringValue(formData, "deliverableId"),
    p_status: getStringValue(formData, "status"),
    p_review_notes: getOptionalStringValue(formData, "reviewNotes"),
    p_revision_request: getOptionalStringValue(formData, "revisionRequest"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=deliverable`);
}

export async function prepareEnterprisePayoutAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_prepare_enterprise_payout", {
    target_offer_id: getStringValue(formData, "offerId"),
    p_amount: getNullableNumber(getStringValue(formData, "payoutAmount")),
    p_reason: getOptionalStringValue(formData, "reason"),
  });

  if (error) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=payout`);
}

export async function ingestEnterpriseKnowledgeAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();

  const [{ data: enterpriseCampaign, error: enterpriseError }, { data: creators, error: creatorsError }] =
    await Promise.all([
      supabase
        .from("enterprise_campaigns")
        .select("*, campaigns(id,title,description,product_type,brand_id)")
        .eq("id", enterpriseCampaignId)
        .maybeSingle(),
      supabase
        .from("creators")
        .select("id,status,display_name,email,application_notes,creator_profile_seed"),
    ]);

  if (enterpriseError || creatorsError || !enterpriseCampaign) {
    const message =
      enterpriseError?.message ??
      creatorsError?.message ??
      "Enterprise campaign not found";
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(message)}`,
    );
  }

  const campaign = Array.isArray(enterpriseCampaign.campaigns)
    ? enterpriseCampaign.campaigns[0]
    : enterpriseCampaign.campaigns;
  const documents = buildEnterpriseKnowledgeDocuments({
    enterpriseCampaign: {
      id: enterpriseCampaign.id,
      campaignId: enterpriseCampaign.campaign_id,
      brandId: enterpriseCampaign.brand_id,
      requirements: enterpriseCampaign.requirements,
    },
    campaign: {
      id: campaign?.id ?? enterpriseCampaign.campaign_id,
      title: campaign?.title ?? "Enterprise campaign",
      description: campaign?.description,
      productType: campaign?.product_type,
    },
    creators: (creators ?? []).map((creator) => ({
      id: creator.id,
      status: creator.status,
      displayName: creator.display_name,
      email: creator.email,
      applicationNotes: creator.application_notes,
      creatorProfileSeed: creator.creator_profile_seed as Record<string, unknown>,
    })),
    brandGuidelines: getOptionalStringValue(formData, "brandGuidelines"),
    offerTemplates: [getStringValue(formData, "offerTemplate")].filter(Boolean),
    revisionQualityRules: getOptionalStringValue(formData, "revisionQualityRules"),
  });

  if (documents.length > 0) {
    const rows = await Promise.all(
      documents.map(async (document) => ({
        enterprise_campaign_id: document.enterpriseCampaignId,
        campaign_id: document.campaignId,
        brand_id: document.brandId,
        creator_id: document.creatorId,
        source_type: document.sourceType,
        title: document.title,
        content: document.content,
        metadata: document.metadata,
        embedding: `[${(await createEnterpriseEmbedding(document.content)).join(",")}]`,
      })),
    );
    const { error } = await supabase.from("agent_knowledge_documents").insert(
      rows,
    );

    if (error) {
      redirect(
        `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=knowledge`);
}

export async function runEnterpriseCampaignDirectorAction(formData: FormData) {
  const locale = getLocale(formData);
  const enterpriseCampaignId = getStringValue(formData, "enterpriseCampaignId");
  const supabase = await createClient();
  const { data: campaign, error: campaignError } = await supabase
    .from("enterprise_campaigns")
    .select(
      "*, enterprise_campaign_creators(*,creators(display_name,email)), campaign_deliverables(*)",
    )
    .eq("id", enterpriseCampaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(campaignError?.message ?? "Enterprise campaign not found")}`,
    );
  }

  const { data: run, error: runError } = await supabase
    .from("campaign_agent_runs")
    .insert({
      enterprise_campaign_id: enterpriseCampaignId,
      run_type: "campaign_director",
      status: "running",
      model: process.env.AGENT_MODEL ?? "dry-run",
      embedding_model: process.env.AGENT_EMBEDDING_MODEL ?? "deterministic-dry-run",
      dry_run: (process.env.AGENT_DRY_RUN ?? "true") !== "false",
      input_json: {
        source: "admin_action",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(runError?.message ?? "Unable to create agent run")}`,
    );
  }

  try {
    const creatorRows = (campaign.enterprise_campaign_creators ?? []) as Array<{
      creator_id: string;
      creators?: { display_name?: string | null; email?: string | null } | null;
      reasons?: string[] | null;
      risks?: string[] | null;
    }>;
    const deliverableRows = (campaign.campaign_deliverables ?? []) as Array<{
      id: string;
      title: string;
    }>;
    const retrievedContext = await retrieveEnterpriseKnowledge({
      query: campaign.requirements ?? "enterprise campaign recommendations",
      embedding: createDeterministicEmbedding(campaign.requirements ?? campaign.id),
      enterpriseCampaignId,
      matchCount: 8,
      rpc: async (fn, args) => supabase.rpc(fn, args),
    });
    const result = await runDryRunCampaignDirector({
      enterpriseCampaignId,
      targetCreatorCount: campaign.target_creator_count,
      plannedOfferAmount: Number(campaign.planned_offer_amount),
      creatorBudgetAmount: Number(campaign.creator_budget_amount),
      creators: creatorRows.map((row) => ({
        creatorId: row.creator_id,
        displayName: row.creators?.display_name ?? row.creators?.email,
        reasons: row.reasons?.length ? row.reasons : ["Shortlisted for enterprise campaign"],
        risks: row.risks ?? [],
      })),
      deliverables: deliverableRows.map((row) => ({
        deliverableId: row.id,
        title: row.title,
      })),
    });

    await supabase.from("campaign_agent_tasks").insert(
      result.tasks.map((task) => ({
        enterprise_campaign_id: enterpriseCampaignId,
        run_id: run.id,
        task_type: task.taskType,
        status: task.status,
        requires_admin_approval: true,
        output_json: task.output,
        retrieved_context_json: retrievedContext,
        confidence: task.confidence,
        risk_flags: task.riskFlags,
        completed_at: new Date().toISOString(),
      })),
    );

    await supabase
      .from("campaign_agent_runs")
      .update({
        status: "completed",
        output_json: result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await supabase.rpc("log_activity_event", {
      p_event_type: "agent_task_completed",
      p_actor_profile_id: null,
      p_subject_type: "campaign_agent_run",
      p_subject_id: run.id,
      p_campaign_id: campaign.campaign_id,
      p_application_id: null,
      p_conversation_id: null,
      p_metadata: {
        enterprise_campaign_id: enterpriseCampaignId,
        task_count: result.tasks.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed";
    await supabase
      .from("campaign_agent_runs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);
    redirect(
      `${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath(getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`));
  redirect(`${getLocalizedPath(locale, `/admin/enterprise-campaigns/${enterpriseCampaignId}`)}?updated=agent`);
}
