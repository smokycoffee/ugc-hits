"use client";

import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl rounded-[28px] border border-white/70 bg-white/78 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          href={homeHref}
          className="shrink-0 text-[0.95rem] font-semibold uppercase tracking-[0.24em] text-slate-950 md:text-sm md:tracking-[0.3em]"
        >
          {brand}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
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

        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <div
            aria-label="Select language"
            className="hidden items-center rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500 md:flex"
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
          <div
            aria-label="Select language"
            className="flex shrink-0 items-center rounded-full border border-slate-200/90 bg-slate-50/95 p-1 text-[0.8rem] font-semibold text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:hidden"
          >
            <Link
              href="/"
              className={cn(
                "rounded-full px-2.5 py-1.5 leading-none transition-colors",
                locale === "pl" && "bg-slate-950 text-white",
              )}
            >
              {localeSwitcher.pl}
            </Link>
            <Link
              href="/en"
              className={cn(
                "rounded-full px-2.5 py-1.5 leading-none transition-colors",
                locale === "en" && "bg-slate-950 text-white",
              )}
            >
              {localeSwitcher.en}
            </Link>
          </div>
          <a
            href={cta.href}
            className={cn(
              "inline-flex h-11 min-w-0 items-center justify-center rounded-[20px] bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition-colors hover:bg-slate-800 md:h-10 md:rounded-full md:px-5 md:shadow-none",
            )}
          >
            <span className="truncate md:hidden">Post Campaign</span>
            <span className="hidden md:inline">{cta.label}</span>
          </a>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-slate-200/90 bg-slate-50/92 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:border-slate-300 hover:text-slate-950 md:hidden"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            </span>
            <span className="relative block h-3.5 w-4">
              <span
                className={cn(
                  "absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-200",
                  isMobileMenuOpen && "top-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[7px] h-0.5 w-4 rounded-full bg-current transition-opacity duration-200",
                  isMobileMenuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[14px] h-0.5 w-4 rounded-full bg-current transition-transform duration-200",
                  isMobileMenuOpen && "top-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-primary-navigation"
        className={cn(
          "border-t border-slate-200/70 px-4 pb-4 pt-3 md:hidden",
          !isMobileMenuOpen && "hidden",
        )}
      >
        <nav
          aria-label="Mobile primary"
          className="grid gap-2 rounded-[22px] bg-slate-50/88 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-[18px] border border-white/90 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-200 hover:text-slate-950"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
