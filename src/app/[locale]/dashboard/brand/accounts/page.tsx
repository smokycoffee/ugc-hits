import {
  BellRing,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsInCellForNavigation } from "@/components/ui/tabs-in-cell-for-navigation";
import { getBrandAccountSettingsSections } from "@/lib/platform/account-settings";
import { getBrandDashboard } from "@/lib/platform/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BrandAccountsPage({ params }: Props) {
  const { locale } = await params;
  const data = await getBrandDashboard(locale as AppLocale);
  const sections = getBrandAccountSettingsSections();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">
          Account
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Manage your account settings
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Review your signed-in account details, understand notification behavior,
            and prepare future account-management actions from one place.
          </p>
        </div>
      </section>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsInCellForNavigation items={sections} />

        <TabsContent value="account" className="mt-0 space-y-6">
          <Card className="overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="gap-2 px-6 py-6">
              <CardTitle className="text-[1.7rem] text-slate-950">Email address</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                This is the email address currently signed in to your brand account.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-slate-200/90" />
            <CardContent className="px-6 py-6">
              <div className="flex items-center gap-4 rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Mail className="size-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Signed in account
                  </p>
                  <p className="mt-1 truncate text-lg font-medium text-slate-950">
                    {data.profile.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="gap-2 px-6 py-6">
              <CardTitle className="text-[1.7rem] text-slate-950">Session</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                End your current dashboard session using the same sign-out action
                available in the sidebar.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-slate-200/90" />
            <CardContent className="px-6 py-6">
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-[1rem] border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="size-4" strokeWidth={2} aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <Card className="overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="gap-3 px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-sky-100 text-sky-900">
                  <BellRing className="size-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-[1.7rem] text-slate-950">
                    Email notifications
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-base leading-8 text-slate-600">
                    If you are subscribed, we will email you when you have new, unread
                    messages from creators. These notifications are included with your
                    subscription and cannot be turned off while your account is active.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-0">
          <Card className="overflow-hidden rounded-[1.65rem] border border-red-200 bg-white/90 shadow-[0_16px_40px_rgba(239,68,68,0.08)]">
            <CardHeader className="gap-3 px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <TriangleAlert className="size-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-[1.7rem] text-red-600">
                    Delete account
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-base leading-8 text-slate-600">
                    Permanently delete your account and all associated data.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-red-100" />
            <CardContent className="space-y-5 px-6 py-6">
              <div className="rounded-[1.25rem] border border-red-100 bg-red-50/70 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-red-500"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <p className="text-base leading-8 text-slate-700">
                    This will permanently delete your account, your campaign, and all
                    associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  disabled
                  className="h-12 rounded-[1rem] bg-red-600 px-5 text-base font-semibold text-white opacity-100 hover:bg-red-600 disabled:pointer-events-none disabled:opacity-100"
                >
                  <Trash2 className="size-4" strokeWidth={2} aria-hidden="true" />
                  Delete account
                </Button>
                <p className="text-sm leading-6 text-slate-500">
                  UI only for now. Account deletion is not wired until the full data
                  cleanup flow is defined.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
