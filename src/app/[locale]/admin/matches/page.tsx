import type { AppLocale } from "@/i18n/routing";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { matchCampaignToCreatorAction } from "@/lib/platform/actions";
import {
  getAdminMatches,
  getAdminMatchesPageState,
  type AdminMatchCampaignOption,
  type AdminMatchCreatorOption,
} from "@/lib/platform/admin-matches";
import { requireRole } from "@/lib/platform/data";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    matched?: string;
    error?: string;
    campaignId?: string;
    creatorId?: string;
  }>;
};

function formatCampaignMeta(campaign: AdminMatchCampaignOption) {
  const parts = [
    campaign.brandName,
    campaign.productType,
    campaign.creatorSlots ? `${campaign.creatorSlots} slots` : null,
    campaign.createdAt
      ? new Date(campaign.createdAt).toLocaleDateString()
      : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

function formatCreatorMeta(creator: AdminMatchCreatorOption) {
  const parts = [creator.email, creator.status].filter(Boolean);
  return parts.join(" · ");
}

export default async function AdminMatchesPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const data = await getAdminMatches(locale as AppLocale, { requireRole });
  const state = getAdminMatchesPageState(await searchParams);
  const selectedCampaign =
    data.campaigns.find((campaign) => campaign.id === state.selectedCampaignId) ?? null;
  const selectedCreator =
    data.creators.find((creator) => creator.id === state.selectedCreatorId) ?? null;

  return (
    <PlatformPageShell
      eyebrow="Admin"
      title="Manual campaign matching"
      description="Pair one live campaign with one creator, trigger the existing match workflow, and leave the admin team on the same internal tool after submission."
      profileLabel={data.profile.email}
      actions={
        <div className="space-y-2">
          <a
            href={`/${locale}/admin/invites`}
            className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to invites
          </a>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Sign out
            </button>
          </form>
        </div>
      }
    >
      <div className="space-y-6">
        {state.success ? (
          <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Match saved. {selectedCampaign?.title ?? "Campaign"} is now available for{" "}
            {selectedCreator?.displayName ?? selectedCreator?.email ?? "the creator"} in the creator dashboard.
          </p>
        ) : null}
        {state.error ? (
          <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        ) : null}

        <form action={matchCampaignToCreatorAction} className="space-y-6">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Campaigns</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pick the campaign the creator should see under matched campaigns.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {data.campaigns.length} available
                </span>
              </div>

              <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {data.campaigns.length === 0 ? (
                  <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                    No campaigns are available to match yet.
                  </p>
                ) : (
                  data.campaigns.map((campaign, index) => {
                    const isChecked = state.selectedCampaignId
                      ? state.selectedCampaignId === campaign.id
                      : index === 0;

                    return (
                      <label
                        key={campaign.id}
                        className="flex cursor-pointer gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <input
                          type="radio"
                          name="campaignId"
                          value={campaign.id}
                          defaultChecked={isChecked}
                          required
                          className="mt-1 h-4 w-4 border-slate-300 text-slate-950"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-950">
                              {campaign.title}
                            </h3>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {campaign.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {formatCampaignMeta(campaign)}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Creators</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pick the creator account that should receive the campaign match.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {data.creators.length} available
                </span>
              </div>

              <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {data.creators.length === 0 ? (
                  <p className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                    No creators are available to match yet.
                  </p>
                ) : (
                  data.creators.map((creator, index) => {
                    const isChecked = state.selectedCreatorId
                      ? state.selectedCreatorId === creator.id
                      : index === 0;

                    return (
                      <label
                        key={creator.id}
                        className="flex cursor-pointer gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4"
                      >
                        <input
                          type="radio"
                          name="creatorId"
                          value={creator.id}
                          defaultChecked={isChecked}
                          required
                          className="mt-1 h-4 w-4 border-slate-300 text-slate-950"
                        />
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-950">
                            {creator.displayName ?? "Unnamed creator"}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            {formatCreatorMeta(creator)}
                          </p>
                          {creator.applicationNotes ? (
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                              {creator.applicationNotes}
                            </p>
                          ) : null}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Submit match</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This uses the existing `match_campaign_to_creator` RPC and keeps the invite flow unchanged.
                </p>
              </div>
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Match selected campaign
              </button>
            </div>
          </section>
        </form>
      </div>
    </PlatformPageShell>
  );
}
