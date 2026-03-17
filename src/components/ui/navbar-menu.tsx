import Link from "next/link";

import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type NavbarLink = {
  href: string;
  label: string;
};

type NavbarMenuProps = {
  brand: string;
  links: NavbarLink[];
  cta: NavbarLink;
  locale: AppLocale;
  localeSwitcher: {
    pl: string;
    en: string;
  };
  className?: string;
};

export function NavbarMenu({
  brand,
  links,
  cta,
  locale,
  localeSwitcher,
  className,
}: NavbarMenuProps) {
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/78 px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl md:px-6",
        className,
      )}
    >
      <Link
        href={homeHref}
        className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-950"
      >
        {brand}
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-slate-600 transition-colors hover:text-slate-950"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden items-center rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500 md:flex">
          <Link
            href="/"
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "pl" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.pl}
          </Link>
          <Link
            href="/en"
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "en" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.en}
          </Link>
        </div>
        <div
          aria-label="Select language"
          className="flex items-center rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500 md:hidden"
        >
          <Link
            href="/"
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "pl" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.pl}
          </Link>
          <Link
            href="/en"
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              locale === "en" && "bg-slate-950 text-white",
            )}
          >
            {localeSwitcher.en}
          </Link>
        </div>
        <a
          href={cta.href}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 md:px-5",
          )}
        >
          <span className="md:hidden">{locale === "en" ? "Post Campaign" : cta.label}</span>
          <span className="hidden md:inline">{cta.label}</span>
        </a>
      </div>
    </div>
  );
}
