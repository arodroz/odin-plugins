---
description: Look up the canonical reference for an ODIN command, function, operator, or system variable (the same docs the editor hover shows).
argument-hint: "<name> — e.g. *PUT, ?STRREPLACE, RAN, _ISTEST"
allowed-tools: mcp__plugin_odin_odin__explain
---

Look up the canonical reference for the ODIN symbol `$ARGUMENTS`.

Call the odin MCP server's `explain` tool with `name` set to `$ARGUMENTS`.
Commands start with `*`, functions with `?`, operators use the manual's notation
(`RAN`, `#`, `TO`, `QxMy`), and system variables are bare (`_ISTEST`); lookups
are case-insensitive. The reference is the LSP's hover knowledge, so it is real
syntax — present it verbatim rather than paraphrasing from memory.

An unknown name comes back as a tool error. Relay its message, and remember that
the reference may be incomplete: a miss does not prove the construct is absent
from ODIN. The `odin://commands`, `odin://functions` and `odin://operators`
resources list everything the reference knows.
