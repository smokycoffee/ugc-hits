# Mobile Navbar Locale Design

## Goal

Show the `PL/EN` language switcher in the mobile navbar immediately to the left of the primary CTA, while shortening the mobile CTA label without changing desktop or hero copy.

## Scope

- Modify only `src/components/ui/navbar-menu.tsx`
- Keep desktop navbar behavior unchanged
- Keep hero CTA copy unchanged
- Keep locale messages unchanged

## Decision

- Add a mobile-only locale switcher next to the CTA in the navbar controls
- Keep the existing desktop locale switcher under `md`
- Render a mobile-only CTA label of `Post Campaign` for English
- Keep the Polish mobile CTA label as `Dodaj kampanię`

## Verification

- Add a regression check for the mobile locale switcher and mobile-only CTA label
- Run `node tests/mobile-navbar-check.mjs`
- Run `npm run lint`
