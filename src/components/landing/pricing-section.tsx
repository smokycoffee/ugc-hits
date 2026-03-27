import { SectionHeading } from "@/components/landing/section-heading";
import { PricingCard } from "@/components/ui/pricing-card";
import type { LandingContent } from "@/lib/get-landing-content";

type PricingSectionProps = {
  pricing: LandingContent["pricing"];
};

export function PricingSection({ pricing }: PricingSectionProps) {

  return (
    <section id={pricing.id} className="scroll-mt-28 px-4 py-20 md:scroll-mt-32 md:px-6">
      <div className="mx-auto max-w-6xl space-y-12">
        <SectionHeading
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          description={pricing.description}
          align="center"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {pricing.plans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              cadence={plan.cadence}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              href={plan.href}
              featured={plan.featured}
              popularLabel={pricing.popularLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
