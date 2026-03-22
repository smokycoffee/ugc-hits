import type { AppLocale } from "@/i18n/routing";

export function getLocalizedPath(locale: AppLocale, path: string) {
  return `/${locale}${path}`;
}

export function sanitizeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/")) {
    return fallback;
  }

  return next;
}

export function getDashboardPathForRole(
  locale: AppLocale,
  role: string | null | undefined,
) {
  if (role === "creator") {
    return getLocalizedPath(locale, "/dashboard/creator");
  }

  if (role === "admin") {
    return getLocalizedPath(locale, "/admin/invites");
  }

  return getLocalizedPath(locale, "/dashboard/brand");
}
