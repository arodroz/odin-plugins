---
description: Draft an ODIN script from a questionnaire spec (Word, PDF or text), verified by the engine until it checks clean and matches the spec.
argument-hint: "<path to the spec> [output .odin]"
---

Draft an ODIN script from the questionnaire spec `$ARGUMENTS` using the `odin-draft`
skill: inventory the spec, write the script, then verify it with the odin MCP server's
`check`, `symbols` and `explore` tools until it checks clean and matches the spec.
Report the file written, the verification results and every `** TODO:` left in it.
