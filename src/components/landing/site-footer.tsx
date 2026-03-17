import type { LandingContent } from "@/lib/get-landing-content";

type SiteFooterProps = {
  brand: string;
  footer: LandingContent["footer"];
};

export function SiteFooter({ brand, footer }: SiteFooterProps) {

  return (
    <footer className="px-4 pb-8 pt-12 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-slate-200/20 bg-slate-950 px-8 py-10 text-slate-200">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-300">
              {brand}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              {footer.note}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="transition-colors hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-5 text-xs text-slate-400">
          {footer.copyright || `© 2026 ${brand}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
