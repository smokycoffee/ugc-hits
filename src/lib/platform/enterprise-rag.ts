import { OpenAIEmbeddings } from "@langchain/openai";

export type EnterpriseKnowledgeSourceType =
  | "creator_profile"
  | "creator_application_notes"
  | "campaign_description"
  | "enterprise_requirements"
  | "brand_guidelines"
  | "offer_template"
  | "revision_rules";

export type EnterpriseKnowledgeDocumentInput = {
  enterpriseCampaign: {
    id: string;
    campaignId: string;
    brandId: string;
    requirements?: string | null;
  };
  campaign: {
    id: string;
    title: string;
    description?: string | null;
    productType?: string | null;
  };
  creators?: Array<{
    id: string;
    status: string;
    displayName?: string | null;
    email: string;
    applicationNotes?: string | null;
    creatorProfileSeed?: Record<string, unknown>;
  }>;
  brandGuidelines?: string | null;
  offerTemplates?: string[];
  revisionQualityRules?: string | null;
};

export type EnterpriseKnowledgeDocument = {
  enterpriseCampaignId: string;
  campaignId: string;
  brandId: string;
  creatorId: string | null;
  sourceType: EnterpriseKnowledgeSourceType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

export type EnterpriseKnowledgeResult = {
  id: string;
  creatorId: string | null;
  sourceType: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

type RetrievalRpc = (
  fn: "match_agent_knowledge_documents",
  args: {
    query_embedding: number[];
    match_count: number;
    filter_enterprise_campaign_id: string | null;
    filter_creator_id: string | null;
    filter_source_types: string[] | null;
  },
) => Promise<{
  data:
    | Array<{
        id: string;
        creator_id: string | null;
        source_type: string;
        title: string;
        content: string;
        metadata: Record<string, unknown> | null;
        similarity: number;
      }>
    | null;
  error: { message: string } | null;
}>;

export type RetrieveEnterpriseKnowledgeInput = {
  query: string;
  embedding: number[];
  matchCount?: number;
  enterpriseCampaignId?: string | null;
  creatorId?: string | null;
  sourceTypes?: EnterpriseKnowledgeSourceType[];
  rpc: RetrievalRpc;
};

export function createDeterministicEmbedding(text: string, dimensions = 1536) {
  const normalized = text.trim().toLowerCase();
  const embedding = Array.from({ length: dimensions }, (_, index) => {
    const charCode = normalized.charCodeAt(index % Math.max(normalized.length, 1)) || 0;
    return ((charCode + index * 31) % 997) / 997;
  });
  const magnitude =
    Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0)) || 1;

  return embedding.map((value) => value / magnitude);
}

export async function createEnterpriseEmbedding(text: string) {
  const dryRun = (process.env.AGENT_DRY_RUN ?? "true") !== "false";

  if (dryRun || !process.env.OPENAI_API_KEY) {
    return createDeterministicEmbedding(text);
  }

  const embeddings = new OpenAIEmbeddings({
    model: process.env.AGENT_EMBEDDING_MODEL ?? "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  return embeddings.embedQuery(text);
}

function contentFromSeed(seed: Record<string, unknown> | undefined) {
  if (!seed || Object.keys(seed).length === 0) {
    return "";
  }

  return JSON.stringify(seed);
}

function baseMetadata(extra?: Record<string, unknown>) {
  return {
    inspectable: true,
    generatedAt: new Date(0).toISOString(),
    ...extra,
  };
}

export function buildEnterpriseKnowledgeDocuments({
  enterpriseCampaign,
  campaign,
  creators = [],
  brandGuidelines,
  offerTemplates = [],
  revisionQualityRules,
}: EnterpriseKnowledgeDocumentInput): EnterpriseKnowledgeDocument[] {
  const documents: EnterpriseKnowledgeDocument[] = [
    {
      enterpriseCampaignId: enterpriseCampaign.id,
      campaignId: campaign.id,
      brandId: enterpriseCampaign.brandId,
      creatorId: null,
      sourceType: "campaign_description",
      title: `${campaign.title} campaign description`,
      content: [campaign.title, campaign.productType, campaign.description]
        .filter(Boolean)
        .join("\n"),
      metadata: baseMetadata({ campaignId: campaign.id }),
    },
  ];

  if (enterpriseCampaign.requirements) {
    documents.push({
      enterpriseCampaignId: enterpriseCampaign.id,
      campaignId: campaign.id,
      brandId: enterpriseCampaign.brandId,
      creatorId: null,
      sourceType: "enterprise_requirements",
      title: `${campaign.title} enterprise requirements`,
      content: enterpriseCampaign.requirements,
      metadata: baseMetadata({ campaignId: campaign.id }),
    });
  }

  if (brandGuidelines) {
    documents.push({
      enterpriseCampaignId: enterpriseCampaign.id,
      campaignId: campaign.id,
      brandId: enterpriseCampaign.brandId,
      creatorId: null,
      sourceType: "brand_guidelines",
      title: `${campaign.title} brand guidelines`,
      content: brandGuidelines,
      metadata: baseMetadata({ campaignId: campaign.id }),
    });
  }

  offerTemplates.forEach((template, index) => {
    documents.push({
      enterpriseCampaignId: enterpriseCampaign.id,
      campaignId: campaign.id,
      brandId: enterpriseCampaign.brandId,
      creatorId: null,
      sourceType: "offer_template",
      title: `${campaign.title} offer template ${index + 1}`,
      content: template,
      metadata: baseMetadata({ campaignId: campaign.id, templateIndex: index }),
    });
  });

  if (revisionQualityRules) {
    documents.push({
      enterpriseCampaignId: enterpriseCampaign.id,
      campaignId: campaign.id,
      brandId: enterpriseCampaign.brandId,
      creatorId: null,
      sourceType: "revision_rules",
      title: `${campaign.title} revision quality rules`,
      content: revisionQualityRules,
      metadata: baseMetadata({ campaignId: campaign.id }),
    });
  }

  creators
    .filter((creator) => creator.status === "active")
    .forEach((creator) => {
      const seedContent = contentFromSeed(creator.creatorProfileSeed);

      if (seedContent) {
        documents.push({
          enterpriseCampaignId: enterpriseCampaign.id,
          campaignId: campaign.id,
          brandId: enterpriseCampaign.brandId,
          creatorId: creator.id,
          sourceType: "creator_profile",
          title: `${creator.displayName ?? creator.email} profile seed`,
          content: seedContent,
          metadata: baseMetadata({
            creatorId: creator.id,
            creatorStatus: creator.status,
          }),
        });
      }

      if (creator.applicationNotes) {
        documents.push({
          enterpriseCampaignId: enterpriseCampaign.id,
          campaignId: campaign.id,
          brandId: enterpriseCampaign.brandId,
          creatorId: creator.id,
          sourceType: "creator_application_notes",
          title: `${creator.displayName ?? creator.email} application notes`,
          content: creator.applicationNotes,
          metadata: baseMetadata({
            creatorId: creator.id,
            creatorStatus: creator.status,
          }),
        });
      }
    });

  return documents.filter((document) => document.content.trim().length > 0);
}

export async function retrieveEnterpriseKnowledge({
  embedding,
  matchCount = 8,
  enterpriseCampaignId = null,
  creatorId = null,
  sourceTypes,
  rpc,
}: RetrieveEnterpriseKnowledgeInput): Promise<EnterpriseKnowledgeResult[]> {
  const { data, error } = await rpc("match_agent_knowledge_documents", {
    query_embedding: embedding,
    match_count: matchCount,
    filter_enterprise_campaign_id: enterpriseCampaignId,
    filter_creator_id: creatorId,
    filter_source_types: sourceTypes ?? null,
  });

  if (error) {
    throw new Error(`Unable to retrieve enterprise knowledge: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => row.metadata?.creatorStatus !== "inactive")
    .map((row) => ({
      id: row.id,
      creatorId: row.creator_id,
      sourceType: row.source_type,
      title: row.title,
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: row.similarity,
    }));
}
