import { GetStartedShell } from "@/components/landing/get-started-shell";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getLandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedGetStartedPage({ params }: Props) {
  const { locale } = await params;
  const content = await getLandingContent(locale as AppLocale);

  return (
    <div className="min-h-screen font-sans text-slate-900">
      <SiteHeader
        brand={content.brand}
        nav={content.nav}
        cta={content.header.primaryCta}
        locale={locale as AppLocale}
        localeSwitcher={content.localeSwitcher}
      />
      <main>
        <GetStartedShell
          content={content.getStarted}
          locale={locale as AppLocale}
        />
      </main>
      <SiteFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}
