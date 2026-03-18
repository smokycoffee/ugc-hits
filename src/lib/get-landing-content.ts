import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  MessageSquareMore,
  Radar,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { loadMessages } from "@/i18n/messages";
import type { Messages } from "@/i18n/messages";
import type { AppLocale } from "@/i18n/routing";

export type LandingLink = {
  href: string;
  label: string;
};

export type LandingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type LandingContent = {
  brand: string;
  nav: LandingLink[];
  header: {
    primaryCta: LandingLink;
    secondaryCta: LandingLink;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: LandingLink;
    secondaryCta: LandingLink;
    supportingNote: string;
    proof: string[];
  };
  process: {
    intro: {
      id: string;
      eyebrow: string;
      title: string;
      description: string;
    };
    steps: Array<{
      step: string;
      title: string;
      description: string;
      bullets: string[];
    }>;
    matching: {
      eyebrow: string;
      title: string;
      description: string;
      signalLabel: string;
      tags: string[];
    };
  };
  pricing: {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    popularLabel: string;
    plans: Array<{
      name: string;
      price: string;
      cadence: string;
      description: string;
      features: string[];
      cta: string;
      featured: boolean;
    }>;
  };
  features: {
    id: string;
    eyebrow: string;
    title: string;
    items: LandingFeature[];
  };
  founder: {
    eyebrow: string;
    title: string;
    name: string;
    location: string;
    summary: string[];
    socials: string[];
  };
  faq: {
    id: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  footer: {
    columns: Array<{
      title: string;
      links: LandingLink[];
    }>;
    note: string;
    copyright: string;
  };
  stats: Array<{
    label: string;
    value: string;
  }>;
  creatorCards: Array<{
    name: string;
    role: string;
    tag: string;
    detail: string;
  }>;
  socialProof: string[];
  featureChips: Array<{ label: string }>;
  audienceRibbon: {
    title: string;
    icon: LucideIcon;
  };
  localeSwitcher: {
    pl: string;
    en: string;
  };
  getStarted: {
    segmentLabel: string;
    brand: {
      label: string;
      headlineLead: string;
      headlineAccent: string;
      description: string;
      benefits: Array<{
        title: string;
        description: string;
        icon: string;
      }>;
      card: {
        title: string;
        description: string;
        fields?: Array<{
          label: string;
          placeholder: string;
          type: "text" | "select";
          options?: string[];
        }>;
        primaryAction: string;
        secondaryPrefix?: string;
        secondaryAction?: string;
      };
    };
    creator: {
      label: string;
      headlineLead: string;
      headlineAccent: string;
      description: string;
      benefits: Array<{
        title: string;
        description: string;
        icon: string;
      }>;
      card: {
        title: string;
        description: string;
        fields?: Array<{
          label: string;
          placeholder: string;
          type: "text" | "select";
          options?: string[];
        }>;
        primaryAction: string;
        secondaryPrefix?: string;
        secondaryAction?: string;
      };
    };
  };
};

const featureIcons = [
  Radar,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  MessageSquareMore,
  Sparkles,
];

type LandingMessages = Messages["Landing"];

function normalizeGetStartedBrand(
  audience: LandingMessages["getStarted"]["brand"],
): LandingContent["getStarted"]["brand"] {
  return {
    ...audience,
    card: {
      ...audience.card,
      fields: audience.card.fields?.map((field) => ({
        ...field,
        type: (field.type === "select" ? "select" : "text") as
          | "text"
          | "select",
      })),
    },
  };
}

function normalizeGetStartedCreator(
  audience: LandingMessages["getStarted"]["creator"],
): LandingContent["getStarted"]["creator"] {
  return audience;
}

function getLocaleBasePath(locale: AppLocale) {
  return `/${locale}`;
}

function getSectionHref(locale: AppLocale, hash: string) {
  return `${getLocaleBasePath(locale)}${hash}`;
}

export async function getLandingContent(
  locale: AppLocale,
): Promise<LandingContent> {
  const messages = await loadMessages(locale);
  const landing: LandingMessages = messages.Landing;
  const getStartedHref = `${getLocaleBasePath(locale)}/get-started`;

  return {
    brand: landing.brand,
    nav: [
      { href: getSectionHref(locale, "#process"), label: landing.nav.howItWorks },
      { href: getSectionHref(locale, "#pricing"), label: landing.nav.pricing },
      { href: getSectionHref(locale, "#proof"), label: landing.nav.why },
      { href: getSectionHref(locale, "#faq"), label: landing.nav.faq },
    ],
    header: {
      primaryCta: {
        href: getSectionHref(locale, "#pricing"),
        label: landing.hero.primaryCta,
      },
      secondaryCta: {
        href: getStartedHref,
        label: landing.nav.getStarted,
      },
    },
    hero: {
      eyebrow: landing.hero.eyebrow,
      title: landing.hero.title,
      description: landing.hero.description,
      primaryCta: {
        href: getSectionHref(locale, "#pricing"),
        label: landing.hero.primaryCta,
      },
      secondaryCta: {
        href: getSectionHref(locale, "#process"),
        label: landing.hero.secondaryCta,
      },
      supportingNote: landing.hero.supportingNote,
      proof: landing.hero.proof,
    },
    process: {
      intro: {
        id: "process",
        eyebrow: landing.process.intro.eyebrow,
        title: landing.process.intro.title,
        description: landing.process.intro.description,
      },
      steps: landing.process.steps,
      matching: {
        eyebrow: landing.process.matching.eyebrow,
        title: landing.process.matching.title,
        description: landing.process.matching.description,
        signalLabel: landing.process.matching.signalLabel,
        tags: landing.process.matching.tags,
      },
    },
    pricing: {
      id: "pricing",
      eyebrow: landing.pricing.eyebrow,
      title: landing.pricing.title,
      description: landing.pricing.description,
      popularLabel: landing.pricing.popular,
      plans: landing.pricing.plans.map((plan, index) => ({
        ...plan,
        featured: index === 0,
      })),
    },
    features: {
      id: "proof",
      eyebrow: landing.features.eyebrow,
      title: landing.features.title,
      items: landing.features.items.map((item, index) => ({
        ...item,
        icon: featureIcons[index] ?? Sparkles,
      })),
    },
    founder: landing.founder,
    faq: {
      id: "faq",
      title: landing.faq.title,
      items: landing.faq.items,
    },
    footer: {
      columns: [
        {
          title: landing.footer.platformTitle,
          links: [
            { href: getSectionHref(locale, "#process"), label: landing.footer.links.howItWorks },
            { href: getSectionHref(locale, "#pricing"), label: landing.footer.links.pricing },
            { href: getSectionHref(locale, "#faq"), label: landing.footer.links.faq },
          ],
        },
        {
          title: landing.footer.audienceTitle,
          links: [
            { href: getSectionHref(locale, "#pricing"), label: landing.footer.links.forBrands },
            { href: getSectionHref(locale, "#pricing"), label: landing.footer.links.managedSupport },
            { href: getSectionHref(locale, "#faq"), label: landing.footer.links.faq },
          ],
        },
      ],
      note: landing.footer.note,
      copyright: landing.footer.copyright,
    },
    stats: landing.stats,
    creatorCards: landing.creatorCards,
    socialProof: landing.socialProof,
    featureChips: landing.featureChips,
    audienceRibbon: {
      title: landing.audienceRibbon.title,
      icon: UsersRound,
    },
    localeSwitcher: messages.LocaleSwitcher,
    getStarted: {
      segmentLabel: landing.getStarted.segmentLabel,
      brand: normalizeGetStartedBrand(landing.getStarted.brand),
      creator: normalizeGetStartedCreator(landing.getStarted.creator),
    },
  };
}
