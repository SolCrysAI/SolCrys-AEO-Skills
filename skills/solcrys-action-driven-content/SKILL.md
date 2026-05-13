---
name: solcrys-action-driven-content
description: Pull the workspace's open action queue from SolCrys, pick one task (or the one the user names), research it against the underlying data and deep-analysis reasoning, web-search for the brand's verifiable facts and competitor content, and draft the actual web content the task recommends — blog post, landing page section, FAQ entry, or comparison piece. The deliverable is a publication-ready first draft grounded in real brand data and the AEO data — or an honest outline + fact checklist when the fact-grounding surface is incomplete. Use this skill whenever the user asks to "draft content from my action queue", "pick an action and write the content", "execute one of my AEO tasks", "write the blog post for task X", "draft the page based on the recommendation", or any framing of *take a recommended action and produce the actual deliverable*. Trigger even if the user just says "pick something from my SolCrys tasks and write it" or "draft me content based on what SolCrys recommends".
---

# SolCrys Action-Driven Content Creator

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md). It contains the three non-negotiable rules — data grounding, AEO goal alignment, and fact-grounded writing. Rule 3 applies most strongly to this skill because it produces external-facing prose.**

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

### 2. Pull the action queue

Call `solcrys_get_tasks` with `status: "todo"`, `limit: 25`. Filter further if the user specified.

If the queue is empty, tell the user — don't fabricate a task.

### 3. Pick the task

Three picking modes:

- **User-specified:** the user named a task by id, title fragment, or theme. If more than one open task matches the user's wording, ask before drafting.
- **Highest-impact pick:** sort by `priority` (high → low), then `due_date` ascending. Take the first content-producing task (action_type implies writing — "publish_post", "refresh_page", "add_faq_entry"). Skip non-content tasks (schema-markup-only, technical SEO fixes).
- **User offered a category:** filter by category first, then highest-impact within it.

Confirm the pick in one short sentence — *"Picking task #[id]: '[title]' (priority: [high], category: [...]). Beginning research now."* — then continue.

### 4. Research the task (data layer)

Gather the SolCrys-side context:

**A. The reasoning behind the task.** If the task's `source_type` is `deep_analysis_result`, call `solcrys_get_deep_analysis` and find the matching record. Its result blob contains the structured analysis and recommendations that generated this task — this tells you *why* this task exists.

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
- **Use citation-ready structure.** Short paragraphs, clear H2/H3 hierarchy, scannable bullets, explicit definitions before opinions.
- **Cite every fact inline.** Specs, prices, benchmarks, dates, quotes — each gets one of: a brand-doc-derived value, a fetched-URL-derived value with `(source: domain.com)`, or a `[FACT TO CONFIRM: <what you need>]` placeholder. No value appears in the draft without one of those.
- **Position against fetched competitor content.** Only characterize a competitor article based on what you actually read in step 5C — not on what its URL/title suggests.
- **Match brand voice only if step 5B produced it.** Otherwise neutral professional tone + a flag in editor notes.

### 7. Draft the content (outline mode — when facts are insufficient)

When step 5's decision gate flips this way, produce:

```markdown
# Outline + Fact Checklist: [Working title]

**Status:** Outline mode — too many facts unverified to safely produce publication-ready copy.

**Source task:** #[id] — [title]
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
**Recommendation source:** [deep_analysis_result / prompt insight / etc.]
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

## What to avoid

- **Don't fabricate specs, prices, benchmark numbers, or quotes.** Use placeholders. The integrity of the draft depends on this.
- **Don't pick a non-content task** (e.g., "implement structured data" or "fix robots.txt") — skip and pick the next content-producing task.
- **Don't draft generic SEO content** ("Welcome to our comprehensive guide…"). AEO rewards directness. First 50 words must answer the prompt.
- **Don't characterize competitor content you didn't fetch.** Referring to "Wirecutter's exhaustive comparison" when you only have a URL/title is fabrication.
- **Don't write to a target word count** when you don't have enough facts to fill it. Outline mode > padding mode.

## Forbidden phrasings in drafted content

Never emit these in the body of any draft:

- **Generic AI-slop openers:** "In today's fast-paced world…", "It's no secret that…", "When it comes to…", "Whether you're a seasoned X or just starting out…", "In this comprehensive guide…".
- **Unsourced superlatives:** "the best", "the leading", "the most trusted", "the industry standard" — unless a specific source is cited.
- **Fabricated quotes** from named people or organizations. Quotes are only permitted if: (a) user-supplied, (b) fetched from a cited URL, or (c) clearly attributed to a generic illustrative role ("a typical [audience role]") and marked as such.
- **Manufactured-research claims:** "Studies show…", "Research suggests…", "Experts agree…", "X% of [audience]…" without a specific cited source.
- **Made-up statistics** of any kind. Either cite a real study or omit the stat.
- **Claims about the brand's own product features, pricing, or roadmap** that did not come from a user-supplied doc or a fetched owned URL.
- See soul.md for the full forbidden-phrase list — it applies here too.
