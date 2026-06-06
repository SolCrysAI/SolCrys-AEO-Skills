# SolCrys AEO MCP

Everything you need to connect your AI client to the SolCrys AEO Answer Engine Optimization platform, plus five ready-to-use skills that demonstrate the kinds of analysis the MCP unlocks.

The SolCrys MCP server lets your favorite AI client — Claude Code, Claude Desktop, Cursor, VS Code Copilot, ChatGPT/Codex, and others — query your brand-visibility data across ChatGPT, Gemini, Perplexity, and Claude. Ask in plain English; your AI client pulls the answer (or drafts the deliverable) straight from your SolCrys data.

---

## 🚀 Get started

You'll need a SolCrys AEO workspace to use anything in this repo. Sign-up takes a couple of minutes and the first workspace is free to set up:

### → [**Sign up and create your workspace at solcrys.com**](https://solcrys.com)

Once your workspace is live, open [**customer-guide.md**](./customer-guide.md) for the connection steps and per-client setup snippets.

---

## What's in this repo

| File | Purpose |
|---|---|
| [customer-guide.md](./customer-guide.md) | The full user guide — who SolCrys MCP is for, how to connect (OAuth or PAT), per-client setup snippets for the 5 most-asked clients, the tool catalog, and troubleshooting. **Start here.** |
| [skills/](./skills/) | Five production-ready Claude skills that demonstrate end-to-end workflows on top of the MCP tools. Drop them into your AI client's skill directory or use them as prompt templates. |
| [skills/soul.md](./skills/soul.md) | The rule-set every skill obeys: data-grounded claims only, AEO-goal-aligned recommendations, fact-grounded writing with web search and user-supplied docs. Read this if you're forking or building your own skills. |

## The six skills

| Skill | Deliverable | When to trigger |
|---|---|---|
| [solcrys-weekly-cmo-brief](./skills/solcrys-weekly-cmo-brief/SKILL.md) | One-page executive brief: headline, key numbers, what's trending, where we're losing, recommended actions, forward-looking note. | *"Generate this week's CMO brief", "Summarize what changed", "What should I tell my CMO"* |
| [solcrys-domain-influence-report](./skills/solcrys-domain-influence-report/SKILL.md) | Citation landscape report broken out by source type (Competitor → Editorial → UGC → Owned) with analysis per block and content-strategy implications. | *"Who's getting cited about our category", "Editorial vs UGC analysis", "Domain influence report"* |
| [solcrys-brand-footprint-gap-analysis](./skills/solcrys-brand-footprint-gap-analysis/SKILL.md) | Two-part report: the URLs where the brand IS surfacing in AI answers (the footprint), and the high-volume prompts where it's missing (the gaps). | *"Where am I showing up in AI answers", "Content footprint audit", "Where are we missing"* |
| [solcrys-monthly-aeo-execution-plan](./skills/solcrys-monthly-aeo-execution-plan/SKILL.md) | Executive "Winning the AI Answer Layer" playbook (Word doc): diagnoses the brand's AI visibility, explains why the category leader is cited more, maps the owned/editorial/UGC footprint gaps, and lays out a phased, indexing-aware content roadmap with KPIs. | *"Generate a monthly AEO execution plan for [workspace] from the last 30 days of data", "AEO/GEO roadmap for the next quarter", "Plan to close our AI share-of-voice gap", "How do we win the AI answer layer"* |
| [solcrys-action-driven-content](./skills/solcrys-action-driven-content/SKILL.md) | Publication-ready first-draft web content (blog post, landing-page section, or FAQ entry) for a task pulled from the action queue, grounded in deep-analysis reasoning and the competitive citation landscape. | *"Pick an action from my queue and draft the content", "Write the blog post for task X", "Execute one of my AEO recommendations"* |
| [solcrys-audit-action-content](./skills/solcrys-audit-action-content/SKILL.md) | Apply-ready page fix for a content-audit recommendation (the JSON-LD/schema block, heading restructure, meta tags, or section rewrite) grounded in the live page and real brand facts, plus the re-audit verify loop that proves the score recovered. | *"Fix the page the audit flagged", "Draft the schema the content audit recommends", "Implement an audit action for URL X", "What do I change to recover the audit points"* |

## Installing the skills

### Claude Code (recommended)

Skills live in `~/.claude/skills/` (user-wide) or `<project>/.claude/skills/` (project-scoped). Pick the scope you want and copy our skills in:

**User-wide install** — skills available in every Claude Code session:

```bash
# Clone this repo somewhere out of the way
git clone https://github.com/SolCrysAI/SolCrys-AEO-Skills.git ~/solcrys-aeo-skills

# Copy the skills (and soul.md, which the skills reference) into your Claude Code skills dir
mkdir -p ~/.claude/skills
cp -r ~/solcrys-aeo-skills/skills/* ~/.claude/skills/
```

**Project-scoped install** — skills available only inside a specific project:

```bash
# From inside your project root
git clone https://github.com/SolCrysAI/SolCrys-AEO-Skills.git /tmp/solcrys-aeo-skills
mkdir -p .claude/skills
cp -r /tmp/solcrys-aeo-skills/skills/* .claude/skills/
```

**Verify the install:**

```bash
ls ~/.claude/skills/    # or .claude/skills/ for project scope
# Expected output: solcrys-action-driven-content, solcrys-audit-action-content,
#                  solcrys-brand-footprint-gap-analysis, solcrys-domain-influence-report,
#                  solcrys-monthly-aeo-execution-plan, solcrys-weekly-cmo-brief, soul.md
```

Then start a Claude Code session and try a triggering phrase like *"Generate this week's CMO brief for [your-workspace-slug]"* — Claude Code should activate the skill automatically based on its description.

### Keeping the skills up to date

```bash
cd ~/solcrys-aeo-skills   # or /tmp/solcrys-aeo-skills
git pull
cp -r skills/* ~/.claude/skills/   # or .claude/skills/
```

### Uninstalling

```bash
rm -rf ~/.claude/skills/solcrys-* ~/.claude/skills/soul.md
```

### Other AI clients

Cursor, VS Code Copilot, and OpenAI Codex CLI don't have a native skill-loading directory the way Claude Code does. Use the skills as **prompt templates** instead: open any `SKILL.md`, copy the body of the file (everything below the YAML frontmatter), and paste it into your AI client as system context or as the first message before your real question. The skill's instructions will steer the assistant through the right tool sequence.

For Claude Desktop, you can either (a) use the prompt-template approach, or (b) if your Claude Desktop install supports the skills plugin system, drop the skills into the configured directory — check the Claude Desktop docs for the path on your platform.

---

## How to use this repo

**If you're connecting your AI client for the first time:** Read [customer-guide.md](./customer-guide.md). It walks through both auth flows and provides copy-paste config snippets for Claude Code, Claude Desktop, Cursor, VS Code Copilot, and OpenAI Codex CLI.

**If you've installed the skills (above):** Just ask in plain English — each skill's `description` field is tuned for natural-language activation. *"Pick an action from my queue and draft the content"* or *"Generate this week's CMO brief"* are enough.

**If you're a developer building your own AEO workflows:** Read the skills as worked examples of how to chain the SolCrys MCP tools together. Fork and adapt for your own use cases — and keep [soul.md](./skills/soul.md) intact when you do.

## Customizing

The skills are workspace-agnostic — they expect the user to either name a workspace in their question or let the assistant discover it via `solcrys_list_workspaces`. If you want a skill pre-bound to a specific workspace, edit the `SKILL.md` and replace the discovery step with a hardcoded slug.

Time windows, output length, tone, and section structure are all editable — the templates are starting points, not rigid contracts.

**One thing not to edit casually:** [skills/soul.md](./skills/soul.md). Every skill references it for the three rules — data-grounded claims, AEO-aligned recommendations, fact-grounded writing — that keep outputs trustworthy. If you fork these skills, keep soul.md (or your equivalent) intact. The whole point is preventing the LLM from drifting into fabrication or off-goal advice; weakening the rules undoes that.

## License

This documentation and the bundled skills are released under the MIT License — fork, modify, redistribute, integrate into your own workflows.

## Support

- **Email** — support@solcrys.com
- **Privacy policy** — https://solcrys.com/privacy

If you build a new skill you think other SolCrys customers would benefit from, send it our way — we're collecting community contributions for the next release.

---

### Don't have a SolCrys workspace yet?

You'll need one to actually run any of this. Setup takes about 2 minutes.

→ [**Create your AEO workspace at solcrys.com**](https://solcrys.com)
