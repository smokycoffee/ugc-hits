import Link from "next/link";

import type { AppLocale } from "@/i18n/routing";
import { NotificationFeed } from "@/components/platform/notification-feed";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { RealtimeSync } from "@/components/platform/realtime-sync";
import {
  acceptApplicationAction,
  rejectApplicationAction,
} from "@/lib/platform/actions";
import { buildBrandOnboardingPath } from "@/lib/platform/brand-onboarding";
import {
  getBrandDashboard,
  type BrandApplicationSummary,
  type CampaignSummary,
  type NotificationSummary,
} from "@/lib/platform/data";

type Props = {
  params: Promise<{ locale: string }>;
};

function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return `$${parsed.toLocaleString("en-US")}`;
}

function getCampaignTypeLabel(campaignType?: string | null) {
  switch (campaignType) {
    case "ugc-program":
      return "UGC Program";
    case "paid-ads":
      return "Paid Ads Campaign";
    case "influencer-campaign":
      return "Influencer Campaign";
    default:
      return "Campaign";
  }
}

export default async function BrandDashboardPage({ params }: Props) {
  const { locale } = await params;
  const data = await getBrandDashboard(locale as AppLocale);
  const onboardingPath = buildBrandOnboardingPath(locale as AppLocale, {
    companyName: data.brand?.company_name,
    productType: data.brand?.product_type,
  });

  return (
    <PlatformPageShell
      eyebrow="Brand Dashboard"
      title="Run campaigns, review applicants, and stay on top of messages."
      description="This dashboard is wired for realtime notifications, application decisions, and transactional email fan-out."
      profileLabel={data.profile.email}
      actions={
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Sign out
          </button>
        </form>
      }
    >
      <RealtimeSync profileId={data.profile.id} />
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
            {data.primaryCampaign ? (
              <div className="bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_34%),linear-gradient(180deg,#f8fafc,#eef8ff)] p-5">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
                        Primary campaign
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                        {data.primaryCampaign.title}
                      </h2>
                      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                        {data.primaryCampaign.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                        {getCampaignTypeLabel(data.primaryCampaign.campaign_type)}
                      </span>
                      <span className="rounded-full border border-white/80 bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                        {data.primaryCampaign.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-white/85 bg-white/82 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Budget
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {formatMoney(data.primaryCampaign.budget_min)} to{" "}
                        {formatMoney(data.primaryCampaign.budget_max)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Base pay per creator deliverable</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/85 bg-white/82 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Creator slots
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {data.primaryCampaign.creator_slots ?? 0}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {data.primaryCampaign.unique_posts ?? 0} unique posts per creator
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/85 bg-white/82 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Channels
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {data.primaryCampaign.posting_platforms?.length
                          ? data.primaryCampaign.posting_platforms.join(", ")
                          : "Direct response"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Product type: {data.primaryCampaign.product_type}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.2rem] border border-slate-200 bg-white/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Targeting
                      </p>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-slate-500">Niches</dt>
                          <dd className="mt-1 text-sm leading-6 text-slate-700">
                            {data.primaryCampaign.creator_niches?.length
                              ? data.primaryCampaign.creator_niches.join(", ")
                              : "Broad"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">Location</dt>
                          <dd className="mt-1 text-sm leading-6 text-slate-700">
                            {data.primaryCampaign.creator_location || "Open"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">Minimum followers</dt>
                          <dd className="mt-1 text-sm leading-6 text-slate-700">
                            {data.primaryCampaign.minimum_follower_count || "Not required"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500">Paid usage</dt>
                          <dd className="mt-1 text-sm leading-6 text-slate-700">
                            {data.primaryCampaign.includes_paid_usage ? "Included" : "Not included"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-[1.2rem] border border-slate-200 bg-white/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Brand setup
                      </p>
                      <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                        <div>
                          <dt className="font-medium text-slate-500">Company</dt>
                          <dd>{data.brand?.company_name ?? "Brand account"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500">Website</dt>
                          <dd>{data.brand?.website ?? "Not added yet"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500">Contact</dt>
                          <dd>{data.brand?.contact_name ?? data.profile.email}</dd>
                        </div>
                      </dl>
                      <Link
                        href={onboardingPath}
                        className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-500 hover:text-slate-950"
                      >
                        Edit onboarding
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
                  Campaign onboarding required
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Finish your brand onboarding to open the dashboard.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Your applicants, notifications, and campaign tools are ready, but this account
                  still needs a saved campaign brief before the primary dashboard state can render.
                </p>
                <Link
                  href={onboardingPath}
                  className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Complete onboarding
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">Other campaigns</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {data.campaigns.length} active
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {data.campaigns.length === 0 ? (
                <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  No additional campaigns yet.
                </p>
              ) : (
                data.campaigns.map((campaign: CampaignSummary) => (
                  <article
                    key={campaign.id}
                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {campaign.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {campaign.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {campaign.status}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Applicants</h2>
            <div className="mt-5 space-y-3">
              {data.applications.length === 0 ? (
                <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  Creator applications will appear here.
                </p>
              ) : (
                data.applications.map((application: BrandApplicationSummary) => (
                  <article
                    key={application.id}
                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {application.creators?.display_name ?? application.creators?.email ?? "Creator"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Campaign: {application.campaigns?.title ?? "Untitled"}
                        </p>
                        {application.note ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {application.note}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          {application.status}
                        </div>
                        <div className="flex gap-2">
                          <form action={acceptApplicationAction}>
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="applicationId"
                              value={application.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                            >
                              Accept
                            </button>
                          </form>
                          <form action={rejectApplicationAction}>
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="applicationId"
                              value={application.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Inbox status
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {data.unreadCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              unread notifications synced with realtime updates and email jobs
            </p>
          </section>
          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Recent updates</h2>
            <div className="mt-5">
                <NotificationFeed
                  locale={locale as AppLocale}
                  notifications={data.notifications as NotificationSummary[]}
                />
            </div>
          </section>
        </aside>
      </div>
    </PlatformPageShell>
  );
}
