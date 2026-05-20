import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateEnterpriseBudget,
  canTransitionEnterpriseCampaign,
  creatorVettingOutputSchema,
  deliverableReviewOutputSchema,
  offerDraftingOutputSchema,
  payoutPrepOutputSchema,
} from "../../src/lib/platform/enterprise-campaign";

test("calculateEnterpriseBudget returns the required campaign budget breakdown", () => {
  assert.deepEqual(
    calculateEnterpriseBudget({
      totalBudgetAmount: 10000,
      managementFeeRate: 0.2,
      targetCreatorCount: 10,
      plannedOfferAmount: 600,
    }),
    {
      totalBudgetAmount: 10000,
      managementFeeRate: 0.2,
      managementFeeAmount: 2000,
      creatorBudgetAmount: 8000,
      targetCreatorCount: 10,
      plannedOfferAmount: 600,
      plannedCreatorCommitmentAmount: 6000,
      remainingCreatorBudgetAmount: 2000,
    },
  );
});

test("agent schemas require reasons, risks, confidence, and admin approval", () => {
  assert.equal(
    creatorVettingOutputSchema.safeParse({
      recommendedCreators: [
        {
          creatorId: "creator-1",
          score: 91,
          reasons: ["Strong niche fit"],
          risks: ["Limited availability"],
          suggestedOfferAmount: 600,
        },
      ],
      backupCreators: [
        {
          creatorId: "creator-2",
          score: 83,
          reasons: ["Good audience match"],
          risks: [],
        },
      ],
      summary: "Recommend one primary and one backup creator.",
    }).success,
    true,
  );

  assert.equal(
    offerDraftingOutputSchema.safeParse({
      offers: [
        {
          creatorId: "creator-1",
          amount: 600,
          currency: "GBP",
          deliverables: ["45-60 videos over one month"],
          deadlineSummary: "One month from brief release",
          usageTermsSummary: "Paid usage included in campaign terms",
          messageDraft: "We would like to offer you the campaign.",
        },
      ],
      totalCommittedAmount: 600,
      remainingCreatorBudget: 7400,
    }).success,
    true,
  );

  assert.equal(
    deliverableReviewOutputSchema.safeParse({
      deliverableId: "deliverable-1",
      recommendedStatus: "approved",
      reasons: ["Meets the approved brief"],
      confidence: 0.82,
    }).success,
    true,
  );

  assert.equal(
    payoutPrepOutputSchema.safeParse({
      payouts: [
        {
          creatorId: "creator-1",
          amount: 600,
          currency: "GBP",
          reason: "Accepted offer and approved deliverable",
        },
      ],
      totalPayoutAmount: 600,
      requiresAdminApproval: true,
    }).success,
    true,
  );

  assert.equal(
    payoutPrepOutputSchema.safeParse({
      payouts: [],
      totalPayoutAmount: 0,
      requiresAdminApproval: false,
    }).success,
    false,
  );

  assert.equal(
    deliverableReviewOutputSchema.safeParse({
      deliverableId: "deliverable-1",
      recommendedStatus: "approved",
      reasons: [],
      confidence: 1.2,
    }).success,
    false,
  );
});

test("enterprise workflow transitions require the correct admin approval gates", () => {
  assert.equal(
    canTransitionEnterpriseCampaign({
      from: "setup",
      to: "offers_sent",
      approvals: ["approve_campaign_plan", "approve_creator_shortlist"],
    }),
    false,
  );

  assert.equal(
    canTransitionEnterpriseCampaign({
      from: "offers_pending_approval",
      to: "offers_sent",
      approvals: [
        "approve_campaign_plan",
        "approve_creator_shortlist",
        "approve_offer_batch",
      ],
    }),
    true,
  );

  assert.equal(
    canTransitionEnterpriseCampaign({
      from: "roster_finalized",
      to: "brief_released",
      approvals: [
        "approve_campaign_plan",
        "approve_creator_shortlist",
        "approve_offer_batch",
      ],
    }),
    false,
  );

  assert.equal(
    canTransitionEnterpriseCampaign({
      from: "payouts_pending_approval",
      to: "payouts_approved",
      approvals: [
        "approve_campaign_plan",
        "approve_creator_shortlist",
        "approve_offer_batch",
        "approve_final_roster",
        "approve_brief_release",
        "approve_deliverable_review",
        "approve_payout_batch",
      ],
    }),
    true,
  );

  assert.equal(
    canTransitionEnterpriseCampaign({
      from: "payouts_approved",
      to: "completed",
      approvals: [
        "approve_campaign_plan",
        "approve_creator_shortlist",
        "approve_offer_batch",
        "approve_final_roster",
        "approve_brief_release",
        "approve_deliverable_review",
        "approve_payout_batch",
      ],
    }),
    false,
  );
});
