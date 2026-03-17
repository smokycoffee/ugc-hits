# UGC Hits I18n And Pricing Design

## Overview

`UGC Hits` will become a bilingual landing page with Polish as the default locale and English available as a secondary locale. The pricing on the homepage will move from `$299` to `399 PLN`, while keeping the one-time campaign listing fee model and the managed support option.

## Goals

- Make Polish the default public language at `/`
- Make English available at `/en`
- Keep the existing landing-page structure and design language
- Move homepage copy into locale-specific message files
- Add a lightweight language switcher in the header
- Update the self-serve plan to `399 PLN`

## Non-Goals

- No CMS or translation dashboard
- No automatic locale detection beyond route handling
- No onboarding flow implementation yet
- No deeper localization of currencies, dates, or forms beyond the homepage content

## Routing Model

- `/` serves Polish
- `/en` serves English
- Locale routing should use `next-intl` with App Router support
- Default locale must be unprefixed so Polish feels like the primary market

## Content Model

The existing hardcoded landing content should be replaced by locale messages:

- `messages/pl.json`
- `messages/en.json`

The messages should cover:

- nav
- hero
- process intro
- process steps
- matching section
- pricing section
- value props
- founder section
- FAQ
- footer

## Component Strategy

Components should remain mostly unchanged structurally. The main change is where content comes from:

- presentational sections continue to render the same layout
- all text and localized labels come from `next-intl`
- pricing values also come from the locale messages

## Language Switching

The header should expose a simple locale switcher:

- `PL`
- `EN`

It should preserve the current page path while switching locale where possible.

## Pricing Change

The self-serve plan should be:

- `399 PLN`
- one-time listing fee

The managed support plan should remain:

- custom pricing

## Implementation Notes

- Use `next-intl` routing with Polish as default locale
- Use unprefixed default routing
- Keep locale logic centralized in `src/i18n`
- Refactor the current `landing.ts` content model away or reduce it to non-translated structural metadata only

## Verification

The implementation should be verified with:

- `npm run lint`
- `npm run build`

The production build may require escalated execution in this environment due sandbox restrictions around Turbopack.
