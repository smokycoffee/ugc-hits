# Get Started Flow Design

## Goal

Add a `Get Started` navbar button beside `Post Your Campaign` that opens a new localized page with a segmented control for `I'm a Brand` and `I'm a Creator`, while preserving the current landing-page visual language and reusing the same footer.

## Scope

- Update the shared navbar to render a secondary internal CTA
- Add a new localized `/get-started` page
- Reuse the landing header and footer chrome
- Keep the page body consistent with the current serif headlines, glass cards, rounded containers, and teal/sky accents
- Use the segmented control to switch on-page copy and CTA destination instead of navigating immediately

## Decision

- Keep `Post Your Campaign` as the primary dark CTA in the navbar
- Add `Get Started` as a lighter secondary pill immediately to its left
- Create a new localized route at `src/app/[locale]/get-started/page.tsx`
- Render a client-side segmented control that defaults to the brand view
- Use one content source for both locales so the page stays aligned with the existing message-driven architecture
- Send the brand CTA to `https://www.ugctank.com/brand-sign-up` and the creator CTA to `https://www.ugctank.com/apply`

## UX Notes

- The segmented control should switch headline, body copy, bullet points, and CTA label/link
- The page should feel like a continuation of the landing hero rather than a separate app surface
- Navigation links on the get-started page should point back to the localized landing-page sections instead of page-local hash targets

## Verification

- Add a static regression check for the navbar `Get Started` button and the new route/component files
- Run the targeted check
- Run `npm run lint`
