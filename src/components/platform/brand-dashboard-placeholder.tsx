type BrandDashboardPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function BrandDashboardPlaceholder({
  eyebrow,
  title,
  description,
}: BrandDashboardPlaceholderProps) {
  return (
    <div className="space-y-6">
      <header className="rounded-[1.8rem] border border-white/80 bg-white/82 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </header>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white/88 p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="max-w-xl rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Coming next
          </p>
          <h3 className="mt-3 font-serif text-2xl text-slate-950">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This section is intentionally scaffolded and ready for the next UI pass. The route,
            layout, and page framing are in place so the final workflow can drop in without
            another navigation refactor.
          </p>
        </div>
      </section>
    </div>
  );
}
