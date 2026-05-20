import Link from "next/link";

import type { AppLocale } from "@/i18n/routing";
import { PlatformPageShell } from "@/components/platform/page-shell";
import {
  formatGbp,
  getCreatorEnterpriseOffers,
  getStatusLabel,
} from "@/lib/platform/enterprise-workflow";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CreatorEnterpriseOffersPage({ params }: Props) {
  const { locale } = await params;
  const data = await getCreatorEnterpriseOffers(locale as AppLocale);

  return (
    <PlatformPageShell
      eyebrow="Creator Dashboard"
      title="Enterprise offers"
      description="Review managed campaign offers, respond to terms, submit deliverable links, and track payout status."
      profileLabel={data.profile.email}
      actions={
        <Link
          href={getLocalizedPath(locale as AppLocale, "/dashboard/creator")}
          className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Dashboard
        </Link>
      }
    >
      <div className="space-y-4">
        {data.offers.length === 0 ? (
          <p className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-500">
            Enterprise offers assigned to your creator account will appear here.
          </p>
        ) : (
          data.offers.map((offer) => {
            const enterprise = offer.enterprise_campaigns;
            const campaign = enterprise?.campaigns;
            const payout = offer.creator_payouts?.[0];

            return (
              <article
                key={offer.id}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                      {campaign?.brands?.company_name ?? "Enterprise campaign"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {campaign?.title ?? "Enterprise offer"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatGbp(offer.offer_amount)} · {getStatusLabel(offer.status)}
                      {payout ? ` · Payout ${getStatusLabel(payout.status)}` : ""}
                    </p>
                  </div>
                  <Link
                    href={getLocalizedPath(
                      locale as AppLocale,
                      `/dashboard/creator/offers/${offer.id}`,
                    )}
                    className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Open offer
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </PlatformPageShell>
  );
}
