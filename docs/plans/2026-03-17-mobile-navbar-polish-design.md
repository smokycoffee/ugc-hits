# Mobile Navbar Polish Design

## Goal

Improve the mobile navbar so it feels deliberate and balanced instead of cramped while preserving the fixed locale switcher, fixed primary CTA, and burger-triggered section menu.

## Visual Direction

The mobile header should feel compact and refined rather than dense. The top row keeps all critical controls visible, but each control gets a clearer role:

- the brand remains left-aligned and prominent
- the locale switcher becomes a tighter utility pill
- the CTA uses a shorter mobile label so it reads quickly
- the burger becomes a lighter utility control instead of competing with the CTA

The expanded menu becomes a soft dropdown card under the top row with larger tap targets, better spacing, and cleaner grouping than the current wrapped pills.

## Behavior

- Desktop header stays unchanged.
- Mobile CTA label changes from `Post Your Campaign` to `Post Campaign`.
- Mobile nav links stay hidden until the burger is opened.
- The locale switcher remains visible in the top row and never moves into the expanded menu.

## Verification

- Update the regression check to assert the mobile CTA short label and the controlled mobile panel.
- Run `node tests/mobile-navbar-check.mjs`.
- Run `npm run lint`.
