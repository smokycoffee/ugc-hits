import { FaqSection } from "@/components/landing/faq-section";
import { FounderSection } from "@/components/landing/founder-section";
import { HeroSection } from "@/components/landing/hero-section";
import { MatchingSection } from "@/components/landing/matching-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProcessSection } from "@/components/landing/process-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { WhySection } from "@/components/landing/why-section";
import { getLandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  const content = await getLandingContent(locale as AppLocale);

  return (
    <div className="min-h-screen font-sans text-slate-900">
      <SiteHeader
        brand={content.brand}
        nav={content.nav}
        cta={content.hero.primaryCta}
        locale={locale as AppLocale}
        localeSwitcher={content.localeSwitcher}
      />
      <main>
        <HeroSection
          hero={content.hero}
          stats={content.stats}
          creatorCards={content.creatorCards}
          socialProof={content.socialProof}
          featureChips={content.featureChips}
          audienceRibbon={content.audienceRibbon}
        />
        <ProcessSection process={content.process} />
        <MatchingSection matching={content.process.matching} />
        <PricingSection pricing={content.pricing} />
        <WhySection features={content.features} />
        <FounderSection founder={content.founder} />
        <FaqSection faq={content.faq} />
      </main>
      <SiteFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}
