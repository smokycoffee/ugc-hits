import type { AppLocale } from "@/i18n/routing";
import {
  bootstrapFirstAdminAction,
  createInviteAction,
  revokeInviteAction,
} from "@/lib/platform/actions";
import { getAdminInvites, type InviteSummary } from "@/lib/platform/data";
import { PlatformPageShell } from "@/components/platform/page-shell";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminInvitesPage({ params }: Props) {
  const { locale } = await params;
  const data = await getAdminInvites(locale as AppLocale);

  return (
    <PlatformPageShell
      eyebrow="Admin"
      title="Invite-only creator access"
      description="Approve creators off-platform, issue invite codes, and revoke pending access without changing the underlying schema."
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
      {!data.hasAdminAccess ? (
        <section className="max-w-2xl rounded-[1.6rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Claim first admin access
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This new project has no admin yet. Claim the first admin role with your current authenticated account.
          </p>
          <form action={bootstrapFirstAdminAction} className="mt-5">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Claim first admin
            </button>
          </form>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-semibold text-slate-950">Create invite</h2>
            <form action={createInviteAction} className="mt-5 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input
                name="email"
                type="email"
                required
                placeholder="creator@email.com"
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 bg-white px-4"
              />
              <textarea
                name="notes"
                placeholder="Notes from the Google Form review"
                className="min-h-28 w-full rounded-[0.9rem] border border-slate-300 bg-white px-4 py-3"
              />
              <input
                name="expiresInDays"
                type="number"
                min="1"
                defaultValue="14"
                className="h-11 w-full rounded-[0.9rem] border border-slate-300 bg-white px-4"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Issue invite
              </button>
            </form>
          </section>

          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Pending invites</h2>
            <div className="mt-5 space-y-3">
              {data.invites.length === 0 ? (
                <p className="rounded-[1.2rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  No invites yet.
                </p>
              ) : (
                data.invites.map((invite: InviteSummary) => (
                  <article
                    key={invite.id}
                    className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {invite.email}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                          {invite.status} · expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                        {invite.status === "pending" ? (
                          <p className="mt-2 font-mono text-xs tracking-[0.18em] text-slate-700">
                            Code: {invite.invite_code ?? "Unavailable"}
                          </p>
                        ) : null}
                      </div>
                      {invite.status === "pending" ? (
                        <form action={revokeInviteAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="inviteId" value={invite.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                          >
                            Revoke
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </PlatformPageShell>
  );
}
