import { Check, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";
import type { LandingContent } from "@/lib/get-landing-content";

type ProcessSectionProps = {
  process: LandingContent["process"];
};

export function ProcessSection({ process }: ProcessSectionProps) {
  const { intro, steps } = process;

  return (
    <section id={intro.id} className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl space-y-14">
        <SectionHeading
          eyebrow={intro.eyebrow}
          title={intro.title}
          description={intro.description}
          align="center"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#14b8a6,#38bdf8,#f59e0b)] opacity-70" />
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                  {step.step}
                </span>
                <div className="rounded-full border border-teal-200 bg-teal-50 p-2 text-teal-700">
                  {index === 0 ? (
                    <Sparkles className="size-4" />
                  ) : (
                    <span className="text-sm font-semibold">0{index + 1}</span>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
              <ul className="mt-6 space-y-3">
                {step.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <Check className="mt-0.5 size-4 text-teal-600" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
