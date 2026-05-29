---
name: solcrys-monthly-aeo-execution-plan
description: >-
  Generate a monthly (or multi-month) AEO (Answer Engine Optimization) execution plan for a brand — an
  executive "Winning the AI Answer Layer" deliverable grounded in SolCrys AEO measurement data. Use this
  whenever the user wants a PLAN or ROADMAP to grow a brand's visibility in AI assistants (ChatGPT, Gemini,
  Google AI Overviews, Perplexity): close a share-of-voice (SOV) gap with a competitor, understand why a
  competitor is cited more AND what to do about it, grow the owned/editorial/UGC content footprint, get onto
  the "best [category] software" lists and the Reddit/LinkedIn threads AI engines cite, or turn SolCrys data
  into a phased monthly content action plan with KPIs and an indexing-aware cadence. Trigger on requests like
  "generate a monthly AEO execution plan", "AEO/GEO roadmap", "plan to close our AI share-of-voice gap",
  "how do we win the AI answer layer", "get cited more by ChatGPT/Perplexity", or "AEO playbook/strategy for
  the next quarter" — even if the user doesn't say "SolCrys", as long as the goal is an AI-search-visibility
  PLAN and a SolCrys workspace is available.
  Do NOT use this for: a one-off SOV or metric lookup (just call the SolCrys tool directly); a weekly CMO
  summary of what changed (use solcrys-weekly-cmo-brief); a citation-landscape / source-type breakdown only
  (use solcrys-domain-influence-report); a "where am I surfacing vs. missing" footprint audit with no plan
  (use solcrys-brand-footprint-gap-analysis); drafting a single piece of web content for one queued action
  (use solcrys-action-driven-content); connecting or configuring the SolCrys MCP; traditional SEO keyword or
  Google Ads work; a generic social-media/content calendar; or a plain product/feature comparison document.
---

# Monthly AEO Execution Plan Builder

## What this skill does

Turns SolCrys AEO measurement data into an executive-ready **"Winning the AI Answer Layer"** playbook
(a Word document) for a target brand. The playbook diagnoses the brand's visibility in AI assistants,
explains why the category leader is cited more, maps the content footprint gaps (owned / editorial / UGC),
and lays out a phased content roadmap with realistic engine-indexing timing and measurable KPIs.

The deliverable structure is fixed and proven; the **content is generated fresh per brand** from that
brand's own SolCrys workspace plus light web research. Never hardcode another customer's numbers, brand
names, competitors, or domains into the output — everything comes from the live data for the brand at hand.

## When to use vs. not

Use it for AI-search/AEO/GEO strategy work grounded in SolCrys data. Don't use it for traditional SEO
keyword reports, paid-media plans, or generic content calendars unrelated to AI-answer visibility.

## House rules

This skill obeys the repo's shared rule-set in `../soul.md`: (1) **data-grounded claims** — every number
traces to SolCrys or a cited URL; (2) **AEO-goal-aligned recommendations** — actions must plausibly move
the brand's AI visibility, not generic marketing; (3) **fact-grounded writing** — verify with web search and
user-supplied docs, and label vendor figures as company claims unless independently sourced. If `soul.md`
is present, read it and follow it; the quality bar below restates these in context.

## Workflow

Work through these phases. Use a task list to track them. Ask the user to confirm scope before the deep
data pull (which brand/workspace, 14d or 30d, 2-month or 3-month roadmap).

### 1. Scope & locate the workspace
- Call `solcrys_list_workspaces` to find the brand's workspace `slug`. If several exist, ask which one.
- Confirm with the user: time window (**14d or 30d**; default 14d), and roadmap length (**2 or 3 months**;
  recommend 3 because of AI-engine indexing lag — see `references/indexing_lag.md`).
- The SolCrys MCP tools are prefixed with a tenant-specific server id (e.g. `mcp__<id>__solcrys_*`).
  Refer to them by the `solcrys_*` suffix; the exact prefix will already be present in the tool list.
  See `references/solcrys_mcp.md` for each tool, its parameters, and gotchas.

### 2. Pull the data (one window, all sources)
Pull, for the chosen `timeRange`:
- `solcrys_get_visibility_insights` — KPIs, SOV ranking, per-engine rates, sentiment, over-time, citation summary.
- `solcrys_get_prompts` — the tracked prompts (so you can reason about coverage/relevance).
- `solcrys_get_citations_insights` — top domains by citation count + source-type classification (Owned/Editorial/UGC/Other).
- `solcrys_get_content_audit_reports` — owned-page AEO score(s).
- `solcrys_get_deep_analysis` (status `completed`) — prompt-level recommendations. **This output is often huge
  and will exceed the tool limit.** When it does, follow the file-extraction pattern in `references/solcrys_mcp.md`
  (spawn a subagent to jq/parse the saved file and return a themed briefing) so it stays out of main context.

### 3. Light web research (verify, don't assume)
- Verify the brand's headline product/feature claims and flag internal inconsistencies (e.g., the same stat
  stated differently across pages) — engines will surface the weakest version.
- Fact-check the competitor's marquee claims; mark any that aren't supported by independent sources.
- **Inventory the brand's existing owned pages** (used to ground the 1P actions in Phase 4). Start from the
  owned citation URLs the engines already pull (`solcrys_get_citations` with `owned: true`), the pages in the
  content-audit reports, and any pages named in deep-analysis; then skim the brand's sitemap/site for pages
  that already cover a tracked prompt's topic. Know what exists before recommending anyone build it.
- Identify real, current candidate targets for the 3P appendices: editorial outlets with contributor/PR
  pathways, the category "best X software" roundups the engines already cite, relevant subreddits, and named
  LinkedIn voices in the brand's industry. Pull these from search + the brand's own site, not from memory of
  other clients. **For each candidate, record whether a tracked competitor is already present there** — cited
  on that domain, mentioned on that page, or active in that community — which is the vetting signal Phase 4 uses.

### 4. Synthesize the takeaways
From the data, derive:
- **Content footprint** by layer: Owned (1P) %, Editorial (3P) %, Industry/Other (3P) %, UGC % — and where the brand is present vs. absent. The `by_type` and `top_domains` fields from citations insights give you this directly.
- **Why the leader wins**: compare owned citable-page breadth (citations and URL counts), tier-1 editorial halo, any parent/partner amplification, and primary-mention rate.
- **Citation insights**: Top ~5 editorial domains and Top ~5 UGC domains (note when a single domain dominates a layer — e.g., UGC is often almost entirely one community site).
- **Prompt standing**: how many prompts the brand is invisible on (0 mentions), weak on, and leading on — the under-performing prompts are where SOV points are won.
- **Weakest engine** (usually the biggest upside) and overall sentiment.
- **Owned-page action map (grounds the 1P roadmap)**: cross each prompt you intend to target against the owned-page inventory from Phase 3. Each owned action is then either *refresh a specific existing URL* (the page exists but isn't answer-shaped/citable for that prompt) or *create a new page* — and "create" is allowed only when the inventory shows no existing page covers the prompt. Don't recommend building content the brand already has; upgrade the page it has.
- **3P target vetting (grounds the appendices)**: classify each candidate editorial outlet, roundup, subreddit, and LinkedIn voice by competitor presence. *Proven* = a tracked competitor is cited/mentioned/active there while the brand is absent (a channel demonstrably feeding category citations that the brand is missing from) — these rank first. *Speculative* = no evidence any tracked brand is cited there yet; keep only if genuinely useful and label it as such. Never present a speculative target as a proven one.

### 5. Build the playbook document
Follow `references/playbook_outline.md` for the exact section spec. Assemble a `data.json` matching the
schema in `assets/data.example.json`, then render with the bundled builder:

```bash
cd <output-dir>
npm install docx   # if not already present
node <skill-path>/assets/build_playbook.js data.json "<Brand>_AEO_Playbook.docx"
```

The builder renders every section, skips any you omit, and styles a clean executive doc with per-section
source boxes. Validate with the docx skill's validator if available, then present the `.docx` to the user.

### 6. Quality bar
- Every data claim ties to either SolCrys or a cited URL. Put a small **Sources** box at the end of each
  data-bearing section and each appendix (the builder supports this).
- Keep vendor performance figures labeled as company claims unless backed by an independent source.
- Set realistic expectations: SOV is a **lagging** metric. Month 1 should track leading indicators
  (pages indexed, bots crawling, first Perplexity pickups), with SOV lift arriving in later months.
  Use the trajectory table so a quiet early dashboard isn't mistaken for failure.
- **Ground every owned (1P) action**: name the specific existing URL to refresh, or state the gap ("no
  current page covers [prompt]") before proposing a new page. No generic "build answer pages" deliverables.
- **Vet every 3P target**: each editorial outlet, roundup, community, and LinkedIn target carries its
  evidence — which tracked competitor is cited/present there, or an explicit "speculative — no category brand
  cited here yet" label. Proven targets (competitor present, brand absent) rank above speculative ones.

## Anti-leak rule (important)
This skill is generic. The example data, the references, and the builder contain **no real customer data**.
When you run it, populate everything from the current brand's SolCrys workspace and fresh research. Do not
copy brand names, competitor names, domains, stats, or roadmaps from any prior run or example into a new
brand's playbook.

## Bundled resources
- `references/solcrys_mcp.md` — SolCrys MCP tool reference, parameters, and the large-output extraction pattern.
- `references/indexing_lag.md` — AI-engine crawl/index/citation pickup lag model (used for the timing section and roadmap buffers), with sources.
- `references/playbook_outline.md` — the exact document section spec ("Winning the AI Answer Layer").
- `assets/build_playbook.js` — data-driven Word-document builder (reads `data.json`, renders the playbook).
- `assets/data.example.json` — fully generic, clearly-fictional example of the data schema. Copy its shape; replace all values.
