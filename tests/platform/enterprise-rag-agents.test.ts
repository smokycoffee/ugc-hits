import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEnterpriseKnowledgeDocuments,
  createDeterministicEmbedding,
  createEnterpriseEmbedding,
  retrieveEnterpriseKnowledge,
} from "../../src/lib/platform/enterprise-rag";
import { runDryRunCampaignDirector } from "../../src/lib/agents/enterprise-campaign-agents";

test("buildEnterpriseKnowledgeDocuments creates inspectable campaign and active creator documents", () => {
  const docs = buildEnterpriseKnowledgeDocuments({
    enterpriseCampaign: {
      id: "enterprise-1",
      campaignId: "campaign-1",
      brandId: "brand-1",
      requirements: "Need wellness creators with testimonial experience.",
    },
    campaign: {
      id: "campaign-1",
      title: "Wellness launch",
      description: "Launch campaign for a supplements brand.",
      productType: "Supplements",
    },
    creators: [
      {
        id: "creator-1",
        status: "active",
        displayName: "Marta",
        email: "marta@example.com",
        applicationNotes: "Strong wellness portfolio.",
        creatorProfileSeed: { niches: ["wellness"], location: "Warsaw" },
      },
      {
        id: "creator-2",
        status: "inactive",
        displayName: "Inactive creator",
        email: "inactive@example.com",
        applicationNotes: "Do not recommend.",
        creatorProfileSeed: {},
      },
    ],
  });

  assert.deepEqual(
    docs.map((doc) => doc.sourceType),
    [
      "campaign_description",
      "enterprise_requirements",
      "creator_profile",
      "creator_application_notes",
    ],
  );
  assert.equal(docs.some((doc) => doc.creatorId === "creator-2"), false);
  assert.equal(docs[0]?.metadata.inspectable, true);
});

test("retrieveEnterpriseKnowledge filters inactive creator documents returned by vector RPC", async () => {
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];

  const results = await retrieveEnterpriseKnowledge({
    query: "wellness creators",
    embedding: [0.1, 0.2, 0.3],
    matchCount: 4,
    enterpriseCampaignId: "enterprise-1",
    sourceTypes: ["creator_profile"],
    rpc: async (fn, args) => {
      rpcCalls.push({ fn, args: args as Record<string, unknown> });
      return {
        data: [
          {
            id: "doc-1",
            creator_id: "creator-1",
            source_type: "creator_profile",
            title: "Marta profile",
            content: "Active creator",
            metadata: { creatorStatus: "active" },
            similarity: 0.88,
          },
          {
            id: "doc-2",
            creator_id: "creator-2",
            source_type: "creator_profile",
            title: "Inactive profile",
            content: "Inactive creator",
            metadata: { creatorStatus: "inactive" },
            similarity: 0.91,
          },
        ],
        error: null,
      };
    },
  });

  assert.equal(rpcCalls[0]?.fn, "match_agent_knowledge_documents");
  assert.equal(rpcCalls[0]?.args.filter_enterprise_campaign_id, "enterprise-1");
  assert.deepEqual(
    results.map((result) => result.id),
    ["doc-1"],
  );
});

test("createDeterministicEmbedding returns stable pgvector-sized dry-run embeddings", () => {
  const first = createDeterministicEmbedding("Wellness creator profile");
  const second = createDeterministicEmbedding("Wellness creator profile");

  assert.equal(first.length, 1536);
  assert.deepEqual(first, second);
  assert.equal(first.every((value) => Number.isFinite(value)), true);
});

test("createEnterpriseEmbedding uses deterministic embeddings in dry-run mode", async () => {
  const previousDryRun = process.env.AGENT_DRY_RUN;
  process.env.AGENT_DRY_RUN = "true";

  try {
    assert.deepEqual(
      await createEnterpriseEmbedding("Dry run embedding"),
      createDeterministicEmbedding("Dry run embedding"),
    );
  } finally {
    if (previousDryRun === undefined) {
      delete process.env.AGENT_DRY_RUN;
    } else {
      process.env.AGENT_DRY_RUN = previousDryRun;
    }
  }
});

test("dry-run campaign director returns admin-gated specialist recommendations with reasons and risks", async () => {
  const result = await runDryRunCampaignDirector({
    enterpriseCampaignId: "enterprise-1",
    targetCreatorCount: 10,
    plannedOfferAmount: 600,
    creatorBudgetAmount: 8000,
    creators: [
      {
        creatorId: "creator-1",
        displayName: "Marta",
        reasons: ["Strong wellness match"],
        risks: ["Availability not confirmed"],
      },
    ],
    deliverables: [{ deliverableId: "deliverable-1", title: "Hook test" }],
  });

  assert.equal(result.requiresAdminApproval, true);
  assert.equal(result.tasks.length >= 5, true);
  assert.equal(result.tasks[0]?.status, "completed");
  assert.equal(result.creatorVetting.recommendedCreators[0]?.reasons[0], "Strong wellness match");
  assert.equal(result.creatorVetting.recommendedCreators[0]?.risks[0], "Availability not confirmed");
  assert.equal(result.offerDrafting.remainingCreatorBudget, 7400);
  assert.equal(result.deliverableReview[0]?.confidence, 0.72);
  assert.equal(result.payoutPrep.requiresAdminApproval, true);
});
