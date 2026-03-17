import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn("space-y-4", centered && "text-center")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl",
          centered && "mx-auto",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-slate-600 md:text-lg",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
