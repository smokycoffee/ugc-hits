import type { AppLocale } from "@/i18n/routing";

import { resolveBrandAuthNextPath } from "./brand-onboarding";
import { getDashboardPathForRole } from "./utils";

export type LoginRole = "brand" | "creator" | "admin";

type SharedLoginTargetInput = {
  next?: string | null;
  companyName?: string | null;
  productType?: string | null;
  existingRole?: LoginRole | null;
};

export function resolveSharedLoginTarget(
  locale: AppLocale,
  input: SharedLoginTargetInput,
) {
  const hasBrandLeadContext =
    Boolean(input.next?.trim()) ||
    Boolean(input.companyName?.trim()) ||
    Boolean(input.productType?.trim());

  if (hasBrandLeadContext) {
    return {
      next: resolveBrandAuthNextPath(locale, input.next, {
        companyName: input.companyName,
        productType: input.productType,
      }),
      role: "brand" as const,
    };
  }

  const role = input.existingRole ?? "brand";

  return {
    next: getDashboardPathForRole(locale, role),
    role,
  };
}
