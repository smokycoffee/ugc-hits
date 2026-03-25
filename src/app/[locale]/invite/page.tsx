import type { AppLocale } from "@/i18n/routing";
import { sendCreatorInviteLink } from "@/lib/platform/actions";
import { PlatformPageShell } from "@/components/platform/page-shell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; sent?: string }>;
};

export default async function InvitePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, sent } = await searchParams;

  return (
    <PlatformPageShell
      eyebrow="Creator Invite"
      title="Activate your creator account with your invite code."
      description="Creators do not self-register. Enter the email you were approved with and the invite code from your UGC Hits invite email."
      profileLabel={`Locale: ${(locale as AppLocale).toUpperCase()}`}
    >
      <div className="max-w-2xl rounded-[1.6rem] border border-slate-200 bg-white p-6">
        <form action={sendCreatorInviteLink} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-950">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="creator@email.com"
              className="h-12 w-full rounded-[1rem] border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-950">
              Invite code
            </label>
            <input
              name="inviteCode"
              type="text"
              required
              placeholder="UGCHITS2026"
              className="h-12 w-full rounded-[1rem] border border-slate-300 bg-white px-4 text-base uppercase tracking-[0.18em] text-slate-950 outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-12 w-full rounded-[1rem] bg-slate-950 text-sm font-semibold text-white"
          >
            Send activation link
          </button>
        </form>
        {sent ? (
          <p className="mt-4 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Activation link sent. Check your inbox.
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
      </div>
    </PlatformPageShell>
  );
}
