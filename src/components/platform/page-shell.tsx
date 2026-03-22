import type { ReactNode } from "react";

type PlatformPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  profileLabel: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PlatformPageShell({
  eyebrow,
  title,
  description,
  profileLabel,
  actions,
  children,
}: PlatformPageShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,#f8fafc,#eef6ff)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {description}
              </p>
            </div>
            <div className="space-y-2 text-sm text-slate-500">
              <p className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700">
                {profileLabel}
              </p>
              {actions}
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
