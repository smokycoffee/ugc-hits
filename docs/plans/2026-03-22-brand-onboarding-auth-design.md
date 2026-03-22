# Brand Onboarding Auth Flow Design

## Goal

Change the brand acquisition flow to send qualified brand leads through login before onboarding, require authentication for onboarding, persist the onboarding form into Supabase, and make the brand dashboard feature the saved campaign instead of showing a duplicate create form.

## Scope

- Route brand leads from localized `get-started` to localized `login`
- Preserve `companyName` and `productType` through auth and into onboarding
- Make `/[locale]/onboarding-brand` require a logged-in brand session
- Save onboarding data into the brand and campaign records
- Redirect successful onboarding submissions to `/[locale]/dashboard/brand`
- Replace the dashboard create form with a primary campaign overview
- Keep creator invite auth and creator dashboard behavior unchanged

## Decisions

- Use localized `next` paths rather than temporary client storage so brand onboarding state survives both magic-link and Google auth
- Treat onboarding as the manager for one primary brand campaign; update that record on repeat submissions instead of creating duplicates
- Extend `campaigns` with onboarding-specific fields and add a single `is_primary` flag per brand
- Keep the dashboard’s applicants, notifications, and realtime sections intact while changing only the primary campaign section

## Data Notes

- `brands` remains the canonical brand profile record for company identity fields
- `campaigns` stores the onboarding campaign detail and targeting fields needed for dashboard rendering
- Existing brands with campaigns are backfilled so their latest campaign becomes the primary campaign

## Verification

- Add failing tests for onboarding path helpers and auth redirect behavior
- Update static flow checks for `get-started`, `login`, `onboarding-brand`, and `dashboard/brand`
- Run `npm run test:platform`
- Run targeted source checks
- Run `npm run lint`
- Run `npm run build`
