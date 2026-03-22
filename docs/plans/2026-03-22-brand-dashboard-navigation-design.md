# Brand Dashboard Navigation Design

## Goal

Reshape the brand dashboard into a routed workspace with a left navigation rail, a campaign list page, a campaign detail page, and placeholder pages for the remaining sections while preserving the current UGC Hits visual language.

## Scope

- Add a reusable brand dashboard shell with sidebar navigation
- Convert the current `/[locale]/dashboard/brand` entry into a routed dashboard section
- Create a campaigns index page with a review/next-steps panel and campaign cards
- Create a campaign detail page that follows the existing design system instead of duplicating the competitor styling
- Add placeholder `messages`, `applicants`, `accounts`, and `support` pages
- Keep mobile simple with a stacked navigation block above the content

## Decisions

- Use nested routes under `/[locale]/dashboard/brand` so campaign detail views can be linked directly
- Keep the current pale slate, teal, and sky palette rather than adding a dark sidebar taken from the reference
- Use the existing brand dashboard data source and shape missing campaign fields into UI-ready fallbacks
- Treat `campaigns` as the primary destination for the brand dashboard and redirect the bare brand route there
- Keep the non-campaign sections intentionally light for now, but make them real pages inside the same shell

## UX Notes

- The sidebar should feel operational and product-like, not marketing-like
- The campaigns page should increase information density from the current dashboard without losing the spacious card rhythm already used in the app
- The campaign detail page should mirror the reference’s hierarchy: status callout, back link, identity block, summary, deliverables, inspiration, and creator targeting
- All copy should use `UGC Hits` language instead of competitor text

## Data Notes

- `getBrandDashboard` already returns the profile, brand, primary campaign, additional campaigns, notifications, and applicants needed to populate the initial pages
- The new UI can render from `primaryCampaign` plus `campaigns`, combining them into one campaign collection for display
- Campaign fields that may be absent should render with presentable defaults rather than leaving sections empty or broken

## Verification

- Add a small test seam for the campaign/dashboard view model helpers
- Run `npm run test:platform`
- Run `npm run lint`
