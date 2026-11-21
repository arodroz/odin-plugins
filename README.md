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

Current engine: **1.53.1**. Free to use; not open source — see [LICENSE.md](LICENSE.md).

## Feedback

Something broken, a diagnostic that looks wrong, an idea or a question:
[odin.anteras.org/feedback](https://odin.anteras.org/feedback).

It is a short form. You need no account, and your report goes privately to the developer:
it is never published. Leave your email address if you would like a reply.
In VS Code, `ODIN: Report Issue or Send Feedback` (or the lightbulb on any ODIN diagnostic)
opens the form with the details filled in.

## Support

The engine, the plugin and the VS Code extension are free and maintained by one person.
If they save you or your team time, [buy me a coffee](https://buymeacoffee.com/arodroz) —
or [become a monthly supporter](https://buymeacoffee.com/arodroz/membership).
