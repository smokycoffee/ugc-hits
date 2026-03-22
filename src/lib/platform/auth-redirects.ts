import type { AppLocale } from "@/i18n/routing";
import { getLocalizedPath, sanitizeNextPath } from "./utils";

export function buildBrandMagicLinkRedirect(
  appUrl: string,
  locale: AppLocale,
  next?: string,
) {
  const redirectUrl = new URL(
    sanitizeNextPath(next, getLocalizedPath(locale, "/dashboard/brand")),
    appUrl,
  );
  redirectUrl.searchParams.set("role", "brand");
  return redirectUrl.toString();
}

export function buildCreatorInviteRedirect(
  appUrl: string,
  locale: AppLocale,
  inviteCode: string,
) {
  const normalizedInviteCode = inviteCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return `${appUrl}${getLocalizedPath(locale, "/dashboard/creator")}?role=creator&invite_code=${encodeURIComponent(
    normalizedInviteCode,
  )}`;
}
