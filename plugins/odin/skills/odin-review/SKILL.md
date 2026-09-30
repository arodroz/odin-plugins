---
name: odin-review
description: Audit a corpus of NIPO ODIN (.odin) survey scripts and reconcile a script against a questionnaire spec, using the canonical engine's structural map as ground truth. Use when the user wants to review many .odin files for errors/orphans, compare an .odin to a Word/PDF spec, or asks for a corpus audit, intent-vs-spec check, or generator-vs-source reconciliation.
---

# odin-review

Deliberate, multi-step review of ODIN scripts. This is the *judgment* layer — it
reasons about whether a questionnaire is correct and matches intent. The *structure*
it reasons over always comes from the canonical engine — the plugin's `odin` MCP
server, or the `odin` CLI — never from reading raw `.odin` text.

This is distinct from the `odin hook` PostToolUse handler (also bundled in this
plugin), which auto-validates a single file after every edit. Use this skill for
cross-file audits and spec reconciliation a human would deliberately ask for.

## The one hard rule

**Never infer questionnaire structure by reading or regexing `.odin` source.** ODIN is
not regex-parseable; the canonical engine already resolved the symbols, references, and
routing for you. Every structural fact — what questions exist, which lists are orphaned,
where routing jumps — comes from:

- the `review` MCP tool (`paths`) / `odin review <paths>... --json` — corpus roll-up
  (counts, diagnostics, orphans)
- the `symbols` MCP tool (`path`) / `odin check <path> --symbols --json` — one file's
  full structural map (every question, variable, list, subroutine, and flow edge)

You may *read* the spec document and the prose of a question, but the structure is the
engine's to state and yours to judge.

## Prerequisite

Prefer the plugin's `odin` MCP server: its `check`, `symbols`, `review`, `explain` and
`gesstabs` tools return exactly the JSON contracts the CLI commands below print with
`--json`, so every CLI example has an MCP twin. The plugin starts the server itself
(through `npx @arodroz/odin`); nothing needs to be on `PATH`.

The CLI examples assume `odin` on `PATH` (`npm install -g @arodroz/odin`). If neither
the MCP server nor the CLI is available, stop and tell the user to check the plugin
install rather than falling back to text scanning.

## Capability 1 — Corpus audit

Audit every script in a working tree at once and rank by what is actually broken.

1. Run the audit over the corpus:
   ```sh
   odin review *.odin --json
   ```
   (Drop `--json` for a quick human eyeball; keep it when you will reason over the
   result.)
2. Read the `aggregate` first to triage: `filesWithErrors`, total `errors`/`warnings`,
   and corpus-wide `orphanLists`/`danglingEdges`.
3. Drill into individual `files[]` rows. Each row carries `errors`, `warnings`,
   structural counts, and the structural smells: `orphanLists`, `orphanVariables`,
   `orphanSubroutines` (symbols the engine resolved **zero** references to) and
   `danglingEdges` (a `*GOTO`/`*GOSUB` whose target is not a known question).
4. For any file worth a closer look, pull its full map with
   `odin check <file> --symbols --json` and inspect the offending symbols.
5. Report per-file findings plus the aggregate, and **interpret** — a high
   `orphanVariables` count is common and usually benign (working vars written but never
   read), whereas `danglingEdges > 0` or `errors > 0` is almost always a real defect.

Worked example:

```
$ odin review *.odin
  I26141q.odin: 0 error(s), 0 warning(s), 153 question(s), 22 orphan var(s)
  P24220q.odin: 1 error(s), 0 warning(s), 256 question(s), 2 orphan list(s), 2 orphan var(s)
  P26107q.odin: 0 error(s), 0 warning(s), 104 question(s), 29 orphan var(s), 4 orphan sub(s)
  Q25101_q1.odin: 1 error(s), 0 warning(s), 34 question(s)
  W25266q.odin: 10 error(s), 1 warning(s), 140 question(s), 14 orphan var(s), 5 orphan sub(s)
7 file(s), 4 with errors: 13 error(s), 1 warning(s); 1044 question(s), 4 orphan list(s), 0 dangling edge(s)
```

Here the audit immediately flags `W25266q.odin` (10 errors) as the script to fix first,
and the identical rows for two `P24220q` files reveal a duplicate in the tree.

## Capability 2 — Intent-vs-spec reconciliation

Given a questionnaire spec (Word/PDF) and an `.odin`, check that the script realizes
the intended questionnaire.

1. Pull the script's structural map:
   ```sh
   odin check survey.odin --symbols --json
   ```
2. Read the spec document for the *intended* questions, routing, and lists.
3. Reconcile the two — this is the judgment layer:
   - **Missing** — a question/list the spec calls for that has no symbol in the map.
   - **Mismatched routing** — the spec says "if Q3 = yes skip to Q7" but the map's
     `flowEdges` jump elsewhere (or nowhere).
   - **Orphan** — a list/variable in the map (`referenceCount 0`) the spec never
     intended, or that is defined but wired to nothing.
   - **Extra** — symbols present in the script that the spec does not mention.
4. Report each discrepancy with the spec reference and the structural fact from the
   map (question ID, edge target, symbol name) — never a line you grepped from source.

The parser owns *what the script is*; you own *whether that matches intent*.

## Capability 3 — Generator-vs-source verification

Confirm the GESStabs generator can turn the `.odin` into an internally consistent
tabulation spec — and surface every place the source contradicts what the generator
needs. The generator already reconciles source against output as it runs; its
diagnostics *are* the generator-vs-source findings. Your job is to drive it and
interpret them, not to re-derive them.

1. Run the gated generator over the script, emitting the structured contract:
   ```sh
   odin gesstabs survey.odin --json
   ```
   The license key is read **only** from `$ODIN_LICENSE_KEY` — never pass it as an
   argument or echo it. Within the trial window no key is needed.
2. **Branch on the exit code first** (this is the graceful-degradation step):
   - **Exit 1 — gated block.** The gate refused: no/expired trial or an
     invalid/unreachable license. stdout is empty; a reason-specific message is on
     stderr (e.g. *"GESStabs Generator trial has expired. Set ODIN_LICENSE_KEY to a
     valid license key to continue."*). **Report that verification was skipped because
     the license is unavailable, and quote the reason** — do not present an empty result
     as "no inconsistencies found," and do not fall back to reading the `.odin` text.
   - **Exit 2 — operational error.** Missing path or an undecodable file; relay it.
   - **Exit 0 — generator ran.** stdout is the `{schemaVersion, source, diagnostics[]}`
     contract. Proceed to step 3.
3. Read `diagnostics[]`. Each entry is LSP-shaped with `source` namespaced as
   `gesstabs:<family>` (e.g. `gesstabs:banner`, `gesstabs:recode`, `gesstabs:mean`,
   `gesstabs:battery`) and a `severity` (1 = error, 2 = warning). A non-empty list means
   the source is inconsistent with what a clean tabulation spec requires; an empty list
   (`"diagnostics": []`, exit 0) means the generator verified the script clean.
4. Report the inconsistencies grouped by `gesstabs:<family>`, each with its severity and
   message (which names the offending symbol — e.g. a banner referencing an undeclared
   variable). This is the same finding set the generator's `.generator-report.json`
   carries, so your summary matches what the Pro generator would write to disk.

Worked example — the graceful no-license path, captured on a machine with an expired
trial and no key set:

```
$ odin gesstabs P26107q.odin --json
odin gesstabs: GESStabs Generator trial has expired. Set ODIN_LICENSE_KEY to a valid license key to continue.
$ echo $?
1
```

Here the correct report is *"Generator-vs-source verification skipped — the GESStabs
license is unavailable (trial expired). Set `$ODIN_LICENSE_KEY` to run it,"* **not**
silence and **not** a text-scan fallback. With a valid key (or active trial) the same
command exits 0 and prints the diagnostics contract to act on.

## Contract reference

All three JSON contracts — `odin review`, `odin check --symbols`, and the
`odin gesstabs` report — are versioned independently (`schemaVersion`); check it
before relying on a field.
`review` and `--symbols` never exit 1 — their output is data feeding this skill's
judgment, not a pass/fail verdict; a corpus with a bad file still exits 0 and records
that file's error in its own row. `gesstabs` is the exception: it carries an exit-1
**block** tier because it runs behind the license gate, so Capability 3 must branch on
the exit code before trusting an empty diagnostics list.
