import type { AppLocale } from "@/i18n/routing";
import { NotificationFeed } from "@/components/platform/notification-feed";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { RealtimeSync } from "@/components/platform/realtime-sync";
import { applyToCampaignAction } from "@/lib/platform/actions";
import {
  getCreatorDashboard,
  type CreatorApplicationSummary,
  type CreatorMatchSummary,
  type NotificationSummary,
} from "@/lib/platform/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CreatorDashboardPage({ params }: Props) {
  const { locale } = await params;
  const data = await getCreatorDashboard(locale as AppLocale);

  return (
    <PlatformPageShell
      eyebrow="Creator Dashboard"
      title="Review matched campaigns and respond without leaving the platform."
      description="Matched opportunities, application state, message alerts, and inbox updates are all driven from the same event pipeline."
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
          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">Matched campaigns</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {data.matches.length} opportunities
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {data.matches.length === 0 ? (
                <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  New campaign matches will land here automatically.
                </p>
              ) : (
                data.matches.map((match: CreatorMatchSummary) => (
                  <article
                    key={match.id}
                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <h3 className="text-base font-semibold text-slate-950">
                      {match.campaigns?.title ?? "Matched campaign"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {match.campaigns?.description ?? "Campaign details will appear here."}
                    </p>
                    <form action={applyToCampaignAction} className="mt-4 space-y-3">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="campaignId" value={match.campaign_id} />
                      <textarea
                        name="note"
                        placeholder="Tell the brand why you are a fit."
                        className="min-h-24 w-full rounded-[0.9rem] border border-slate-300 bg-white px-4 py-3"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Apply to campaign
                      </button>
                    </form>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Application status</h2>
            <div className="mt-5 space-y-3">
              {data.applications.length === 0 ? (
                <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  Your applications will show up here.
                </p>
              ) : (
                data.applications.map((application: CreatorApplicationSummary) => (
                  <article
                    key={application.id}
                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {application.campaigns?.title ?? "Campaign"}
                        </h3>
                        {application.note ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {application.note}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {application.status}
                      </span>
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
              unread updates across matches, decisions, and messages
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
