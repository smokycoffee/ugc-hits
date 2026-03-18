"use client";

import { useId, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileText,
  Globe,
  ImagePlus,
  Info,
  PencilRuler,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

type StepIcon =
  | typeof Building2
  | typeof BriefcaseBusiness
  | typeof UsersRound
  | typeof BadgeCheck
  | typeof PencilRuler
  | typeof Globe
  | typeof FileText;

type StepConfig = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  highlights: string[];
  icon: StepIcon;
};

type BrandOnboardingShellProps = {
  initialCompanyName: string;
  initialProductType: string;
  productTypeOptions: string[];
};

type BrandOnboardingForm = {
  companyName: string;
  companyWebsite: string;
  instagram: string;
  tiktok: string;
  productType: string;
  companyLogoName: string;
  contactName: string;
  role: string;
  referralSource: string;
  creatorSlots: string;
  creatorNiches: string[];
  creatorLocation: string;
  creatorAgeRanges: string[];
  creatorGenders: string[];
  creatorEthnicities: string[];
  campaignType: string;
  budgetMin: string;
  budgetMax: string;
  inspirationLinks: [string, string, string];
  campaignDescription: string;
};

type ErrorState = Partial<Record<keyof BrandOnboardingForm, string>>;

const steps: StepConfig[] = [
  {
    id: "company",
    title: "Company details",
    kicker: "Step 1",
    description:
      "Tell us about your company. This will be shown to creators on your campaign listing.",
    highlights: [
      "Company name",
      "Website",
      "Instagram or TikTok",
      "Product type",
      "Company logo",
    ],
    icon: Building2,
  },
  {
    id: "personal",
    title: "Personal info",
    kicker: "Step 2",
    description:
      "This information is private and will not be shared with creators.",
    highlights: ["Your name", "Your role", "How you heard about us"],
    icon: BriefcaseBusiness,
  },
  {
    id: "creator-preferences",
    title: "Creator preferences",
    kicker: "Step 3",
    description:
      "Shape the creator profile you want to attract while keeping the matching pool healthy.",
    highlights: [
      "Open spots",
      "Creator niche",
      "Location targeting",
      "Age, gender, and ethnicity filters",
    ],
    icon: UsersRound,
  },
  {
    id: "deliverables",
    title: "Deliverables",
    kicker: "Step 4",
    description:
      "Choose the campaign type and set expectations creators can evaluate immediately.",
    highlights: ["UGC program", "Paid ads campaign", "Influencer campaign"],
    icon: BadgeCheck,
  },
  {
    id: "budget",
    title: "Budget",
    kicker: "Step 5",
    description:
      "Set the base pay range you are willing to offer for each creator submission.",
    highlights: ["Minimum pay", "Maximum pay", "Internal-use budget note"],
    icon: Globe,
  },
  {
    id: "creative-direction",
    title: "Creative direction",
    kicker: "Step 6",
    description:
      "Share references that signal the visual style and performance bar you want creators to match.",
    highlights: ["Reference link 1", "Reference link 2", "Reference link 3"],
    icon: PencilRuler,
  },
  {
    id: "campaign-description",
    title: "Campaign description",
    kicker: "Step 7",
    description:
      "Describe your company and how much direction the creator will receive so the right applicants opt in.",
    highlights: ["Campaign brief", "Creative direction level", "2000 character limit"],
    icon: FileText,
  },
];

const creatorSlotOptions = ["1", "2-5", "6-10", "11-20", "20+"];
const creatorNicheOptions = [
  "Lifestyle",
  "Tech",
  "Productivity",
  "Study",
  "Career",
  "Interviews",
  "Comedy",
  "Relationships",
  "Finance",
  "Reviews",
  "Beauty",
  "Fitness",
  "Fashion",
  "Food",
  "Wellness",
  "Art",
  "Travel",
  "Gaming",
  "Sports",
  "Music",
];
const creatorLocationOptions = [
  "Any country",
  "United States only",
  "United States, Canada, United Kingdom, Australia, or New Zealand",
];
const creatorAgeOptions = ["18-21", "22-25", "26-29", "30-34", "35-39", "40+"];
const creatorGenderOptions = ["Woman", "Man"];
const creatorEthnicityOptions = [
  "Asian",
  "Black/African American",
  "Hispanic/Latino",
  "White/Caucasian",
  "Native American/Indigenous",
  "Pacific Islander",
];
const roleOptions = ["Founder", "Marketing", "Agency/Partner"];
const campaignTypes = [
  {
    id: "ugc-program",
    label: "UGC Program",
    description: "Content posted to brand new, creator-managed accounts",
  },
  {
    id: "paid-ads",
    label: "Paid Ads Campaign",
    description: "Content posted to brand-managed accounts",
  },
  {
    id: "influencer-campaign",
    label: "Influencer Campaign",
    description: "Content posted to the influencer's own accounts",
  },
];

function createInitialFormState(
  initialCompanyName: string,
  initialProductType: string,
): BrandOnboardingForm {
  return {
    companyName: initialCompanyName,
    companyWebsite: "",
    instagram: "",
    tiktok: "",
    productType: initialProductType,
    companyLogoName: "",
    contactName: "",
    role: "",
    referralSource: "",
    creatorSlots: "",
    creatorNiches: [],
    creatorLocation: "Any country",
    creatorAgeRanges: [],
    creatorGenders: [],
    creatorEthnicities: [],
    campaignType: "",
    budgetMin: "",
    budgetMax: "",
    inspirationLinks: ["", "", ""],
    campaignDescription: "",
  };
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-950">
      {children}
      {required ? <span className="text-rose-500"> *</span> : null}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: "text" | "url" | "number";
}) {
  return (
    <input
      type={type}
      inputMode={type === "number" ? "numeric" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-14 w-full rounded-[1rem] border bg-white/90 px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950",
        error ? "border-rose-400" : "border-slate-300",
      )}
    />
  );
}

function SelectInput({
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  error?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-14 w-full rounded-[1rem] border bg-white/90 px-4 text-base text-slate-950 outline-none transition-colors focus:border-slate-950",
        value ? "text-slate-950" : "text-slate-400",
        error ? "border-rose-400" : "border-slate-300",
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function OptionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        selected
          ? "border-slate-950 bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.15)]"
          : "border-white/85 bg-white/82 text-slate-700 hover:border-slate-300 hover:text-slate-950",
      )}
    >
      {label}
    </button>
  );
}

export function BrandOnboardingShell({
  initialCompanyName,
  initialProductType,
  productTypeOptions,
}: BrandOnboardingShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BrandOnboardingForm>(() =>
    createInitialFormState(initialCompanyName, initialProductType),
  );
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputId = useId();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentConfig = steps[currentStep];

  function updateField<K extends keyof BrandOnboardingForm>(
    field: K,
    value: BrandOnboardingForm[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function toggleMultiValue(
    field: "creatorNiches" | "creatorAgeRanges" | "creatorGenders" | "creatorEthnicities",
    value: string,
  ) {
    const currentValues = formData[field];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateField(field, nextValues);
  }

  function updateInspirationLink(index: number, value: string) {
    const nextLinks = [...formData.inspirationLinks] as [string, string, string];
    nextLinks[index] = value;
    updateField("inspirationLinks", nextLinks);
  }

  function validateStep(stepIndex: number) {
    const nextErrors: ErrorState = {};

    if (stepIndex === 0) {
      if (!formData.companyName.trim()) {
        nextErrors.companyName = "Company name is required.";
      }
      if (!formData.companyWebsite.trim()) {
        nextErrors.companyWebsite = "Company website is required.";
      }
      if (!formData.instagram.trim() && !formData.tiktok.trim()) {
        nextErrors.instagram = "Add at least one social profile.";
      }
      if (!formData.productType.trim()) {
        nextErrors.productType = "Product type is required.";
      }
      if (!formData.companyLogoName.trim()) {
        nextErrors.companyLogoName = "Company logo is required.";
      }
    }

    if (stepIndex === 1) {
      if (!formData.contactName.trim()) {
        nextErrors.contactName = "Your name is required.";
      }
      if (!formData.role.trim()) {
        nextErrors.role = "Select your role.";
      }
      if (!formData.referralSource.trim()) {
        nextErrors.referralSource = "Tell us how you heard about UGC Tank.";
      }
    }

    if (stepIndex === 2) {
      if (!formData.creatorSlots.trim()) {
        nextErrors.creatorSlots = "Choose how many spots are available.";
      }
      if (formData.creatorNiches.length === 0) {
        nextErrors.creatorNiches = "Select at least one creator niche.";
      }
    }

    if (stepIndex === 3 && !formData.campaignType.trim()) {
      nextErrors.campaignType = "Choose a campaign type.";
    }

    if (stepIndex === 4) {
      if (!formData.budgetMin.trim()) {
        nextErrors.budgetMin = "Enter a minimum budget.";
      }
      if (!formData.budgetMax.trim()) {
        nextErrors.budgetMax = "Enter a maximum budget.";
      }
    }

    if (
      stepIndex === 5 &&
      formData.inspirationLinks.every((link) => !link.trim())
    ) {
      nextErrors.inspirationLinks = "Add at least one inspiration link.";
    }

    if (stepIndex === 6 && !formData.campaignDescription.trim()) {
      nextErrors.campaignDescription = "Campaign description is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === steps.length - 1) {
      setSubmitted(true);
      return;
    }

    setCurrentStep((value) => value + 1);
  }

  function handleBack() {
    if (currentStep === 0) {
      return;
    }

    setCurrentStep((value) => value - 1);
  }

  if (submitted) {
    return (
      <section className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(238,250,248,0.92))] p-8 shadow-[0_26px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
                <Sparkles className="size-7" />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
                Campaign draft created
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                Your onboarding flow is ready.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                The UI is now collecting the brand details, preferences, and
                campaign brief from the onboarding reference flow in your landing
                page style.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/85 bg-white/88 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Company
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {formData.companyName}
                </p>
                <p className="mt-1 text-base text-slate-600">
                  {formData.productType}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/85 bg-white/88 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Campaign type
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {campaignTypes.find((type) => type.id === formData.campaignType)?.label}
                </p>
                <p className="mt-1 text-base text-slate-600">
                  ${formData.budgetMin} to ${formData.budgetMax} per post
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/85 bg-white/88 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Targeting
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {formData.creatorSlots} spot{formData.creatorSlots === "1" ? "" : "s"}
                </p>
                <p className="mt-1 text-base text-slate-600">
                  {formData.creatorNiches.slice(0, 3).join(", ")}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(0);
                }}
                className="inline-flex h-14 items-center justify-center rounded-[1rem] bg-slate-950 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Review onboarding again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-10">
      <div className="absolute left-[-6rem] top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
      <div className="absolute right-[-4rem] top-14 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.9))] p-5 shadow-[0_26px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Create your campaign
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                {currentConfig.title}
              </h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex w-52 shrink-0 items-center gap-3 rounded-[1.2rem] border px-4 py-3 transition-all",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_32px_rgba(15,23,42,0.16)]"
                        : "border-white/85 bg-white/88 text-slate-700",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border",
                        isActive
                          ? "border-white/20 bg-white/12"
                          : isComplete
                            ? "border-teal-200 bg-teal-50 text-teal-700"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                      )}
                    >
                      {isComplete ? <BadgeCheck className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-[0.22em]",
                          isActive ? "text-white/72" : "text-slate-400",
                        )}
                      >
                        Step {index + 1}
                      </p>
                      <p className="truncate text-base font-semibold">{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> */}

          <div className="mt-6 h-2 rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#1e3a5f,#0f766e)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-8 min-h-[34rem]">
            {currentStep === 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Company Details
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        Tell us about your company. This will be shown to creators
                        on your campaign listing.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>Company Name</FieldLabel>
                      <TextInput
                        value={formData.companyName}
                        onChange={(value) => updateField("companyName", value)}
                        placeholder="Your company name"
                        error={errors.companyName}
                      />
                      <FieldError message={errors.companyName} />
                    </div>

                    <div>
                      <FieldLabel required>Company Website</FieldLabel>
                      <TextInput
                        value={formData.companyWebsite}
                        onChange={(value) => updateField("companyWebsite", value)}
                        placeholder="example.com"
                        error={errors.companyWebsite}
                        type="url"
                      />
                      <FieldError message={errors.companyWebsite} />
                    </div>

                    <div>
                      <FieldLabel required>Socials</FieldLabel>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <TextInput
                            value={formData.instagram}
                            onChange={(value) => updateField("instagram", value)}
                            placeholder="Instagram handle or URL"
                            error={errors.instagram}
                          />
                        </div>
                        <div>
                          <TextInput
                            value={formData.tiktok}
                            onChange={(value) => updateField("tiktok", value)}
                            placeholder="TikTok handle or URL"
                            error={errors.instagram}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        At least one is required. Founder&apos;s socials is also acceptable.
                      </p>
                      <FieldError message={errors.instagram} />
                    </div>

                    <div>
                      <FieldLabel required>Product Type</FieldLabel>
                      <SelectInput
                        value={formData.productType}
                        onChange={(value) => updateField("productType", value)}
                        placeholder="Select product type"
                        options={productTypeOptions}
                        error={errors.productType}
                      />
                      <FieldError message={errors.productType} />
                    </div>

                    <div>
                      <FieldLabel required>Company Logo</FieldLabel>
                      <input
                        id={fileInputId}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          updateField("companyLogoName", file?.name ?? "");
                        }}
                      />
                      <label
                        htmlFor={fileInputId}
                        className={cn(
                          "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed px-6 py-8 text-center transition-colors",
                          errors.companyLogoName
                            ? "border-rose-300 bg-rose-50/40"
                            : "border-slate-300 bg-slate-50/70 hover:border-slate-500",
                        )}
                      >
                        <div className="flex size-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
                          <ImagePlus className="size-6" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-slate-950">
                          {formData.companyLogoName || "Upload your company logo"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          PNG or JPG is enough for this onboarding mock flow.
                        </p>
                      </label>
                      <FieldError message={errors.companyLogoName} />
                    </div>
                  </div>
                ) : null}

                {currentStep === 1 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Personal Info
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        This information is private and will not be shared with creators.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>Your Name</FieldLabel>
                      <TextInput
                        value={formData.contactName}
                        onChange={(value) => updateField("contactName", value)}
                        placeholder="First and last name"
                        error={errors.contactName}
                      />
                      <FieldError message={errors.contactName} />
                    </div>

                    <div>
                      <FieldLabel required>Your Role</FieldLabel>
                      <div className="flex flex-wrap gap-3">
                        {roleOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.role === option}
                            onClick={() => updateField("role", option)}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.role} />
                    </div>

                    <div>
                      <FieldLabel required>How did you hear about UGC Tank?</FieldLabel>
                      <TextInput
                        value={formData.referralSource}
                        onChange={(value) => updateField("referralSource", value)}
                        placeholder="How did you hear about us?"
                        error={errors.referralSource}
                      />
                      <FieldError message={errors.referralSource} />
                    </div>
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Creator Preferences
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        Share your ideal creator profile. All preferences except
                        ethnicity will be visible on your campaign listing.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>How many spots are available?</FieldLabel>
                      <div className="flex flex-wrap gap-3">
                        {creatorSlotOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.creatorSlots === option}
                            onClick={() => updateField("creatorSlots", option)}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.creatorSlots} />
                    </div>

                    <div>
                      <FieldLabel required>Creator niche</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">Select up to 3.</p>
                      <div className="flex flex-wrap gap-3">
                        {creatorNicheOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.creatorNiches.includes(option)}
                            onClick={() => {
                              if (
                                !formData.creatorNiches.includes(option) &&
                                formData.creatorNiches.length >= 3
                              ) {
                                return;
                              }
                              toggleMultiValue("creatorNiches", option);
                            }}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.creatorNiches} />
                    </div>

                    <div>
                      <FieldLabel>Creator Location</FieldLabel>
                      <div className="space-y-3">
                        {creatorLocationOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateField("creatorLocation", option)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[1rem] border px-4 py-3 text-left transition-colors",
                              formData.creatorLocation === option
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-white/82 text-slate-700 hover:border-slate-400",
                            )}
                          >
                            <span
                              className={cn(
                                "size-4 rounded-full border",
                                formData.creatorLocation === option
                                  ? "border-white bg-white"
                                  : "border-slate-300 bg-white",
                              )}
                            />
                            <span className="text-sm font-medium">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Creator Age Range</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        Leave blank for no preference.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {creatorAgeOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.creatorAgeRanges.includes(option)}
                            onClick={() => toggleMultiValue("creatorAgeRanges", option)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Creator Gender</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        Leave blank for no preference.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {creatorGenderOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.creatorGenders.includes(option)}
                            onClick={() => toggleMultiValue("creatorGenders", option)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Creator Ethnicity</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        Not shown on your campaign listing. Leave blank for no preference.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {creatorEthnicityOptions.map((option) => (
                          <OptionChip
                            key={option}
                            label={option}
                            selected={formData.creatorEthnicities.includes(option)}
                            onClick={() => toggleMultiValue("creatorEthnicities", option)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                      Creators must match your location, gender, and ethnicity
                      selections to see your campaign. Niche and age are used to
                      improve relevance, but do not restrict visibility. The more
                      filters you apply, the fewer applicants you will receive.
                    </div>
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Deliverables
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        What are the deliverables per creator? This will be shown
                        to creators on your campaign listing.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>Campaign type</FieldLabel>
                      <div className="space-y-4">
                        {campaignTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => updateField("campaignType", type.id)}
                            className={cn(
                              "w-full rounded-[1.4rem] border px-5 py-5 text-left transition-all",
                              formData.campaignType === type.id
                                ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                                : "border-slate-200 bg-white/88 text-slate-700 hover:border-slate-400",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                                formData.campaignType === type.id
                                  ? "bg-white/12 text-white"
                                  : "bg-slate-100 text-slate-700",
                              )}
                            >
                              {type.label}
                            </span>
                            <p className="mt-3 text-lg font-medium">
                              {type.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      <FieldError message={errors.campaignType} />
                    </div>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Budget
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        We vet for quality on both the creator and brand side, so
                        campaigns with a base pay less than $25 are unlikely to get approved.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-[1.2rem] border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
                      <Info className="mt-0.5 size-5 shrink-0" />
                      <p>
                        Budget will not be shown to creators for influencer
                        marketing campaigns. This information is for internal use
                        and matching.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>Base Pay Per Post</FieldLabel>
                      <p className="mb-4 text-sm text-slate-500">
                        Enter the budget range you are willing to pay per post.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <FieldLabel required>Min ($)</FieldLabel>
                          <TextInput
                            value={formData.budgetMin}
                            onChange={(value) => updateField("budgetMin", value)}
                            placeholder="100"
                            error={errors.budgetMin}
                            type="number"
                          />
                          <FieldError message={errors.budgetMin} />
                        </div>
                        <div>
                          <FieldLabel required>Max ($)</FieldLabel>
                          <TextInput
                            value={formData.budgetMax}
                            onChange={(value) => updateField("budgetMax", value)}
                            placeholder="150"
                            error={errors.budgetMax}
                            type="number"
                          />
                          <FieldError message={errors.budgetMax} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 5 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Creative Direction
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        Share examples of UGC or ads that match the style and
                        quality you are looking for, ideally your own brand&apos;s content.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <FieldLabel required>Content Inspiration</FieldLabel>
                      {formData.inspirationLinks.map((link, index) => (
                        <TextInput
                          key={`inspiration-${index + 1}`}
                          value={link}
                          onChange={(value) => updateInspirationLink(index, value)}
                          placeholder="https://..."
                          error={errors.inspirationLinks}
                          type="url"
                        />
                      ))}
                      <FieldError message={errors.inspirationLinks} />
                    </div>
                  </div>
                ) : null}

                {currentStep === 6 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Campaign Description
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        Share more about your company and the level of creative
                        direction you will provide for this campaign.
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>Campaign Brief</FieldLabel>
                      <textarea
                        value={formData.campaignDescription}
                        onChange={(event) =>
                          updateField(
                            "campaignDescription",
                            event.target.value.slice(0, 2000),
                          )
                        }
                        placeholder="Write a detailed description of your company and campaign"
                        className={cn(
                          "min-h-72 w-full rounded-[1.3rem] border bg-white/90 px-5 py-4 text-base leading-7 text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950",
                          errors.campaignDescription ? "border-rose-400" : "border-slate-300",
                        )}
                      />
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <FieldError message={errors.campaignDescription} />
                        <span>{formData.campaignDescription.length}/2000</span>
                      </div>
                    </div>
                  </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                "inline-flex h-14 items-center justify-center gap-2 rounded-[1rem] border px-5 text-base font-semibold transition-colors",
                currentStep === 0
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950",
              )}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[1rem] bg-slate-950 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {currentStep === steps.length - 1 ? "Create Campaign" : "Next"}
              {currentStep === steps.length - 1 ? null : <ArrowRight className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
