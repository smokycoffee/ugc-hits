"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

export function Accordion(
  props: AccordionPrimitive.Root.Props,
): React.ReactElement {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-2xl border border-border/80 bg-white/80 px-5 last:border-border/80",
        className,
      )}
      data-slot="accordion-item"
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 cursor-pointer items-start justify-between gap-4 py-5 text-left text-sm font-semibold text-slate-900 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/50 data-panel-open:text-primary",
          className,
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronDown className="mt-0.5 size-4 shrink-0 opacity-75 transition-transform duration-200 data-[panel-open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Panel
      className="h-(--accordion-panel-height) overflow-hidden text-sm text-muted-foreground transition-[height] duration-200 ease-in-out data-ending-style:h-0 data-starting-style:h-0"
      data-slot="accordion-panel"
      {...props}
    >
      <div className={cn("pb-5 pr-8 leading-7", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}
