import { z } from "zod";

export const enterpriseCampaignStatuses = [
  "setup",
  "plan_pending_approval",
  "plan_approved",
  "shortlist_pending_approval",
  "shortlist_approved",
  "offers_pending_approval",
  "offers_sent",
  "roster_finalized",
  "brief_released",
  "deliverables_in_review",
  "payouts_pending_approval",
  "payouts_approved",
  "completed",
  "cancelled",
] as const;

export type EnterpriseCampaignStatus =
  (typeof enterpriseCampaignStatuses)[number];

export const adminApprovalTypes = [
  "approve_campaign_plan",
  "approve_creator_shortlist",
  "approve_offer_batch",
  "approve_final_roster",
  "approve_brief_release",
  "approve_deliverable_review",
  "approve_payout_batch",
  "mark_payouts_paid",
  "approve_brand_update",
] as const;

export type AdminApprovalType = (typeof adminApprovalTypes)[number];

export type EnterpriseBudgetInput = {
  totalBudgetAmount: number;
  managementFeeRate: number;
  targetCreatorCount: number;
  plannedOfferAmount: number;
};

export type EnterpriseBudgetBreakdown = EnterpriseBudgetInput & {
  managementFeeAmount: number;
  creatorBudgetAmount: number;
  plannedCreatorCommitmentAmount: number;
  remainingCreatorBudgetAmount: number;
};

export type EnterpriseTransitionInput = {
  from: EnterpriseCampaignStatus;
  to: EnterpriseCampaignStatus;
  approvals: AdminApprovalType[];
};

const moneySchema = z.number().finite().nonnegative();
const confidenceSchema = z.number().finite().min(0).max(1);
const nonEmptyTextArraySchema = z.array(z.string().trim().min(1)).min(1);

export const creatorVettingOutputSchema = z.object({
  recommendedCreators: z.array(
    z.object({
      creatorId: z.string().trim().min(1),
      score: z.number().finite().min(0).max(100),
      reasons: nonEmptyTextArraySchema,
      risks: z.array(z.string().trim().min(1)),
      suggestedOfferAmount: moneySchema,
    }),
  ),
  backupCreators: z.array(
    z.object({
      creatorId: z.string().trim().min(1),
      score: z.number().finite().min(0).max(100),
      reasons: nonEmptyTextArraySchema,
      risks: z.array(z.string().trim().min(1)),
    }),
  ),
  summary: z.string().trim().min(1),
});

export const offerDraftingOutputSchema = z.object({
  offers: z.array(
    z.object({
      creatorId: z.string().trim().min(1),
      amount: moneySchema,
      currency: z.literal("GBP"),
      deliverables: nonEmptyTextArraySchema,
      deadlineSummary: z.string().trim().min(1),
      usageTermsSummary: z.string().trim().min(1),
      messageDraft: z.string().trim().min(1),
    }),
  ),
  totalCommittedAmount: moneySchema,
  remainingCreatorBudget: moneySchema,
});

export const deliverableReviewOutputSchema = z.object({
  deliverableId: z.string().trim().min(1),
  recommendedStatus: z.enum(["approved", "needs_revision"]),
  reasons: nonEmptyTextArraySchema,
  revisionRequestDraft: z.string().trim().min(1).optional(),
  confidence: confidenceSchema,
});

export const payoutPrepOutputSchema = z.object({
  payouts: z.array(
    z.object({
      creatorId: z.string().trim().min(1),
      amount: moneySchema,
      currency: z.literal("GBP"),
      reason: z.string().trim().min(1),
    }),
  ),
  totalPayoutAmount: moneySchema,
  requiresAdminApproval: z.literal(true),
});

const transitionApprovalRequirements: Partial<
  Record<EnterpriseCampaignStatus, AdminApprovalType[]>
> = {
  plan_approved: ["approve_campaign_plan"],
  shortlist_approved: ["approve_campaign_plan", "approve_creator_shortlist"],
  offers_sent: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
  ],
  roster_finalized: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
  ],
  brief_released: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
    "approve_brief_release",
  ],
  deliverables_in_review: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
    "approve_brief_release",
  ],
  payouts_pending_approval: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
    "approve_brief_release",
    "approve_deliverable_review",
  ],
  payouts_approved: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
    "approve_brief_release",
    "approve_deliverable_review",
    "approve_payout_batch",
  ],
  completed: [
    "approve_campaign_plan",
    "approve_creator_shortlist",
    "approve_offer_batch",
    "approve_final_roster",
    "approve_brief_release",
    "approve_deliverable_review",
    "approve_payout_batch",
    "mark_payouts_paid",
    "approve_brand_update",
  ],
};

const allowedTransitions: Record<EnterpriseCampaignStatus, EnterpriseCampaignStatus[]> = {
  setup: ["plan_pending_approval", "cancelled"],
  plan_pending_approval: ["plan_approved", "setup", "cancelled"],
  plan_approved: ["shortlist_pending_approval", "cancelled"],
  shortlist_pending_approval: ["shortlist_approved", "plan_approved", "cancelled"],
  shortlist_approved: ["offers_pending_approval", "cancelled"],
  offers_pending_approval: ["offers_sent", "shortlist_approved", "cancelled"],
  offers_sent: ["roster_finalized", "cancelled"],
  roster_finalized: ["brief_released", "cancelled"],
  brief_released: ["deliverables_in_review", "cancelled"],
  deliverables_in_review: ["payouts_pending_approval", "cancelled"],
  payouts_pending_approval: ["payouts_approved", "deliverables_in_review", "cancelled"],
  payouts_approved: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateEnterpriseBudget(
  input: EnterpriseBudgetInput,
): EnterpriseBudgetBreakdown {
  const managementFeeAmount = roundMoney(
    input.totalBudgetAmount * input.managementFeeRate,
  );
  const creatorBudgetAmount = roundMoney(
    input.totalBudgetAmount - managementFeeAmount,
  );
  const plannedCreatorCommitmentAmount = roundMoney(
    input.targetCreatorCount * input.plannedOfferAmount,
  );

  return {
    ...input,
    managementFeeAmount,
    creatorBudgetAmount,
    plannedCreatorCommitmentAmount,
    remainingCreatorBudgetAmount: roundMoney(
      creatorBudgetAmount - plannedCreatorCommitmentAmount,
    ),
  };
}

export function canTransitionEnterpriseCampaign({
  from,
  to,
  approvals,
}: EnterpriseTransitionInput) {
  if (!allowedTransitions[from].includes(to)) {
    return false;
  }

  const approvalSet = new Set(approvals);
  const requiredApprovals = transitionApprovalRequirements[to] ?? [];

  return requiredApprovals.every((approval) => approvalSet.has(approval));
}
