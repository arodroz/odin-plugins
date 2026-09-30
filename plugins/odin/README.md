# odin — NIPO ODIN tooling for Claude Code and Codex

A one-install plugin that wires the **canonical NIPO ODIN engine** into Claude Code
and Codex. Installing it gives you, with no manual configuration:

- **MCP tools** — `check` (ground-truth diagnostics), `symbols` (the structural map),
  `review` (corpus audit), `explain` (command/function/operator reference), and the
  license-gated `gesstabs` generator — plus the `odin://commands`, `odin://functions`
  and `odin://operators` reference resources.
- The **`odin-review` skill** — corpus audit, intent-vs-spec, and generator-vs-source
  reconciliation, all reasoning over the engine's structural map (never raw text).
- **`/odin:` slash commands** (Claude Code) — `/odin:audit`, `/odin:check`, `/odin:explain`.
- A **PostToolUse hook** (Claude Code) — every `.odin` edit is auto-validated against
  the engine, and any Error/Warning is fed back into the conversation before the next turn.

Everything is backed by the same engine as the ODIN VS Code extension, so the tools,
the skill, the commands and the hook can never drift from each other or from your editor.

## Prerequisite

**Node.js 18 or later** on your `PATH` (`node --version`). The plugin runs the engine
through `npx @arodroz/odin`, which downloads the prebuilt binary for your platform
(Windows x64, macOS x64/arm64, Linux x64/arm64) on first use and caches it. The plugin
pins the engine version, so updating the plugin updates the engine.

## Install

**Claude Code** — from inside a session:

```
/plugin marketplace add arodroz/odin-plugins
/plugin install odin@anteras-odin
```

Then start a new session (or `/reload-plugins`).

**Codex** — from a terminal:

```sh
codex plugin marketplace add arodroz/odin-plugins
codex plugin add odin@anteras-odin
```

Then start a new Codex session. Codex gets the MCP tools, resources and the skill; the
slash commands and the auto-validate hook are Claude Code features.

**Updating:** `/plugin marketplace update anteras-odin` in Claude Code, or
`codex plugin marketplace upgrade` in Codex.

Confirm it loaded:

- Ask *"List the odin MCP tools you have"* — you should get `check`, `symbols`,
  `review`, `explain` and `gesstabs`. The first start can take a few seconds while
  `npx` downloads the engine.
- In Claude Code, `/help` lists `/odin:audit`, `/odin:check`, `/odin:explain`, and
  editing a `.odin` file with a defect (e.g. a dangling `*GOTO`) surfaces the engine's
  diagnostics on the next turn.

### Try it

```
/odin:audit *.odin            # corpus audit + triage
/odin:check survey.odin       # validate one file against ground truth
/odin:explain ?STRREPLACE     # canonical reference for a function
/odin:explain RAN             # ...or an operator
```

In Codex, ask for the same thing in plain words: *"audit the .odin files here"*.

New to the plugin? The **[user guide](USER_GUIDE.md)** walks through each command, the
review skill, and the auto-validate hook with worked examples and troubleshooting.

## Command line, and other MCP clients

The engine is also a normal CLI:

```sh
npm install -g @arodroz/odin
odin check survey.odin
odin explain '*PUT'
```

Any MCP client can run the server directly. For Cursor, add this to
`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "odin": { "command": "npx", "args": ["-y", "@arodroz/odin", "mcp"] }
  }
}
```

## GESStabs licensing

The `gesstabs` tool runs behind the same license gate as the VS Code Pro extension. Its
key is read **only** from the `$ODIN_LICENSE_KEY` environment variable of the process
that launches the MCP server — never a tool argument — so it can't land in a transcript
or argv. Within the trial window no key is needed; when the gate blocks, the tool
degrades gracefully (`{available:false, reason, message}`) rather than returning a
misleading empty result.

## Privacy

The engine analyses your scripts locally and never uploads them. Its only network
traffic is the GESStabs license check, which sends the license key and a machine
instance name to the license provider.

## License

Free to use, including commercially; not open source. See [LICENSE.md](LICENSE.md).
Report problems at [github.com/arodroz/odin-plugins/issues](https://github.com/arodroz/odin-plugins/issues).
