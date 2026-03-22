import type { AppLocale } from "@/i18n/routing";
import {
  sendBrandMagicLink,
  startGoogleBrandLogin,
} from "@/lib/platform/actions";
import { PlatformPageShell } from "@/components/platform/page-shell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    sent?: string;
    next?: string;
    companyName?: string;
    productType?: string;
  }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, sent, next, companyName, productType } = await searchParams;

  return (
    <PlatformPageShell
      eyebrow="Brand Access"
      title="Sign in to manage campaigns, applicants, and messages."
      description="Brands can use Google login or a passwordless email link. Creator activation happens through invite-only redemption."
      profileLabel={`Locale: ${(locale as AppLocale).toUpperCase()}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Brand magic link
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send a sign-in link to the email you use for your brand account.
          </p>
          <form action={sendBrandMagicLink} className="mt-5 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next ?? ""} />
            <input type="hidden" name="companyName" value={companyName ?? ""} />
            <input type="hidden" name="productType" value={productType ?? ""} />
            <input
              name="email"
              type="email"
              required
              placeholder="brand@company.com"
              className="h-12 w-full rounded-[1rem] border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none"
            />
            <button
              type="submit"
              className="h-12 w-full rounded-[1rem] bg-slate-950 text-sm font-semibold text-white"
            >
              Send magic link
            </button>
          </form>
        </section>

        <section className="rounded-[1.6rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Google login
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use Google for faster brand access if that is already your team login.
          </p>
          <form action={startGoogleBrandLogin} className="mt-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next ?? ""} />
            <input type="hidden" name="companyName" value={companyName ?? ""} />
            <input type="hidden" name="productType" value={productType ?? ""} />
            <button
              type="submit"
              className="h-12 w-full rounded-[1rem] border border-slate-300 bg-white text-sm font-semibold text-slate-950"
            >
              Continue with Google
            </button>
          </form>
          {sent ? (
            <p className="mt-4 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Magic link sent. Check your inbox.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {decodeURIComponent(error)}
            </p>
          ) : null}
        </section>
      </div>
    </PlatformPageShell>
  );
}
