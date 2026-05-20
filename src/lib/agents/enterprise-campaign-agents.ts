import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";

import {
  creatorVettingOutputSchema,
  deliverableReviewOutputSchema,
  offerDraftingOutputSchema,
  payoutPrepOutputSchema,
} from "../platform/enterprise-campaign";

type CreatorVettingOutput = z.infer<typeof creatorVettingOutputSchema>;
type OfferDraftingOutput = z.infer<typeof offerDraftingOutputSchema>;
type DeliverableReviewOutput = z.infer<typeof deliverableReviewOutputSchema>;
type PayoutPrepOutput = z.infer<typeof payoutPrepOutputSchema>;

export const campaignDirectorTaskTypes = [
  "campaign_planning",
  "creator_vetting",
  "offer_drafting",
  "briefing",
  "deliverable_review",
  "brand_update",
  "payout_prep",
] as const;

export type CampaignDirectorTaskType = (typeof campaignDirectorTaskTypes)[number];

export type CampaignDirectorTaskResult = {
  taskType: CampaignDirectorTaskType;
  status: "completed" | "failed";
  requiresAdminApproval: true;
  confidence: number;
  riskFlags: string[];
  output: unknown;
};

export type DryRunCampaignDirectorInput = {
  enterpriseCampaignId: string;
  targetCreatorCount: number;
  plannedOfferAmount: number;
  creatorBudgetAmount: number;
  creators: Array<{
    creatorId: string;
    displayName?: string | null;
    reasons: string[];
    risks: string[];
  }>;
  deliverables?: Array<{
    deliverableId: string;
    title: string;
  }>;
};

export type DryRunCampaignDirectorOutput = {
  enterpriseCampaignId: string;
  requiresAdminApproval: true;
  tasks: CampaignDirectorTaskResult[];
  creatorVetting: CreatorVettingOutput;
  offerDrafting: OfferDraftingOutput;
  deliverableReview: DeliverableReviewOutput[];
  payoutPrep: PayoutPrepOutput;
  brandUpdateDraft: {
    summary: string;
    confidence: number;
    risks: string[];
  };
};

const CampaignDirectorAnnotation = Annotation.Root({
  input: Annotation<DryRunCampaignDirectorInput>,
  tasks: Annotation<CampaignDirectorTaskResult[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  creatorVetting: Annotation<CreatorVettingOutput | undefined>,
  offerDrafting: Annotation<OfferDraftingOutput | undefined>,
  deliverableReview: Annotation<DeliverableReviewOutput[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  payoutPrep: Annotation<PayoutPrepOutput | undefined>,
  brandUpdateDraft: Annotation<
    | {
        summary: string;
        confidence: number;
        risks: string[];
      }
    | undefined
  >,
});

function taskResult(
  taskType: CampaignDirectorTaskType,
  output: unknown,
  riskFlags: string[] = [],
  confidence = 0.72,
): CampaignDirectorTaskResult {
  return {
    taskType,
    status: "completed",
    requiresAdminApproval: true,
    confidence,
    riskFlags,
    output,
  };
}

export async function runDryRunCampaignDirector(
  input: DryRunCampaignDirectorInput,
): Promise<DryRunCampaignDirectorOutput> {
  const graph = new StateGraph(CampaignDirectorAnnotation)
    .addNode("campaign_planning", () => ({
      tasks: [
        taskResult("campaign_planning", {
          summary: "Campaign plan requires admin approval before downstream actions.",
        }),
      ],
    }))
    .addNode("creator_vetting", (state) => {
      const recommendedCreators = state.input.creators
        .slice(0, state.input.targetCreatorCount)
        .map((creator, index) => ({
          creatorId: creator.creatorId,
          score: Math.max(70, 95 - index * 3),
          reasons: creator.reasons.length > 0 ? creator.reasons : ["Matches campaign requirements"],
          risks: creator.risks,
          suggestedOfferAmount: state.input.plannedOfferAmount,
        }));

      const backupCreators = state.input.creators
        .slice(state.input.targetCreatorCount, state.input.targetCreatorCount + 5)
        .map((creator, index) => ({
          creatorId: creator.creatorId,
          score: Math.max(60, 82 - index * 3),
          reasons: creator.reasons.length > 0 ? creator.reasons : ["Backup fit for campaign requirements"],
          risks: creator.risks,
        }));

      const creatorVetting = creatorVettingOutputSchema.parse({
        recommendedCreators,
        backupCreators,
        summary: `Dry-run recommendation for ${recommendedCreators.length} primary creators and ${backupCreators.length} backups.`,
      });

      return {
        creatorVetting,
        tasks: [
          taskResult(
            "creator_vetting",
            creatorVetting,
            creatorVetting.recommendedCreators.flatMap((creator) => creator.risks),
          ),
        ],
      };
    })
    .addNode("offer_drafting", (state) => {
      if (!state.creatorVetting) {
        throw new Error("Creator vetting output is required before offer drafting");
      }

      const totalCommittedAmount =
        state.creatorVetting.recommendedCreators.length * state.input.plannedOfferAmount;
      const offerDrafting = offerDraftingOutputSchema.parse({
        offers: state.creatorVetting.recommendedCreators.map((creator) => ({
          creatorId: creator.creatorId,
          amount: state.input.plannedOfferAmount,
          currency: "GBP",
          deliverables: ["45-60 videos over one month"],
          deadlineSummary: "One month from approved brief release",
          usageTermsSummary: "Manual V1 terms require admin approval before sending",
          messageDraft:
            "We would like to offer you a managed enterprise UGC campaign. Please review the terms in your dashboard.",
        })),
        totalCommittedAmount,
        remainingCreatorBudget: state.input.creatorBudgetAmount - totalCommittedAmount,
      });

      return {
        offerDrafting,
        tasks: [taskResult("offer_drafting", offerDrafting)],
      };
    })
    .addNode("briefing", () => ({
      tasks: [
        taskResult("briefing", {
          summary: "Brief draft should be reviewed and released by admin only.",
        }),
      ],
    }))
    .addNode("deliverable_review", (state) => {
      const deliverableReview = (state.input.deliverables ?? []).map((deliverable) =>
        deliverableReviewOutputSchema.parse({
          deliverableId: deliverable.deliverableId,
          recommendedStatus: "approved",
          reasons: [`${deliverable.title} is ready for admin review in dry-run mode`],
          confidence: 0.72,
        }),
      );

      return {
        deliverableReview,
        tasks: deliverableReview.map((review) =>
          taskResult("deliverable_review", review, [], review.confidence),
        ),
      };
    })
    .addNode("payout_prep", (state) => {
      if (!state.creatorVetting) {
        throw new Error("Creator vetting output is required before payout preparation");
      }

      const totalCommittedAmount =
        state.creatorVetting.recommendedCreators.length * state.input.plannedOfferAmount;
      const payoutPrep = payoutPrepOutputSchema.parse({
        payouts: state.creatorVetting.recommendedCreators.map((creator) => ({
          creatorId: creator.creatorId,
          amount: state.input.plannedOfferAmount,
          currency: "GBP",
          reason: "Dry-run payout recommendation after accepted offer and approved deliverable",
        })),
        totalPayoutAmount: totalCommittedAmount,
        requiresAdminApproval: true,
      });

      return {
        payoutPrep,
        tasks: [taskResult("payout_prep", payoutPrep)],
      };
    })
    .addNode("brand_update", () => {
      const brandUpdateDraft = {
        summary:
          "Enterprise campaign recommendations are ready for admin review. No brand update should be sent until approved.",
        confidence: 0.72,
        risks: ["Dry-run output must be reviewed against source-of-truth campaign state"],
      };

      return {
        brandUpdateDraft,
        tasks: [taskResult("brand_update", brandUpdateDraft, brandUpdateDraft.risks)],
      };
    })
    .addEdge(START, "campaign_planning")
    .addEdge("campaign_planning", "creator_vetting")
    .addEdge("creator_vetting", "offer_drafting")
    .addEdge("offer_drafting", "briefing")
    .addEdge("briefing", "deliverable_review")
    .addEdge("deliverable_review", "payout_prep")
    .addEdge("payout_prep", "brand_update")
    .addEdge("brand_update", END)
    .compile();

  const state = await graph.invoke({ input });

  if (!state.creatorVetting || !state.offerDrafting || !state.payoutPrep || !state.brandUpdateDraft) {
    throw new Error("Campaign Director graph did not produce all required outputs");
  }

  return {
    enterpriseCampaignId: input.enterpriseCampaignId,
    requiresAdminApproval: true,
    tasks: state.tasks,
    creatorVetting: state.creatorVetting,
    offerDrafting: state.offerDrafting,
    deliverableReview: state.deliverableReview,
    payoutPrep: state.payoutPrep,
    brandUpdateDraft: state.brandUpdateDraft,
  };
}

export function buildDryRunCreatorVettingOutput(input: DryRunCampaignDirectorInput) {
  const recommendedCreators = input.creators
    .slice(0, input.targetCreatorCount)
    .map((creator, index) => ({
      creatorId: creator.creatorId,
      score: Math.max(70, 95 - index * 3),
      reasons: creator.reasons.length > 0 ? creator.reasons : ["Matches campaign requirements"],
      risks: creator.risks,
      suggestedOfferAmount: input.plannedOfferAmount,
    }));

  const backupCreators = input.creators
    .slice(input.targetCreatorCount, input.targetCreatorCount + 5)
    .map((creator, index) => ({
      creatorId: creator.creatorId,
      score: Math.max(60, 82 - index * 3),
      reasons: creator.reasons.length > 0 ? creator.reasons : ["Backup fit for campaign requirements"],
      risks: creator.risks,
    }));

  const creatorVetting = creatorVettingOutputSchema.parse({
    recommendedCreators,
    backupCreators,
    summary: `Dry-run recommendation for ${recommendedCreators.length} primary creators and ${backupCreators.length} backups.`,
  });

  const totalCommittedAmount =
    creatorVetting.recommendedCreators.length * input.plannedOfferAmount;
  const offerDrafting = offerDraftingOutputSchema.parse({
    offers: creatorVetting.recommendedCreators.map((creator) => ({
      creatorId: creator.creatorId,
      amount: input.plannedOfferAmount,
      currency: "GBP",
      deliverables: ["45-60 videos over one month"],
      deadlineSummary: "One month from approved brief release",
      usageTermsSummary: "Manual V1 terms require admin approval before sending",
      messageDraft:
        "We would like to offer you a managed enterprise UGC campaign. Please review the terms in your dashboard.",
    })),
    totalCommittedAmount,
    remainingCreatorBudget: input.creatorBudgetAmount - totalCommittedAmount,
  });

  const deliverableReview = (input.deliverables ?? []).map((deliverable) =>
    deliverableReviewOutputSchema.parse({
      deliverableId: deliverable.deliverableId,
      recommendedStatus: "approved",
      reasons: [`${deliverable.title} is ready for admin review in dry-run mode`],
      confidence: 0.72,
    }),
  );

  const payoutPrep = payoutPrepOutputSchema.parse({
    payouts: creatorVetting.recommendedCreators.map((creator) => ({
      creatorId: creator.creatorId,
      amount: input.plannedOfferAmount,
      currency: "GBP",
      reason: "Dry-run payout recommendation after accepted offer and approved deliverable",
    })),
    totalPayoutAmount: totalCommittedAmount,
    requiresAdminApproval: true,
  });

  const brandUpdateDraft = {
    summary:
      "Enterprise campaign recommendations are ready for admin review. No brand update should be sent until approved.",
    confidence: 0.72,
    risks: ["Dry-run output must be reviewed against source-of-truth campaign state"],
  };

  return {
    enterpriseCampaignId: input.enterpriseCampaignId,
    requiresAdminApproval: true,
    tasks: [
      taskResult("campaign_planning", {
        summary: "Campaign plan requires admin approval before downstream actions.",
      }),
      taskResult("creator_vetting", creatorVetting, creatorVetting.recommendedCreators.flatMap((creator) => creator.risks)),
      taskResult("offer_drafting", offerDrafting),
      taskResult("briefing", {
        summary: "Brief draft should be reviewed and released by admin only.",
      }),
      ...deliverableReview.map((review) =>
        taskResult("deliverable_review", review, [], review.confidence),
      ),
      taskResult("payout_prep", payoutPrep),
      taskResult("brand_update", brandUpdateDraft, brandUpdateDraft.risks),
    ],
    creatorVetting,
    offerDrafting,
    deliverableReview,
    payoutPrep,
    brandUpdateDraft,
  };
}
