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

Current engine: **1.35.1**. Free to use; not open source — see [LICENSE.md](LICENSE.md).

## Feedback

This repo is also where the NIPO ODIN Language extension for VS Code takes feedback.

- **Something broken, or a diagnostic that looks wrong:** [open an issue](https://github.com/arodroz/odin-plugins/issues/new/choose).
  In VS Code, `ODIN: Report Issue or Send Feedback` (or the lightbulb on any ODIN diagnostic) fills in the details for you.
- **Questions:** [Discussions](https://github.com/arodroz/odin-plugins/discussions).
- **Anything you can't share publicly**, such as a client script that triggers the problem:
  email [arodriguez@anteras.org](mailto:arodriguez@anteras.org?subject=ODIN%20feedback).

The issue tracker is public: please don't paste client questionnaires or respondent data there.

## Support

The engine, the plugin and the VS Code extension are free and maintained by one person.
If they save you or your team time, [buy me a coffee](https://buymeacoffee.com/arodroz) —
or [become a monthly supporter](https://buymeacoffee.com/arodroz/membership).
