# odin-plugins

The **odin** plugin for Claude Code and Codex: the canonical NIPO ODIN analysis
engine as MCP tools (diagnostics, structural map, corpus audit, language
reference), the odin-review skill, `/odin:` commands and
auto-validation of every `.odin` edit.

```text
# Claude Code
/plugin marketplace add arodroz/odin-plugins
/plugin install odin@anteras-odin

# Codex
codex plugin marketplace add arodroz/odin-plugins
codex plugin add odin@anteras-odin
```

Requires Node.js 18+. Details: [plugins/odin/README.md](plugins/odin/README.md).
The engine alone is on npm as [`@arodroz/odin`](https://www.npmjs.com/package/@arodroz/odin).

Current engine: **1.30.0**. Free to use; not open source — see [LICENSE.md](LICENSE.md).
