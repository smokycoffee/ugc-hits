"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LifeBuoy,
  Mail,
  Megaphone,
  Settings2,
  Users2,
} from "lucide-react";

import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getLocalizedPath } from "@/lib/platform/utils";

type BrandDashboardShellProps = {
  locale: AppLocale;
  brandName: string;
  profileEmail: string;
  unreadCount: number;
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof Megaphone;
  badge?: string;
};

function DashboardNavLink({
  item,
  pathname,
  tone = "dark",
}: {
  item: NavItem;
  pathname: string;
  tone?: "dark" | "light";
}) {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-[1.1rem] px-3 py-3 text-sm font-medium transition-colors",
        tone === "dark"
          ? isActive
            ? "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            : "text-slate-300 hover:bg-white/8 hover:text-white"
          : isActive
            ? "border border-slate-200 bg-slate-950 text-white"
            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="size-4" />
        {item.label}
      </span>
      {item.badge ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
            tone === "dark"
              ? "bg-white/14 text-slate-200"
              : isActive
                ? "bg-white/14 text-white"
                : "bg-slate-100 text-slate-500",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function BrandDashboardShell({
  locale,
  brandName,
  profileEmail,
  unreadCount,
  children,
}: BrandDashboardShellProps) {
  const pathname = usePathname();
  const primaryNav: NavItem[] = [
    {
      label: "Campaigns",
      href: getLocalizedPath(locale, "/dashboard/brand/campaigns"),
      icon: Megaphone,
    },
    {
      label: "Applicants",
      href: getLocalizedPath(locale, "/dashboard/brand/applicants"),
      icon: Users2,
    },
    {
      label: "Messages",
      href: getLocalizedPath(locale, "/dashboard/brand/messages"),
      icon: Mail,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
  ];
  const utilityNav: NavItem[] = [
    {
      label: "Account",
      href: getLocalizedPath(locale, "/dashboard/brand/accounts"),
      icon: Settings2,
    },
    {
      label: "Support",
      href: getLocalizedPath(locale, "/dashboard/brand/support"),
      icon: LifeBuoy,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),linear-gradient(180deg,#f8fbff,#edf5fd)]">
      <aside className="fixed inset-y-4 left-4 z-20 hidden w-[272px] flex-col rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(17,37,61,0.96))] p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] md:flex">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-200/90">
            UGC Hits
          </p>
         
          <h2 className="mt-4 text-sm leading-6 text-slate-300">{brandName}</h2>
        </div>

        <nav className="mt-6 space-y-2">
          {primaryNav.map((item) => (
            <DashboardNavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="mt-auto space-y-5 pt-8">
          <nav className="space-y-2">
            {utilityNav.map((item) => (
              <DashboardNavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
          {/* <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-[1rem] border border-white/14 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
            >
              Sign out
            </button>
          </form> */}
        </div>
      </aside>

      <div className="px-3 py-4 md:pl-[308px] md:pr-5 md:py-5">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-sm">
            <div className="flex min-w-0 flex-col">
              <div className="border-b border-slate-200/80 bg-white/85 p-4 md:hidden">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.94))] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-teal-700">
                    UGC Hits
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h1 className="font-serif text-2xl leading-none text-slate-950">
                        Brand Dashboard
                      </h1>
                      <h2 className="mt-3 text-sm text-slate-600">{brandName}</h2>
                    </div>
                   
                  </div>

                  <nav className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[...primaryNav, ...utilityNav].map((item) => (
                      <DashboardNavLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        tone="light"
                      />
                    ))}
                  </nav>
                </div>
              </div>

              <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
