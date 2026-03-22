"use client";

import { BellRing, Mail, TriangleAlert } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type NavigationTabItem = {
  value: "account" | "notifications" | "danger";
  label: string;
  tone?: "default" | "danger";
};

type TabsInCellForNavigationProps = {
  items: NavigationTabItem[];
  className?: string;
};

export function TabsInCellForNavigation({
  items,
  className,
}: TabsInCellForNavigationProps) {
  const icons = {
    account: Mail,
    notifications: BellRing,
    danger: TriangleAlert,
  } as const;

  return (
    <ScrollArea className={className}>
      <TabsList className="mb-3 h-auto min-w-full justify-start gap-0 rounded-none border-b border-slate-200/80 bg-transparent p-0 text-slate-500 shadow-none">
        {items.map((item) => {
          const Icon = icons[item.value];

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "relative min-w-fit overflow-hidden rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-base font-medium text-slate-500 shadow-none ring-0 first:mr-8 last:mr-0 hover:text-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none sm:px-4 sm:text-[1.05rem]",
                item.tone === "danger" &&
                  "text-slate-500 data-[state=active]:border-red-500 data-[state=active]:text-red-600",
                item.tone !== "danger" &&
                  "data-[state=active]:border-sky-800 data-[state=active]:text-sky-900",
              )}
            >
              {Icon ? (
                <Icon
                  className="mr-2 inline-flex size-4 -translate-y-px opacity-70"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              ) : null}
              {item.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
