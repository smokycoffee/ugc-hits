import type { BrandRecord, CampaignSummary } from "@/lib/platform/data";

function dedupeCampaigns(campaigns: CampaignSummary[]) {
  const seen = new Set<string>();

  return campaigns.filter((campaign) => {
    if (seen.has(campaign.id)) {
      return false;
    }

    seen.add(campaign.id);
    return true;
  });
}

function toSentenceCase(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").trim();

  if (!normalized) {
    return "Unknown";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function arrayOrFallback(values: string[] | undefined, fallback: string) {
  if (!values || values.length === 0) {
    return [fallback];
  }

  return values;
}

export function collectBrandCampaigns(
  primaryCampaign: CampaignSummary | null,
  campaigns: CampaignSummary[],
) {
  return dedupeCampaigns(
    primaryCampaign ? [primaryCampaign, ...campaigns] : campaigns,
  );
}

export function findBrandCampaignById(
  primaryCampaign: CampaignSummary | null,
  campaigns: CampaignSummary[],
  campaignId: string,
) {
  return (
    collectBrandCampaigns(primaryCampaign, campaigns).find(
      (campaign) => campaign.id === campaignId,
    ) ?? null
  );
}

export function getCampaignTypeLabel(campaignType?: string | null) {
  switch (campaignType) {
    case "ugc-program":
      return "UGC Program";
    case "paid-ads":
      return "Paid Ads Campaign";
    case "influencer-campaign":
      return "Influencer Campaign";
    default:
      return "Campaign";
  }
}

export function getCampaignStatusLabel(status?: string | null) {
  if (!status) {
    return "Draft";
  }

  return toSentenceCase(status);
}

export function getPlatformLabel(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "facebook":
      return "Facebook";
    default:
      return toSentenceCase(platform);
  }
}

export function buildCampaignDetailView(
  campaign: CampaignSummary,
  brand: BrandRecord | null,
) {
  const deliverables = [];

  if (campaign.unique_posts && campaign.unique_posts > 0) {
    deliverables.push(`${campaign.unique_posts} unique posts total`);
  }

  if (campaign.minimum_follower_count) {
    deliverables.push(`${campaign.minimum_follower_count}+ followers preferred`);
  }

  if (campaign.includes_paid_usage) {
    deliverables.push("Includes paid usage rights");
  }

  if (deliverables.length === 0) {
    deliverables.push("Deliverables will be confirmed with the UGC Hits team.");
  }

  return {
    id: campaign.id,
    title: campaign.title || "Untitled campaign",
    productType: campaign.product_type || brand?.product_type || "UGC campaign",
    typeLabel: getCampaignTypeLabel(campaign.campaign_type),
    statusLabel: getCampaignStatusLabel(campaign.status),
    summary:
      campaign.description ||
      "Campaign details will appear here as soon as your brief is finalized.",
    deliverables,
    platforms: arrayOrFallback(campaign.posting_platforms, "Platform mix to be confirmed").map(
      getPlatformLabel,
    ),
    inspirationLinks: arrayOrFallback(campaign.inspiration_links, "https://ugc-hits.com"),
    targeting: {
      creators:
        campaign.creator_slots && campaign.creator_slots > 0
          ? `${campaign.creator_slots} creator spots`
          : "Flexible creator count",
      gender: arrayOrFallback(campaign.creator_genders, "Open").join(", "),
      location: campaign.creator_location || "Open",
      age: arrayOrFallback(campaign.creator_age_ranges, "Any age range").join(", "),
      ethnicity: arrayOrFallback(campaign.creator_ethnicities, "Open").join(", "),
      niches: arrayOrFallback(campaign.creator_niches, "Open to aligned creators"),
    },
    brand: {
      companyName: brand?.company_name || "UGC Hits brand account",
      website: brand?.website || "Website coming soon",
      instagram: brand?.instagram || "@ugchits",
      tiktok: brand?.tiktok || "@ugchits",
    },
  };
}
