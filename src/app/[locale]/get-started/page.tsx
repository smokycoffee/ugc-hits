import { GetStartedShell } from "@/components/landing/get-started-shell";
import { PageLocaleChrome } from "@/components/landing/page-locale-chrome";
import { SiteFooter } from "@/components/landing/site-footer";
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
      <PageLocaleChrome
        brand={content.brand}
        locale={locale as AppLocale}
        localeSwitcher={content.localeSwitcher}
        path="/get-started"
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
