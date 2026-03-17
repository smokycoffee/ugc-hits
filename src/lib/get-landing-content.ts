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

export async function getLandingContent(
  locale: AppLocale,
): Promise<LandingContent> {
  const messages = await loadMessages(locale);
  const landing: LandingMessages = messages.Landing;

  return {
    brand: landing.brand,
    nav: [
      { href: "#process", label: landing.nav.howItWorks },
      { href: "#pricing", label: landing.nav.pricing },
      { href: "#proof", label: landing.nav.why },
      { href: "#faq", label: landing.nav.faq },
    ],
    hero: {
      eyebrow: landing.hero.eyebrow,
      title: landing.hero.title,
      description: landing.hero.description,
      primaryCta: { href: "#pricing", label: landing.hero.primaryCta },
      secondaryCta: { href: "#process", label: landing.hero.secondaryCta },
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
            { href: "#process", label: landing.footer.links.howItWorks },
            { href: "#pricing", label: landing.footer.links.pricing },
            { href: "#faq", label: landing.footer.links.faq },
          ],
        },
        {
          title: landing.footer.audienceTitle,
          links: [
            { href: "#pricing", label: landing.footer.links.forBrands },
            { href: "#pricing", label: landing.footer.links.managedSupport },
            { href: "#faq", label: landing.footer.links.faq },
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
  };
}
