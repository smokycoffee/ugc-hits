import { redirect } from "next/navigation";

import { BrandOnboardingShell } from "@/components/onboarding/brand-onboarding-shell";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { getLandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";
import type { CampaignSummary } from "@/lib/platform/data";
import {
  buildBrandLoginPath,
} from "@/lib/platform/brand-onboarding";
import { getDashboardPathForRole } from "@/lib/platform/utils";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    companyName?: string | string[];
    productType?: string | string[];
    error?: string | string[];
  }>;
};

function getFirstValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getCreatorSlotValue(value?: number | null) {
  if (!value) {
    return "";
  }

  if (value <= 1) {
    return "1";
  }

  if (value <= 5) {
    return "2-5";
  }

  if (value <= 10) {
    return "6-10";
  }

  if (value <= 20) {
    return "11-20";
  }

  return "20+";
}

export default async function LocalizedOnboardingBrandPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const currentLocale = locale as AppLocale;
  const content = await getLandingContent(locale as AppLocale);
  const productTypeOptions =
    content.getStarted.brand.card.fields?.find((field) => field.type === "select")
      ?.options ?? [];
  const companyName = getFirstValue(query.companyName);
  const productType = getFirstValue(query.productType);
  const error = getFirstValue(query.error);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      buildBrandLoginPath(currentLocale, {
        companyName,
        productType,
      }),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect(
      buildBrandLoginPath(currentLocale, {
        companyName,
        productType,
      }),
    );
  }

  if (profile.role !== "brand") {
    redirect(getDashboardPathForRole(currentLocale, profile.role));
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  const primaryCampaign =
    ((campaigns ?? []) as CampaignSummary[])
      .filter((campaign) => campaign.brand_id === brand?.id)
      .find((campaign) => campaign.is_primary) ??
    ((campaigns ?? []) as CampaignSummary[]).find(
      (campaign) => campaign.brand_id === brand?.id,
    ) ??
    null;

  return (
    <PlatformPageShell
      eyebrow="Brand Onboarding"
      title="Complete your campaign details before entering the dashboard."
      description="This authenticated onboarding saves your brand profile, targeting, and campaign brief into the marketplace instead of showing a temporary draft state."
      profileLabel={profile.email}
      actions={
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Sign out
          </button>
        </form>
      }
    >
      {error ? (
        <p className="mb-6 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {decodeURIComponent(error)}
        </p>
      ) : null}
      <BrandOnboardingShell
        initialValues={{
          companyName: companyName || brand?.company_name || "",
          companyWebsite: brand?.website ?? "",
          instagram: brand?.instagram ?? "",
          tiktok: brand?.tiktok ?? "",
          productType: productType || primaryCampaign?.product_type || brand?.product_type || "",
          companyLogoName: brand?.logo_asset_name ?? "",
          contactName: brand?.contact_name ?? "",
          role: brand?.contact_role ?? "",
          referralSource: brand?.referral_source ?? "",
          creatorSlots: getCreatorSlotValue(primaryCampaign?.creator_slots),
          creatorNiches: primaryCampaign?.creator_niches ?? [],
          creatorLocation: primaryCampaign?.creator_location ?? undefined,
          creatorAgeRanges: primaryCampaign?.creator_age_ranges ?? [],
          creatorGenders: primaryCampaign?.creator_genders ?? [],
          creatorEthnicities: primaryCampaign?.creator_ethnicities ?? [],
          campaignType: primaryCampaign?.campaign_type ?? "",
          campaignFrequency: primaryCampaign?.campaign_frequency ?? "",
          budgetMin:
            primaryCampaign?.budget_min !== null && primaryCampaign?.budget_min !== undefined
              ? String(primaryCampaign.budget_min)
              : "",
          budgetMax:
            primaryCampaign?.budget_max !== null && primaryCampaign?.budget_max !== undefined
              ? String(primaryCampaign.budget_max)
              : "",
          inspirationLinks: [
            primaryCampaign?.inspiration_links?.[0] ?? "",
            primaryCampaign?.inspiration_links?.[1] ?? "",
            primaryCampaign?.inspiration_links?.[2] ?? "",
          ],
          campaignDescription: primaryCampaign?.description ?? "",
          uniquePosts:
            primaryCampaign?.unique_posts !== null && primaryCampaign?.unique_posts !== undefined
              ? String(primaryCampaign.unique_posts)
              : "",
          postingPlatforms: primaryCampaign?.posting_platforms ?? [],
          minimumFollowerCount: primaryCampaign?.minimum_follower_count ?? "",
          includesPaidUsage: primaryCampaign?.includes_paid_usage ?? false,
        }}
        productTypeOptions={productTypeOptions}
        locale={currentLocale}
      />
    </PlatformPageShell>
  );
}
