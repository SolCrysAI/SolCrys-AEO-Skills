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

**What the token looks like.** A full PAT is roughly:

```
gp_tok_ORRR57VP5.eyJhbGciOiJSUzI1NiIs…(very long)…fdsa-Pq3w
```

— roughly 1,000 characters, with **three dots total** (one between the prefix and the JWS, two inside the JWS itself). The 16-character string shown in the existing-tokens row (`gp_tok_ORRR57VP5`) is **only the display prefix** so you can identify the token later — it is NOT the bearer. If you've lost the full value, revoke the token and create a new one.

**Use a PAT when:**
- Your client doesn't support OAuth (Cursor, Perplexity, Gemini CLI today).
- You're building a programmatic integration — a cron job, a custom agent, a Notion/Slack workflow.
- You want a per-environment token (one for staging, one for prod).

PATs never expire automatically — revoke them from the same dashboard page when you're done.

---

## Per-client setup snippets

The dashboard's **MCP** admin tab generates these with your URL and (optionally) token pre-filled — open the **Quick Start** panel on the Personal Access Tokens tab right after you create a token. Below is the canonical shape for each client.

### Step 0 — verify your token with curl

Before pasting your PAT into any client, confirm it works end-to-end:

```bash
curl -sS -X POST https://mcp.solcrys.com/mcp \
  -H "Authorization: Bearer <PASTE FULL TOKEN HERE>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

A working token returns a JSON-RPC envelope with a `tools` array. If you get `{"code":"invalid_token",…}` or `{"code":"missing_token",…}`, your token is wrong before any client is even in the picture — see Troubleshooting below.

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

Claude Desktop now has a native **Add custom connector** UI for MCP — no config file editing needed.

1. Open Claude Desktop → click **Connectors** in the sidebar (or the connectors icon in the chat composer).
2. Click the **+** icon at the top of the Connectors panel → **Add custom connector**.
3. Fill in the dialog:
   - **Name:** `SolCrys AEO` (or any label)
   - **Remote MCP server URL:** `https://mcp.solcrys.com/mcp`
4. Click **Add**. Your browser opens to the SolCrys consent screen — sign in, pick a tenant, click Authorize.

The connector card flips to **Connected**. In a chat, ask *"Use SolCrys to list my workspaces"* to verify.

> **PAT path:** if you can't use OAuth (e.g., older Claude Desktop, or you want to bind a long-lived token), you can still bridge via the `mcp-remote` proxy. Edit `~/Library/Application Support/Claude/claude_desktop_config.json` and add an `mcpServers.solcrys` entry pointing `command: "npx"` at `mcp-remote` with `--header "Authorization: Bearer <YOUR_TOKEN>"`. Use the native connector UI above whenever possible — it's the supported path.

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

### Generic HTTP / RPA / Integration platforms

For platforms that speak raw HTTP — UiPath, n8n, Zapier, Make, Power Automate, or custom code — configure a single request:

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `https://mcp.solcrys.com/mcp` |
| **Auth scheme** | **API Key / Bearer / Static Token** — *not* OAuth 2.0. Selecting OAuth in the connector dropdown will ignore your PAT and trigger a separate registration flow that fails on non-HTTPS redirects. |
| **Header 1** | `Authorization: Bearer <FULL_PAT>` |
| **Header 2** | `Content-Type: application/json` |
| **Header 3** | `Accept: application/json, text/event-stream` |
| **Body** | JSON-RPC 2.0 envelope, e.g. `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"solcrys_list_workspaces","arguments":{}}}` |

**Watch out for:**
- **Header-value length caps.** A full PAT is ~1,000 characters. Some RPA platforms silently truncate `Authorization` values above 256 or 512 chars — verify the value round-trips before debugging anything else.
- **Dot stripping.** The token contains dots as JWS separators. A few platforms treat `.` as a config delimiter and mangle the value.
- **OAuth auto-discovery.** If your platform reads the server's `WWW-Authenticate` header, it may try OAuth Dynamic Client Registration on its own and fail with `redirect_uris[0] must use https`. Force the connector into "Static Token" / "API Key" mode to bypass that.

### Verification (any client)

Once connected, ask:

> "List my SolCrys workspaces."

You should see a workspace array back. If you get an empty list, your token has access to a tenant with no workspaces (check the dashboard). If you get an auth error, see the Troubleshooting section below for the specific failure modes.

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

### Auth errors (PAT)

**`{"code":"missing_token",…}` (HTTP 401).** No `Authorization` header was sent. Verify the header name (case-insensitive but must be present) and that your client isn't stripping it.

**`{"code":"invalid_token","what_happened":"Invalid bearer token."}` (HTTP 401).** The value you're sending isn't a recognizable PAT shape. Most common causes:
- You pasted the 16-char *display prefix* (`gp_tok_PGJ7J4JEO`) instead of the full ~1,000-char token. The full token has three dots in it.
- Your client truncated the token (header-length cap, paste buffer limit). Use Step 0 above to verify the full string round-trips.
- The bearer scheme is wrong: it must be `Authorization: Bearer <token>`, not `Authorization: <token>` and not `X-API-Key: <token>`.

**Token signature or claims invalid (HTTP 401).** The bearer is JWT-shaped but isn't ours — you've likely pasted a token from a different environment, or the token was revoked. Re-issue from the dashboard.

**"Connection error / Unexpected response from server" (from your client's UI).** This is almost always a 401 that your MCP client is displaying with a generic message. Run the Step 0 curl to see the real error.

### Auth errors (OAuth)

**`redirect_uris[0] must use https (or http for localhost)`.** Your client tried Dynamic Client Registration with a non-HTTPS, non-loopback redirect URI (often a custom scheme like `myapp://`). Either configure the client to use an `https://…` callback or a loopback like `http://127.0.0.1:PORT/callback`, OR switch to a PAT — both are first-class.

**OAuth flow stuck.** Make sure you're on a recent version of your AI client. Some older builds silently fail on PKCE. Falling back to a PAT always works.

### Data errors

**Empty workspace list.** Your token's tenant has no workspaces yet — create one in the dashboard.

**`workspace_not_found`.** The slug doesn't exist in your tenant. Call `solcrys_list_workspaces` first; copy the `slug` (not the name).

**`insufficient_scope`.** Your token doesn't carry the permission the tool requires. Reissue the token with broader access (every tool requires a `read:*` scope matching its data domain).

**`validation_error` on a time range.** Some tools cap how far back you can look in a single query. Retry with a smaller window (e.g. `7d` or `14d`).

### Still stuck?

Run the Step 0 curl and email the raw `code` + `what_happened` to support@solcrys.com — they pinpoint the failure within minutes.

---

## Support

- **Email** — support@solcrys.com
- **Privacy policy** — https://solcrys.com/privacy
