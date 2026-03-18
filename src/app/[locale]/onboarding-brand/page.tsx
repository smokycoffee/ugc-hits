import { BrandOnboardingShell } from "@/components/onboarding/brand-onboarding-shell";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getLandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    companyName?: string | string[];
    productType?: string | string[];
  }>;
};

function getFirstValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LocalizedOnboardingBrandPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const content = await getLandingContent(locale as AppLocale);
  const productTypeOptions =
    content.getStarted.brand.card.fields?.find(
      (field) => field.label === "Product type",
    )?.options ?? [];

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
        <BrandOnboardingShell
          initialCompanyName={getFirstValue(query.companyName)}
          initialProductType={getFirstValue(query.productType)}
          productTypeOptions={productTypeOptions}
        />
      </main>
      <SiteFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}
