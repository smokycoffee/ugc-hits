import type { LandingContent } from "@/lib/get-landing-content";

type FounderSectionProps = {
  founder: LandingContent["founder"];
};

export function FounderSection({ founder }: FounderSectionProps) {

  return (
    <section className="px-4 py-20 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[2.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,255,0.96))] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(186,230,253,0.8),rgba(45,212,191,0.38))] text-6xl font-semibold text-slate-950 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
            JC
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-slate-950">
            {founder.name}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{founder.location}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {founder.socials.map((social) => (
              <span
                key={social}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {social}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
            {founder.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {founder.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
            {founder.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
