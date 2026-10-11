---
description: Run synthetic respondents through an ODIN script and report the routing none of them covered (unreached questions, untaken *IF branches, endless loops).
argument-hint: "<path to .odin> [runs]"
allowed-tools: mcp__plugin_odin_odin__explore
---

Explore the routing of the ODIN script `$ARGUMENTS`.

Call the odin MCP server's `explore` tool with `path` set to the script (and `runs`
if a number was given; the default is 200). Report, in this order:

1. **Errors**: an interview the engine cut short — a `*GOTO` or `*GOSUB` whose target
   does not exist. These are bugs. Give the line and the message.
2. **Endless loops**: a loop that reaches no question. These are bugs. Name the
   question each loop follows.
3. **Stuck**: one question shown over and over. Often a check that a real respondent
   passes but random answers didn't (for example "the total must be 100"). Present it as
   something to look at, not as a bug.
4. **Never shown**: questions no respondent reached, and **branches no respondent took**.
   Group them by the routing that leads there when the structural map (`symbols`
   tool) makes that clear.

Say plainly that "never shown" is not proof of unreachable: a route may need an answer
combination no synthetic respondent gave, and more runs narrow that down. Never infer
routing from the raw .odin text; use the `symbols` tool for structure.
