import Link from "next/link";

import type { AppLocale } from "@/i18n/routing";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { createEnterpriseCampaignAction } from "@/lib/platform/actions";
import {
  formatGbp,
  getAdminEnterpriseCampaigns,
  getEnterpriseNextAction,
  getStatusLabel,
} from "@/lib/platform/enterprise-workflow";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
};

export default async function AdminEnterpriseCampaignsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const pageState = await searchParams;
  const data = await getAdminEnterpriseCampaigns(locale as AppLocale);

  return (
    <PlatformPageShell
      eyebrow="Admin"
      title="Enterprise campaigns"
      description="Create managed enterprise campaign workspaces, inspect budget math, and move each campaign through approval-gated operations."
      profileLabel={data.profile.email}
      actions={
        <Link
          href={getLocalizedPath(locale as AppLocale, "/admin/matches")}
          className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Manual matching
        </Link>
      }
    >
      <div className="space-y-6">
        {pageState.error ? (
          <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {decodeURIComponent(pageState.error)}
          </p>
        ) : null}

        <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Start enterprise workflow
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upgrade an existing campaign into a managed enterprise campaign. Defaults match the V1 example budget.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {data.campaigns.length} campaigns available
            </span>
          </div>

          <form action={createEnterpriseCampaignAction} className="mt-5 grid gap-4 lg:grid-cols-4">
            <input type="hidden" name="locale" value={locale} />
            <label className="space-y-2 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Campaign
              </span>
              <select
                name="campaignId"
                required
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">Select campaign</option>
                {data.campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title} · {campaign.brands?.company_name ?? "Brand"}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Budget
              </span>
              <input
                name="totalBudgetAmount"
                type="number"
                min="0"
                defaultValue="10000"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Fee %
              </span>
              <input
                name="managementFeeRatePercent"
                type="number"
                min="0"
                max="100"
                defaultValue="20"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Creators
              </span>
              <input
                name="targetCreatorCount"
                type="number"
                min="1"
                defaultValue="10"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Offer
              </span>
              <input
                name="plannedOfferAmount"
                type="number"
                min="0"
                defaultValue="600"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Min videos
              </span>
              <input
                name="videosPerCreatorMin"
                type="number"
                min="0"
                defaultValue="45"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Max videos
              </span>
              <input
                name="videosPerCreatorMax"
                type="number"
                min="0"
                defaultValue="60"
                className="h-11 w-full rounded-[0.8rem] border border-slate-300 px-3 text-sm"
              />
            </label>
            <label className="space-y-2 lg:col-span-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Requirements
              </span>
              <textarea
                name="requirements"
                placeholder="Campaign requirements, audience notes, usage terms, and quality rules."
                className="min-h-24 w-full rounded-[0.8rem] border border-slate-300 px-3 py-3 text-sm"
              />
            </label>
            <div className="lg:col-span-4">
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Create enterprise campaign
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {data.enterpriseCampaigns.length === 0 ? (
            <p className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-500">
              No enterprise campaigns yet.
            </p>
          ) : (
            data.enterpriseCampaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                      {campaign.campaigns?.brands?.company_name ?? "Enterprise"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {campaign.campaigns?.title ?? "Enterprise campaign"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {getStatusLabel(campaign.status)} · {campaign.target_creator_count} creators · {campaign.videos_per_creator_min}-{campaign.videos_per_creator_max} videos each
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      Next: {getEnterpriseNextAction(campaign.status)}
                    </p>
                  </div>
                  <Link
                    href={getLocalizedPath(
                      locale as AppLocale,
                      `/admin/enterprise-campaigns/${campaign.id}`,
                    )}
                    className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Open workflow
                  </Link>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget</p>
                    <p className="mt-2 text-lg font-semibold">{formatGbp(campaign.total_budget_amount)}</p>
                  </div>
                  <div className="rounded-[1rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fee</p>
                    <p className="mt-2 text-lg font-semibold">{formatGbp(campaign.management_fee_amount)}</p>
                  </div>
                  <div className="rounded-[1rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Creator pool</p>
                    <p className="mt-2 text-lg font-semibold">{formatGbp(campaign.creator_budget_amount)}</p>
                  </div>
                  <div className="rounded-[1rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Buffer</p>
                    <p className="mt-2 text-lg font-semibold">{formatGbp(campaign.remaining_creator_budget_amount)}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </PlatformPageShell>
  );
}
