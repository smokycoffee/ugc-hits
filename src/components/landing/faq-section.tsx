import type { LandingContent } from "@/lib/get-landing-content";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
type FaqSectionProps = {
  faq: LandingContent["faq"];
};

export function FaqSection({ faq }: FaqSectionProps) {
  return (
    <section id={faq.id} className="scroll-mt-5 px-4 py-20 md:scroll-mt-10 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {faq.title}
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          <Accordion defaultValue={faq.items[0] ? [faq.items[0].question] : []}>
            {faq.items.map((item) => (
              <AccordionItem key={item.question} value={item.question} className="mb-1">
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      </div>
    </section>
  );
}
