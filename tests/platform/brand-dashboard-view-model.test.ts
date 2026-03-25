import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCampaignDetailView,
  collectBrandCampaigns,
  findBrandCampaignById,
} from "../../src/lib/platform/brand-dashboard";

const primaryCampaign = {
  id: "primary-campaign",
  brand_id: "brand-1",
  status: "in_review",
  title: "Spring Creator Sprint",
  description: "Need creators to produce high-trust testimonial content for a launch push.",
  product_type: "Wellness",
  campaign_type: "ugc-program",
  unique_posts: 3,
  minimum_follower_count: "25000",
  includes_paid_usage: true,
  posting_platforms: ["instagram", "tiktok"],
  creator_slots: 12,
  creator_genders: ["Any"],
  creator_location: "United States",
  creator_age_ranges: ["25-34"],
  creator_ethnicities: ["Open"],
  creator_niches: ["Lifestyle", "Wellness"],
  inspiration_links: ["https://ugc-hits.example/reference-1"],
};

const secondaryCampaign = {
  id: "secondary-campaign",
  brand_id: "brand-1",
  status: "draft",
  title: "Always-on testimonials",
  description: "",
  product_type: "Supplements",
};

test("collectBrandCampaigns keeps the primary campaign first without duplicates", () => {
  const campaigns = collectBrandCampaigns(primaryCampaign, [
    primaryCampaign,
    secondaryCampaign,
  ]);

  assert.deepEqual(
    campaigns.map((campaign) => campaign.id),
    ["primary-campaign", "secondary-campaign"],
  );
});

test("findBrandCampaignById resolves campaigns from the merged collection", () => {
  const campaign = findBrandCampaignById(primaryCampaign, [secondaryCampaign], "secondary-campaign");

  assert.equal(campaign?.title, "Always-on testimonials");
});

test("buildCampaignDetailView returns fallbacks for sparse campaign data", () => {
  const detail = buildCampaignDetailView(secondaryCampaign, null);

  assert.equal(detail.typeLabel, "Campaign");
  assert.equal(detail.summary, "Campaign details will appear here as soon as your brief is finalized.");
  assert.equal(detail.deliverables[0], "Deliverables will be confirmed with the UGC Hits team.");
  assert.equal(detail.targeting.location, "Open");
  assert.equal(detail.targeting.niches[0], "Open to aligned creators");
  assert.equal(detail.inspirationLinks[0], "https://ugc-hits.com");
});
