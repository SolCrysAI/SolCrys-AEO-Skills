---
name: solcrys-weekly-cmo-brief
description: Generate a concise weekly AI Visibility brief for a CMO from SolCrys AEO data — headline KPIs, what changed week-over-week, the top 2-3 actions to take, and a one-line forward-looking note. Use this skill whenever the user asks for a "weekly brief", "CMO update", "weekly AEO summary", "exec rollup", "what changed this week", or any kind of executive-grade visibility recap. Trigger even if the user doesn't say the word "brief" — phrases like "summarize this week" or "what should I tell my CMO" count.
---

# SolCrys Weekly AI Visibility Brief for CMO

> **Before doing anything in this skill, read and follow [`../soul.md`](../soul.md).** Three rules are non-negotiable: (1) every claim must trace to MCP tool data — when data is insufficient, say so verbatim, do not invent; (2) every recommendation must name a specific prompt/URL/domain from the data AND target a measurable AEO metric; (3) any drafted prose must be grounded in user-supplied docs, fetched URLs, or web-searched facts.

You're producing a one-page executive brief from SolCrys AEO data. The audience is a CMO: they read 200 words on this and decide what to ask their team about. Optimize for clarity, prioritization, and an unambiguous "so what" — but **never at the expense of the three soul rules**. A sparse, honest brief is the success state; an inventive-feeling polished brief is the failure state.

## When this skill is active

The user wants a periodic (usually weekly) recap of their brand's visibility across AI engines, framed for an executive audience. They may or may not give you a workspace slug.

## Steps

### 1. Identify the workspace

If the user supplied a workspace slug or brand name, use it. Otherwise call `solcrys_list_workspaces` and either:
- Pick the only workspace if there's just one.
- Ask the user which workspace if there are multiple.

### 2. Pull the data in parallel

Call these four tools, all with `timeRange: "7d"` unless the user asks for a different window:

- `solcrys_get_visibility_insights` — headline KPIs, deltas, per-engine breakdown, highlights/gaps.
- `solcrys_get_prompts_insights` — top gainers and decliners, gap detection.
- `solcrys_get_citations_insights` — top domains, mentions-you %, owned-media %.
- `solcrys_get_tasks` — what's already queued for the team.

If any of these returns an `insufficient_scope` error, tell the user which scope they're missing and stop. Don't fabricate data.

### 3. Synthesize, don't just dump

A CMO doesn't want raw numbers — they want the story. As you draft, ask yourself:

- **What's the one thing that changed?** A delta in mention rate, a competitor surge on a specific domain type, a prompt that fell off a cliff.
- **Why did it change?** ONLY state a cause if a tool result explicitly supports it (e.g., deep_analysis records flagging a specific issue, a citation pattern that directly explains a delta). Otherwise write `Cause: insufficient data` and move on. Hypothesis-by-inference is forbidden — see soul.md Rule 1.
- **What's the team already doing about it?** Pull from `get_tasks` — if there's a related action queued, name it.
- **What should they do next?** 2-3 specific actions, ranked. Each action must name a specific prompt, URL, domain, or competitor from the data AND target a measurable AEO metric (mention rate, primary rate, presence_pct on a named prompt). Generic SEO/marketing advice is forbidden — see soul.md Rule 2.

### 4. Output format

Use this exact template. Keep total length under ~350 words.

```markdown
# Weekly AI Visibility Brief — [Brand Name]
**Window:** [start date] – [end date] · **Engines:** OpenAI, Gemini, Perplexity, Claude

## Headline
[One sentence. The single most important thing that changed this week.]

## Key numbers
- **Mention rate:** [X%] ([±N pp vs prior week])
- **Primary rate (top-of-answer):** [X%] ([±N pp])
- **Share of voice rank:** #[N] of [M] tracked brands ([Δ vs prior])
- **Owned-media citation share:** [X%] ([±N pp])

## What's trending
- **[Engine name]:** [one-line trend — e.g., "Perplexity mention rate jumped 9pp on technical prompts."]
- **[Engine name]:** [one-line trend]
- **Competitor watch:** [one line on the biggest competitor gain/loss observed]

## Where we're losing
- **[Prompt or domain]:** [one-line gap — e.g., "Prompt 'best [product category] for [use case]' presence fell from 41% → 18%; two editorial publications now own the top two citation slots."]
- [One more if it earns its place; otherwise drop.]

## Recommended actions (priority order)
1. **[Action]** — [why this first, in one sentence]
2. **[Action]** — [why]
3. **[Action]** — [why]

## On the horizon
[One sentence grounded in a leading indicator from the data — a presence_change_pp trend pointing down, a queued task with a due date next week, a competitor surge from this week's data. If no such indicator exists, write "Insufficient signal for forward note." Speculation about future market moves is forbidden.]
```

## What good looks like

- Numbers are concrete and sourced from the tool calls. Never round more than 1 decimal.
- Deltas always show direction (`+`, `-`, or `flat`) — never just "changed".
- "Where we're losing" names prompts or domains specifically. Generic statements like "engagement is down" don't belong.
- "Recommended actions" are verbs the team could start tomorrow ("Publish a comparison post targeting [the specific prompt]"; "Update /[specific-page] on the brand's owned domain to add citation-ready bullet structure"), not abstractions ("improve SEO").
- If `get_tasks` shows existing queued work that overlaps with your recommendations, acknowledge it: *"This is already in the queue as Action #42 — recommend bumping priority."*

## What to avoid

- Don't include the raw JSON from any tool call.
- Don't list every per-engine metric — pick the 2-3 with the largest deltas.
- Don't speculate about causes outside the data (e.g., don't blame "an algorithm change" or "a platform update" unless the data tells you). When in doubt: `Cause: insufficient data`.
- If a metric is unavailable for the window (insufficient runs, new workspace), say "insufficient data" rather than inventing a number.
- Don't write that engines covered "all four" if the tool returned fewer than four. Use only what was returned.
- Don't write banned exec-summary phrases: "strong momentum", "tailwinds", "headwinds", "going forward", "appears to", "seems to suggest", "broadly", "directionally". See soul.md for the full forbidden list.
