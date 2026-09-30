---
description: Validate a single .odin file against the canonical engine (the same diagnostics the VS Code Problems panel shows).
argument-hint: "<path/to/script.odin>"
allowed-tools: mcp__plugin_odin_odin__check
---

Validate the ODIN file at `$ARGUMENTS` against ground truth.

1. Call the odin MCP server's `check` tool with `path` set to `$ARGUMENTS` (an
   absolute path is safest). It returns the versioned
   `{schemaVersion, path, diagnostics[]}` contract; an empty `diagnostics` list
   means verified clean.
2. If diagnostics are present, report each `line:col` finding and propose a
   concrete fix. Call `check` again after editing to confirm it is clean.

Do not infer correctness by reading the source — the engine's diagnostics are the
ground truth. If the odin MCP server is not connected, tell the user to check the
plugin install (see the plugin README); do not fall back to reading the text.
