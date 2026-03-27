# Pricing CTA Routing Design

**Goal:** Make the self-serve homepage pricing CTA navigate to the locale-aware brand get-started route while leaving the managed support CTA unchanged.

## Approach

- Keep navigation decisions in the landing content layer so locale-aware URLs are generated once in `getLandingContent`.
- Add an optional `href` to pricing plans and assign it only to the first, self-serve plan.
- Update the pricing card UI to render a link-styled CTA when an `href` exists and preserve the current button presentation otherwise.

## Notes

- Polish should navigate to `/get-started`.
- English should navigate to `/en/get-started`.
- Managed support remains non-navigating for now.
