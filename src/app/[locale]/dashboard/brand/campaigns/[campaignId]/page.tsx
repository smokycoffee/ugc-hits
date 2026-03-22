import Link from "next/link";
import { ArrowLeft, Globe2, Instagram, Music4, PencilLine, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import { buildBrandOnboardingPath } from "@/lib/platform/brand-onboarding";
import { getBrandDashboard } from "@/lib/platform/data";
import {
  buildCampaignDetailView,
  findBrandCampaignById,
} from "@/lib/platform/brand-dashboard";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string; campaignId: string }>;
};

function formatCampaignTimestamp(value?: string | null) {
  if (!value) {
    return "Updated recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BrandCampaignDetailPage({ params }: Props) {
  const { locale, campaignId } = await params;
  const data = await getBrandDashboard(locale as AppLocale);
  const campaign = findBrandCampaignById(
    data.primaryCampaign,
    data.campaigns,
    campaignId,
  );

  if (!campaign) {
    notFound();
  }

  const view = buildCampaignDetailView(campaign, data.brand);
  const onboardingPath = buildBrandOnboardingPath(locale as AppLocale, {
    companyName: data.brand?.company_name,
    productType: data.brand?.product_type,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-sky-200/90 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(232,244,255,0.94))] px-5 py-4 text-sm text-sky-800 shadow-[0_14px_40px_rgba(56,189,248,0.08)]">
        Your campaign is under review. UGC Hits can still update the brief while the team checks
        deliverables, targeting, and usage details.
      </section>

      <header className="space-y-4 rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <Link
          href={getLocalizedPath(locale as AppLocale, "/dashboard/brand/campaigns")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
              {view.typeLabel}
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-slate-950 md:text-4xl">
              {campaign.title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">{formatCampaignTimestamp(campaign.updated_at)}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {view.statusLabel}
            </span>
            <Link
              href={onboardingPath}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
            >
              <PencilLine className="size-4" />
              Edit campaign brief
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white/90 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
        <div className="grid gap-6 border-b border-slate-200 pb-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex items-start gap-4">
            <div className="flex size-18 shrink-0 items-center justify-center rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.32),transparent_42%),linear-gradient(135deg,#e0f2fe,#f8fafc)] text-xl font-semibold text-slate-900">
              {campaign.title
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif text-3xl text-slate-950">{view.brand.companyName}</h3>
              <p className="mt-2 text-lg text-slate-600">{view.productType}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Instagram className="size-4" />
                  {view.brand.instagram}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Music4 className="size-4" />
                  {view.brand.tiktok}
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Deliverables
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {campaign.unique_posts ?? "TBD"}
              </p>
              <p className="mt-1 text-sm text-slate-600">posts planned</p>
            </div>
            <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Creator target
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {campaign.minimum_follower_count ? `${campaign.minimum_follower_count}+` : "Open"}
              </p>
              <p className="mt-1 text-sm text-slate-600">followers preferred</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 py-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <section>
              <h4 className="font-serif text-2xl text-slate-950">About this campaign</h4>
              <p className="mt-3 text-base leading-8 text-slate-600">{view.summary}</p>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h4 className="font-serif text-2xl text-slate-950">Deliverables</h4>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {view.deliverables.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Sparkles className="mt-1 size-4 shrink-0 text-teal-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h4 className="font-serif text-2xl text-slate-950">Platforms</h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {view.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h4 className="font-serif text-2xl text-slate-950">Content inspiration</h4>
              <div className="mt-4 space-y-3">
                {view.inspirationLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
                  >
                    <Globe2 className="size-4" />
                    {link}
                  </a>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
              <h4 className="font-serif text-2xl text-slate-950">Creator profile</h4>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Creator count
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{view.targeting.creators}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Gender
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{view.targeting.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{view.targeting.location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Age
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{view.targeting.age}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ethnicity
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{view.targeting.ethnicity}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Niches
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {view.targeting.niches.map((niche) => (
                      <span
                        key={niche}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
              <h4 className="font-serif text-2xl text-slate-950">Brand details</h4>
              <dl className="mt-5 space-y-4 text-sm text-slate-700">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Company
                  </dt>
                  <dd className="mt-2">{view.brand.companyName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Website
                  </dt>
                  <dd className="mt-2">{view.brand.website}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Status
                  </dt>
                  <dd className="mt-2">{view.statusLabel}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
