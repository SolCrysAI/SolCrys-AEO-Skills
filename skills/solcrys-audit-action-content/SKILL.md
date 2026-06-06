---
name: solcrys-audit-action-content
description: Follow up on a content-audit recommendation from SolCrys and draft the concrete page fix — the JSON-LD/schema block, heading restructure, meta tags, or section rewrite the audit flagged — then hand the user the apply-and-verify loop so the re-audit can prove the score recovered. Pulls the promoted audit-action queue (solcrys_get_tasks, source_type="audit"), reads the full per-URL recommendation via solcrys_get_content_audit_report_detail (check_ids, points_recoverable, current_vs_update, code_examples), fetches the LIVE page so the "current" state is real not assumed, and produces a ready-to-apply remediation grounded in actual brand facts — never fabricated ratings/FAQs/schema. Use this skill whenever the user asks to "fix the page the audit flagged", "draft the schema/markup the content audit recommends", "remediate an audit finding", "implement a content-audit action", "apply the audit recommendation for URL X", "what do I change to recover the audit points", or any framing of *take a content-audit recommendation and produce the actual page fix*. This is the page-remediation sibling to solcrys-action-driven-content (which drafts net-new content for prompt gaps); use THIS one when the action came from a content audit (source_type="audit") and the work is fixing an existing URL.
---

# SolCrys Audit-Action Page Remediation

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md). It contains the four non-negotiable rules — data grounding, AEO goal alignment, fact-grounded writing, and Google AI anti-hack alignment. Rule 4 applies with special force here: content-audit findings often touch schema, headings, and metadata, and it is easy to slide from "make the page genuinely machine-readable" into "game the AI ranking." You produce the former, never the latter.**

You're closing the *impact* half of the content-audit loop. The audit already told the user, page-by-page, what's dragging each URL's AEO score down and how many points each fix recovers. Your job is to turn one of those recommendations into the **actual page change** — the schema block, the heading restructure, the meta tag, the section rewrite — grounded in what the page really says today and what the brand can truthfully claim. Then you hand off the verify loop: once the fix ships, the Action Hub re-audits the page and the Impact tab shows the score recovery (which checks now pass, points recovered).

**If you can't read the live page or can't truthfully ground a claim the fix would assert, you mark it `[FACT TO CONFIRM]` or drop it — you never invent FAQ answers, ratings, authors, or dates just to satisfy a schema check.** Honesty > a higher audit score.

## When this skill is active

The user wants the page fix for a content-audit recommendation — not an analysis of it, the actual change. The action came from a content audit (`source_type="audit"`), and the work is remediating an existing URL, not writing net-new content. (For net-new content against a prompt gap, use `solcrys-action-driven-content` instead.)

## Steps

### 1. Identify the workspace

Standard discovery (use the slug if supplied; otherwise `solcrys_list_workspaces`). If a fuzzy brand name could match multiple workspaces, **ask** rather than guess.

### 2. Build the candidate list

The pool defaults to **promoted audit actions** (the Action Hub). Widen to **un-promoted audit findings** only when the user asks for "all audit findings" / "everything from the audit" / names a finding not in the queue, or the promoted queue is empty.

**2A. Promoted audit actions (Action Hub).** Call `solcrys_get_tasks` with `status: "todo"`, `limit: 25`. Keep only rows where `source_type == "audit"` (these came from a content audit). The MCP task row gives you `source_id` (the **audit run id**), `target_url` (the page), `title`, and `description` (the audit promote builds it as `Recommendation: <title>` + `Evidence: <…>`). Note: `get_tasks` does **not** expose `source_metadata`, so the per-finding index is not available over MCP — you'll re-locate the finding inside the report by title/URL in step 4. Tag each `[PROMOTED]` (the row `id` is its identifier). If the user named a different source type, hand off to `solcrys-action-driven-content`.

**2B. Un-promoted audit findings (skip if 2A satisfied the ask).** Call `solcrys_get_content_audit_reports` (`status: "completed"`) to list recent audit runs, pick the relevant run(s) by `start_url` / recency, then call `solcrys_get_content_audit_report_detail` with that `auditRunId`. Each `report.actions[]` element is a finding: `title`, `impact`, `effort`, `points_recoverable`, `check_ids`, `why_it_matters`, `current_vs_update`, `code_examples`. **Dedup against 2A:** drop any finding whose `title` matches a `[PROMOTED]` task on the **same run** (`source_id` == this `auditRunId`) and same `target_url` — that one's already tracked. Tag survivors `[UNPROMOTED-AUDIT]` with synthetic id `audit:<runId8>:<index>` (index = its position in `report.actions[]`).

If the combined list is empty, tell the user — don't fabricate a finding.

### 3. Pick the finding

- **User-specified:** by id (`<uuid>` promoted, `audit:<runId8>:<idx>` un-promoted), title fragment, URL, or check (e.g. "the JSON-LD one"). If more than one matches, ask.
- **Highest-recovery pick:** sort by `points_recoverable` desc, then `impact` (high→low), then `effort` (low→high — cheap wins first). Take the top finding.

**Confirmation sentence.** Promoted: *"Picking audit action #[id]: '[title]' on [target_url] — recovers ~[points_recoverable] pts across checks [check_ids]. Reading the recommendation and the live page now."* Un-promoted: add *"⚠ This finding isn't tracked in the Action Hub yet — promote `audit:[runId8]:[idx]` from the dashboard's Content Audit view if you want the re-audit to track its score recovery. Proceeding to draft the fix."*

### 4. Read the full recommendation (data layer)

Get the exact finding from the audit report:

- If you don't already have it from 2B, call `solcrys_get_content_audit_report_detail` with the finding's `auditRunId` (= the promoted task's `source_id`). **Match the finding inside `report.actions[]` by title** (the task `title` is a shortened form of the action title) **and `target_url`** — the per-finding index isn't carried on the task, so match, don't index blindly. If no title matches cleanly, fall back to the task's own `description` (it already holds the recommendation + evidence) and use the report only for the surrounding page checks.
- Capture from the matched action: `check_ids` (the specific checks this fixes — e.g. `TC-01` JSON-LD present, `TC-03` FAQPage schema, `CQ-02` heading hierarchy, `DC-01` meta description), `points_recoverable`, `why_it_matters`, `current_vs_update` (the audit's read of current state → target), and `code_examples` (the audit's starting-point markup).
- Find the page in `report.pages[]` matching `target_url`; read its failing `checks[]` (the `evidence` field says *why* each check failed on this specific page). This is your spec.

### 5. Ground in the live page + real brand facts (fact-grounding layer)

**Non-skippable. The audit's `current_vs_update` and `code_examples` are templates, not facts about this page. Follow soul.md Rule 3.**

**A. Fetch the live page** (`target_url`, via WebFetch). Read what's actually there: existing headings, existing schema/JSON-LD, existing meta tags, the real author/date/product details, the real Q&A content if any. The fix must edit the *real* page, not the audit's assumed version. If you cannot fetch the page, say so and produce the fix as a template with `[CONFIRM AGAINST LIVE PAGE]` markers — do not assert a "current" state you didn't read.

**B. Ask the user once** for any brand facts the fix would assert that aren't on the live page:

> *"To fill the schema/markup truthfully I may need: the real author/byline, the genuine publish/update date, exact product name + price, and any real FAQ Q&As. Paste what you have — anything I can't verify I'll leave as a `[FACT TO CONFIRM]` placeholder rather than invent it."*

**C. Verify every value the markup would emit.** Schema is a truth contract with the engines: a `datePublished`, an `author`, a `price`, an `aggregateRating`, an FAQ answer that isn't real is a fabrication that can get the page penalized, not boosted. Each value comes from the live page, a user-supplied doc, or a placeholder.

### 6. Draft the fix (remediation mode)

Produce the concrete, apply-ready change for each `check_id` in the finding. Match the fix to the check:

| Check family | The fix to draft |
|---|---|
| `TC-01/02/04` JSON-LD / schema type / completeness | A complete `<script type="application/ld+json">` block of the **correct schema type for the page** (Article, Product, FAQPage, Organization…), every field filled from real values or a placeholder. |
| `TC-03` FAQPage schema | FAQPage JSON-LD **only if the page genuinely has Q&A content** — built from the page's real questions/answers. Never invent Q&As to add the schema (soul.md Rule 4). If no real Q&A exists, recommend adding genuine FAQ content first, as content not schema. |
| `CQ-02` heading hierarchy | The restructured H1→H2→H3 outline using the page's real section titles (one H1, logical nesting). |
| `CQ-03 / CQ-11` depth / definitions | The specific section/passage rewrite or addition, grounded in fetched facts. |
| `DC-01 / DC-12` meta description / title | The exact `<meta name="description">` / `<title>` text (within length limits), describing the real page. |
| `DC-04/05/06` Open Graph / canonical / publish date | The exact tags with real values. |

The drafted fix must:

- **Edit the real page.** Show `current` (what you read on the live page in 5A) vs `update_to` (the fix). If you couldn't fetch the page, mark current as `[CONFIRM AGAINST LIVE PAGE]`.
- **Emit only true values.** Every schema field / claim is a fetched value, a user-supplied value, or a `[FACT TO CONFIRM: …]` placeholder. No invented authors, dates, prices, ratings, reviews, or FAQ answers.
- **Pass the soul.md Rule 4 anti-hack check.** Legitimate: correct schema for content that exists, real headings, honest metadata. Forbidden: FAQ/question-H2 quotas, AI-only or fabricated schema, `llms.txt`, forced chunking "for the AI," inventing content to hit a check. The audit measures genuine machine-readability — recover the points by making the page genuinely better, not by gaming the check. Run the `editorial_standards_v1.md` §A grep on any prose you add.
- **Map each fix back to its check_id**, so the user (and the re-audit) can see which recovered point each change targets.

### 7. Output format

```markdown
# Page Fix: [target_url]

**Source action:** [PROMOTED #<uuid> | UNPROMOTED-AUDIT audit:<runId8>:<index>]
**Finding:** [title] — recovers ~[points_recoverable] pts
**Checks targeted:** [check_ids, with each check's human name]
**Live page fetched:** [yes — <url> | no — fix is a template, confirm against live page]
**Fact-grounding sources:** [live page / user docs / web search domains]

---

## Fixes (apply-ready)

### Fix 1 — [check_id] [check name]  (+[pts] pts)
**Why it failed:** [the audit's evidence for this page]
**Current (on the live page):** [what you read, or `[CONFIRM AGAINST LIVE PAGE]`]
**Change to:**
```[html/json]
[the exact markup / heading outline / meta tag — every value real or `[FACT TO CONFIRM]`]
```
**Where:** [where in the page this goes — e.g. "<head>", "replace the H1 block"]

### Fix 2 — [check_id] …
[…]

---

## Open `[FACT TO CONFIRM]` placeholders
- [every placeholder the user must resolve before shipping — author, date, price, real FAQ answers, etc.]

## Apply & verify (closing the loop)
1. Apply the fixes above to **[target_url]** and publish.
2. In the Action Hub, open this action → **Impact** tab. Publishing auto-triggers a re-audit; or click **Re-measure** once the change is live.
3. The score-recovery panel will show **before → after**, which of [check_ids] now pass, and the points recovered. If a check didn't recover, its evidence line tells you what's still missing.
   - **Lifecycle:** [PROMOTED → "tracked as #<uuid>; mark in_progress/in_review after handoff." | UNPROMOTED → "⚠ not tracked — promote `audit:<runId8>:<index>` from the Content Audit view first if you want the re-audit to record the recovery."]

## Why this recovers the points
[2-3 sentences: which checks were dragging the score, why these exact changes make the page genuinely more machine-readable/citable (not a ranking hack), and that the re-audit will confirm it.]
```

## What good looks like

- Every fix is apply-ready: an engineer/editor can paste the markup or follow the heading outline with no further interpretation.
- Every schema field and asserted claim is a real value, a user-supplied value, or an explicit `[FACT TO CONFIRM]` — never invented.
- The "current" state reflects the **fetched live page**, not the audit's assumed template.
- Each fix is mapped to its `check_id` and point value, so the re-audit's recovery is predictable.
- The apply-and-verify loop is spelled out, so the user knows the Impact tab will prove the recovery — and the skill never claims to have published anything.

## What to avoid

- **Don't invent values to satisfy a check.** No fabricated authors, dates, prices, ratings, reviews, or FAQ Q&As. A schema check passed with false data is a Rule-3 and Rule-4 violation, and can hurt the page.
- **Don't add FAQPage/Review/Rating schema for content the page doesn't have.** Recommend adding the real content first; schema describes reality.
- **Don't characterize the page's current state without fetching it.** If WebFetch fails, mark current as unconfirmed.
- **Don't frame fixes as AI-ranking hacks.** No `llms.txt`, AI-only schema, question-H2/FAQ quotas, forced chunking "for the AI." Make the page genuinely better; the audit measures that.
- **Don't auto-publish or auto-promote.** This skill drafts the fix and explains the verify loop. It has no write tools and must not claim to have applied, published, or promoted anything.
- **Don't silently widen to un-promoted findings.** Widen only on the explicit triggers in step 2, and say so once.
- See `../soul.md` for the full forbidden-phrase list — it applies to any prose you add to the page.
