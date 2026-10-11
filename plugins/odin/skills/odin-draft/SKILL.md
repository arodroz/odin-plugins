---
name: odin-draft
description: Draft a NIPO ODIN (.odin) script from a questionnaire spec (Word, PDF or text), verified by the canonical engine until it checks clean and matches the spec. Use when the user wants a questionnaire scripted, a spec turned into ODIN, or a first draft of a survey script.
---

# odin-draft

Turn a client questionnaire into a draft `.odin` script. You write the ODIN; the
canonical engine (the plugin's `odin` MCP server, or the `odin` CLI) is the only judge
of whether it is right. A draft is finished when the engine agrees with the spec, not
when it looks plausible.

Every structural fact about the draft — which questions exist, their type, categories
and routing — comes from the engine's `symbols` and `check` results, never from
re-reading the `.odin` text you wrote.

## Steps

### 1. Inventory the spec

Read the spec (`.docx`: `pandoc spec.docx -t plain`; `.pdf`: `pdftotext -layout`;
or the text the user pasted) and write an **inventory**: one row per question, in order,
with

- its number or label as the spec gives it, and the question text;
- its type: single choice, multiple choice, number, open text, grid/matrix, form, or a
  screen of text only;
- its categories with codes (keep the spec's codes; number them 1..n when it has none),
  marking exclusive ones ("none of these", "don't know") and "other, specify";
- number limits ("18–99"), and any minimum/maximum answers on a multiple choice;
- its routing: who is asked ("ask if Q1 = yes"), where an answer jumps to, screen-outs,
  loops over a list ("for each brand mentioned").

Done when every question of the spec is a row, and every routing instruction in the
spec is attached to a row. Keep the inventory: steps 3 and 4 check against it.

### 2. Write the draft

Write the script to `<name>.odin`. Look up any command you are not certain of with the
`explain` tool (`*MATRIX`, `*REPEAT`, `*CONTROL`, …) or the `odin://commands` resource
before using it — real syntax, not recalled syntax.

```
*QUESTION 10 *CODES 61L1
Do you own a car?
1: Yes
2: No

*QUESTION 20 *CODES 62L4 *MULTI *IF [Q10,1]
Which brands do you own?
1: Ford
2: Fiat
3: Other *OPEN
4: Don't know *NMUL

*QUESTION 30 *NUMBER 66L2 *RANGE [18 TO 99]
How old are you?

*QUESTION 40 *OPEN 68L1
Any comments?

*END
```

Conventions that keep a draft valid:

- **Field positions** start at 61 (1–60 hold interview metadata) and never overlap: a
  single choice needs the digits of its highest code, a `*MULTI` one position per code
  (`62L4` for codes 1–4), a number its width. Assign them in order down the script.
- **Routing** is a question-level `*IF [condition]` for "ask if", `*IF [...] *GOTO n`
  after a question for jumps, and `*END`/`*ENDST` for screen-outs. Code tests read
  `[Q10,1]`, `[Q20,1,2]` (any of), `[#Q20,3]` (not); expressions evaluate strictly left
  to right with no operator precedence — bracket compound conditions.
- What the spec leaves open goes in a comment line starting `** TODO:` with the question
  it concerns, never a guess written as fact.

### 3. Verify with the engine

Repeat until all three pass:

1. **`check`** the file. Fix every Error and Warning; Info and Hint are advice. Read each
   message — they name the Nfield rule and the fix.
2. **`symbols`** the file and compare it with the inventory, row by row: every question
   present with the right type, its categories with the spec's codes and labels, its
   `*IF` condition, and the flow edges matching the spec's jumps.
3. **`explore`** the file. An **endless loop** is a bug to fix. A question **never
   shown** must be explained by the spec (a rare route) or fixed; **stuck** usually
   means a check that random answers fail — confirm it is the spec's.

Done when `check` reports no Error or Warning, every inventory row matches the
structural map, and every `explore` finding is fixed or explained.

### 4. Hand over

Tell the user:

- the file written and the `check`/`explore` results;
- each `** TODO:` left in the draft, with the spec question it concerns and what is
  missing (a code list, a condition the spec states ambiguously, a quota);
- anything the spec asked for that the draft does not do, and why.
