# odin plugin — user guide

A practical, task-oriented guide to using the **odin** plugin (Claude Code and Codex) in your
day-to-day ODIN scripting. For one-time install steps see the
[README](README.md); this guide is about what to *do* once it's installed.

> **Who this is for:** ODIN scripters who write `.odin` questionnaire scripts (e.g.
> Nfield exports) and want Claude to check, audit, and reason about them against
> ground truth instead of guessing from the raw text.

---

## The mental model

Everything the plugin does is backed by the **canonical ODIN engine** — the same
parser behind the VS Code extension's Problems panel — reached through one `odin`
binary, which the plugin runs for you through `npx @arodroz/odin`. You never have to trust Claude's *reading* of a script; the engine states
the facts, and Claude reasons over them.

You interact with it four ways, from most explicit to most automatic:

| You do this | And you get |
|-------------|-------------|
| Type a **`/odin:` command** | A scripted action — validate a file, audit a corpus, look up syntax |
| **Ask in plain English** ("audit my scripts") | Claude picks the right MCP tool or the **odin-review skill** on its own |
| **Edit a `.odin` file** (you or Claude) | The **hook** silently re-validates it and flags real problems |
| (under the hood) | The **MCP tools** Claude calls to get diagnostics, the structural map, etc. |

You don't have to choose a "mode" — use a command when you know exactly what you
want, or just describe the goal and let Claude reach for the tools.

---

## Quick check: is it working?

After installing (README) and starting a fresh session:

1. Type `/odin:` — you should see `audit`, `check`, and `explain` in the completion list.
2. Ask: *"List the odin MCP tools you have."* — Claude should name `check`, `symbols`,
   `review`, and `explain`.
3. Run `/odin:check` on any `.odin` file — you should get either `clean` or a list of
   `file:line:col` diagnostics.

If `/odin:` shows nothing, see [Troubleshooting](#troubleshooting).

---

## The slash commands

### `/odin:check <path>` — validate one file

Validates a single script against the engine and reports every diagnostic, then
offers fixes.

```
/odin:check W25266q.odin
```

Claude calls the `check` tool, and you get the same diagnostics the VS Code Problems
panel would show — for example:

```
W25266q.odin:1:13: error: mismatched input '*GOTO' expecting a valid command or value
W25266q.odin:1:19: warning: Undefined question 'Q99'
```

Claude then proposes concrete fixes and re-checks until the file is clean. Use this
when you've just written or pasted a script and want it vetted before fielding.

### `/odin:audit [glob]` — review a whole corpus

Audits every matching script at once, triages by what's actually broken, and drills
into the worst offenders. Defaults to `*.odin` in the current directory.

```
/odin:audit *.odin
```

You get a per-file + aggregate roll-up, e.g.:

```
  I26141q.odin: 0 error(s), 0 warning(s), 153 question(s), 22 orphan var(s)
  W25266q.odin: 10 error(s), 1 warning(s), 140 question(s), 14 orphan var(s)
7 file(s), 4 with errors: 13 error(s), 1 warning(s); 1044 question(s), 0 dangling edge(s)
```

…and Claude interprets it for you: which file to fix first, which "orphans" are
benign (working variables written but never read are normal), and which signals —
errors, **dangling routing edges** — are almost always real defects. This command
drives the **odin-review skill** end-to-end.

### `/odin:explain <name>` — look up real syntax

Prints the canonical reference for an ODIN command, function, operator, or system variable —
the same text the editor hover shows. Saves you (and Claude) from guessing syntax
and burning an edit→check→fix cycle.

```
/odin:explain *PUT
/odin:explain ?STRREPLACE
/odin:explain _ISTEST
/odin:explain RAN
```

```
$ /odin:explain ?STRREPLACE
**?STRREPLACE** — Replace text; set 4th arg to 1 for regex
`?STRREPLACE(str, find, repl[, regex])`
```

Commands start with `*`, functions with `?`, operators use the manual's notation
(`RAN`, `#`, `TO`, `QxMy`), and system variables are bare. Lookups are
case-insensitive. A "no reference" answer means the reference has no entry, not that
ODIN lacks the construct.

---

## Just ask — the odin-review skill

You don't need a command for the heavier work. Describe the goal and Claude invokes
the **odin-review skill**, which reasons over the engine's structural map (never the
raw text). Three things it's especially good at:

- **Corpus audit** — *"Audit all the `.odin` files in this folder and tell me which to
  fix first."* Same engine as `/odin:audit`, but you can layer on follow-up questions.
- **Intent-vs-spec reconciliation** — *"Here's the questionnaire spec (PDF). Does
  `survey.odin` actually implement it?"* Claude pulls the script's structural map,
  reads your spec, and reports what's **missing**, **mismatched routing**, **orphaned**,
  or **extra** — each tied to a real symbol or flow edge, not a grepped line.

The skill's one hard rule is also your guarantee: **it never infers structure by
reading or regexing `.odin` source.** If the engine can't tell it something, it says
so rather than guessing.

---

## The auto-validate hook

Once installed, the hook works with zero effort: **every time a `.odin` file is
edited** — by you or by Claude — it re-runs the engine and, if the edit left a real
problem, feeds the diagnostics back into the conversation before Claude's next turn.

What you'll notice:

- **Clean edits are silent.** No problems → nothing appears, Claude just continues.
- **Real problems surface immediately.** Introduce a dangling `*GOTO` and you'll see:

  ```
  `odin check` found 1 issue(s) in survey.odin after your edit:
    survey.odin:5:18: warning: Undefined question 'Q99'
  ```

  …and Claude can correct it on the spot.
- **Noise is suppressed.** Only **errors and warnings** surface. Low-severity *hints*
  (like an unreachable-code note after an `*END`) are intentionally not raised — real
  scripts carry those routinely and they're not "a broken edit."
- **Non-`.odin` edits are ignored** entirely.

The effect: Claude double-checks its own ODIN edits against ground truth without you
having to remember to ask. You can confirm it's active by having Claude make a
deliberately broken edit to a scratch `.odin` file.

---

## Using the same tools in Codex or Cursor

In **Codex**, the plugin gives you the same MCP tools, resources and the odin-review
skill. There are no slash commands and no auto-validate hook, so ask in plain words:
*"check survey.odin"*, *"audit the scripts in this folder"*.

In **Cursor** (or any MCP client), add to `~/.cursor/mcp.json` (global) or
`.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "odin": { "command": "npx", "args": ["-y", "@arodroz/odin", "mcp"] }
  }
}
```

Restart Cursor and ask its agent to check or audit your scripts. The tools and
resources are identical across clients.

---

## Troubleshooting

**`/odin:` shows no commands.**
The plugin isn't loaded. Confirm with `/plugin` that `odin@anteras-odin` is installed
and enabled, then start a new session or run `/reload-plugins`.

**The odin MCP server won't connect.**
The plugin starts it with `npx`, so Node.js 18+ must be on your `PATH`. Check that
`npx -y @arodroz/odin explain '*PUT'` works in a terminal: the first run downloads
the engine for your platform (a proxy or offline machine can block that), later runs
use npm's cache.

**The hook never fires.**
It only reacts to `.odin` files, and only to **error/warning** severity (hints are
suppressed). Make a clearly invalid edit (e.g. a `*GOTO` to a question that doesn't
exist) to a `.odin` file to see it. If still nothing, verify the hook handler works
directly: `echo '{"tool_input":{"file_path":"/abs/path/to/survey.odin"}}' | npx -y @arodroz/odin hook`
should print block JSON for a defective file.

**My script is UTF-16 (a typical Nfield export) — will it work?**
Yes. Every surface (`check`, `audit`, the hook, the tools) decodes UTF-8 and UTF-16
transparently. You don't need to convert anything.

**A diagnostic looks wrong / the engine rejects valid syntax.**
The engine is the canonical source of truth, but it can have grammar gaps. File it at
the [issue tracker](https://github.com/arodroz/odin-plugins/issues) with the smallest
snippet that reproduces — that's how grammar coverage improves.

---

## Go deeper

- [README](README.md) — install, prerequisites, the Cursor snippet.
- The `odin://commands`, `odin://functions` and `odin://operators` MCP resources — the complete language
  reference, browsable from any MCP client.
