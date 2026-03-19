import Link from "next/link";

import { cn } from "@/lib/utils";
import type { LandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type PageLocaleChromeProps = {
  brand: string;
  locale: AppLocale;
  localeSwitcher: LandingContent["localeSwitcher"];
  path: string;
  searchParams?: Record<string, string>;
};

function getLocalizedPath(locale: AppLocale, path: string) {
  return `/${locale}${path}`;
}

function getHref(
  locale: AppLocale,
  path: string,
  searchParams?: Record<string, string>,
) {
  const query = new URLSearchParams(searchParams);
  const queryString = query.toString();
  return `${getLocalizedPath(locale, path)}${queryString ? `?${queryString}` : ""}`;
}

export function PageLocaleChrome({
  brand,
  locale,
  localeSwitcher,
  path,
  searchParams,
}: PageLocaleChromeProps) {
  return (
    <div className="px-4 pt-4 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/78 px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl md:px-6">
        <Link
          href={getLocalizedPath(locale, "/")}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-950"
        >
          {brand}
        </Link>

        <div className="flex items-center rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500">
          <Link
            href={getHref("pl", path, searchParams)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "pl" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.pl}
          </Link>
          <Link
            href={getHref("en", path, searchParams)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "en" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.en}
          </Link>
        </div>
      </div>
    </div>
  );
}
