# Anchor Offset Design

## Goal

Prevent the sticky navbar from overlapping the main section headings when users click the in-page navbar links.

## Scope

Apply the anchor offset only to the main navbar sections:

- `#process`
- `#pricing`
- `#proof`
- `#faq`

## Decision

Use per-section `scroll-margin-top` on the target `<section>` elements instead of modifying the link behavior. This keeps the fix local to the scrolled destinations, works with smooth scrolling, and avoids affecting unrelated anchors.

## Verification

- Add a regression check for the four section files.
- Run `node tests/anchor-offset-check.mjs`.
- Run `npm run lint`.
