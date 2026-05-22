# SolCrys AEO MCP Setup Guide

SolCrys MCP lets AI clients query your SolCrys AEO data directly. You can ask questions like:

- "List my SolCrys workspaces."
- "Show visibility KPIs for the last 30 days."
- "Which prompts are losing presence?"
- "What domains are AI engines citing for my category?"
- "Draft a content brief for prompts where competitors are winning."

The MCP server is read-only. It can retrieve your SolCrys data, but it cannot modify your workspace.

---

## Connection Details

| Field | Value |
|---|---|
| Server URL | `https://mcp.solcrys.com/mcp` |
| Transport | Streamable HTTP |
| Auth methods | OAuth or Personal Access Token |
| Access | Read-only |

---

## Choose Your Auth Method

SolCrys MCP supports two ways to connect.

| Method | Use When | What You Configure |
|---|---|---|
| OAuth | Your client supports browser sign-in | Server URL only |
| Personal Access Token, or PAT | Your client asks for headers, API key, bearer token, static token, or custom auth | `Authorization: Bearer <FULL_PAT>` |

Use this rule:

**If the client opens a SolCrys browser sign-in, use OAuth. If the client asks for headers or a token, use a PAT.**

One client-specific note: **Claude Desktop is OAuth-only** for remote MCP servers. There is no PAT path for Claude Desktop — see the Claude Desktop section below.

---

## Option 1: OAuth

Use OAuth for interactive clients that support browser-based MCP authorization.

### Setup

1. In your AI client, add a new remote MCP server.
2. Enter the server URL:

   `https://mcp.solcrys.com/mcp`

3. Choose OAuth, browser sign-in, or automatic authentication if the client asks.
4. Your browser opens SolCrys.
5. Sign in, choose the tenant or workspace access, and approve.
6. Return to your AI client.
7. Verify by asking:

   "List my SolCrys workspaces."

### Important

Do not paste a PAT into the OAuth flow. OAuth does not need manual headers.

---

## Option 2: Personal Access Token, or PAT

Use a PAT when your client does not support OAuth, or when you are setting up a static integration, script, RPA tool, or custom HTTP client.

### Create A PAT

1. Sign in to SolCrys.
2. Go to **Workspaces -> MCP -> Personal Access Tokens**.
3. Click **Create token**.
4. Name the token.
5. Choose the workspace access.
6. Copy the full token immediately.

The full PAT is shown only once. Store it in a password manager.

### What A Full PAT Looks Like

A full PAT starts with `gp_tok_` and is long:

```text
gp_tok_ABC123XYZ.eyJhbGciOiJSUzI1NiIs...(very long)...abc123
```

The short value shown later in the token table is only a display prefix. It is not the full token and cannot be used to connect.

The token expiration date is shown in the dashboard. You can revoke or rotate a PAT any time.

---

## Verify A PAT With Curl

Before configuring any AI client, test the PAT directly:

```bash
curl -sS -X POST https://mcp.solcrys.com/mcp \
  -H "Authorization: Bearer <PASTE_FULL_PAT_HERE>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

A working token returns a JSON-RPC response with a `tools` list.

If this curl command fails, fix the token before debugging your AI client.

---

## Generic PAT Configuration

For clients that support custom MCP headers, configure:

```text
URL: https://mcp.solcrys.com/mcp
Header: Authorization: Bearer <FULL_PAT>
```

The request must be sent as `POST`.

For raw HTTP integrations, also send:

```text
Content-Type: application/json
Accept: application/json, text/event-stream
```

---

## Example Client Setups

### Claude Code

OAuth:

```bash
claude mcp add --transport http solcrys https://mcp.solcrys.com/mcp
```

PAT:

```bash
claude mcp add --transport http solcrys https://mcp.solcrys.com/mcp \
  --header "Authorization: Bearer <FULL_PAT>"
```

Verify:

```bash
claude mcp list
```

---

### Claude Desktop

Claude Desktop supports remote MCP servers **only** through the in-app **Custom Connector** flow (OAuth). Do not edit `claude_desktop_config.json` for SolCrys — Anthropic only documents that file for local stdio servers, not remote HTTP servers.

1. Open Claude Desktop and click **Connectors** in the sidebar (or the connectors icon in the chat composer).
2. Click the **+** at the top of the Connectors panel and choose **Add custom connector**.
3. Fill in:

   - **Name:** SolCrys AEO (or any label)
   - **Remote MCP server URL:** `https://mcp.solcrys.com/mcp`

4. Click **Add**. Claude Desktop opens a browser tab for OAuth consent on SolCrys — sign in, pick a tenant, click **Authorize**.
5. The connector card flips to **Connected**. Ask in a chat:

   ```text
   List my SolCrys workspaces.
   ```

There is no PAT path for Claude Desktop. If you need a long-lived token (scripting, RPA), use **Claude Code** or **Cursor** with a PAT — both are documented elsewhere in this guide.

---

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "solcrys": {
      "url": "https://mcp.solcrys.com/mcp",
      "headers": {
        "Authorization": "Bearer <FULL_PAT>"
      }
    }
  }
}
```

Restart Cursor, then ask:

```text
List my SolCrys workspaces.
```

---

### VS Code

Use a workspace or user MCP config.

```json
{
  "servers": {
    "solcrys": {
      "type": "http",
      "url": "https://mcp.solcrys.com/mcp",
      "headers": {
        "Authorization": "Bearer <FULL_PAT>"
      }
    }
  }
}
```

Reload VS Code after editing the config.

> **Using the Continue extension instead of native VS Code MCP?** Edit `~/.continue/config.json` with the same shape under the `mcpServers` key:
>
> ```json
> {
>   "mcpServers": {
>     "solcrys": {
>       "url": "https://mcp.solcrys.com/mcp",
>       "headers": { "Authorization": "Bearer <FULL_PAT>" }
>     }
>   }
> }
> ```
>
> Reload VS Code after editing.

---

### Codex

Codex CLI supports bearer tokens for streamable HTTP MCP servers. Prefer keeping the full PAT in an environment variable and referencing that variable from `~/.codex/config.toml`:

```toml
[mcp_servers.solcrys]
url = "https://mcp.solcrys.com/mcp"
bearer_token_env_var = "MCP_PAT_TOKEN"
```

Set `MCP_PAT_TOKEN` in the shell where you launch Codex.

If you need to put the header directly in Codex config instead, use `http_headers`:

[mcp_servers.solcrys.http_headers]
Authorization = "Bearer <FULL_PAT>"
```

Verify:

```bash
codex mcp list
```

---

### Custom HTTP, RPA, Or Automation Tools

Use PAT auth, not OAuth.

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `https://mcp.solcrys.com/mcp` |
| Auth type | Bearer token, API key, static token, or custom header |
| Header | `Authorization: Bearer <FULL_PAT>` |
| Content-Type | `application/json` |
| Accept | `application/json, text/event-stream` |

Test body:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

---

## Verify Any Connection

After setup, ask your AI client:

```text
List my SolCrys workspaces.
```

Success means the client can access SolCrys MCP.

If you see an empty workspace list, authentication worked, but the account or token does not have access to any workspaces.

---

## Troubleshooting

### "Last used: never"

The PAT has not successfully authenticated yet.

Run the curl test above.

If curl works, the PAT is valid and the issue is your client configuration.

If curl fails, create a new PAT and try again.

---

### `missing_token`

No `Authorization` header reached SolCrys.

Check that your client sends:

```text
Authorization: Bearer <FULL_PAT>
```

Do not use:

```text
Authorization: <FULL_PAT>
X-API-Key: <FULL_PAT>
Bearer: <FULL_PAT>
```

---

### `invalid_token`

The header reached SolCrys, but the token was not accepted.

Common causes:

- You pasted the short display prefix instead of the full PAT.
- The token was truncated by the client.
- The token contains extra spaces or line breaks.
- The token was revoked.
- The token expired.
- The token came from a different environment.

Create a new PAT and verify it with curl.

---

### `redirect_uris[0] must use https (or http for localhost)`

Your client is trying to use OAuth registration.

OAuth redirect URLs must use either:

```text
https://...
http://localhost/...
http://127.0.0.1/...
```

If you meant to use a PAT, change the client auth type to one of:

```text
Bearer Token
API Key
Static Token
Custom Header
```

Then configure:

```text
Authorization: Bearer <FULL_PAT>
```

---

### "Unexpected response from server"

Many MCP clients hide the real HTTP error.

Run the curl test. The curl response will usually show the actual issue: `missing_token`, `invalid_token`, or another specific error.

---

### Empty Workspace List

Authentication worked, but the authenticated account or PAT does not have access to any workspaces.

Check the workspace access in SolCrys, or create a new PAT with the correct workspace access.

---

### `workspace_not_found`

The workspace slug is wrong or not accessible to the token.

Ask:

```text
List my SolCrys workspaces.
```

Use the `slug` from that response, not the display name.

---

### `insufficient_scope`

The token does not have the required read scope.

Create a new PAT with broader read access.

---

## What To Send Support

If you are still stuck, send support:

- AI client name and version
- Auth method used: OAuth or PAT
- The curl response body
- The PAT prefix only, for example `gp_tok_ABC123...`

Never send the full PAT.

Support: `support@solcrys.com`

---

## Example Prompts

After setup, try:

```text
List my SolCrys workspaces.
```

```text
For <workspace-slug>, show visibility KPIs for the last 30 days.
```

```text
For <workspace-slug>, which prompts are losing presence?
```

```text
For <workspace-slug>, show the top cited domains and flag owned-media gaps.
```

```text
For <workspace-slug>, summarize the highest-priority recommendations from deep analysis.
```

---

## Security Notes

- SolCrys MCP is read-only.
- Workspace access is scoped to the authenticated account or PAT.
- PATs should be stored in a password manager.
- Revoke unused PATs from the MCP admin page.
- Do not share full PATs with support or paste them into chat tools.
