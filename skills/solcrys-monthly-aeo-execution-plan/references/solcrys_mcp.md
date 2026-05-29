# SolCrys AEO MCP — tool reference

The SolCrys MCP exposes a brand's AI-search (AEO) measurement data. Tools are named
`mcp__<server-id>__solcrys_*`; the `<server-id>` is tenant-specific and already present in your tool
list — match on the `solcrys_*` suffix. All data tools take a `workspaceSlug` and most take an optional
`timeRange` (`7d`/`14d`/`30d`/`60d`; default usually `14d`). Engines referenced: `openai` (ChatGPT),
`gemini`, `google_aio` (Google AI Overviews), `perplexity`.

## Core concepts
- **Mention / SOV**: a brand's "share of voice" = share of AI responses (across tracked prompts and
  engines) that mention it. `primary` = the brand presented as the top recommendation.
- **Citation**: a source URL an engine pulled when answering. Classified by `source_type`:
  `Owned` (the brand's site), `Editorial`, `UGC` (community: Reddit/YouTube/LinkedIn/etc.), `Other`
  (vendor/industry/blog), and a catch-all.
- **Prompt**: a tracked query the workspace measures (e.g., "best AI HVAC optimization software").

## Tools

### solcrys_list_workspaces
First call when you don't know the slug. Returns `workspaces[]` with `slug`, `brand_name`, `status`,
`last_run_at`. No inputs required.

### solcrys_get_visibility_insights  (the headline pull)
Inputs: `workspaceSlug` (req), `timeRange`, `engine` ('all' or one engine).
Returns: KPIs (`overall_mention_pct`, `primary_mention_pct`, `sov_ranking`, `sov_total_brands`,
`citation_mentions_you_pct`, `citation_owned_pct`); per-engine breakdown with sentiment; `over_time`
series; `share_of_voice` (top brands by mention and by primary rate — this is where you read the
competitor gap); `citations_summary` (`by_type` percentages + `top_domains` with `type` and
`target_mentioned`); `highlights`; `gaps` (e.g., `owned_underrepresented`, `competitor_heavy_domains`).
→ Use for: the SOV gap, per-engine strengths/weaknesses, sentiment, and the footprint `by_type` split.

### solcrys_get_prompts
Inputs: `workspaceSlug` (req), `limit`. Returns the active tracked prompts with `category`, `tags`,
`is_brand_specific`. → Use to reason about prompt coverage and which prompts to target.

### solcrys_get_prompts_insights
Per-prompt presence/citation/mention stats with pagination (`cursor`) and `highlights`/`gaps`.
→ Use to identify invisible (0-mention), weak, and leading prompts.

### solcrys_get_citations_insights  (domain-level)
Inputs: `workspaceSlug` (req), `timeRange`, `engine`, `mentionsYou`, `sourceType[]`, `limit`.
Returns `stats` (total citations, unique domains, `mentions_you_pct`, `owned_pct`) and ranked `rows`
(domain, `source_type`, `citation_count`, `prompt_count`, `engines`, `url_count`,
`target_brand_mentioned_on_page`). → Use for Top editorial domains, Top UGC domains, and the
industry/"Other" layer. Filter `sourceType: ["Editorial"]` or `["UGC"]` to isolate a layer.

### solcrys_get_citations  (raw rows)
Raw citation rows with filters (`domain`, `urlContains`, `sourceType`, `owned`, `mentionsYou`,
`engine`) and keyset pagination. → Use only when you need specific example URLs.

### solcrys_get_content_audit_reports
Inputs: `workspaceSlug` (req), `timeRange`, `status`, `limit`. Returns owned-page AEO audit runs:
`score_overall`, sub-scores (`score_citation_readiness`, `score_structure`, `score_credibility`,
`score_quality`), `verdict`, bot-access note. → Use for the "fix the owned substrate" baseline KPI.

### solcrys_get_deep_analysis  (prompt-level recommendations — LARGE)
Inputs: `workspaceSlug` (req), `timeRange`, `promptId`, `status` (use `completed`), `limit`.
Each row has a structured `result` (diagnosis, recommendations, action items) and `superseded_at`
(filter to current = null). → Richest source of specific recommendations and competitor observations.

## Handling the large deep-analysis output
`solcrys_get_deep_analysis` frequently exceeds the tool output limit and is saved to a file instead, with
the path returned in the error. Don't try to read it line-by-line. Instead, spawn a subagent with this
verbatim-style instruction (adjust the path), so the bulk stays out of your main context:

> Read this JSON file: `<PATH>`. Schema:
> `{workspace_id, time_range, count, truncated, analyses: [{prompt_id, result, status, superseded_at, ...}]}`.
> It is AEO deep-analysis data for a brand. Probe structure with jq (type/length/keys of `analyses[0]`
> and `analyses[0].result`), then read the content in full with jq or python. Return, organized by theme:
> (1) per-prompt diagnosis + the specific recommendations/action items; (2) recurring content gaps and
> recommended asset types; (3) recommended target domains/publications to earn citations; (4) competitor
> observations; (5) specific pages/assets to create or fix. Quote recommendation text where useful. ~1500 words.

## Tips
- Pull everything for ONE `timeRange` so the playbook is internally consistent. State the window in the doc.
- `gaps.competitor_heavy_domains` and `top_domains` with `target_mentioned: false` are your earned-media
  and listicle targets.
- A high `mention_pct` with low `citation_owned_pct` (owned underrepresented) is the classic
  "liked but under-supplied" signal — the brand is a content-supply problem, not a perception problem.
