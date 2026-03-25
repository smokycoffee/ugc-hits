import type { AppLocale } from "@/i18n/routing";

import { getLocalizedPath, sanitizeNextPath } from "./utils";

export type BrandLeadParams = {
  companyName?: string | null;
  productType?: string | null;
};

function appendLeadParams(params: URLSearchParams, lead?: BrandLeadParams) {
  if (!lead) {
    return;
  }

  const companyName = lead.companyName?.trim();
  const productType = lead.productType?.trim();

  if (companyName) {
    params.set("companyName", companyName);
  }

  if (productType) {
    params.set("productType", productType);
  }
}

export function buildBrandOnboardingPath(
  locale: AppLocale,
  lead?: BrandLeadParams,
) {
  const path = getLocalizedPath(locale, "/onboarding-brand");
  const params = new URLSearchParams();

  appendLeadParams(params, lead);

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function buildBrandLoginPath(locale: AppLocale, lead?: BrandLeadParams) {
  const path = getLocalizedPath(locale, "/login");
  const params = new URLSearchParams();

  appendLeadParams(params, lead);
  params.set("next", buildBrandOnboardingPath(locale, lead));

  return `${path}?${params.toString()}`;
}

export function resolveBrandAuthNextPath(
  locale: AppLocale,
  next: string | null | undefined,
  lead?: BrandLeadParams,
) {
  return sanitizeNextPath(next, buildBrandOnboardingPath(locale, lead));
}
