# Enterprise Dashboard UI Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the enterprise campaign workflow and role dashboards easier to navigate, with clean top-tab workflow sections and proper admin/creator sidebars.

**Architecture:** Replace standalone admin/creator dashboard pages with role-specific dashboard shells that mirror the existing brand sidebar pattern. Reorganize enterprise campaign detail into top tabs so admins work on one workflow area at a time. Keep existing Supabase workflow/RPC behavior; this is a UI/navigation cleanup plus one admin convenience flow for creating a base campaign before upgrading it to enterprise.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, lucide-react, existing Supabase server actions/view models.

---

## Summary

The UI should stop feeling like one long operational form. Admins should see a clear sidebar with internal tools, and enterprise campaign detail should use top tabs: `Overview`, `Plan`, `Creators`, `Offers`, `Brief`, `Deliverables`, `Payouts`, `Agents`, `Activity`. Creators should get their own dashboard shell with sidebar links for normal dashboard, enterprise offers, messages, account, and support.

## Key Changes

- Add shared role-dashboard shell infrastructure based on the existing brand shell, then instantiate:
  - Admin sidebar: `Creator invites`, `Manual matching`, `Enterprise campaigns`, `Account`.
  - Creator sidebar: `Dashboard`, `Enterprise offers`, `Messages`, `Account`, `Support`.
  - Preserve mobile nav behavior equivalent to the brand shell.
- Add admin and creator layouts:
  - Admin routes under `/[locale]/admin/*` use the admin shell.
  - Creator routes under `/[locale]/dashboard/creator/*` use the creator shell.
  - Remove repeated sign-out/action link clusters from individual admin and creator pages once they live in the shell.
- Rework enterprise campaign detail into top-tab sections:
  - Tabs are URL-addressable using a `tab` search param.
  - Default tab is `Overview`.
  - Each tab shows only its relevant controls and a compact "next required action" banner.
  - Disable or explain invalid actions instead of letting users hit database gate errors.
- Clean up workflow copy and control states:
  - `proposed` creators appear in Creators only.
  - Offers dropdown only shows offer-eligible creators: `shortlisted`, `offered`, `accepted`, `change_requested`.
  - Plan, shortlist, offer, brief, deliverable, and payout approval buttons are never nested inside other forms.
  - Empty states explain the exact next step in plain language.
- Improve Enterprise Campaigns list page:
  - Keep existing "upgrade existing campaign" selector.
  - Add an inline "Create new campaign" admin form with minimal fields: brand, title, description, product type, budget, creator slots.
  - After creation, immediately create or route into the enterprise upgrade flow.
  - Keep this admin-only; do not change brand onboarding.
- Add placeholder pages where needed:
  - Admin account page.
  - Creator account page.
  - Creator support page.
  - Creator messages landing page that links to existing conversation detail pages or shows an empty state if no conversations are available.

## Test Plan

- Add platform/UI view-model tests for:
  - Admin sidebar nav items and active hrefs.
  - Creator sidebar nav items and active hrefs.
  - Enterprise tab selection defaults to `Overview` and accepts known tab keys.
  - Invalid enterprise actions show explanatory disabled/blocked UI states.
  - Creating a base campaign from the enterprise page calls the expected server action shape.
- Run:
  - `npm run test:platform`
  - `npm run lint`
  - `npm run build`
- Manual QA:
  - Log in as admin and confirm sidebar appears on invites, manual matching, enterprise list, enterprise detail, and account.
  - Log in as creator and confirm sidebar appears on dashboard, enterprise offers, messages, account, and support.
  - On enterprise detail, move through the full workflow using tabs without nested form console errors.
  - Confirm multi-creator shortlist and offer drafting remain usable.

## Assumptions

- Use top tabs for the enterprise workflow, per user preference.
- Add inline admin campaign creation on the Enterprise Campaigns page, per user preference.
- Do not redesign the brand sidebar beyond extracting/reusing patterns needed for admin and creator shells.
- Do not change enterprise workflow business rules or Supabase approval gates unless a UI state exposes an existing bug.
- Admin sidebar keeps `Creator invites` because it is an existing admin tool, even though the requested emphasis is manual matching, enterprise campaigns, and account.
