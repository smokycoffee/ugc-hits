import type { LandingContent } from "@/lib/get-landing-content";

type MatchingSectionProps = {
  matching: LandingContent["process"]["matching"];
};

export function MatchingSection({ matching }: MatchingSectionProps) {

  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(236,252,250,0.72),rgba(255,255,255,0.94))] p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-12">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              {matching.eyebrow}
            </p>
            <h3 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {matching.title}
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              {matching.description}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
            <div className="relative grid gap-5 md:grid-cols-2">
              {matching.tags.map((tag, index) => (
                <article
                  key={tag}
                  className={`rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                    index === 1 ? "md:translate-y-8" : ""
                  }`}
                >
                  <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {matching.signalLabel}
                  </div>
                  <div className="text-lg font-semibold text-slate-950">{tag}</div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6,#38bdf8)]"
                      style={{ width: `${88 - index * 9}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
