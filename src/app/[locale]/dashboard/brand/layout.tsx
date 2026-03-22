import type { ReactNode } from "react";

import type { AppLocale } from "@/i18n/routing";
import { BrandDashboardShell } from "@/components/platform/brand-dashboard-shell";
import { RealtimeSync } from "@/components/platform/realtime-sync";
import { getBrandDashboard } from "@/lib/platform/data";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BrandDashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const data = await getBrandDashboard(locale as AppLocale);

  return (
    <BrandDashboardShell
      locale={locale as AppLocale}
      brandName={data.brand?.company_name ?? "UGC Hits"}
      profileEmail={data.profile.email}
      unreadCount={data.unreadCount}
    >
      <RealtimeSync profileId={data.profile.id} />
      {children}
    </BrandDashboardShell>
  );
}
