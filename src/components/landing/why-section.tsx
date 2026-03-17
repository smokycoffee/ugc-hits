import { SectionHeading } from "@/components/landing/section-heading";
import type { LandingContent } from "@/lib/get-landing-content";
import { cn } from "@/lib/utils";

type WhySectionProps = {
  features: LandingContent["features"];
};

export function WhySection({ features }: WhySectionProps) {

  return (
    <section id={features.id} className="scroll-mt-8 px-4 py-20 md:scroll-mt-10 md:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={features.eyebrow}
          title={features.title}
          align="center"
        />

        <div className="mt-12 grid overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-3">
          {features.items.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className={cn(
                  "group relative border-slate-200/80 p-8 transition-colors duration-300 hover:bg-[linear-gradient(180deg,rgba(240,253,250,0.9),rgba(255,255,255,0.95))]",
                  index % 3 !== 2 && "xl:border-r",
                  index < 3 && "xl:border-b",
                  index % 2 === 0 && "md:border-r xl:border-r",
                  index < 4 && "md:border-b xl:border-b",
                )}
              >
                <div className="mb-5 inline-flex rounded-2xl border border-teal-100 bg-teal-50 p-3 text-teal-700 transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
