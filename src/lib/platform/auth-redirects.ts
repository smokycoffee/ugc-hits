import type { AppLocale } from "@/i18n/routing";
import { getDashboardPathForRole, getLocalizedPath, sanitizeNextPath } from "./utils";
import type { LoginRole } from "./login-flow";

export function buildMagicLinkRedirect(
  appUrl: string,
  locale: AppLocale,
  role: LoginRole,
  next?: string,
) {
  const redirectUrl = new URL(
    sanitizeNextPath(next, getDashboardPathForRole(locale, role)),
    appUrl,
  );
  redirectUrl.searchParams.set("role", role);
  return redirectUrl.toString();
}

export function buildBrandMagicLinkRedirect(
  appUrl: string,
  locale: AppLocale,
  next?: string,
) {
  return buildMagicLinkRedirect(appUrl, locale, "brand", next);
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
