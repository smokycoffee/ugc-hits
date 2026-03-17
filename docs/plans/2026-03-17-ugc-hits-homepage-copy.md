# UGC Hits Homepage Copy Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace prototype homepage content with professional UGC Hits marketing copy aligned to a one-time campaign listing fee plus managed support model.

**Architecture:** Keep the existing landing-page structure and design system, but rewrite the content model in `src/content/landing.ts` so every section reflects a real product narrative. Make only minimal component edits where copy or labels need small structural support.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn-compatible component structure

---

### Task 1: Refresh the landing content model

**Files:**
- Modify: `src/content/landing.ts`

**Step 1: Rewrite hero, process, pricing, value props, founder, FAQ, and footer copy**

**Step 2: Keep the self-serve offer as a one-time listing fee and keep managed support alongside it**

**Step 3: Remove all prototype/dummy phrases**

### Task 2: Adjust components only where content needs support

**Files:**
- Modify: `src/components/landing/site-footer.tsx`
- Modify: `src/components/ui/pricing-card.tsx`

**Step 1: Ensure pricing and footer presentation fit the updated content**

**Step 2: Keep layout changes minimal and content-driven**

### Task 3: Verify the app still builds cleanly

**Files:**
- Modify as needed based on lint/build feedback

**Step 1: Run `npm run lint`**

**Step 2: Run `npm run build`**

**Step 3: Fix any issues and re-run verification**
