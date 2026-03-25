type Props = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/8 p-8 text-white backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
          Authentication Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          We could not complete the sign-in flow.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Check your link, try again, or return to the platform entry page.
        </p>
        {reason ? (
          <p className="mt-4 rounded-[1rem] bg-white/10 px-4 py-3 text-sm leading-6 text-slate-200">
            Reason: {decodeURIComponent(reason)}
          </p>
        ) : null}
      </div>
    </main>
  );
}
