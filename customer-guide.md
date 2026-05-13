# SolCrys AEO MCP Instructions

The SolCrys MCP server lets your favorite AI client — Claude Code, Claude Desktop, Cursor, VS Code Copilot, ChatGPT/Codex, and others — query your AEO data directly. Ask in plain English: *"How did my brand perform across AI engines this week?"*, *"Which prompts are losing visibility?"*, *"What should I fix first based on the deep-analysis recommendations?"*, or *"Draft a blog brief for the prompts where I'm losing to competitors."* — and your AI client pulls the answer (or writes the deliverable) straight from your SolCrys data.

This guide walks through who it's for, how to connect, and how to use it day-to-day.

---

## Who SolCrys MCP is for

- **AEO/SEO leaders** who run weekly visibility check-ins and want their AI assistant to pull the numbers, find the gaps, and draft the action list — without bouncing between dashboards.
- **Content strategists** who need a fast loop from "where am I losing?" to "what should I write?". The MCP surfaces the prompts, citations, and recommendations you need to draft briefs in your AI client of choice.
- **Brand and PR teams** tracking share-of-voice and competitor mentions across AI engines, and watching for shifts that need a response.
- **Analysts and consultants** producing reports for clients or executives. Ask once in natural language and let the assistant assemble the report from live data.
- **RevOps and growth teams** wiring AEO signals into automated workflows — Slack alerts on visibility drops, weekly digests, content briefs generated from the latest gaps.

If you're already getting value from the SolCrys dashboard, MCP is the conversational and programmatic interface to the same data — meet it where your team already works.

---

## What you can do

- **Track brand visibility** across ChatGPT, Gemini, Claude, and Perplexity in one query.
- **Compare against competitors** — share-of-voice, mention rates, and the gaps where they're winning.
- **See your citation profile** — which domains AI engines cite when answering about your category, and how much of it is owned-media.
- **Drill into prompt performance** — find prompts losing presence, top gainers, sentiment shifts.
- **Read recommendation analysis** — structured reasoning per AI response: *"why did this answer look this way, and what should we do about it?"*
- **Audit your pages** for AEO readiness — citation-friendliness, structure, credibility scores.
- **Pull your action queue** — open recommendations to address, ranked by impact.
- **Automate workflows** — schedule weekly check-ins, alert on visibility drops, draft reports and content briefs from live data.

---

## How it works

1. **Connect once** — point your AI client at `https://mcp.solcrys.com/mcp` and either sign in (OAuth) or paste a Personal Access Token.
2. **Pick a workspace** — your first call returns every workspace your account can access.
3. **Ask anything** — your AI client picks the right tools and assembles the answer.

Example queries you might run:

> "List my SolCrys workspaces."
>
> "For acme-co, show me the headline visibility KPIs for the last 30 days and tell me which engine is weakest."
>
> "Pull the top 10 cited domains for acme-co — flag any that aren't owned media."
>
> "For acme-co's five worst-performing prompts this month, pull the deep-analysis records and summarize the recommended actions — rank them by how often the same recommendation recurs."
>
> "Find acme-co prompts where my presence dropped below 30% AND a competitor is winning the top-cited domain. For each, draft a 200-word content brief for a blog post that targets the prompt's intent and references the workspace's owned domains."

---

## Connection details

| | |
|---|---|
| **Server URL** | `https://mcp.solcrys.com/mcp` |
| **Transport** | Streamable HTTP |
| **Authentication** | OAuth 2.1 (browser sign-in) or Personal Access Token |
| **Access** | Read-only |

---

## How to set up (two ways)

### Option 1 — OAuth (recommended for interactive use)

The flow you'll see in any modern AI client:

1. Your client calls `claude mcp add` / equivalent with just the server URL — no token to paste.
2. It opens your browser to the SolCrys consent screen.
3. You log into SolCrys (or stay logged in), pick the tenant you want to grant access to, and confirm.
4. SolCrys redirects back to your client. You're connected.
5. Tokens refresh automatically. Revoke any time from the **Connected Apps** tab in the dashboard.

**Use OAuth when** you want a real "click-to-connect" experience and your client supports it. Claude Code, Claude Desktop, Claude.ai connector, and ChatGPT/Codex all do.

### Option 2 — Personal Access Token (PAT)

A PAT is a long-lived bearer token you paste into your client's `Authorization: Bearer …` header.

1. Sign into the SolCrys dashboard.
2. Go to the **Workspaces** page, open the **MCP** admin tab, and switch to **Personal Access Tokens**.
3. Click **Create token**, name it, pick which workspaces it can access, and confirm.
4. Copy the token. **It's shown exactly once** — store it in a password manager.
5. Paste it into your client's config (snippets below).

**Use a PAT when:**
- Your client doesn't support OAuth (Cursor, Perplexity, Gemini CLI today).
- You're building a programmatic integration — a cron job, a custom agent, a Notion/Slack workflow.
- You want a per-environment token (one for staging, one for prod).

PATs never expire automatically — revoke them from the same dashboard page when you're done.

---

## Per-client setup snippets

The dashboard's **MCP** admin tab generates these with your URL and (optionally) token pre-filled — open the **Quick Start** panel on the Personal Access Tokens tab right after you create a token. Below is the canonical shape for each client.

### Claude Code

```bash
claude mcp add --transport http solcrys https://mcp.solcrys.com/mcp
# OAuth: a browser window opens for sign-in.

# Or with a PAT:
claude mcp add --transport http solcrys https://mcp.solcrys.com/mcp \
  --header "Authorization: Bearer <PASTE TOKEN HERE>"
```

Verify with `claude mcp list` — `solcrys` should show as registered.

### Claude Desktop

Claude Desktop bridges through the `mcp-remote` proxy (`npx` fetches it):

```json
{
  "mcpServers": {
    "solcrys": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.solcrys.com/mcp",
        "--header",
        "Authorization: Bearer <PASTE TOKEN HERE>"
      ]
    }
  }
}
```

Config file path (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`. Restart Claude Desktop after editing.

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "solcrys": {
      "url": "https://mcp.solcrys.com/mcp",
      "headers": { "Authorization": "Bearer <PASTE TOKEN HERE>" }
    }
  }
}
```

Restart Cursor.

### VS Code (Copilot Chat)

Workspace-scoped: `.vscode/mcp.json`. User-scoped: `~/.config/Code/User/mcp.json`.

```json
{
  "servers": {
    "solcrys": {
      "type": "http",
      "url": "https://mcp.solcrys.com/mcp",
      "headers": { "Authorization": "Bearer <PASTE TOKEN HERE>" }
    }
  }
}
```

Reload the window: **Cmd+Shift+P → Developer: Reload Window**.

### Codex (OpenAI Codex CLI)

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.solcrys]
url = "https://mcp.solcrys.com/mcp"

[mcp_servers.solcrys.headers]
Authorization = "Bearer <PASTE TOKEN HERE>"
```

Verify with `codex mcp list`.

### Verification (any client)

Once connected, ask:

> "List my SolCrys workspaces."

You should see a workspace array back. If you get an empty list, your token has access to a tenant with no workspaces (check the dashboard). If you get an auth error, double-check the bearer header.

---

## Supported clients

| Client | OAuth | PAT |
|---|---|---|
| Claude Code | ✅ | ✅ |
| Claude Desktop | ✅ | ✅ |
| Claude.ai connector | ✅ | — |
| ChatGPT / Codex | ✅ | ✅ |
| Cursor | — | ✅ |
| VS Code Copilot | — | ✅ |
| Perplexity integrations | — | ✅ |
| Gemini CLI | — | ✅ |
| Custom HTTP client | — | ✅ |

If your AI client speaks MCP over HTTP, it'll work with a PAT — the table above just shows which ones also support the OAuth click-to-connect flow.

---

## How to use it: the tool catalog

Every tool is read-only and workspace-scoped (except `solcrys_list_workspaces`, which is tenant-scoped — that's your discovery tool).

| Tool | What it returns | When to use |
|---|---|---|
| `solcrys_list_workspaces` | Every workspace your account can access: name, slug, brand name, status, last measurement timestamp. | **Call this first.** Your AI client needs a workspace slug for every other tool. |
| `solcrys_get_prompts` | The workspace's tracked prompt set — the questions SolCrys is measuring AI engines on. | When you want to see the prompts the workspace is monitoring, regardless of when each was added. |
| `solcrys_get_visibility_insights` | The dashboard's hero view: mention rate, primary rate, share-of-voice ranking, owned-media %, over-time series, per-engine breakdown, top competitors, highlights, and gaps. | **The fastest "how am I doing?" call.** Start most analyses here. |
| `solcrys_get_prompts_insights` | Per-prompt performance: presence %, citation %, sentiment, change vs prior window. Identifies top gainers, decliners, lowest-presence, and high-volume-low-presence prompts. | When you want to find which specific prompts are working and which are losing — and what to fix first. |
| `solcrys_get_citations_insights` | Top-cited domains with per-engine breakdown, source-type classification (Owned / Competitor / Editorial / UGC / Other), and aggregate stats (mentions-you %, owned-media %). | When you want a citation-landscape overview — *"who's getting cited about my category, and how much of it is mine?"* |
| `solcrys_get_citations` | Raw citation rows with rich filters: by engine, source type, domain, URL substring, mentions-you only, owned-media only. | Drill-down after citations_insights. *"Show me the actual URLs cited from acme.com last month."* |
| `solcrys_get_deep_analysis` | Per-response structured reasoning: recommendations, action items, brand-position analysis. | When you want to understand *why* a response looked the way it did and what to do about it. |
| `solcrys_get_tasks` | Action-center queue: title, status, priority, source. | When asking *"what should I work on next?"* — this is the curated action list. |
| `solcrys_get_content_audit_reports` | Web-page AEO audit results: overall score, sub-scores (citation readiness, structure, credibility, quality), verdict. | When you want a page-health summary or to compare audit scores over time. |

### A typical narrative flow

1. `solcrys_list_workspaces` → pick a workspace slug.
2. `solcrys_get_visibility_insights` → see headline KPIs and which engine is weakest.
3. `solcrys_get_prompts_insights` → find the prompts driving that weakness.
4. `solcrys_get_deep_analysis` → understand *why*, with the recommendation engine's reasoning.
5. `solcrys_get_citations_insights` + `solcrys_get_citations` → confirm whether the gap is a citation problem (competitors winning domains) and which specific URLs to target.
6. `solcrys_get_tasks` → see what's already in your action queue.
7. `solcrys_get_content_audit_reports` → check whether your own pages are AEO-ready.

Your AI client picks the sequence automatically based on your question — you don't have to memorize this flow. But knowing the shape of the catalog helps you ask sharper questions.

---

## Data access & privacy

- **Workspace data is strictly scoped.** A token issued for one tenant cannot see another tenant's workspaces, even if a prompt injection tells it to try.
- **Every tool call is logged.** Contact support if you need an audit-trail export.

---

## Requirements

- A SolCrys account with at least one active workspace.
- A supported AI client (see the table above).

---

## Troubleshooting

**Empty workspace list.** Your token has access to a tenant that hasn't created any workspaces yet — log into the dashboard and create one.

**`workspace_not_found` error.** The workspace slug doesn't exist in your tenant. Ask your AI client to list workspaces first.

**`insufficient_scope` error.** Your token doesn't carry the permission the tool requires. Reissue the token with broader access from the dashboard.

**`validation_error` on a time range.** Some tools cap how far back you can look in a single query. Retry with a smaller window (e.g. `7d` or `14d`).

**OAuth flow stuck.** Make sure you're on a recent version of your AI client. If OAuth still fails, fall back to the PAT path — it always works.

---

## Support

- **Email** — support@solcrys.com
- **Dashboard** — in-app chat at **Settings → Help**
- **Status** — https://status.solcrys.com
- **Privacy policy** — https://solcrys.com/privacy

If you're integrating MCP into a product or platform, ask us about Enterprise — we can issue scoped tokens per-customer and tailor the integration to your workflow.
