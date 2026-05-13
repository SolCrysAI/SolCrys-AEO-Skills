---
name: solcrys-brand-footprint-gap-analysis
description: Build a "brand content footprint and gaps" report from SolCrys data — list the specific URLs (mentions-you citations) where the brand IS surfacing in AI answers, plus the prompts where the brand is NOT mentioned (the gaps). The deliverable shows what content is already working AI-citation-wise and what's missing. Use this skill whenever the user asks for a "content footprint", "where am I cited", "what's working", "what's our AI presence", "where are we missing", "AI-citation audit", "mentions-you analysis", "AI presence map", or any framing of *which of our URLs are getting cited and which prompts are we losing*. Trigger even if the user says it informally ("show me where I'm showing up in AI answers").
---

# SolCrys Brand Content Footprint & Gap Analysis

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md).** Three rules are non-negotiable: (1) every claim must trace to MCP tool data — when data is insufficient, say so verbatim, do not invent; (2) every recommendation must name a specific prompt/URL/domain from the data AND target a measurable AEO metric; (3) any drafted prose must be grounded in user-supplied docs, fetched URLs, or web-searched facts.

You're producing a two-part report:

1. **The footprint** — the specific URLs (the brand's own pages and any third-party page that names the brand) that AI engines actually cite when answering prompts in this workspace's tracked set. This is the brand's *current* AI-visible content surface.
2. **The gaps** — the prompts in the tracked set where the brand has low or zero presence, especially the high-volume ones, where AI engines answer the question *without* mentioning the brand at all.

The report tells the team: *here's what your existing content is doing for you in AI answers, and here are the conversations you're not part of yet.*

## When this skill is active

The user wants to know which of their content surfaces are AI-citation-active and where they're invisible. Often comes up in: content audits, quarterly business reviews, PR/digital-comms strategy, page-prioritization for AEO updates.

## Steps

### 1. Identify the workspace

Standard discovery flow: use the slug the user supplied, or call `solcrys_list_workspaces` and pick or ask.

### 2. Pull the footprint (mentions-you citations)

Call `solcrys_get_citations` with:

- `mentionsYou: true` — restricts to citations from responses where the brand was actually mentioned.
- `limit: 100`
- (Time range: tool default unless the user specified one.)

This returns the citation rows you need. Each row has a URL, domain, source-type classification, engine, and the response it appeared in.

Then call `solcrys_get_citations` a second time with `owned: true` to get the strict subset of citations on the brand's *own* domains. Cross-reference these against the first call — the owned-but-not-mentions-you set is interesting too (your domain got cited as a source even when AI didn't name your brand in the answer body — a sign your content is being treated as an authoritative reference).

### 3. Pull the gaps (low-presence prompts)

Call `solcrys_get_prompts_insights` with `sortBy: "presence_asc"` and `limit: 25`. This returns the 25 prompts with the lowest brand-presence percentages.

Pay special attention to:

- Prompts with **presence_pct < 20%** — the AI engines are answering without you.
- Prompts with **high `total_volume`** (volume_label = "High") AND low presence — these are gaps that matter, not just obscure prompts no one is asking.
- Prompts with **negative `presence_change_pp`** — you used to be there and you're not anymore.

For each gap-prompt that earns a callout in the report, *optionally* call `solcrys_get_citations_insights` with `engine: "<engine where this prompt runs>"` to see who IS getting cited in that conversation. Don't do this for every gap — only the 3-5 you're highlighting. Otherwise you'll burn a lot of quota.

### 4. Compose the report

```markdown
# Brand Content Footprint & Gaps — [Brand Name]
**Window:** [date range] · **Workspace:** [slug]

## Footprint summary
- **Mentions-you citations:** [N] across [M] unique URLs
- **Owned-media citations:** [N] across [M] unique URLs of your own domains
- **Top brand-mentioning engines:** [list with rough share]

### Where your brand is being cited

| URL | Domain | Source Type | Engines | Citation count |
|---|---|---|---|---|
| [url] | [domain] | Owned / Editorial / UGC / Competitor | OpenAI, Perplexity | 8 |
| ... | | | | |

[Show the top 15-20 URLs. Group by source type with sub-headings if it improves readability.]

**Read on the footprint:** [2-3 sentences. Is the brand's citation footprint concentrated (one or two hero URLs doing all the work) or distributed (many surfaces contributing)? Is editorial coverage outweighing owned content, or vice versa? Are any expected core pages absent from this list — and what does that suggest?]

---

## Gaps — high-volume prompts where the brand is missing

| Prompt | Volume | Presence | Δ vs prior | Top competitor cited |
|---|---|---|---|---|
| "[prompt text, truncated to 60 chars]" | High | 8% | -12pp | competitor-a.com |
| ... | | | | |

[List 5-10 prompts. Prioritize: high volume + low presence + negative delta.]

### Why these matter

- **[Prompt name]** — [one-line read grounded in the returned fields. e.g., "volume_label: High across the engines returned; brand presence dropped from 31% → 8% over [window]. Two editorial publications now own the top citation slots for this prompt." Do NOT invent frequency claims like "asked daily" — volume_label is a bucket (Low/Med/High), not a count.]
- **[Prompt name]** — [...]
- **[Prompt name]** — [...]

---

## Recommendations

Every recommendation must name a specific URL, prompt, or domain from the data and target a measurable AEO metric (presence_pct, citation count, owned-media share). Forbidden: "syndicate", "thought leadership", "content calendar", or any generic content-marketing move (see soul.md Rule 2).

1. **Reinforce existing footprint:** [Name 1-2 specific owned URLs from the footprint table and the AEO-bounded move — refresh for citation-readiness (structured Q&A, citable specs), expand to address a named adjacent prompt. NOT: generic "repurpose" or "syndicate".]
2. **Close a specific gap:** [Name a high-volume gap prompt from the table and propose a concrete citation-ready answer on a specified owned URL.]
3. **PR / outreach play:** [Only include if a specific editorial domain appears in the gap data. Name the domain and what they cite today. Skip this section if no named editorial domain is in the prompt-scoped data.]
4. **Watch list:** [Name 1-2 prompts to monitor that haven't crossed the threshold for action yet.]
```

## What good looks like

- The footprint table names specific URLs the team can open in a browser, not just domains.
- Owned-media URLs are clearly distinguished from third-party "mentions-you" URLs — they're different signals (one is your content doing the work; one is someone else's content doing the work for you).
- Gap callouts are framed by impact (volume × presence delta), not just by lowest presence. A prompt with 4% presence but `volume_label: Low` matters less than a prompt with 30% presence and `volume_label: High` and a -15pp delta.
- The recommendations are specific enough that an editor or PR manager could action one of them this week.

## What to avoid

- Don't include URLs from `owned: true` that aren't actually owned according to the workspace's owned_domains setting — trust the source_type classification.
- Don't list every prompt — the top 5-10 gaps that earn the callout, no more. Long lists are dashboard-grade, not report-grade.
- Don't recommend "create a content calendar" or other generic advice — every recommendation should be tied to a specific prompt, URL, or competitor named in the data.
- Don't invent that "an owned URL got cited even though the brand wasn't mentioned" means "your content is being treated as an authoritative reference." It means the URL was cited; the reason is unknown. State the fact, not the interpretation.
- Don't call a page "missing" or "expected but absent" unless the user named it, a task referenced it, or it appears as an adjacent owned URL in the data. No imagining what content a brand "should" have.
