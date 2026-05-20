import { cache } from "react";

import type { AppLocale } from "@/i18n/routing";
import { requireRole } from "@/lib/platform/data";

type CampaignRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  product_type: string | null;
  brands?: {
    company_name?: string | null;
  } | null;
};

type CreatorRow = {
  id: string;
  email: string;
  display_name: string | null;
  status: string;
  application_notes: string | null;
};

type EnterpriseCampaignRow = {
  id: string;
  campaign_id: string;
  brand_id: string;
  status: string;
  currency: "GBP";
  total_budget_amount: number | string;
  management_fee_percentage: number | string;
  management_fee_amount: number | string;
  creator_budget_amount: number | string;
  target_creator_count: number;
  videos_per_creator_min: number;
  videos_per_creator_max: number;
  planned_offer_amount: number | string;
  planned_total_creator_commitment: number | string;
  remaining_creator_budget_amount: number | string;
  requirements: string | null;
  approved_campaign_plan: unknown;
  approved_brief: unknown;
  brand_guidelines: string | null;
  brand_update_draft: string | null;
  created_at: string;
  updated_at: string;
  campaigns?: CampaignRow | null;
  enterprise_campaign_creators?: EnterpriseCreatorRow[];
  creator_offers?: CreatorOfferRow[];
  campaign_deliverables?: DeliverableRow[];
  creator_payouts?: PayoutRow[];
  admin_approvals?: ApprovalRow[];
  campaign_agent_runs?: AgentRunRow[];
  campaign_agent_tasks?: AgentTaskRow[];
};

type EnterpriseCreatorRow = {
  id: string;
  creator_id: string;
  status: string;
  source: string;
  score: number | string | null;
  reasons: string[];
  risks: string[];
  suggested_offer_amount: number | string | null;
  creators?: CreatorRow | null;
};

type CreatorOfferRow = {
  id: string;
  enterprise_campaign_id: string;
  creator_id: string;
  status: string;
  currency: "GBP";
  offer_amount: number | string;
  terms_summary: string;
  deliverables: unknown;
  deadline_summary: string;
  usage_terms_summary: string;
  message_draft: string | null;
  response_note: string | null;
  sent_at: string | null;
  responded_at: string | null;
  creators?: CreatorRow | null;
  enterprise_campaigns?: EnterpriseCampaignRow | null;
  campaign_deliverables?: DeliverableRow[];
  creator_payouts?: PayoutRow[];
};

type DeliverableRow = {
  id: string;
  enterprise_campaign_id: string;
  creator_offer_id: string | null;
  creator_id: string;
  status: string;
  title: string;
  submitted_url: string;
  submitted_note: string | null;
  review_notes: string | null;
  revision_request: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  creators?: CreatorRow | null;
};

type PayoutRow = {
  id: string;
  enterprise_campaign_id: string;
  creator_offer_id: string | null;
  creator_id: string;
  status: string;
  currency: "GBP";
  amount: number | string;
  reason: string;
  approved_at: string | null;
  paid_at: string | null;
  creators?: CreatorRow | null;
};

type ApprovalRow = {
  id: string;
  approval_type: string;
  status: string;
  snapshot_json: unknown;
  decision_note: string | null;
  decided_at: string;
};

type AgentRunRow = {
  id: string;
  run_type: string;
  status: string;
  model: string | null;
  dry_run: boolean;
  error_message: string | null;
  created_at: string;
};

type AgentTaskRow = {
  id: string;
  task_type: string;
  status: string;
  requires_admin_approval: boolean;
  output_json: unknown;
  retrieved_context_json: unknown;
  confidence: number | string | null;
  risk_flags: string[];
  error_message: string | null;
  created_at: string;
};

export function toMoneyNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatGbp(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value));
}

export function getStatusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getEnterpriseNextAction(status: string) {
  const nextActions: Record<string, string> = {
    setup: "Save a campaign plan, then approve it.",
    plan_pending_approval: "Review and approve the campaign plan.",
    plan_approved: "Shortlist active creators for admin approval.",
    shortlist_pending_approval: "Review and approve the creator shortlist.",
    shortlist_approved: "Draft creator offers for shortlisted creators.",
    offers_pending_approval: "Approve and send the offer batch.",
    offers_sent: "Wait for creator responses, then approve the final roster.",
    roster_finalized: "Save and approve the campaign brief.",
    brief_released: "Wait for creator deliverable submissions.",
    deliverables_in_review: "Review submitted deliverables and approve the review batch.",
    payouts_pending_approval: "Prepare and approve creator payouts.",
    payouts_approved: "Mark approved payouts as paid manually.",
    completed: "Campaign completed.",
    cancelled: "Campaign cancelled.",
  };

  return nextActions[status] ?? "Review campaign activity for the next action.";
}

export function approvalSnapshot(value: unknown) {
  return JSON.stringify(value ?? {}, null, 0);
}

export function getJsonString(value: unknown, key: string, fallback = "") {
  if (value && typeof value === "object" && key in value) {
    const field = (value as Record<string, unknown>)[key];
    return typeof field === "string" ? field : fallback;
  }

  return fallback;
}

function asArray<T>(value: T[] | null | undefined) {
  return value ?? [];
}

export const getAdminEnterpriseCampaigns = cache(
  async function getAdminEnterpriseCampaigns(locale: AppLocale) {
    const { supabase, profile } = await requireRole(locale, "admin");

    const [enterpriseResult, campaignsResult] = await Promise.all([
      supabase
        .from("enterprise_campaigns")
        .select(
          "*, campaigns(id,title,description,status,product_type,brands(company_name)), enterprise_campaign_creators(id,status), creator_offers(id,status,offer_amount), campaign_deliverables(id,status), creator_payouts(id,status,amount)",
        )
        .order("updated_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("id,title,description,status,product_type,brands(company_name)")
        .order("created_at", { ascending: false }),
    ]);

    if (enterpriseResult.error) {
      throw new Error(`Unable to load enterprise campaigns: ${enterpriseResult.error.message}`);
    }

    if (campaignsResult.error) {
      throw new Error(`Unable to load campaigns: ${campaignsResult.error.message}`);
    }

    const enterpriseCampaigns =
      (enterpriseResult.data ?? []) as EnterpriseCampaignRow[];
    const enterpriseCampaignIds = new Set(
      enterpriseCampaigns.map((campaign) => campaign.campaign_id),
    );

    return {
      profile,
      enterpriseCampaigns,
      campaigns: ((campaignsResult.data ?? []) as CampaignRow[]).filter(
        (campaign) => !enterpriseCampaignIds.has(campaign.id),
      ),
    };
  },
);

export const getAdminEnterpriseCampaignDetail = cache(
  async function getAdminEnterpriseCampaignDetail(
    locale: AppLocale,
    enterpriseCampaignId: string,
  ) {
    const { supabase, profile } = await requireRole(locale, "admin");

    const [enterpriseResult, creatorsResult] = await Promise.all([
      supabase
        .from("enterprise_campaigns")
        .select(
          "*, campaigns(id,title,description,status,product_type,brands(company_name)), enterprise_campaign_creators(*,creators(id,email,display_name,status,application_notes)), creator_offers(*,creators(id,email,display_name,status,application_notes)), campaign_deliverables(*,creators(id,email,display_name,status,application_notes)), creator_payouts(*,creators(id,email,display_name,status,application_notes)), admin_approvals(*), campaign_agent_runs(*), campaign_agent_tasks(*)",
        )
        .eq("id", enterpriseCampaignId)
        .maybeSingle(),
      supabase
        .from("creators")
        .select("id,email,display_name,status,application_notes")
        .order("updated_at", { ascending: false }),
    ]);

    if (enterpriseResult.error) {
      throw new Error(`Unable to load enterprise campaign: ${enterpriseResult.error.message}`);
    }

    if (!enterpriseResult.data) {
      return null;
    }

    if (creatorsResult.error) {
      throw new Error(`Unable to load creators: ${creatorsResult.error.message}`);
    }

    const enterpriseCampaign =
      enterpriseResult.data as EnterpriseCampaignRow;
    const usedCreatorIds = new Set(
      asArray(enterpriseCampaign.enterprise_campaign_creators).map(
        (creator) => creator.creator_id,
      ),
    );

    return {
      profile,
      enterpriseCampaign,
      availableCreators: ((creatorsResult.data ?? []) as CreatorRow[]).filter(
        (creator) => creator.status === "active" && !usedCreatorIds.has(creator.id),
      ),
    };
  },
);

export const getCreatorEnterpriseOffers = cache(
  async function getCreatorEnterpriseOffers(locale: AppLocale) {
    const { supabase, profile } = await requireRole(locale, "creator");
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id,email,display_name,status,application_notes")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (creatorError) {
      throw new Error(`Unable to load creator profile: ${creatorError.message}`);
    }

    if (!creator) {
      return { profile, creator: null, offers: [] as CreatorOfferRow[] };
    }

    const { data: offers, error: offersError } = await supabase
      .from("creator_offers")
      .select(
        "*, enterprise_campaigns(*,campaigns(id,title,description,status,product_type,brands(company_name))), campaign_deliverables(*), creator_payouts(*)",
      )
      .eq("creator_id", creator.id)
      .order("updated_at", { ascending: false });

    if (offersError) {
      throw new Error(`Unable to load enterprise offers: ${offersError.message}`);
    }

    return {
      profile,
      creator: creator as CreatorRow,
      offers: (offers ?? []) as CreatorOfferRow[],
    };
  },
);

export const getCreatorEnterpriseOfferDetail = cache(
  async function getCreatorEnterpriseOfferDetail(locale: AppLocale, offerId: string) {
    const data = await getCreatorEnterpriseOffers(locale);

    return {
      ...data,
      offer: data.offers.find((offer) => offer.id === offerId) ?? null,
    };
  },
);
