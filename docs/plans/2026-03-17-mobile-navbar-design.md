# Mobile Navbar Burger Design

## Goal

Make the landing page header usable on mobile by keeping the locale switcher visible in the top row and moving the section links behind a burger-triggered expandable panel.

## Decision

- Desktop navigation remains unchanged.
- Mobile top row order becomes brand, locale switcher, primary CTA, burger toggle.
- The `PL/EN` switcher stays visible in the header and sits immediately to the left of the CTA.
- The section tabs are hidden by default on mobile and appear in an expandable panel when the burger button is pressed.

## Interaction

- The burger toggle uses an explicit open or closed state.
- The toggle exposes `aria-expanded` and `aria-controls`.
- The mobile panel appears directly below the top row with a light divider and the existing section links as pill buttons.

## Verification

- Add a regression check that confirms the navbar is a client component, includes a burger toggle, and keeps the language switcher outside the collapsible mobile panel.
- Run the targeted regression check and `npm run lint`.
