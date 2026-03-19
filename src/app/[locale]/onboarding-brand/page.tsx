import { PageLocaleChrome } from "@/components/landing/page-locale-chrome";
import { BrandOnboardingShell } from "@/components/onboarding/brand-onboarding-shell";
import { SiteFooter } from "@/components/landing/site-footer";
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
    content.getStarted.brand.card.fields?.find((field) => field.type === "select")
      ?.options ?? [];
  const companyName = getFirstValue(query.companyName);
  const productType = getFirstValue(query.productType);

  return (
    <div className="min-h-screen font-sans text-slate-900">
      <PageLocaleChrome
        brand={content.brand}
        locale={locale as AppLocale}
        localeSwitcher={content.localeSwitcher}
        path="/onboarding-brand"
        searchParams={{
          ...(companyName ? { companyName } : {}),
          ...(productType ? { productType } : {}),
        }}
      />
      <main>
        <BrandOnboardingShell
          initialCompanyName={companyName}
          initialProductType={productType}
          productTypeOptions={productTypeOptions}
          locale={locale as AppLocale}
        />
      </main>
      <SiteFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}
