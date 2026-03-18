import { ArrowRight, Sparkles } from "lucide-react";

import type { LandingContent } from "@/lib/get-landing-content";

function HeroCard({
  name,
  role,
  tag,
  detail,
  tone,
}: {
  name: string;
  role: string;
  tag: string;
  detail: string;
  tone: string;
}) {
  return (
    <article
      className={`rounded-[1.75rem] border border-white/70 ${tone} p-5 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{name}</p>
          <p className="mt-1 text-sm text-slate-600">{role}</p>
        </div>
        <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
          {tag}
        </span>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}

type HeroSectionProps = {
  hero: LandingContent["hero"];
  stats: LandingContent["stats"];
  creatorCards: LandingContent["creatorCards"];
  socialProof: LandingContent["socialProof"];
  featureChips: LandingContent["featureChips"];
  audienceRibbon: LandingContent["audienceRibbon"];
};

export function HeroSection({
  hero,
  stats,
  creatorCards,
  socialProof,
  featureChips,
  audienceRibbon,
}: HeroSectionProps) {
  const tones = [
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(238,250,248,0.95))]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,246,255,0.95))]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,237,0.95))]",
  ];
  const AudienceIcon = audienceRibbon.icon;

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 shadow-sm">
            <Sparkles className="size-3.5" />
            {hero.eyebrow}
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
              {hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {hero.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={hero.primaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-white"
            >
              {hero.secondaryCta.label}
              <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            {featureChips.map((chip) => (
              <span
                key={chip.label}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {chip.label}
              </span>
            ))}
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fffdf9] px-4 py-2 text-sm text-slate-700">
              <AudienceIcon className="size-4 text-teal-600" />
              {audienceRibbon.title}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              {socialProof.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-teal-200/35 blur-3xl" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative space-y-4">
            {creatorCards.map((card, index) => (
              <div
                key={card.name}
                className={
                  index === 1
                    ? "translate-x-0 md:translate-x-8"
                    : index === 2
                      ? "translate-x-0 md:translate-x-16"
                      : ""
                }
              >
                <HeroCard {...card} tone={tones[index] ?? tones[0]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
