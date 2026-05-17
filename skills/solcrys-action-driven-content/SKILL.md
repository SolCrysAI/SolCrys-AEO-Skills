---
name: solcrys-action-driven-content
description: Pull the workspace's open recommendation pool from SolCrys — by default the promoted Action Hub queue, widening to un-promoted deep-analysis recommendations when the user asks for "all recommendations" / "include un-promoted" / "everything in the workspace" or when the promoted queue is empty — pick one task (or the one the user names), research it against the underlying data and deep-analysis reasoning, web-search for the brand's verifiable facts and competitor content, and draft the actual web content the task recommends — blog post, landing page section, FAQ entry, or comparison piece. The deliverable is a publication-ready first draft grounded in real brand data and the AEO data — or an honest outline + fact checklist when the fact-grounding surface is incomplete. Use this skill whenever the user asks to "draft content from my action queue", "pick an action and write the content", "execute one of my AEO tasks", "write the blog post for task X", "draft the page based on the recommendation", or any framing of *take a recommended action and produce the actual deliverable*. Trigger even if the user just says "pick something from my SolCrys tasks and write it", "draft me content based on what SolCrys recommends", or "include un-promoted deep-analysis recommendations".
---

# SolCrys Action-Driven Content Creator

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md). It contains the four non-negotiable rules — data grounding, AEO goal alignment, fact-grounded writing, and Google AI anti-hack alignment. Rules 3 and 4 apply most strongly to this skill because it produces external-facing prose that may touch AEO/GEO and Google AI surfaces.**

You're closing the loop from *recommendation* to *deliverable*. SolCrys' action queue is full of "publish X" or "refresh Y" tasks — the user is asking you to *do one*. You'll research the task against:

1. The underlying SolCrys data (which prompts triggered the recommendation, what competitors are winning the citation slot, what the deep-analysis reasoning says).
2. The brand's verifiable facts (user-supplied docs, fetched owned-page content, web-searched public facts).
3. The competitor content being displaced (fetched, not inferred from titles).

Only then do you draft. **If the fact-grounding surface is incomplete, you output an outline + fact checklist instead of "publication-ready" copy** — that's a feature, not a failure. Honesty > polish.

## When this skill is active

The user wants the AI to act on one of SolCrys' recommended actions — not just analyze it, but produce the content.

## Steps

### 1. Identify the workspace

Standard discovery flow (use the slug if supplied; otherwise call `solcrys_list_workspaces`). If multiple workspaces could match a fuzzy brand name supplied by the user, **ask** rather than guess.

### 2. Build the candidate list

The candidate pool defaults to **promoted tasks only** (the Action Hub — what `solcrys_get_tasks` returns). It widens to include **un-promoted deep-analysis recommendations** when ANY of the following hold:

- The user asked for "all recommendations" / "include un-promoted" / "everything in the workspace" / any framing of *don't limit to the Action Hub*.
- The promoted queue (2A) is empty.
- The user named a specific recommendation that doesn't appear in the promoted queue.

**2A. Promoted tasks (Action Hub).** Call `solcrys_get_tasks` with `status: "todo"`, `limit: 25`. Apply `priority` / `category` filters if the user specified them. Tag each row `[PROMOTED]` in your internal candidate list (the row's `id` is its identifier).

**2B. Un-promoted deep-analysis recommendations (skip if 2A already satisfied the user's ask).** Call `solcrys_get_deep_analysis` with `status: "completed"`, `limit: 30`, and the same `timeRange` as 2A. For each returned analysis row:

- Parse `result.actions[]` from the row's `result` JSONB. Each element typically carries `title`, `rationale`, `content_type` ("create" | "fix"), `impact`, `gap_types`, `primary_engines`, `evidence_response_ids`, `evidence_citation_ids`, `related_prompt_ids`.
- **Dedup against 2A:** drop any candidate where some `[PROMOTED]` task `T` has `T.source_type == "deep_analysis"` AND `T.source_id == analysis.response_id` AND `T.source_metadata.action_item_index == index`. The promoted version is canonical — use that instead.
- Tag survivors `[UNPROMOTED-DEEP-ANALYSIS]` with synthetic id `da:<response_id_short8>:<index>` (e.g. `da:a3f02bd1:2`).

**Coverage caveat — surface to the user the first time 2B fires:** the MCP does not currently expose `prompt_deep_analysis_reports` (the newer per-prompt synthesis reports). Recommendations that live only there will not appear in 2B. If the user expects a specific recommendation that is missing, they may need to promote it from the dashboard, or wait for a future MCP tool that surfaces that table. State this once, then proceed.

If the combined candidate list is empty, tell the user — don't fabricate a task.

### 3. Pick the task

Four picking modes:

- **User-specified:** the user named a task by id (`<uuid>` for promoted, `da:<id8>:<idx>` for un-promoted), title fragment, or theme. If more than one candidate matches, ask before drafting.
- **Highest-impact pick (promoted only):** sort `[PROMOTED]` candidates by `priority` (high → low), then `due_date` ascending. Take the first content-producing task (action_type implies writing — `content_create`, `content_fix` whose title implies prose work — "publish_post", "refresh_page", "add_faq_entry"). Skip non-content tasks (schema-markup-only, robots.txt, technical SEO fixes).
- **Highest-impact pick across promoted + un-promoted** (only when 2B fired): rank `[PROMOTED]` first within the same priority tier; within `[UNPROMOTED-DEEP-ANALYSIS]` rank by `impact` (high → low — strings often come as "high"/"medium"/"low"). Same content-only filter.
- **User offered a category:** filter by category first, then highest-impact within it.

**When picking an `[UNPROMOTED-DEEP-ANALYSIS]` candidate, warn explicitly in the confirmation sentence:** *"Picking un-promoted recommendation `da:[id8]:[idx]` from deep-analysis report on prompt '[truncated prompt text]'. ⚠ No Action Hub record will track this work — recommend promoting from the dashboard before publishing if you want lifecycle tracking (status, assignment, publish_verified). Proceeding to research."*

For a promoted pick, the existing form: *"Picking task #[id]: '[title]' (priority: [high], category: [...]). Beginning research now."*

### 4. Research the task (data layer)

Gather the SolCrys-side context:

**A. The reasoning behind the task.** Branch by candidate origin:
- **`[PROMOTED]` with `source_type == "deep_analysis"`:** call `solcrys_get_deep_analysis` and find the record where `response_id == task.source_id`. Index into `result.actions[task.source_metadata.action_item_index]` for the originating recommendation; use the surrounding `result` (analysis-level fields like `brand_status`, `position`) and the picked `actions[i]` (`rationale`, `engine_reasoning`, `gap_types`, `primary_engines`, `evidence_response_ids`) for *why*.
- **`[PROMOTED]` with `source_type == "audit"` / `"manual"` / `"agent"` / `"system"`:** rely on the task's own `description` and `source_metadata` — there's no deep-analysis blob to fetch.
- **`[UNPROMOTED-DEEP-ANALYSIS]`:** you already have the recommendation in hand from step 2B. Reuse the same analysis record (don't re-fetch). Treat its `result.actions[index]` as the recommendation, and the surrounding `result` as the *why*.

**B. The prompt-level context.** Call `solcrys_get_prompts_insights` and find the prompt(s) the task references. Note: presence_pct, citation_pct, sentiment, top competitors, and the engines where presence is lowest.

**C. The competitive citation landscape.** Call `solcrys_get_citations` with `mentionsYou: false` and filters scoped to the relevant domain/engine. You'll get URLs — the actual content winning this slot today.

**D. The brand's owned-content footprint on this topic.** Call `solcrys_get_citations` with `owned: true`. List the brand's own URLs cited on similar prompts.

### 5. Research the task (fact-grounding layer)

**This step is non-skippable. If you skip it, you'll fabricate. Follow soul.md Rule 3.**

**A. Ask the user once:**

> *"Before I draft, do you have any of the following you can paste/upload? Product specs, pricing pages, brand messaging guidelines, recent press releases, customer quotes, or competitor analyses. These ground every specific number, spec, price, and claim in the draft. If nothing's available, I'll proceed but the draft will have `[FACT TO CONFIRM]` placeholders for anything I can't verify."*

Proceed regardless of the answer — the question is what gets asked. If they paste docs, use them as the primary fact source.

**B. Web-search the brand's public surface.** You need actual content, not URL titles:
- The brand's homepage and main product/service pages — for current positioning, taglines, product names, and headline claims.
- The owned URLs you saw in step 4D — to read what they actually say, so the new draft doesn't contradict existing content and can match brand voice. **Brand voice cannot be imitated without reading actual brand-written text.** If you cannot fetch any owned-content body, state "brand voice: insufficient data" in the editor notes and write in a neutral professional tone.
- Recent press / news about the brand — for any product launches, repositioning, or claims you might inadvertently contradict.

**C. Web-search the competitor URLs from step 4C.** Read their actual content, not just titles. The draft's differentiation strategy depends on what competitors *actually* say. **If you cannot fetch a competitor URL, do not characterize its content** — refer to it only by title and domain.

**D. Web-search any third-party facts** the draft will reference: industry stats, benchmarks, prevailing prices, public reviews. Capture the source domain — every cited stat needs an inline `(source: domain.com)` attribution.

**Decision gate at end of step 5:**

If after steps 5A-5D you have **fewer than half** the facts the draft would need (a typical comparison post needs at least 4-6 verified product claims, 2-3 competitor positioning facts, and any prices/specs called out) → **do NOT proceed to publication-ready drafting**. Instead, jump to step 7 (outline mode).

### 6. Draft the content (publication-ready mode)

You enter this step only when step 5 produced enough fact-grounding. Pick the format:

| Task action_type implies | Format to draft |
|---|---|
| Comparison post, "vs", listicle | Long-form blog post — length is whatever it takes to beat the top-cited competitor URL, not a fixed target |
| Landing page refresh, hero section | Landing page section (~400-600 words) |
| FAQ entry | Q&A block (1 question + 150-250 word answer) |
| Schema / structured-data add | Page-section rewrite optimized for AI citation |

The draft must:

- **Open with the search intent.** First paragraph mirrors the prompt language — if the gap prompt is "what's the best [product] for [use case]", the first ~50 words answer that directly.
- **Use reader-first structure.** Short paragraphs, clear H2/H3 hierarchy that names the real reader question, scannable bullets, explicit definitions before opinions. This structure helps both human readers and RAG-based engines (ChatGPT, Perplexity, Claude, Gemini grounding, retail RAG) lift clean passages. Do not frame the structure as a Google AI optimization tactic — soul.md Rule 4 prohibits that framing.
- **Cite every fact inline.** Specs, prices, benchmarks, dates, quotes — each gets one of: a brand-doc-derived value, a fetched-URL-derived value with `(source: domain.com)`, or a `[FACT TO CONFIRM: <what you need>]` placeholder. No value appears in the draft without one of those.
- **Position against fetched competitor content.** Only characterize a competitor article based on what you actually read in step 5C — not on what its URL/title suggests.
- **Match brand voice only if step 5B produced it.** Otherwise neutral professional tone + a flag in editor notes.
- **Pass the soul.md Rule 4 anti-hack check.** Do not recommend `llms.txt`, AI-only schema, forced chunking for Google, question-H2 quotas, FAQ-schema quotas, one-page-per-fan-out, inauthentic mentions, or guaranteed AI ranking. Refuting these patterns in the draft is fine; recommending them is a hard fail. Run the grep from `editorial_standards_v1.md` §A on your draft before declaring it ready.

### 7. Draft the content (outline mode — when facts are insufficient)

When step 5's decision gate flips this way, produce:

```markdown
# Outline + Fact Checklist: [Working title]

**Status:** Outline mode — too many facts unverified to safely produce publication-ready copy.

**Source task:** #[id] — [title]
**Candidate origin:** [PROMOTED #<action-uuid> | UNPROMOTED-DEEP-ANALYSIS da:<id8>:<index>]
**Target prompts:** [list with current presence %]
**Competitor citations being displaced:** [list URLs + whether each was fetched or only known by title]

## Outline

[H2 outline with bullet-level structure of the intended draft. No prose yet. Each section that would contain a specific fact lists what fact is needed.]

## Fact checklist (needed before drafting publication-ready copy)

- [ ] [Specific fact, e.g., "Product X's actual price"] — source needed: [user doc / competitor URL fetch / web search]
- [ ] [Another fact] — source: [...]
- [ ] [...]

## To unblock

Paste/upload: [the specific docs you need], OR confirm I can web-search for: [specific things].
```

This is a successful outcome, not a failed one. Better an honest outline than fabricated prose.

### 8. Output format (publication-ready mode)

```markdown
# Draft: [Working title]

**Source task:** #[id] — [title]
**Candidate origin:** [PROMOTED #<action-uuid> | UNPROMOTED-DEEP-ANALYSIS da:<id8>:<index>]
**Recommendation source:** [deep_analysis_result / audit / manual / agent / system]
**Target prompts:** [list 1-3 prompts this draft targets, with current presence %]
**Competitor citations being displaced:** [list 2-3 URLs from step 4C, marked as "fetched" or "title-only"]
**Fact-grounding sources used:** [user docs / fetched URLs / web search domains]

---

## Draft content

[The actual content. Real H2/H3 headings. Inline source citations on every specific fact: `(source: example.com)`. `[FACT TO CONFIRM: ...]` for any value you couldn't verify.]

---

## Editor notes
- **AEO angles used:** [bullet list — e.g., "Opened with direct prompt answer", "Added specs comparison table grounded in user-supplied spec sheet", "Cited fetched competitor article for positioning"]
- **Open `[FACT TO CONFIRM]` placeholders:** [bullet list of every placeholder the editor needs to resolve before publishing]
- **Suggested internal links:** [2-3 owned URLs that were fetched in step 5B, with the actual link target — not invented]
- **Brand voice source:** [either "matched from fetched content at <url>" OR "insufficient data — wrote in neutral professional tone"]
- **Schema / metadata recommendation:** [only if page type and required properties are verified; never invent ratings/reviews/prices]
- **Lifecycle status:** [if Candidate origin is `[PROMOTED]`: "Tracked in Action Hub as #<uuid> — update its status to `in_progress` or `in_review` after handing off." | if `[UNPROMOTED-DEEP-ANALYSIS]`: "⚠ Not tracked in Action Hub. To enable status/assignment/publish_verified tracking, promote `da:<id8>:<index>` from the dashboard's deep-analysis view before publishing this draft."]

---

## Why this should move the needle
[2-3 sentences tying the draft back to the SolCrys data: which prompt's presence_pct this targets (specific number), why this format/angle beats the fetched competitor content currently cited, what KPI the team should monitor over the next 2-4 weeks. If `solcrys_get_tasks` or `solcrys_get_deep_analysis` provided a numeric target, cite it; otherwise list the KPI to monitor without inventing a target.]
```

## What good looks like

- The draft reads like content, not like a brief about content. An editor could send it to copyedit with minor changes.
- Every specific number, spec, price, benchmark, date, or named quote in the body has one of: a brand-doc citation, a `(source: domain.com)` inline citation, or a `[FACT TO CONFIRM: ...]` placeholder.
- Competitor positioning is grounded in what you actually read (fetched in step 5C), not inferred from URL/title.
- Brand voice either matches fetched owned content OR is explicitly flagged as neutral with the source-insufficient note.
- The "Why this should move the needle" section names a specific prompt and current presence %, not a vague "improve AEO".
- When in doubt, the outline-mode fallback fires instead of producing invented prose.
- The candidate's origin (`[PROMOTED]` vs `[UNPROMOTED-DEEP-ANALYSIS]`) is surfaced in both the pick confirmation and the deliverable metadata. When un-promoted, the lifecycle warning is shown to the user once.

## What to avoid

- **Don't fabricate specs, prices, benchmark numbers, or quotes.** Use placeholders. The integrity of the draft depends on this.
- **Don't pick a non-content task** (e.g., "implement structured data" or "fix robots.txt") — skip and pick the next content-producing task.
- **Don't draft generic SEO content** ("Welcome to our comprehensive guide…"). AEO rewards directness. First 50 words must answer the prompt.
- **Don't characterize competitor content you didn't fetch.** Referring to "Wirecutter's exhaustive comparison" when you only have a URL/title is fabrication.
- **Don't write to a target word count** when you don't have enough facts to fill it. Outline mode > padding mode.
- **Don't silently widen to un-promoted recommendations.** The widening triggers in step 2 are explicit; if none of them hold, stop at the promoted queue. When you do widen, say so once.
- **Don't auto-promote.** This skill does not call the dashboard's `/actions/promote` endpoint (no MCP write tools exist for that anyway). If the user wants an un-promoted recommendation tracked in the Action Hub, point them at the dashboard's deep-analysis view — never claim the skill promoted it.

## Forbidden phrasings in drafted content

Never emit these in the body of any draft:

- **Generic AI-slop openers:** "In today's fast-paced world…", "It's no secret that…", "When it comes to…", "Whether you're a seasoned X or just starting out…", "In this comprehensive guide…".
- **Unsourced superlatives:** "the best", "the leading", "the most trusted", "the industry standard" — unless a specific source is cited.
- **Fabricated quotes** from named people or organizations. Quotes are only permitted if: (a) user-supplied, (b) fetched from a cited URL, or (c) clearly attributed to a generic illustrative role ("a typical [audience role]") and marked as such.
- **Manufactured-research claims:** "Studies show…", "Research suggests…", "Experts agree…", "X% of [audience]…" without a specific cited source.
- **Made-up statistics** of any kind. Either cite a real study or omit the stat.
- **Claims about the brand's own product features, pricing, or roadmap** that did not come from a user-supplied doc or a fetched owned URL.
- See soul.md for the full forbidden-phrase list — it applies here too.
