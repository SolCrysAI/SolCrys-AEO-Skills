# AI-engine indexing & citation-pickup lag model

Publishing content is not the same as being cited. Before an AI assistant can cite a page it must (a)
crawl it, (b) index/rank it, and (c) select it into a generated answer. Crawling is fast — within ~24h
of publishing, Perplexity and ChatGPT bots typically hit a new page several times. The lag is in steps
(b) and (c), and it differs sharply by engine. Use these as **planning estimates**, not guarantees —
actual pickup varies with the domain's authority and competition.

| Engine | Crawl | Typical citation pickup after publish | Notes |
|---|---|---|---|
| Perplexity | hours–days | ~2–4 weeks | Freshest; biggest fast-feedback lever and best leading indicator |
| Google AI Overviews | days | ~2–8 weeks | Leans on organic rankings (~54% overlap with top-20 results) |
| Gemini | days | ~2–8 weeks | Tied to the Google index |
| ChatGPT | hours–days | ~6–12 weeks | Retrieval/refresh cycle is the long pole |

Two more lags stack on top for non-owned content:
- **Earned media**: pitch-to-publish is ~2–6 weeks before the engine clock even starts. Pitch early so
  pieces are live and ingested before the measurement endpoint.
- **UGC (Reddit/LinkedIn/YouTube)**: posts need to age and accumulate engagement before engines treat
  them as citation-worthy. Start early; expect compounding, not instant effect.

## How this shapes the roadmap
- **Front-load all owned content** into the first month so the longest (ChatGPT, 6–12 wk) clock starts
  as early as possible.
- Treat the following month(s) as the **deliberate pickup buffer** — when month-1 work converts into SOV,
  not idle time. Perplexity moves first, then Google AIO/Gemini, then ChatGPT.
- A 2-month plan structurally under-delivers: it tends to measure before ChatGPT (often a top engine) has
  ingested the work. Recommend **3 months** when the goal is a measured SOV lift.
- Set expectations with a trajectory: roughly flat-to-modest in month 1, acceleration in month 2, target
  reached in month 3. In month 1, track **leading indicators** (pages indexed, AI bots crawling, first
  Perplexity pickups) rather than SOV.

## Sources
- AEO/GEO playbook — ChatGPT 6–12 wk, Perplexity 2–4 wk pickup: https://startupgtm.substack.com/p/get-visibility-in-chatgpt-perplexity
- Citation preferences by platform (ChatGPT/Perplexity/Google AIO): https://siteup.ai/blog/chatgpt-perplexity-google-ai-overview-citation-preference
- How OpenAI crawls & indexes your site: https://www.withdaydream.com/library/how-openai-crawls-and-indexes-your-website
- Crawlability & indexing for AI search: https://discoveredlabs.com/blog/crawlability-indexing-for-ai-search-ensuring-llms-can-access-and-understand-your-content
