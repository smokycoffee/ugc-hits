import { NavbarMenu } from "@/components/ui/navbar-menu";
import type { LandingContent, LandingLink } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type SiteHeaderProps = {
  brand: string;
  nav: LandingLink[];
  cta: LandingLink;
  locale: AppLocale;
  localeSwitcher: LandingContent["localeSwitcher"];
};

export function SiteHeader({
  brand,
  nav,
  cta,
  locale,
  localeSwitcher,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <NavbarMenu
        brand={brand}
        links={nav}
        cta={cta}
        locale={locale}
        localeSwitcher={localeSwitcher}
      />
    </header>
  );
}
