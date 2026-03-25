"use client";

import { useId, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileText,
  Globe,
  ImagePlus,
  Instagram,
  Info,
  Music2,
  PencilRuler,
  UsersRound,
  Youtube,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { saveBrandOnboardingAction } from "@/lib/platform/actions";

type StepIcon =
  | typeof Building2
  | typeof BriefcaseBusiness
  | typeof UsersRound
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
  initialValues?: Partial<BrandOnboardingForm>;
  productTypeOptions: string[];
  locale: AppLocale;
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
  campaignFrequency: string;
  budgetMin: string;
  budgetMax: string;
  inspirationLinks: [string, string, string];
  campaignDescription: string;
  uniquePosts: string;
  postingPlatforms: string[];
  minimumFollowerCount: string;
  includesPaidUsage: boolean;
};

type ErrorState = Partial<Record<keyof BrandOnboardingForm, string>>;

const steps: StepConfig[] = [
  {
    id: "company",
    title: "Company Details",
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
    title: "Personal Info",
    kicker: "Step 2",
    description:
      "This information is private and will not be shared with creators.",
    highlights: ["Your name", "Your role", "How you heard about us"],
    icon: BriefcaseBusiness,
  },
  {
    id: "creator-preferences",
    title: "Creator Preferences",
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
    title: "Creative Direction",
    kicker: "Step 6",
    description:
      "Share references that signal the visual style and performance bar you want creators to match.",
    highlights: ["Reference link 1", "Reference link 2", "Reference link 3"],
    icon: PencilRuler,
  },
  {
    id: "campaign-description",
    title: "Campaign Description",
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
  "Poland",
  "Europe only",
  "Any location",
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
    description: "Content designed for creator-made UGC submissions and approvals",
  },
  {
    id: "paid-ads",
    label: "Paid Ads Campaign",
    description: "Content built for brand-managed ad accounts and paid social",
  },
  {
    id: "influencer-campaign",
    label: "Influencer Campaign",
    description: "Content published on the creator's own channels",
  },
];
const campaignFrequencyOptions = ["Monthly Retainer", "Weekly Retainer", "One Time"];
const postingPlatforms = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "youtube", label: "YouTube", icon: Youtube },
];
const minimumFollowerOptions = ["10K+", "25K+", "50K+", "100K+", "250K+"];

function createInitialFormState(
  initialValues?: Partial<BrandOnboardingForm>,
): BrandOnboardingForm {
  return {
    companyName: initialValues?.companyName ?? "",
    companyWebsite: initialValues?.companyWebsite ?? "",
    instagram: initialValues?.instagram ?? "",
    tiktok: initialValues?.tiktok ?? "",
    productType: initialValues?.productType ?? "",
    companyLogoName: initialValues?.companyLogoName ?? "",
    contactName: initialValues?.contactName ?? "",
    role: initialValues?.role ?? "",
    referralSource: initialValues?.referralSource ?? "",
    creatorSlots: initialValues?.creatorSlots ?? "",
    creatorNiches: initialValues?.creatorNiches ?? [],
    creatorLocation: initialValues?.creatorLocation ?? "Any country",
    creatorAgeRanges: initialValues?.creatorAgeRanges ?? [],
    creatorGenders: initialValues?.creatorGenders ?? [],
    creatorEthnicities: initialValues?.creatorEthnicities ?? [],
    campaignType: initialValues?.campaignType ?? "",
    campaignFrequency: initialValues?.campaignFrequency ?? "",
    budgetMin: initialValues?.budgetMin ?? "",
    budgetMax: initialValues?.budgetMax ?? "",
    inspirationLinks: [
      initialValues?.inspirationLinks?.[0] ?? "",
      initialValues?.inspirationLinks?.[1] ?? "",
      initialValues?.inspirationLinks?.[2] ?? "",
    ],
    campaignDescription: initialValues?.campaignDescription ?? "",
    uniquePosts: initialValues?.uniquePosts ?? "",
    postingPlatforms: initialValues?.postingPlatforms ?? [],
    minimumFollowerCount: initialValues?.minimumFollowerCount ?? "",
    includesPaidUsage: initialValues?.includesPaidUsage ?? false,
  };
}

function selectionSurface(selected: boolean) {
  return selected
    ? "border-teal-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.98),rgba(233,250,247,0.95))] text-slate-950 shadow-[0_10px_26px_rgba(13,148,136,0.10)]"
    : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.95))] text-slate-700 shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-white hover:text-slate-950";
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
        "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
        selectionSurface(selected),
      )}
    >
      {label}
    </button>
  );
}

function ChoiceRow({
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
      className={cn(
        "flex w-full items-center gap-3 rounded-[1rem] border px-4 py-3 text-left transition-colors",
        selectionSurface(selected),
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full border transition-colors",
          selected ? "border-teal-500 bg-teal-500/85" : "border-slate-300 bg-white",
        )}
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function PlatformChip({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: typeof Instagram;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all",
        selectionSurface(selected),
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function FormHiddenInputs({
  locale,
  formData,
}: {
  locale: AppLocale;
  formData: BrandOnboardingForm;
}) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="companyName" value={formData.companyName} />
      <input type="hidden" name="companyWebsite" value={formData.companyWebsite} />
      <input type="hidden" name="instagram" value={formData.instagram} />
      <input type="hidden" name="tiktok" value={formData.tiktok} />
      <input type="hidden" name="productType" value={formData.productType} />
      <input type="hidden" name="companyLogoName" value={formData.companyLogoName} />
      <input type="hidden" name="contactName" value={formData.contactName} />
      <input type="hidden" name="role" value={formData.role} />
      <input type="hidden" name="referralSource" value={formData.referralSource} />
      <input type="hidden" name="creatorSlots" value={formData.creatorSlots} />
      <input type="hidden" name="creatorLocation" value={formData.creatorLocation} />
      <input type="hidden" name="campaignType" value={formData.campaignType} />
      <input type="hidden" name="campaignFrequency" value={formData.campaignFrequency} />
      <input type="hidden" name="budgetMin" value={formData.budgetMin} />
      <input type="hidden" name="budgetMax" value={formData.budgetMax} />
      <input type="hidden" name="campaignDescription" value={formData.campaignDescription} />
      <input type="hidden" name="uniquePosts" value={formData.uniquePosts} />
      <input
        type="hidden"
        name="minimumFollowerCount"
        value={formData.minimumFollowerCount}
      />
      <input
        type="hidden"
        name="includesPaidUsage"
        value={formData.includesPaidUsage ? "true" : "false"}
      />
      {formData.creatorNiches.map((value) => (
        <input key={`creator-niche-${value}`} type="hidden" name="creatorNiches" value={value} />
      ))}
      {formData.creatorAgeRanges.map((value) => (
        <input key={`creator-age-${value}`} type="hidden" name="creatorAgeRanges" value={value} />
      ))}
      {formData.creatorGenders.map((value) => (
        <input key={`creator-gender-${value}`} type="hidden" name="creatorGenders" value={value} />
      ))}
      {formData.creatorEthnicities.map((value) => (
        <input
          key={`creator-ethnicity-${value}`}
          type="hidden"
          name="creatorEthnicities"
          value={value}
        />
      ))}
      {formData.postingPlatforms.map((value) => (
        <input
          key={`posting-platform-${value}`}
          type="hidden"
          name="postingPlatforms"
          value={value}
        />
      ))}
      {formData.inspirationLinks.map((value, index) => (
        <input
          key={`inspiration-link-${index + 1}`}
          type="hidden"
          name="inspirationLinks"
          value={value}
        />
      ))}
    </>
  );
}

function FinalSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex h-14 items-center justify-center gap-2 rounded-[1rem] bg-slate-950 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function BrandOnboardingShell({
  initialValues,
  productTypeOptions,
  locale,
}: BrandOnboardingShellProps) {
  const isPolish = locale === "pl";
  const copy = isPolish
    ? {
        createCampaign: "Stwórz kampanię",
        stepLabel: "Krok",
        stepOf: "z",
        successBadge: "Szkic kampanii gotowy",
        successTitle: "Twoja kampania UGC Hits jest gotowa.",
        successDescription:
          "Flow zbiera teraz szczegóły kampanii, targetowanie i kierunek kreatywny w tym samym języku wizualnym co landing UGC Hits.",
        reviewAgain: "Przejrzyj onboarding ponownie",
        back: "Wstecz",
        next: "Dalej",
        companySummary: "Firma",
        campaignTypeSummary: "Typ kampanii",
        targetingSummary: "Targetowanie",
        companyDetails: "Dane firmy",
        companyDetailsDescription:
          "Opowiedz o swojej firmie. Ta sekcja będzie widoczna dla twórców na stronie kampanii.",
        personalInfo: "Informacje prywatne",
        personalInfoDescription:
          "Te informacje są prywatne i nie będą udostępniane twórcom.",
        creatorPreferences: "Preferencje twórców",
        creatorPreferencesDescription:
          "Określ profil twórców, których chcesz przyciągnąć. Wszystkie preferencje poza etnicznością będą widoczne przy kampanii.",
        deliverables: "Deliverables",
        deliverablesDescription:
          "Określ zakres deliverables na twórcę. Te informacje będą widoczne dla twórców na stronie kampanii.",
        budget: "Budżet",
        budgetDescription:
          "Weryfikujemy jakość po stronie twórcy i marki, więc kampanie z bazową stawką poniżej 25 USD raczej nie zostaną zaakceptowane.",
        creativeDirection: "Kierunek kreatywny",
        creativeDirectionDescription:
          "Pokaż przykłady UGC lub reklam, które oddają styl i jakość, jakiej oczekujesz, najlepiej z Twojej marki.",
        campaignDescription: "Opis kampanii",
        campaignDescriptionDescription:
          "Napisz więcej o swojej firmie i o tym, jak dużo kierunku kreatywnego zapewnisz przy tej kampanii.",
        companyName: "Nazwa firmy",
        companyWebsite: "Strona firmy",
        socials: "Social media",
        productType: "Typ produktu",
        companyLogo: "Logo firmy",
        yourName: "Twoje imię i nazwisko",
        yourRole: "Twoja rola",
        heardAbout: "Skąd dowiedziałeś(-aś) się o UGC Hits?",
        creatorSlots: "Ile miejsc jest dostępnych?",
        creatorNiche: "Nisza twórcy",
        creatorLocation: "Lokalizacja twórcy",
        creatorAgeRange: "Wiek twórcy",
        creatorGender: "Płeć twórcy",
        creatorEthnicity: "Etniczność twórcy",
        campaignType: "Typ kampanii",
        campaignFrequency: "Częstotliwość kampanii",
        uniquePosts: "Liczba unikalnych materiałów na twórcę",
        postingTo: "Publikacja na (wybierz wszystkie pasujące)",
        minimumFollowers: "Minimalna liczba obserwujących (łącznie na platformach)",
        paidUsage: "Czy potrzebujesz praw do paid usage?",
        includesPaidUsage: "Uwzględnij paid usage",
        basePayPerPost: "Stawka bazowa za materiał",
        minLabel: "Min ($)",
        maxLabel: "Max ($)",
        contentInspiration: "Inspiracje contentowe",
        campaignBrief: "Opis kampanii",
        anyCountry: "Dowolny kraj",
        usOnly: "Tylko Stany Zjednoczone",
        tierOneCountries:
          "Stany Zjednoczone, Kanada, Wielka Brytania, Australia lub Nowa Zelandia",
        selectUpToThree: "Wybierz maksymalnie 3.",
        leaveBlank: "Zostaw puste, jeśli nie masz preferencji.",
        ethnicityHelper:
          "Nie jest widoczne na stronie kampanii. Zostaw puste, jeśli nie masz preferencji.",
        socialsHelper:
          "Wystarczy przynajmniej jeden profil. Możesz też podać social media foundera.",
        budgetHelper: "Podaj zakres budżetu, który chcesz zapłacić za materiał.",
        budgetNote:
          "Budżet nie będzie widoczny dla twórców w kampaniach influencer marketingowych. Te informacje służą nam do wewnętrznego dopasowania.",
        creatorFiltersWarning:
          "Twórcy muszą pasować do wybranej lokalizacji, płci i etniczności, aby zobaczyć kampanię. Nisza i wiek pomagają w dopasowaniu, ale nie ograniczają widoczności. Im więcej filtrów ustawisz, tym mniej zgłoszeń otrzymasz.",
        logoHelper: "PNG lub JPG w zupełności wystarczy na potrzeby tego mocka.",
        uploadLogo: "Prześlij logo firmy",
        heardAboutPlaceholder: "Gdzie usłyszałeś(-aś) o UGC Hits?",
        namePlaceholder: "Imię i nazwisko",
        websitePlaceholder: "example.com",
        instagramPlaceholder: "Instagram handle lub URL",
        tiktokPlaceholder: "TikTok handle lub URL",
        uniquePostsPlaceholder: "np. 4",
        budgetMinPlaceholder: "100",
        budgetMaxPlaceholder: "150",
        inspirationPlaceholder: "https://...",
        campaignBriefPlaceholder: "Napisz szczegółowy opis firmy i kampanii",
        submitting: "Zapisywanie kampanii...",
        reviewCampaign: "Przejrzyj kampanię ponownie",
        companyNameRequired: "Nazwa firmy jest wymagana.",
        companyWebsiteRequired: "Strona firmy jest wymagana.",
        socialRequired: "Dodaj przynajmniej jeden profil społecznościowy.",
        productTypeRequired: "Typ produktu jest wymagany.",
        companyLogoRequired: "Logo firmy jest wymagane.",
        contactNameRequired: "Imię i nazwisko są wymagane.",
        roleRequired: "Wybierz swoją rolę.",
        referralRequired: "Powiedz nam, skąd dowiedziałeś(-aś) się o UGC Hits.",
        creatorSlotsRequired: "Wybierz liczbę dostępnych miejsc.",
        creatorNicheRequired: "Wybierz przynajmniej jedną niszę twórcy.",
        campaignTypeRequired: "Wybierz typ kampanii.",
        campaignFrequencyRequired: "Wybierz częstotliwość kampanii.",
        uniquePostsRequired: "Podaj liczbę unikalnych materiałów na twórcę.",
        postingPlatformsRequired: "Wybierz przynajmniej jedną platformę publikacji.",
        minimumFollowersRequired: "Wybierz minimalną liczbę obserwujących.",
        budgetMinRequired: "Podaj minimalny budżet.",
        budgetMaxRequired: "Podaj maksymalny budżet.",
        inspirationRequired: "Dodaj przynajmniej jeden link inspiracyjny.",
        campaignDescriptionRequired: "Opis kampanii jest wymagany.",
        roleOptions: ["Founder", "Marketing", "Agencja/Partner"],
        creatorLocationOptions: [
          "Dowolny kraj",
          "Tylko Stany Zjednoczone",
          "Stany Zjednoczone, Kanada, Wielka Brytania, Australia lub Nowa Zelandia",
        ],
        creatorGenderOptions: ["Kobieta", "Mężczyzna"],
        creatorEthnicityOptions: [
          "Azjatycka",
          "Czarna/Afroamerykańska",
          "Latynoska",
          "Biała/Kaukaska",
          "Rdzenna/Indigenous",
          "Wyspy Pacyfiku",
        ],
        campaignFrequencyOptions: [
          "Retainer miesięczny",
          "Retainer tygodniowy",
          "Jednorazowo",
        ],
        campaignTypes: [
          {
            id: "ugc-program",
            label: "Program UGC",
            description:
              "Treści tworzone pod UGC od twórców i proces akceptacji po stronie marki",
          },
          {
            id: "paid-ads",
            label: "Kampania Paid Ads",
            description:
              "Treści przygotowane pod konta reklamowe marki i paid social",
          },
          {
            id: "influencer-campaign",
            label: "Kampania Influencer",
            description: "Treści publikowane na własnych kanałach twórcy",
          },
        ],
        postingPlatforms: [
          { id: "instagram", label: "Instagram", icon: Instagram },
          { id: "tiktok", label: "TikTok", icon: Music2 },
          { id: "youtube", label: "YouTube", icon: Youtube },
        ],
      }
    : {
        createCampaign: "Create your campaign",
        stepLabel: "Step",
        stepOf: "of",
        successBadge: "Campaign draft created",
        successTitle: "Your UGC Hits campaign is ready.",
        successDescription:
          "The flow now captures your campaign details, targeting, and creative direction in the same visual language as the UGC Hits landing page.",
        reviewAgain: "Review onboarding again",
        back: "Back",
        next: "Next",
        companySummary: "Company",
        campaignTypeSummary: "Campaign type",
        targetingSummary: "Targeting",
        companyDetails: "Company Details",
        companyDetailsDescription:
          "Tell us about your company. This section will be shown to creators on your campaign listing.",
        personalInfo: "Personal Info",
        personalInfoDescription:
          "This information is private and will not be shared with creators.",
        creatorPreferences: "Creator Preferences",
        creatorPreferencesDescription:
          "Shape the creator profile you want to attract. All preferences except ethnicity will be visible on your campaign listing.",
        deliverables: "Deliverables",
        deliverablesDescription:
          "Set the deliverables per creator. This information will be shown to creators on your campaign listing.",
        budget: "Budget",
        budgetDescription:
          "We vet for quality on both the creator and brand side, so campaigns with a base pay less than $25 are unlikely to get approved.",
        creativeDirection: "Creative Direction",
        creativeDirectionDescription:
          "Share examples of UGC or ads that match the style and quality you want, ideally from your own brand.",
        campaignDescription: "Campaign Description",
        campaignDescriptionDescription:
          "Share more about your company and the level of creative direction you will provide for this campaign.",
        companyName: "Company Name",
        companyWebsite: "Company Website",
        socials: "Socials",
        productType: "Product Type",
        companyLogo: "Company Logo",
        yourName: "Your Name",
        yourRole: "Your Role",
        heardAbout: "How did you hear about UGC Hits?",
        creatorSlots: "How many spots are available?",
        creatorNiche: "Creator niche",
        creatorLocation: "Creator Location",
        creatorAgeRange: "Creator Age Range",
        creatorGender: "Creator Gender",
        creatorEthnicity: "Creator Ethnicity",
        campaignType: "Campaign type",
        campaignFrequency: "Campaign frequency",
        uniquePosts: "Unique posts to create per creator",
        postingTo: "Posting to (select all that apply)",
        minimumFollowers: "Minimum creator follower count (across platforms)",
        paidUsage: "Do you need paid usage rights?",
        includesPaidUsage: "Includes paid usage",
        basePayPerPost: "Base Pay Per Post",
        minLabel: "Min ($)",
        maxLabel: "Max ($)",
        contentInspiration: "Content Inspiration",
        campaignBrief: "Campaign Brief",
        anyCountry: "Any country",
        usOnly: "United States only",
        tierOneCountries:
          "United States, Canada, United Kingdom, Australia, or New Zealand",
        selectUpToThree: "Select up to 3.",
        leaveBlank: "Leave blank for no preference.",
        ethnicityHelper:
          "Not shown on your campaign listing. Leave blank for no preference.",
        socialsHelper:
          "At least one is required. Founder's socials is also acceptable.",
        budgetHelper: "Enter the budget range you are willing to pay per post.",
        budgetNote:
          "Budget will not be shown to creators for influencer marketing campaigns. This information is for internal use and matching.",
        creatorFiltersWarning:
          "Creators must match your location, gender, and ethnicity selections to see your campaign. Niche and age are used to improve relevance, but do not restrict visibility. The more filters you apply, the fewer applicants you will receive.",
        logoHelper: "PNG or JPG is enough for this onboarding mock flow.",
        uploadLogo: "Upload your company logo",
        heardAboutPlaceholder: "Where did you hear about UGC Hits?",
        namePlaceholder: "First and last name",
        websitePlaceholder: "example.com",
        instagramPlaceholder: "Instagram handle or URL",
        tiktokPlaceholder: "TikTok handle or URL",
        uniquePostsPlaceholder: "e.g. 4",
        budgetMinPlaceholder: "100",
        budgetMaxPlaceholder: "150",
        inspirationPlaceholder: "https://...",
        campaignBriefPlaceholder: "Write a detailed description of your company and campaign",
        submitting: "Saving campaign...",
        reviewCampaign: "Review campaign again",
        companyNameRequired: "Company name is required.",
        companyWebsiteRequired: "Company website is required.",
        socialRequired: "Add at least one social profile.",
        productTypeRequired: "Product type is required.",
        companyLogoRequired: "Company logo is required.",
        contactNameRequired: "Your name is required.",
        roleRequired: "Select your role.",
        referralRequired: "Tell us how you heard about UGC Hits.",
        creatorSlotsRequired: "Choose how many spots are available.",
        creatorNicheRequired: "Select at least one creator niche.",
        campaignTypeRequired: "Choose a campaign type.",
        campaignFrequencyRequired: "Choose a campaign frequency.",
        uniquePostsRequired: "Enter how many unique posts each creator should make.",
        postingPlatformsRequired: "Select at least one posting platform.",
        minimumFollowersRequired: "Choose a minimum creator follower count.",
        budgetMinRequired: "Enter a minimum budget.",
        budgetMaxRequired: "Enter a maximum budget.",
        inspirationRequired: "Add at least one inspiration link.",
        campaignDescriptionRequired: "Campaign description is required.",
        roleOptions,
        creatorLocationOptions,
        creatorGenderOptions,
        creatorEthnicityOptions,
        campaignFrequencyOptions,
        campaignTypes,
        postingPlatforms,
      };
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BrandOnboardingForm>(() =>
    createInitialFormState(initialValues),
  );
  const [errors, setErrors] = useState<ErrorState>({});
  const fileInputId = useId();

  const localizedSteps = isPolish
    ? [
        {
          ...steps[0],
          kicker: "Krok 1",
          title: "Dane Firmy",
          description:
            "Opowiedz o swojej firmie. Ta sekcja będzie widoczna dla twórców na stronie kampanii.",
          highlights: [
            "Nazwa firmy",
            "Strona internetowa",
            "Instagram lub TikTok",
            "Typ produktu",
            "Logo firmy",
          ],
        },
        {
          ...steps[1],
          kicker: "Krok 2",
          title: "Informacje Prywatne",
          description:
            "Te informacje są prywatne i nie będą udostępniane twórcom.",
          highlights: ["Imię i nazwisko", "Twoja rola", "Skąd nas znasz"],
        },
        {
          ...steps[2],
          kicker: "Krok 3",
          title: "Preferencje Twórców",
          description:
            "Określ profil twórców, których chcesz przyciągnąć, bez zamykania zbyt dużej części puli.",
          highlights: [
            "Liczba miejsc",
            "Nisza twórcy",
            "Lokalizacja",
            "Wiek, płeć i etniczność",
          ],
        },
        {
          ...steps[3],
          kicker: "Krok 4",
          title: "Deliverables",
          description:
            "Wybierz typ kampanii i ustaw oczekiwania, które twórcy od razu zrozumieją.",
          highlights: ["Program UGC", "Kampania Paid Ads", "Kampania Influencer"],
        },
        {
          ...steps[4],
          kicker: "Krok 5",
          title: "Budżet",
          description:
            "Ustal bazowy zakres stawek, jaki chcesz zaoferować za każdy materiał.",
          highlights: ["Minimalna stawka", "Maksymalna stawka", "Wewnętrzna notatka o budżecie"],
        },
        {
          ...steps[5],
          kicker: "Krok 6",
          title: "Kierunek Kreatywny",
          description:
            "Pokaż przykłady, które sygnalizują styl, poziom i energię treści, jakiej oczekujesz.",
          highlights: ["Link referencyjny 1", "Link referencyjny 2", "Link referencyjny 3"],
        },
        {
          ...steps[6],
          kicker: "Krok 7",
          title: "Opis Kampanii",
          description:
            "Opisz firmę i poziom kierunku kreatywnego, aby przyciągnąć odpowiednich kandydatów.",
          highlights: ["Brief kampanii", "Poziom guidance", "Limit 2000 znaków"],
        },
      ]
    : steps;
  const progress = ((currentStep + 1) / localizedSteps.length) * 100;
  const currentConfig = localizedSteps[currentStep];

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

  function togglePostingPlatform(value: string) {
    const nextPlatforms = formData.postingPlatforms.includes(value)
      ? formData.postingPlatforms.filter((item) => item !== value)
      : [...formData.postingPlatforms, value];

    updateField("postingPlatforms", nextPlatforms);
  }

  function validateStep(stepIndex: number) {
    const nextErrors: ErrorState = {};

    if (stepIndex === 0) {
      if (!formData.companyName.trim()) {
        nextErrors.companyName = copy.companyNameRequired;
      }
      if (!formData.companyWebsite.trim()) {
        nextErrors.companyWebsite = copy.companyWebsiteRequired;
      }
      if (!formData.instagram.trim() && !formData.tiktok.trim()) {
        nextErrors.instagram = copy.socialRequired;
      }
      if (!formData.productType.trim()) {
        nextErrors.productType = copy.productTypeRequired;
      }
      if (!formData.companyLogoName.trim()) {
        nextErrors.companyLogoName = copy.companyLogoRequired;
      }
    }

    if (stepIndex === 1) {
      if (!formData.contactName.trim()) {
        nextErrors.contactName = copy.contactNameRequired;
      }
      if (!formData.role.trim()) {
        nextErrors.role = copy.roleRequired;
      }
      if (!formData.referralSource.trim()) {
        nextErrors.referralSource = copy.referralRequired;
      }
    }

    if (stepIndex === 2) {
      if (!formData.creatorSlots.trim()) {
        nextErrors.creatorSlots = copy.creatorSlotsRequired;
      }
      if (formData.creatorNiches.length === 0) {
        nextErrors.creatorNiches = copy.creatorNicheRequired;
      }
    }

    if (stepIndex === 3) {
      if (!formData.campaignType.trim()) {
        nextErrors.campaignType = copy.campaignTypeRequired;
      }
      if (!formData.uniquePosts.trim()) {
        nextErrors.uniquePosts = "Enter how many unique posts each creator should make.";
      }
      if (
        (formData.campaignType === "ugc-program" ||
          formData.campaignType === "paid-ads") &&
        !formData.campaignFrequency.trim()
      ) {
        nextErrors.campaignFrequency = copy.campaignFrequencyRequired;
      }
      if (
        (formData.campaignType === "ugc-program" ||
          formData.campaignType === "influencer-campaign") &&
        formData.postingPlatforms.length === 0
      ) {
        nextErrors.postingPlatforms = copy.postingPlatformsRequired;
      }
      if (
        formData.campaignType === "influencer-campaign" &&
        !formData.minimumFollowerCount.trim()
      ) {
        nextErrors.minimumFollowerCount = copy.minimumFollowersRequired;
      }
      if (!formData.uniquePosts.trim()) {
        nextErrors.uniquePosts = copy.uniquePostsRequired;
      }
    }

    if (stepIndex === 4) {
      if (!formData.budgetMin.trim()) {
        nextErrors.budgetMin = copy.budgetMinRequired;
      }
      if (!formData.budgetMax.trim()) {
        nextErrors.budgetMax = copy.budgetMaxRequired;
      }
    }

    if (
      stepIndex === 5 &&
      formData.inspirationLinks.every((link) => !link.trim())
    ) {
      nextErrors.inspirationLinks = copy.inspirationRequired;
    }

    if (stepIndex === 6 && !formData.campaignDescription.trim()) {
      nextErrors.campaignDescription = copy.campaignDescriptionRequired;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(currentStep)) {
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

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-10">
      <div className="absolute left-[-6rem] top-20 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
      <div className="absolute right-[-4rem] top-14 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="mx-auto max-w-5xl">
        <form
          action={saveBrandOnboardingAction}
          onSubmit={(event) => {
            if (currentStep !== localizedSteps.length - 1) {
              event.preventDefault();
              handleNext();
              return;
            }

            if (!validateStep(currentStep)) {
              event.preventDefault();
            }
          }}
          className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.9))] p-5 shadow-[0_26px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8"
        >
          <FormHiddenInputs locale={locale} formData={formData} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                {copy.createCampaign}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                {currentConfig.title}
              </h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {copy.stepLabel} {currentStep + 1} {copy.stepOf} {localizedSteps.length}
            </p>
          </div>

          {/* <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {localizedSteps.map((step, index) => {
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
                          {copy.stepLabel} {index + 1}
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
                        {copy.companyDetails}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.companyDetailsDescription}
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.companyName}</FieldLabel>
                      <TextInput
                        value={formData.companyName}
                        onChange={(value) => updateField("companyName", value)}
                        placeholder={copy.companyName}
                        error={errors.companyName}
                      />
                      <FieldError message={errors.companyName} />
                    </div>

                    <div>
                      <FieldLabel required>{copy.companyWebsite}</FieldLabel>
                      <TextInput
                        value={formData.companyWebsite}
                        onChange={(value) => updateField("companyWebsite", value)}
                        placeholder={copy.websitePlaceholder}
                        error={errors.companyWebsite}
                        type="url"
                      />
                      <FieldError message={errors.companyWebsite} />
                    </div>

                    <div>
                      <FieldLabel required>{copy.socials}</FieldLabel>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <TextInput
                            value={formData.instagram}
                            onChange={(value) => updateField("instagram", value)}
                            placeholder={copy.instagramPlaceholder}
                            error={errors.instagram}
                          />
                        </div>
                        <div>
                          <TextInput
                            value={formData.tiktok}
                            onChange={(value) => updateField("tiktok", value)}
                            placeholder={copy.tiktokPlaceholder}
                            error={errors.instagram}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {copy.socialsHelper}
                      </p>
                      <FieldError message={errors.instagram} />
                    </div>

                    <div>
                      <FieldLabel required>{copy.productType}</FieldLabel>
                      <SelectInput
                        value={formData.productType}
                        onChange={(value) => updateField("productType", value)}
                        placeholder={copy.productType}
                        options={productTypeOptions}
                        error={errors.productType}
                      />
                      <FieldError message={errors.productType} />
                    </div>

                    <div>
                      <FieldLabel required>{copy.companyLogo}</FieldLabel>
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
                          {formData.companyLogoName || copy.uploadLogo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {copy.logoHelper}
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
                        {copy.personalInfo}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.personalInfoDescription}
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.yourName}</FieldLabel>
                      <TextInput
                        value={formData.contactName}
                        onChange={(value) => updateField("contactName", value)}
                        placeholder={copy.namePlaceholder}
                        error={errors.contactName}
                      />
                      <FieldError message={errors.contactName} />
                    </div>

                    <div>
                      <FieldLabel required>{copy.yourRole}</FieldLabel>
                      <div className="flex flex-wrap gap-3">
                        {copy.roleOptions.map((option) => (
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
                      <FieldLabel required>{copy.heardAbout}</FieldLabel>
                      <TextInput
                        value={formData.referralSource}
                        onChange={(value) => updateField("referralSource", value)}
                        placeholder={copy.heardAboutPlaceholder}
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
                        {copy.creatorPreferences}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.creatorPreferencesDescription}
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.creatorSlots}</FieldLabel>
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
                      <FieldLabel required>{copy.creatorNiche}</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">{copy.selectUpToThree}</p>
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
                      <FieldLabel>{copy.creatorLocation}</FieldLabel>
                      <div className="space-y-3">
                        {copy.creatorLocationOptions.map((option) => (
                          <ChoiceRow
                            key={option}
                            label={option}
                            selected={formData.creatorLocation === option}
                            onClick={() => updateField("creatorLocation", option)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>{copy.creatorAgeRange}</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        {copy.leaveBlank}
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
                      <FieldLabel>{copy.creatorGender}</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        {copy.leaveBlank}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {copy.creatorGenderOptions.map((option) => (
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
                      <FieldLabel>{copy.creatorEthnicity}</FieldLabel>
                      <p className="mb-3 text-sm text-slate-500">
                        {copy.ethnicityHelper}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {copy.creatorEthnicityOptions.map((option) => (
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
                      {copy.creatorFiltersWarning}
                    </div>
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {copy.deliverables}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.deliverablesDescription}
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.campaignType}</FieldLabel>
                      <div className="space-y-4">
                        {copy.campaignTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => updateField("campaignType", type.id)}
                            className={cn(
                              "w-full rounded-[1.4rem] border px-5 py-5 text-left transition-all shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                              formData.campaignType === type.id
                                ? "border-teal-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.98),rgba(233,250,247,0.95))] text-slate-950 shadow-[0_16px_34px_rgba(13,148,136,0.10)]"
                                : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.94))] text-slate-700 hover:border-slate-400 hover:bg-white",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                                formData.campaignType === type.id
                                  ? "border border-teal-200 bg-white/80 text-slate-950"
                                  : "border border-slate-200 bg-white/90 text-slate-700",
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

                    {(formData.campaignType === "ugc-program" ||
                      formData.campaignType === "paid-ads") ? (
                      <div>
                        <FieldLabel required>{copy.campaignFrequency}</FieldLabel>
                        <div className="space-y-3">
                          {copy.campaignFrequencyOptions
                            .filter((option) =>
                              formData.campaignType === "ugc-program"
                                ? option !== (isPolish ? "Jednorazowo" : "One Time")
                                : true,
                            )
                            .map((option) => (
                              <ChoiceRow
                                key={option}
                                label={option}
                                selected={formData.campaignFrequency === option}
                                onClick={() => updateField("campaignFrequency", option)}
                              />
                            ))}
                        </div>
                        <FieldError message={errors.campaignFrequency} />
                      </div>
                    ) : null}

                    <div>
                      <FieldLabel required>{copy.uniquePosts}</FieldLabel>
                      <TextInput
                        value={formData.uniquePosts}
                        onChange={(value) => updateField("uniquePosts", value)}
                        placeholder={copy.uniquePostsPlaceholder}
                        error={errors.uniquePosts}
                        type="number"
                      />
                      <FieldError message={errors.uniquePosts} />
                    </div>

                    {(formData.campaignType === "ugc-program" ||
                      formData.campaignType === "influencer-campaign") ? (
                      <div>
                        <FieldLabel required>{copy.postingTo}</FieldLabel>
                        <div className="flex flex-wrap gap-3">
                          {copy.postingPlatforms.map((platform) => (
                            <PlatformChip
                              key={platform.id}
                              label={platform.label}
                              icon={platform.icon}
                              selected={formData.postingPlatforms.includes(platform.id)}
                              onClick={() => togglePostingPlatform(platform.id)}
                            />
                          ))}
                        </div>
                        <FieldError message={errors.postingPlatforms} />
                      </div>
                    ) : null}

                    {formData.campaignType === "influencer-campaign" ? (
                      <>
                        <div>
                          <FieldLabel required>{copy.minimumFollowers}</FieldLabel>
                          <div className="space-y-3">
                            {minimumFollowerOptions.map((option) => (
                              <ChoiceRow
                                key={option}
                                label={option}
                                selected={formData.minimumFollowerCount === option}
                                onClick={() =>
                                  updateField("minimumFollowerCount", option)
                                }
                              />
                            ))}
                          </div>
                          <FieldError message={errors.minimumFollowerCount} />
                        </div>

                        <div>
                          <FieldLabel>{copy.paidUsage}</FieldLabel>
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                "includesPaidUsage",
                                !formData.includesPaidUsage,
                              )
                            }
                            className={cn(
                              "flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-left transition-colors",
                              selectionSurface(formData.includesPaidUsage),
                            )}
                          >
                            <span
                              className={cn(
                                "size-4 rounded-sm border transition-colors",
                                formData.includesPaidUsage
                                  ? "border-teal-500 bg-teal-500/85"
                                  : "border-slate-300 bg-white",
                              )}
                            />
                            <span className="text-sm font-medium">
                              {copy.includesPaidUsage}
                            </span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {copy.budget}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.budgetDescription}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-[1.2rem] border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
                      <Info className="mt-0.5 size-5 shrink-0" />
                      <p>{copy.budgetNote}</p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.basePayPerPost}</FieldLabel>
                      <p className="mb-4 text-sm text-slate-500">
                        {copy.budgetHelper}
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <FieldLabel required>{copy.minLabel}</FieldLabel>
                          <TextInput
                            value={formData.budgetMin}
                            onChange={(value) => updateField("budgetMin", value)}
                            placeholder={copy.budgetMinPlaceholder}
                            error={errors.budgetMin}
                            type="number"
                          />
                          <FieldError message={errors.budgetMin} />
                        </div>
                        <div>
                          <FieldLabel required>{copy.maxLabel}</FieldLabel>
                          <TextInput
                            value={formData.budgetMax}
                            onChange={(value) => updateField("budgetMax", value)}
                            placeholder={copy.budgetMaxPlaceholder}
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
                        {copy.creativeDirection}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.creativeDirectionDescription}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <FieldLabel required>{copy.contentInspiration}</FieldLabel>
                      {formData.inspirationLinks.map((link, index) => (
                        <TextInput
                          key={`inspiration-${index + 1}`}
                          value={link}
                          onChange={(value) => updateInspirationLink(index, value)}
                          placeholder={copy.inspirationPlaceholder}
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
                        {copy.campaignDescription}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {copy.campaignDescriptionDescription}
                      </p>
                    </div>

                    <div>
                      <FieldLabel required>{copy.campaignBrief}</FieldLabel>
                      <textarea
                        value={formData.campaignDescription}
                        onChange={(event) =>
                          updateField(
                            "campaignDescription",
                            event.target.value.slice(0, 2000),
                          )
                        }
                        placeholder={copy.campaignBriefPlaceholder}
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
              {copy.back}
            </button>
            {currentStep === localizedSteps.length - 1 ? (
              <FinalSubmitButton label={copy.createCampaign} pendingLabel={copy.submitting} />
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[1rem] bg-slate-950 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-800"
              >
                {copy.next}
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
