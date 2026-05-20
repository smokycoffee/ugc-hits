import Link from "next/link";
import { notFound } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import {
  respondEnterpriseOfferAction,
  submitEnterpriseDeliverableAction,
} from "@/lib/platform/actions";
import {
  formatGbp,
  getCreatorEnterpriseOfferDetail,
  getJsonString,
  getStatusLabel,
} from "@/lib/platform/enterprise-workflow";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string; offerId: string }>;
  searchParams: Promise<{ error?: string; responded?: string; submitted?: string }>;
};

function getOfferDeliverables(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
}

export default async function CreatorEnterpriseOfferDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, offerId } = await params;
  const pageState = await searchParams;
  const data = await getCreatorEnterpriseOfferDetail(locale as AppLocale, offerId);

  if (!data.offer) {
    notFound();
  }

  const offer = data.offer;
  const enterprise = offer.enterprise_campaigns;
  const campaign = enterprise?.campaigns;
  const offerDeliverables = getOfferDeliverables(offer.deliverables);
  const deliverables = offer.campaign_deliverables ?? [];
  const payouts = offer.creator_payouts ?? [];
  const canRespond = offer.status === "sent";
  const canSubmit = offer.status === "accepted" && enterprise?.status === "brief_released";
  const briefTitle = getJsonString(
    enterprise?.approved_brief,
    "title",
    "Campaign brief",
  );
  const briefBody = getJsonString(enterprise?.approved_brief, "body");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <main className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[1.6rem] border border-slate-200 bg-white p-6">
          <Link
            href={getLocalizedPath(locale as AppLocale, "/dashboard/creator/offers")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to offers
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
            {campaign?.brands?.company_name ?? "Enterprise campaign"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {campaign?.title ?? "Enterprise offer"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {formatGbp(offer.offer_amount)} · {getStatusLabel(offer.status)}
          </p>
          {pageState.error ? (
            <p className="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {decodeURIComponent(pageState.error)}
            </p>
          ) : null}
          {pageState.responded || pageState.submitted ? (
            <p className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Offer workflow updated.
            </p>
          ) : null}
        </header>

        <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">Offer terms</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{offer.terms_summary}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {offer.deadline_summary || "To be confirmed"}
              </p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Usage</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {offer.usage_terms_summary || "Standard campaign usage"}
              </p>
            </div>
          </div>
          {offerDeliverables.length ? (
            <div className="mt-5 rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Requested deliverables
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {offerDeliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Amount</p>
              <p className="mt-2 text-lg font-semibold">{formatGbp(offer.offer_amount)}</p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Brief</p>
              <p className="mt-2 text-sm font-semibold">
                {enterprise?.status === "brief_released" ? "Released" : "Pending final roster"}
              </p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payout</p>
              <p className="mt-2 text-sm font-semibold">
                {payouts[0] ? getStatusLabel(payouts[0].status) : "Not prepared"}
              </p>
            </div>
          </div>
        </section>

        {canRespond ? (
          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Respond to offer</h2>
            <form action={respondEnterpriseOfferAction} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="offerId" value={offer.id} />
              <textarea
                name="responseNote"
                placeholder="Optional note for the admin team"
                className="min-h-24 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  name="response"
                  value="accepted"
                  className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Accept
                </button>
                <button
                  name="response"
                  value="change_requested"
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Request changes
                </button>
                <button
                  name="response"
                  value="declined"
                  className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Decline
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {enterprise?.status === "brief_released" ? (
          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">
              {briefTitle}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {briefBody}
            </p>
          </section>
        ) : null}

        <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">Deliverables</h2>
          {canSubmit ? (
            <form action={submitEnterpriseDeliverableAction} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="offerId" value={offer.id} />
              <input
                name="title"
                placeholder="Deliverable title"
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              />
              <input
                name="submittedUrl"
                type="url"
                required
                placeholder="https://..."
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              />
              <textarea
                name="submissionNote"
                placeholder="Optional submission note"
                className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Submit deliverable
              </button>
            </form>
          ) : null}
          <div className="mt-4 space-y-3">
            {deliverables.length === 0 ? (
              <p className="text-sm text-slate-500">No deliverables submitted yet.</p>
            ) : (
              deliverables.map((deliverable) => (
                <article key={deliverable.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={deliverable.submitted_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                    >
                      {deliverable.title}
                    </a>
                    <span>{getStatusLabel(deliverable.status)}</span>
                  </div>
                  {deliverable.revision_request ? (
                    <p className="mt-2 text-amber-700">{deliverable.revision_request}</p>
                  ) : null}
                  {deliverable.review_notes ? (
                    <p className="mt-2 text-slate-600">{deliverable.review_notes}</p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
