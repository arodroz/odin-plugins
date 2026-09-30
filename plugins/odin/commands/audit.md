---
description: Audit a corpus of .odin scripts for errors, orphans, and dangling routing using the canonical engine, then triage and report.
argument-hint: "[glob or paths — defaults to *.odin]"
allowed-tools: mcp__plugin_odin_odin__review, mcp__plugin_odin_odin__symbols, Glob
---

Use the **odin-review** skill, Capability 1 (Corpus audit), to review the ODIN
scripts matching `$ARGUMENTS`. If `$ARGUMENTS` is empty, audit `*.odin` in the
current directory.

Drive it through the canonical engine — never read or regex the `.odin` source:

1. Expand `$ARGUMENTS` (or `*.odin`) to file paths, then call the odin MCP
   server's `review` tool with those `paths` for the corpus roll-up.
2. Read the `aggregate` first to triage: `filesWithErrors`, total `errors` /
   `warnings`, and corpus-wide `orphanLists` / `danglingEdges`.
3. For any file with `errors > 0` or `danglingEdges > 0`, pull its full structural
   map with the `symbols` tool (`path` = that file) and inspect the offending
   symbols.
4. Report per-file findings plus the aggregate, and **interpret**: a high
   `orphanVariables` count is usually benign (working vars), whereas
   `danglingEdges > 0` or `errors > 0` is almost always a real defect.

If the odin MCP server is not connected, stop and tell the user to check the
plugin install (see the plugin README) rather than falling back to scanning text.
