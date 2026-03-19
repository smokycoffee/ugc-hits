"use client";

import { useState } from "react";
import {
  Gauge,
  Inbox,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { LandingContent } from "@/lib/get-landing-content";
import type { AppLocale } from "@/i18n/routing";

type AudienceKey = "brand" | "creator";

type GetStartedShellProps = {
  content: LandingContent["getStarted"];
  locale: AppLocale;
};

type BrandLeadState = {
  companyName: string;
  productType: string;
};

type BrandLeadErrors = Partial<Record<keyof BrandLeadState, string>>;

function getLocalizedPath(locale: AppLocale, path: string) {
  return `/${locale}${path}`;
}

function getBenefitIcon(icon: string) {
  switch (icon) {
    case "shield":
      return ShieldCheck;
    case "sliders":
      return SlidersHorizontal;
    case "gauge":
      return Gauge;
    case "rocket":
      return Rocket;
    case "users":
      return Users;
    case "inbox":
      return Inbox;
    default:
      return ShieldCheck;
  }
}

export function GetStartedShell({ content, locale }: GetStartedShellProps) {
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("brand");
  const [brandLead, setBrandLead] = useState<BrandLeadState>({
    companyName: "",
    productType: "",
  });
  const [brandErrors, setBrandErrors] = useState<BrandLeadErrors>({});
  const router = useRouter();
  const audience = content[activeAudience];
  const accentTone =
    activeAudience === "brand" ? "text-teal-700" : "text-sky-800";
  const cardTone =
    activeAudience === "brand"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,250,248,0.9))]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.9))]";
  const validationCopy =
    locale === "pl"
      ? {
          companyNameRequired: "Nazwa firmy jest wymagana.",
          productTypeRequired: "Typ produktu jest wymagany.",
        }
      : {
          companyNameRequired: "Company name is required.",
          productTypeRequired: "Product type is required.",
        };

  function updateBrandLead(field: keyof BrandLeadState, value: string) {
    setBrandLead((current) => ({ ...current, [field]: value }));
    setBrandErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handlePrimaryAction() {
    if (activeAudience !== "brand") {
      return;
    }

    const nextErrors: BrandLeadErrors = {};

    if (!brandLead.companyName.trim()) {
      nextErrors.companyName = validationCopy.companyNameRequired;
    }

    if (!brandLead.productType.trim()) {
      nextErrors.productType = validationCopy.productTypeRequired;
    }

    setBrandErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const params = new URLSearchParams({
      companyName: brandLead.companyName.trim(),
      productType: brandLead.productType.trim(),
    });

    router.push(
      `${getLocalizedPath(locale, "/onboarding-brand")}?${params.toString()}`,
    );
  }

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center">
          <div className="inline-flex w-full max-w-lg rounded-full border-[3px] border-slate-950 bg-slate-950 p-1 shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
            {(["brand", "creator"] as AudienceKey[]).map((key) => {
              const isActive = activeAudience === key;

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={content.segmentLabel}
                  onClick={() => setActiveAudience(key)}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all md:px-7 md:py-3 md:text-base ${
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_8px_20px_rgba(255,255,255,0.16)]"
                      : "text-white hover:text-white/90"
                  }`}
                >
                  {content[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center rounded-full border border-white/80 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] shadow-sm">
              <span className={accentTone}>{content[activeAudience].label}</span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold leading-[0.96] tracking-tight text-slate-950 md:text-6xl">
                <span className="block">{audience.headlineLead}</span>
                <span className={`block ${accentTone}`}>{audience.headlineAccent}</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                {audience.description}
              </p>
            </div>

            <div className="space-y-3">
              {audience.benefits.map((benefit) => {
                const Icon = getBenefitIcon(benefit.icon);

                return (
                  <div
                    key={benefit.title}
                    className="flex items-center gap-4 rounded-[1.4rem] border border-white/75 bg-white/72 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center self-center rounded-full bg-slate-100 text-slate-800 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold tracking-tight text-slate-950">
                        {benefit.title}
                      </p>
                      <p className="mt-0.5 max-w-xl text-base leading-7 text-slate-700">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="absolute right-0 top-4 h-32 w-32 rounded-full bg-sky-200/35 blur-3xl" />

            <aside
              className={`relative mx-auto max-w-md rounded-[1.9rem] border border-white/75 ${cardTone} p-6 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8`}
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                {audience.card.title} 
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-500 md:text-lg">
                {audience.card.description}
              </p>

              {audience.card.fields?.length ? (
                <div className="mt-8 space-y-5">
                  {audience.card.fields.map((field, fieldIndex) => (
                    <div key={field.label}>
                      <label className="mb-2 block text-base font-semibold text-slate-950">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={activeAudience === "brand" && fieldIndex === 1 ? brandLead.productType : ""}
                          onChange={(event) => {
                            if (activeAudience === "brand" && fieldIndex === 1) {
                              updateBrandLead("productType", event.target.value);
                            }
                          }}
                          className={`h-14 w-full rounded-[1.1rem] border bg-white/85 px-4 text-base outline-none transition-colors focus:border-slate-950 ${
                            activeAudience === "brand" && fieldIndex === 1 && brandErrors.productType
                              ? "border-rose-400 text-slate-950"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          <option value="" disabled>
                            {field.placeholder}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={activeAudience === "brand" && fieldIndex === 0 ? brandLead.companyName : ""}
                          onChange={(event) => {
                            if (activeAudience === "brand" && fieldIndex === 0) {
                              updateBrandLead("companyName", event.target.value);
                            }
                          }}
                          placeholder={field.placeholder}
                          className={`h-14 w-full rounded-[1.1rem] border bg-white/85 px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 ${
                            activeAudience === "brand" && fieldIndex === 0 && brandErrors.companyName
                              ? "border-rose-400"
                              : "border-slate-300"
                          }`}
                        />
                      )}
                      {activeAudience === "brand" && fieldIndex === 0 ? (
                        <p className="mt-2 text-sm text-rose-600">
                          {brandErrors.companyName}
                        </p>
                      ) : null}
                      {activeAudience === "brand" && fieldIndex === 1 ? (
                        <p className="mt-2 text-sm text-rose-600">
                          {brandErrors.productType}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handlePrimaryAction}
                className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-[1rem] bg-slate-950 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-800"
              >
                {audience.card.primaryAction}
              </button>

              {audience.card.secondaryPrefix && audience.card.secondaryAction ? (
                <p className="mt-5 text-center text-base text-slate-500">
                  {audience.card.secondaryPrefix}{" "}
                  <button
                    type="button"
                    className="font-semibold text-slate-950 transition-colors hover:text-slate-700"
                  >
                    {audience.card.secondaryAction}
                  </button>
                </p>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
