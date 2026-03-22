import Link from "next/link";
import { Check, Dot } from "lucide-react";

import type { AppLocale } from "@/i18n/routing";
import { getBrandDashboard } from "@/lib/platform/data";
import {
  buildCampaignDetailView,
  collectBrandCampaigns,
  getCampaignStatusLabel,
} from "@/lib/platform/brand-dashboard";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

function formatCampaignTimestamp(value?: string | null) {
  if (!value) {
    return "Updated recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStepIcon(index: number) {
  if (index === 0) {
    return <Check className="size-4" />;
  }

  if (index === 1) {
    return <Dot className="size-6" />;
  }

  return <span className="text-sm font-semibold">{index + 1}</span>;
}

export default async function BrandCampaignsPage({ params }: Props) {
  const { locale } = await params;
  const data = await getBrandDashboard(locale as AppLocale);
  const campaigns = collectBrandCampaigns(data.primaryCampaign, data.campaigns);
  const steps = [
    {
      title: "Campaign saved",
      body: "Your UGC Hits brief is on file and ready to keep iterating.",
    },
    {
      title: "Campaign under review",
      body: "Our team is reviewing your campaign. We'll send you a email once it's approved.",
    },
    {
      title: "Pay listing to go live",
      body: "When approved, pay 399 PLN to go live to our creator network or until you get 50 applicants, whichever comes first.",
    },
    {
      title: "We promote your campaign to best-fit creators",
      body: "Your campaign will be included in our email and SMS blasts to creators. Campaigns typically get 25-100+ applicants in a 30 day period, depending on budget and target demographics.",
    },
    {
      title: "Review applicants and connect with creators you like",
      body: "Use our in-platform messaging to coordinate next steps with your picks - you own the relationship from there. We just facilitate the introduction!",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
          Campaigns
        </p>
        {/* <h2 className="mt-3 font-serif text-3xl tracking-tight text-slate-950 md:text-4xl">
          Run UGC Hits campaigns with a clearer workflow.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Keep briefs, creator targeting, and campaign status in one place. This view is
          designed to feel more operational while staying inside the current UGC Hits style.
        </p> */}
      </header>

      <section className="rounded-[1.8rem] border border-sky-200/90 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(232,244,255,0.94))] p-6 shadow-[0_14px_40px_rgba(56,189,248,0.08)]">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
            Next steps
          </p>
          <h3 className="font-serif text-2xl text-slate-950">What happens next at UGC Hits</h3>
        </div>
        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
                {getStepIcon(index)}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-950">{step.title}</p>
                <p className="mt-1 max-w-4xl text-sm leading-7 text-slate-600">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {/* <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-slate-950">Active campaigns</h3>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {campaigns.length} total
          </span>
        </div> */}

        {campaigns.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white/85 p-8">
            <p className="text-sm leading-7 text-slate-600">
              No campaigns are saved yet. Finish your onboarding brief to create the first UGC Hits
              campaign workspace.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {campaigns.map((campaign, index) => {
              const view = buildCampaignDetailView(campaign, data.brand);
              const detailHref = getLocalizedPath(
                locale as AppLocale,
                `/dashboard/brand/campaigns/${campaign.id}`,
              );
              const initials = campaign.title
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase();

              return (
                <article
                  key={campaign.id}
                  className="rounded-[1.8rem] border border-slate-200 bg-white/88 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.3rem] bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.32),transparent_42%),linear-gradient(135deg,#e0f2fe,#f8fafc)] text-lg font-semibold text-slate-900">
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            UGC Hits campaign
                          </p>
                          {index === 0 ? (
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-700">
                              Primary
                            </span>
                          ) : null}
                        </div>
                        <h4 className="mt-2 font-serif text-2xl leading-tight text-slate-950">
                          {campaign.title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-600">
                          {view.productType} · {formatCampaignTimestamp(campaign.updated_at)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                      {getCampaignStatusLabel(campaign.status)}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600">{view.summary}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Type
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{view.typeLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Deliverables
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        {view.deliverables[0]}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Targeting
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">
                        {view.targeting.creators}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {view.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      {view.targeting.location} · {view.targeting.age}
                    </p>
                    <Link
                      href={detailHref}
                      className="inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      View campaign
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
