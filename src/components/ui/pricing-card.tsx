import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type PricingCardProps = {
  popularLabel?: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export function PricingCard({
  popularLabel = "Most popular",
  name,
  price,
  cadence,
  description,
  features,
  cta,
  featured = false,
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm",
        featured &&
          "border-teal-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(235,250,248,0.96))]",
      )}
    >
      {featured ? (
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700">
          <Sparkles className="size-3.5" />
          {popularLabel}
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {name}
          </p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">
              {price}
            </span>
            <span className="pb-1 text-sm text-slate-500">{cadence}</span>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <ul className="mt-8 space-y-3 text-sm text-slate-700">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-1 size-2 rounded-full bg-teal-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <button
          type="button"
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
            featured
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "bg-transparent text-slate-900 hover:bg-slate-100",
          )}
        >
          {cta}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  );
}
