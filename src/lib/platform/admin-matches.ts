import type { AppLocale } from "@/i18n/routing";
import { getLocalizedPath } from "./utils";

type CampaignRow = {
  id: string;
  title: string;
  status: string;
  product_type: string;
  creator_slots: number | null;
  created_at: string | null;
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
  updated_at?: string | null;
};

export type AdminMatchCampaignOption = {
  id: string;
  title: string;
  status: string;
  productType: string;
  creatorSlots: number | null;
  createdAt: string | null;
  brandName: string | null;
};

export type AdminMatchCreatorOption = {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  applicationNotes: string | null;
};

export type AdminMatchesPageState = {
  error: string | null;
  selectedCampaignId: string | null;
  selectedCreatorId: string | null;
  success: {
    campaignId: string;
    creatorId: string;
  } | null;
};

type AdminMatchesSearchParams = Record<
  string,
  string | string[] | undefined
>;

type MatchCampaignRpcArgs = {
  target_campaign_id: string;
  target_creator_id: string;
};

type MatchCampaignRpcResult = {
  error: {
    message: string;
  } | null;
};

type MatchCampaignRunnerInput = {
  locale: AppLocale;
  campaignId: string;
  creatorId: string;
};

type MatchCampaignRunnerDependencies = {
  rpc: (
    fn: "match_campaign_to_creator",
    args: MatchCampaignRpcArgs,
  ) => Promise<MatchCampaignRpcResult>;
  revalidatePath: (path: string) => void;
};

type LoadAdminMatchesDependencies = {
  requireRole: (
    locale: AppLocale,
    expectedRole: "brand" | "creator" | "admin",
  ) => Promise<{
    profile: {
      id: string;
      role: "brand" | "creator" | "admin";
      email: string;
      full_name: string | null;
    };
    supabase: {
      from: (table: string) => {
        select: (query: string) => {
          order: (
            column: string,
            options: { ascending: boolean },
          ) => PromiseLike<{
            data: unknown[] | null;
            error: {
              message: string;
            } | null;
          }>;
        };
      };
    };
  }>;
};

function getSearchParamValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return typeof value === "string" ? value.trim() : "";
}

function decodeQueryValue(value: string) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildAdminMatchesPath(
  locale: AppLocale,
  params?: Record<string, string | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return `${getLocalizedPath(locale, "/admin/matches")}${query ? `?${query}` : ""}`;
}

export function getAdminMatchesPageState(
  searchParams: AdminMatchesSearchParams,
): AdminMatchesPageState {
  const selectedCampaignId = getSearchParamValue(searchParams.campaignId) || null;
  const selectedCreatorId = getSearchParamValue(searchParams.creatorId) || null;
  const matched = getSearchParamValue(searchParams.matched);
  const error = decodeQueryValue(getSearchParamValue(searchParams.error));

  return {
    error,
    selectedCampaignId,
    selectedCreatorId,
    success:
      matched === "1" && selectedCampaignId && selectedCreatorId
        ? {
            campaignId: selectedCampaignId,
            creatorId: selectedCreatorId,
          }
        : null,
  };
}

export async function getAdminMatches(
  locale: AppLocale,
  deps: LoadAdminMatchesDependencies,
) {
  const { supabase, profile } = await deps.requireRole(locale, "admin");

  const [campaignsResult, creatorsResult] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, title, status, product_type, creator_slots, created_at, brands(company_name)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("creators")
      .select("id, email, display_name, status, application_notes, updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (campaignsResult.error) {
    throw new Error(`Unable to load campaigns for manual matching: ${campaignsResult.error.message}`);
  }

  if (creatorsResult.error) {
    throw new Error(`Unable to load creators for manual matching: ${creatorsResult.error.message}`);
  }

  return {
    profile,
    campaigns: ((campaignsResult.data ?? []) as CampaignRow[])
      .filter((campaign) => campaign.status === "live")
      .map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        productType: campaign.product_type,
        creatorSlots: campaign.creator_slots,
        createdAt: campaign.created_at,
        brandName: campaign.brands?.company_name ?? null,
      })),
    creators: ((creatorsResult.data ?? []) as CreatorRow[])
      .filter((creator) => creator.status === "active")
      .map((creator) => ({
        id: creator.id,
        email: creator.email,
        displayName: creator.display_name,
        status: creator.status,
        applicationNotes: creator.application_notes,
      })),
  };
}

export async function runMatchCampaignToCreator(
  input: MatchCampaignRunnerInput,
  deps: MatchCampaignRunnerDependencies,
) {
  const campaignId = input.campaignId.trim();
  const creatorId = input.creatorId.trim();

  if (!campaignId || !creatorId) {
    return {
      redirectPath: buildAdminMatchesPath(input.locale, {
        error: "Select one campaign and one creator before matching.",
        campaignId,
        creatorId,
      }),
    };
  }

  const { error } = await deps.rpc("match_campaign_to_creator", {
    target_campaign_id: campaignId,
    target_creator_id: creatorId,
  });

  if (error) {
    return {
      redirectPath: buildAdminMatchesPath(input.locale, {
        error: error.message,
        campaignId,
        creatorId,
      }),
    };
  }

  const pathsToRevalidate = [
    getLocalizedPath(input.locale, "/admin/matches"),
    getLocalizedPath("en", "/dashboard/creator"),
    getLocalizedPath("pl", "/dashboard/creator"),
  ];

  pathsToRevalidate.forEach((path) => {
    deps.revalidatePath(path);
  });

  return {
    redirectPath: buildAdminMatchesPath(input.locale, {
      matched: "1",
      campaignId,
      creatorId,
    }),
  };
}
