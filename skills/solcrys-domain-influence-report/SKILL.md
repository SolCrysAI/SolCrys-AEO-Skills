---
name: solcrys-domain-influence-report
description: Produce a "who's influencing AI answers in our industry" report from SolCrys citation data — the top domains AI engines cite, broken out by source type (Owned, Competitor, Editorial, UGC, Other), with a brief analysis under each block. Use this skill whenever the user asks for a "citation landscape", "domain influence report", "who's getting cited", "top-cited sources", "editorial vs UGC analysis", "competitor citation analysis", or any framing of *which sources are winning AI mindshare in our category*. Trigger even if the user doesn't say "by source type" — surface the breakdown anyway, it's the value-add.
---

# SolCrys Domain Influence Report (by Source Type)

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md).** Three rules are non-negotiable: (1) every claim must trace to MCP tool data — when data is insufficient, say so verbatim, do not invent; (2) every recommendation must name a specific prompt/URL/domain from the data AND target a measurable AEO metric; (3) any drafted prose must be grounded in user-supplied docs, fetched URLs, or web-searched facts.

You're producing a citation-landscape report that answers: *"In this workspace's tracked prompts, which domains are AI engines actually citing, and what kind of sources are they?"* The output is structured by source type so the reader can immediately see whether they're losing ground to competitors, editorial publications, UGC platforms, or their own owned media's underrepresentation.

**Scope:** the report describes THIS workspace's measurements — not "the industry" or "the category". Claims about category-wide dynamics or competitor strategy are forbidden (see soul.md Rule 1).

## When this skill is active

The user wants to understand the citation landscape for a workspace — who's getting cited, by source type. They may frame it as competitive analysis, content strategy input, or PR/digital-comms planning. Default time window is the tool's default (typically the last few weeks); the user may override.

## Steps

### 1. Identify the workspace

If the user supplied a workspace slug or brand name, use it. Otherwise call `solcrys_list_workspaces` and pick the obvious one (or ask if multiple).

### 2. Pull the high-level citation aggregates

Call `solcrys_get_citations_insights` with the workspace slug. This gives you:

- Top-cited domains overall, with rank, citation count, prompt count, per-engine breakdown.
- Each domain's source-type classification (Owned / Competitor / Editorial / UGC / Other).
- Aggregate stats: total citations, unique domains, mentions-you %, owned-media %.

### 3. Drill into each source type

For each of the four primary source types (Owned, Competitor, Editorial, UGC), call `solcrys_get_citations` with `sourceType: ["<TYPE>"]` and `limit: 50`. This gets you the actual citation rows so you can rank the top domains within that type by citation count and see specific URLs.

You can run the four drill-down calls in parallel — they're independent.

Skip the "Other" bucket in the main report unless it's larger than 15% of total citations. If it is, call it out as a "miscellany" callout, but don't expand it.

### 4. Compose the report

Structure: a short intro with the aggregate stats, then four sections (one per source type) in this order: **Competitor → Editorial → UGC → Owned**. This order is intentional — start with who's beating the brand, then where the editorial coverage is, then the social/UGC signal, then end on the brand's own footprint.

For each section, include:

- **Top 5 domains** in a table: rank, domain, citation count, share of that source-type's citations, engines that cite it most.
- **Brief analysis** (2-3 sentences max): what the citation counts and engine distribution show. Acceptable framings: how concentrated the citations are (one domain vs many), which engines cite which domains, how the owned-media share is distributed. NOT acceptable: claims about why engines cite a domain (trust, authority, strategy) — those are not in the data. State the counts; let the reader infer intent.

### 5. Output format

```markdown
# Citation Landscape: [Brand Name / Industry]
**Window:** [date range] · **Source:** SolCrys AEO measurements across OpenAI, Gemini, Perplexity, Claude

## Snapshot
- **Total citations measured:** [N]
- **Unique domains:** [N]
- **Mentions-you citations (where your brand was the subject):** [X%]
- **Owned-media share:** [X%]
- **AI engines covered:** [list]

> [One-sentence headline read on the landscape. e.g., "Editorial publications dominate (38% of citations), and a single publication alone accounts for 14% — a single-source concentration risk for any brand in this category."]

---

## Competitor citations
[Brief framing — e.g., "These are the citations supporting competitor brands. The top 5 are concentrated, suggesting AI engines have settled on a small set of trusted references for category questions."]

| Rank | Domain | Citations | Share | Top engine(s) |
|---|---|---|---|---|
| 1 | competitor-a.com | 142 | 18% | OpenAI, Perplexity |
| 2 | competitor-b.com | 89 | 11% | Gemini |
| ... | | | | |

**Analysis:** [2-3 sentences. Who's winning? Is the lead structural (a strong owned-media operation) or fragmented (a few high-traffic comparison posts)?]

---

## Editorial citations
[Brief framing]

| Rank | Domain | Citations | Share | Top engine(s) |
|---|---|---|---|---|
| ... | | | | |

**Analysis:** [2-3 sentences]

---

## UGC citations
[Brief framing — Reddit, Quora, forums, niche communities]

| Rank | Domain | Citations | Share | Top engine(s) |
|---|---|---|---|---|
| ... | | | | |

**Analysis:** [2-3 sentences]

---

## Owned-media citations
[Brief framing — the brand's own domains and operated properties]

| Rank | Domain | Citations | Share | Top engine(s) |
|---|---|---|---|---|
| ... | | | | |

**Analysis:** [2-3 sentences. Is the brand winning citations to a single hero page or spread across the site? Are any expected key pages missing from the list?]

---

## Implications for AEO posture
[Implications must follow from the source-type distribution above and target the workspace's AEO outcome. Allowed framings: where to invest resource — PR outreach to a NAMED editorial domain that appears in the citation data, content production targeting a NAMED prompt with low presence, community presence on a NAMED UGC domain. Forbidden: category-wide claims, competitor-strategy inferences, generic content-marketing advice.]

- **[Implication, e.g., "Editorial citations are concentrated in [domain-from-data]. AEO-aligned next move: pitch a guest piece or expert quote to [domain-from-data] given they already cite competitors in this workspace's tracked prompts."]**
- **[Another implication grounded in the source-type counts]**
- **[A third if it earns its place; otherwise drop. Quality > completeness.]**
```

## What good looks like

- Each "Analysis" paragraph names specific domains and reads like a strategist's note, not a summary of the numbers above it.
- The implications section ties back to the source-type imbalance — e.g., *high editorial share → invest in PR; high UGC share → invest in community presence; low owned share → audit which owned pages aren't AEO-ready*.
- Source-type classification respects tenant overrides — if `get_citations_insights` returned a domain as `Owned` because of a per-tenant override, treat it as Owned in the report.

## What to avoid

- Don't combine source types into one mega-table. The point of the report is the breakdown.
- Don't make up engine attribution — if the citation rows only listed two engines, don't claim "all four engines."
- Don't recommend specific content topics in this skill — that's the job of `solcrys-action-driven-content`. Keep this report to structural observations about the citation landscape.
- Don't generalize beyond this workspace. Claims like "in this category", "the industry", "any brand like yours" are forbidden — see soul.md Rule 1.
- Don't characterize domain strategy or intent. "They pivoted to thought leadership", "they're winning the narrative" — forbidden. You can count; you cannot read minds.
- Don't write the title as "[Industry]" if the workspace metadata doesn't include an industry. Use the brand or workspace name instead.
