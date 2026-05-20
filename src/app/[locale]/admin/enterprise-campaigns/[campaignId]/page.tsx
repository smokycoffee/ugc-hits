import Link from "next/link";
import { notFound } from "next/navigation";

import type { AppLocale } from "@/i18n/routing";
import {
  addEnterpriseCreatorAction,
  approveEnterpriseStepAction,
  createEnterpriseOfferAction,
  prepareEnterprisePayoutAction,
  reviewEnterpriseDeliverableAction,
  ingestEnterpriseKnowledgeAction,
  runEnterpriseCampaignDirectorAction,
  saveEnterpriseBriefAction,
  saveEnterpriseCampaignPlanAction,
} from "@/lib/platform/actions";
import {
  approvalSnapshot,
  formatGbp,
  getAdminEnterpriseCampaignDetail,
  getEnterpriseNextAction,
  getJsonString,
  getStatusLabel,
} from "@/lib/platform/enterprise-workflow";
import { getLocalizedPath } from "@/lib/platform/utils";

type Props = {
  params: Promise<{ locale: string; campaignId: string }>;
  searchParams: Promise<{ error?: string; approved?: string; updated?: string }>;
};

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ApprovalButton({
  locale,
  enterpriseCampaignId,
  approvalType,
  label,
  snapshot,
}: {
  locale: string;
  enterpriseCampaignId: string;
  approvalType: string;
  label: string;
  snapshot: unknown;
}) {
  return (
    <form action={approveEnterpriseStepAction}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="enterpriseCampaignId" value={enterpriseCampaignId} />
      <input type="hidden" name="approvalType" value={approvalType} />
      <input type="hidden" name="snapshotJson" value={approvalSnapshot(snapshot)} />
      <button
        type="submit"
        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminEnterpriseCampaignDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, campaignId } = await params;
  const pageState = await searchParams;
  const data = await getAdminEnterpriseCampaignDetail(locale as AppLocale, campaignId);

  if (!data) {
    notFound();
  }

  const campaign = data.enterpriseCampaign;
  const campaignTitle = campaign.campaigns?.title ?? "Enterprise campaign";
  const campaignCreators = campaign.enterprise_campaign_creators ?? [];
  const offerEligibleCreators = campaignCreators.filter((creator) =>
    ["shortlisted", "offered", "accepted", "change_requested"].includes(creator.status),
  );
  const offers = campaign.creator_offers ?? [];
  const deliverables = campaign.campaign_deliverables ?? [];
  const payouts = campaign.creator_payouts ?? [];
  const approvals = campaign.admin_approvals ?? [];
  const agentTasks = campaign.campaign_agent_tasks ?? [];
  const agentRuns = campaign.campaign_agent_runs ?? [];
  const acceptedOffers = offers.filter((offer) => offer.status === "accepted");
  const approvedDeliverables = deliverables.filter(
    (deliverable) => deliverable.status === "approved",
  );
  const campaignPlanSummary = getJsonString(campaign.approved_campaign_plan, "summary");
  const briefTitle = getJsonString(campaign.approved_brief, "title", campaignTitle);
  const briefBody = getJsonString(
    campaign.approved_brief,
    "body",
    campaign.requirements ?? "",
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
      <main className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[1.6rem] border border-slate-200 bg-white p-6">
          <Link
            href={getLocalizedPath(locale as AppLocale, "/admin/enterprise-campaigns")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to enterprise campaigns
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">
                {campaign.campaigns?.brands?.company_name ?? "Enterprise"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {campaignTitle}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {getStatusLabel(campaign.status)} · {campaign.target_creator_count} creators · {campaign.videos_per_creator_min}-{campaign.videos_per_creator_max} videos per creator
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                Next: {getEnterpriseNextAction(campaign.status)}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              {getStatusLabel(campaign.status)}
            </span>
          </div>
          {pageState.error ? (
            <p className="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {decodeURIComponent(pageState.error)}
            </p>
          ) : null}
          {pageState.approved || pageState.updated ? (
            <p className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Workflow updated.
            </p>
          ) : null}
        </header>

        <section className="grid gap-3 md:grid-cols-5">
          {[
            ["Total budget", campaign.total_budget_amount],
            ["Management fee", campaign.management_fee_amount],
            ["Creator pool", campaign.creator_budget_amount],
            ["Committed", campaign.planned_total_creator_commitment],
            ["Buffer", campaign.remaining_creator_budget_amount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{formatGbp(value)}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel eyebrow="Agents" title="RAG and Campaign Director">
            <div className="space-y-4">
              <form action={ingestEnterpriseKnowledgeAction} className="space-y-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
                <textarea
                  name="brandGuidelines"
                  placeholder="Optional brand guidelines to add to knowledge base"
                  className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
                />
                <textarea
                  name="offerTemplate"
                  placeholder="Optional offer template"
                  className="min-h-16 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
                />
                <textarea
                  name="revisionQualityRules"
                  placeholder="Optional revision and quality rules"
                  className="min-h-16 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
                />
                <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                  Ingest knowledge
                </button>
              </form>
              <form action={runEnterpriseCampaignDirectorAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
                <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  Run Campaign Director
                </button>
              </form>
              <div className="rounded-[1rem] bg-slate-50 p-3 text-sm text-slate-600">
                Agent outputs are recommendations only. Offers, brief release, deliverables, payouts, and brand updates still require explicit admin approvals.
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Agent output" title="Inspectable recommendations">
            <div className="space-y-3">
              {agentRuns.length === 0 ? (
                <p className="text-sm text-slate-500">No agent runs yet.</p>
              ) : (
                agentRuns.map((run) => (
                  <div key={run.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                    {getStatusLabel(run.run_type)} · {run.status} · {run.dry_run ? "Dry run" : run.model ?? "Model"}
                    {run.error_message ? (
                      <p className="mt-2 text-rose-700">{run.error_message}</p>
                    ) : null}
                  </div>
                ))
              )}
              {agentTasks.map((task) => (
                <details key={task.id} className="rounded-[1rem] border border-slate-200 bg-white p-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-slate-950">
                    {getStatusLabel(task.task_type)} · {task.status} · confidence {task.confidence ?? "n/a"}
                  </summary>
                  {task.risk_flags?.length ? (
                    <p className="mt-3 text-amber-700">Risks: {task.risk_flags.join(", ")}</p>
                  ) : null}
                  <pre className="mt-3 max-h-64 overflow-auto rounded-[0.8rem] bg-slate-950 p-3 text-xs text-slate-100">
                    {JSON.stringify(
                      {
                        output: task.output_json,
                        retrievedContext: task.retrieved_context_json,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Plan" title="Campaign plan">
            <form action={saveEnterpriseCampaignPlanAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
              <textarea
                name="planSummary"
                defaultValue={campaignPlanSummary}
                placeholder="Manual plan summary"
                className="min-h-24 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <textarea
                name="successCriteria"
                placeholder="Success criteria and operational notes"
                className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                  Save plan
                </button>
              </div>
            </form>
            <div className="mt-3">
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_campaign_plan"
                label="Approve plan"
                snapshot={campaign.approved_campaign_plan}
              />
            </div>
          </Panel>

          <Panel eyebrow="Creators" title="Creator shortlist">
            <form action={addEnterpriseCreatorAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
              <select
                name="creatorId"
                required
                className="h-11 rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              >
                <option value="">Add active creator</option>
                {data.availableCreators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.display_name ?? creator.email}
                  </option>
                ))}
              </select>
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                Add
              </button>
              <input
                name="reason"
                placeholder="Reason for shortlist"
                className="h-11 rounded-[0.9rem] border border-slate-300 px-3 text-sm md:col-span-2"
              />
            </form>
            <div className="mt-4 space-y-3">
              {campaignCreators.length === 0 ? (
                <p className="text-sm text-slate-500">No creators shortlisted yet.</p>
              ) : (
                campaignCreators.map((creator) => (
                  <div key={creator.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-950">
                        {creator.creators?.display_name ?? creator.creators?.email ?? "Creator"}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {creator.status}
                      </span>
                    </div>
                    {creator.reasons?.[0] ? (
                      <p className="mt-2 text-slate-600">{creator.reasons[0]}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              {campaign.status !== "shortlist_pending_approval" ? (
                <p className="mb-3 text-sm text-amber-700">
                  Save and approve the campaign plan first. Once the plan is approved, proposed creators can be approved for the shortlist.
                </p>
              ) : null}
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_creator_shortlist"
                label="Approve shortlist"
                snapshot={campaignCreators}
              />
            </div>
          </Panel>

          <Panel eyebrow="Offers" title="Offer drafting and approval">
            <form action={createEnterpriseOfferAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
              <select
                name="creatorId"
                required
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              >
                <option value="">Select shortlisted creator</option>
                {offerEligibleCreators.map((creator) => (
                  <option key={creator.creator_id} value={creator.creator_id}>
                    {creator.creators?.display_name ?? creator.creators?.email}
                  </option>
                ))}
              </select>
              {offerEligibleCreators.length === 0 ? (
                <p className="text-sm text-amber-700">
                  Approve the creator shortlist before drafting offers. Proposed creators cannot receive offers yet.
                </p>
              ) : null}
              <input
                name="offerAmount"
                type="number"
                min="0"
                defaultValue={String(campaign.planned_offer_amount)}
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              />
              <textarea
                name="termsSummary"
                placeholder="Terms summary"
                className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <textarea
                name="usageTermsSummary"
                placeholder="Usage terms summary"
                className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <textarea
                name="deadlineSummary"
                placeholder="Deadline summary"
                className="min-h-16 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <textarea
                name="deliverablesText"
                defaultValue={`${campaign.videos_per_creator_min}-${campaign.videos_per_creator_max} videos over one month`}
                className="min-h-20 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                Draft offer
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      {offer.creators?.display_name ?? offer.creators?.email ?? "Creator"}
                    </span>
                    <span>{formatGbp(offer.offer_amount)} · {offer.status}</span>
                  </div>
                  {offer.response_note ? (
                    <p className="mt-2 text-slate-600">{offer.response_note}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_offer_batch"
                label="Approve and send offers"
                snapshot={offers}
              />
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_final_roster"
                label="Approve final roster"
                snapshot={acceptedOffers}
              />
            </div>
          </Panel>

          <Panel eyebrow="Brief" title="Brief release">
            <form action={saveEnterpriseBriefAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
              <input
                name="briefTitle"
                defaultValue={briefTitle}
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 px-3 text-sm"
              />
              <textarea
                name="briefBody"
                defaultValue={briefBody}
                placeholder="Approved campaign brief for accepted creators"
                className="min-h-36 w-full rounded-[0.9rem] border border-slate-300 px-3 py-3 text-sm"
              />
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                  Save brief
                </button>
              </div>
            </form>
            <div className="mt-3">
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_brief_release"
                label="Approve brief release"
                snapshot={campaign.approved_brief}
              />
            </div>
          </Panel>

          <Panel eyebrow="Deliverables" title="Review submissions">
            <div className="space-y-3">
              {deliverables.length === 0 ? (
                <p className="text-sm text-slate-500">No deliverables submitted yet.</p>
              ) : (
                deliverables.map((deliverable) => (
                  <form
                    key={deliverable.id}
                    action={reviewEnterpriseDeliverableAction}
                    className="rounded-[1rem] bg-slate-50 p-3 text-sm"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
                    <input type="hidden" name="deliverableId" value={deliverable.id} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={deliverable.submitted_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                      >
                        {deliverable.title}
                      </a>
                      <span>{deliverable.status}</span>
                    </div>
                    <textarea
                      name="reviewNotes"
                      placeholder="Review notes"
                      className="mt-3 min-h-16 w-full rounded-[0.8rem] border border-slate-300 px-3 py-2"
                    />
                    <textarea
                      name="revisionRequest"
                      placeholder="Revision request if needed"
                      className="mt-3 min-h-16 w-full rounded-[0.8rem] border border-slate-300 px-3 py-2"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        name="status"
                        value="approved"
                        className="rounded-full bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        name="status"
                        value="needs_revision"
                        className="rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Needs revision
                      </button>
                    </div>
                  </form>
                ))
              )}
            </div>
            <div className="mt-4">
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_deliverable_review"
                label="Approve deliverable review batch"
                snapshot={approvedDeliverables}
              />
            </div>
          </Panel>

          <Panel eyebrow="Payouts" title="Manual payout preparation">
            <div className="space-y-3">
              {acceptedOffers.map((offer) => (
                <form
                  key={offer.id}
                  action={prepareEnterprisePayoutAction}
                  className="grid gap-3 rounded-[1rem] bg-slate-50 p-3 text-sm md:grid-cols-[1fr_8rem_auto]"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="enterpriseCampaignId" value={campaign.id} />
                  <input type="hidden" name="offerId" value={offer.id} />
                  <div>
                    <p className="font-semibold">
                      {offer.creators?.display_name ?? offer.creators?.email ?? "Creator"}
                    </p>
                    <p className="mt-1 text-slate-500">Accepted offer</p>
                  </div>
                  <input
                    name="payoutAmount"
                    type="number"
                    min="0"
                    defaultValue={String(offer.offer_amount)}
                    className="h-10 rounded-[0.8rem] border border-slate-300 px-3"
                  />
                  <button className="rounded-full border border-slate-300 px-4 py-2 font-semibold">
                    Prepare
                  </button>
                </form>
              ))}
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                  {payout.creators?.display_name ?? payout.creators?.email ?? "Creator"} · {formatGbp(payout.amount)} · {payout.status}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_payout_batch"
                label="Approve payout batch"
                snapshot={payouts}
              />
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="mark_payouts_paid"
                label="Mark payouts paid"
                snapshot={payouts}
              />
              <ApprovalButton
                locale={locale}
                enterpriseCampaignId={campaign.id}
                approvalType="approve_brand_update"
                label="Approve final brand update"
                snapshot={{ campaignId: campaign.id, payouts }}
              />
            </div>
          </Panel>
        </div>

        <Panel eyebrow="Activity" title="Approval history">
          {approvals.length === 0 ? (
            <p className="text-sm text-slate-500">No approvals yet.</p>
          ) : (
            <div className="space-y-2">
              {approvals.map((approval) => (
                <div key={approval.id} className="rounded-[1rem] bg-slate-50 p-3 text-sm">
                  {getStatusLabel(approval.approval_type)} · {approval.status} · {new Date(approval.decided_at).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </main>
    </div>
  );
}
