# pudi-skills

Two Claude Code plugins in one marketplace repo.

| Plugin | Skills | Hooks |
|---|---|---|
| `pudi` | `pudi`, `pudi-review`, `pudi-debt`, `prd-writer`, `add-analyzer`, `build-report`, `risk-radar` | PreToolUse (block) + PostToolUse (warn) |
| `guardrails` | `guardrails` | PreToolUse (block) on Write/Edit/NotebookEdit |

The split is deliberate: `pudi` shapes how much you build, `guardrails` carries
personal standards, so either can be toggled off per project without losing the
rest.

## Install

These plugins are **not installable directly from the git URL** — the
marketplace must be added from a local clone.

```
git clone https://github.com/ishwarsw/pudi-skills.git
```

Then, inside Claude Code, point the marketplace at wherever you cloned it
(shown here for a clone under `Documents`):

```
/plugin marketplace add <path where you cloned the repo>
/plugin install pudi@pudi-skills
/plugin install guardrails@pudi-skills
```

To update later: `git pull` in the clone, then `/plugin marketplace update pudi-skills`.

## What each skill does

- **pudi** — the ladder: does this need to exist → already in the codebase →
  stdlib → native platform → installed dep → one line → minimum that works.
  Levels (`lite`/`full`/`ultra`) apply to the message you say them in; nothing
  persists between messages.
- **pudi-review** — hunts over-engineering only, never correctness. Scope
  `diff` (default) or `repo`. One line per finding, ends with `net: -N lines`.
- **pudi-debt** — harvests `pudi:` comments into a ledger so deferrals don't
  rot. Flags markers with no upgrade trigger.
- **prd-writer** — 13-section PRD structure with testable acceptance criteria.
- **add-analyzer** — one analysis feature = one file, behind a design-first
  gate. Unsupported language returns null, never a guessed number. Thresholds
  live in `references/recipes.md`, read only when implementing.
- **build-report** — the human-readable outputs of a scan: self-contained HTML
  dashboard, Markdown summary, badge, FIXES.md. Design language is in
  `references/dashboard-design.md`, read only when writing HTML.
- **risk-radar** — ranks which files are most likely to break next from churn,
  author spread, and complexity, with the weights published and a plain-English
  reason per row. No git history means the score is `null`, not a guess. Ships
  `scripts/risk_radar.py`, stdlib-only, for repos with no scanner.
- **guardrails** — nine non-negotiables. Rule 7 is enforced by
  `guardrails/scripts/policy-check.js`, which blocks the write rather than
  asking nicely.

The last three are scoped to code-quality scanner work. They will not fire on
ordinary app features — `add-analyzer` says so itself and hands you back to
`ruff`/`eslint` when the repo has no scanner.

## The hooks

Three checks across two plugins. All of them read the tool payload on stdin and
say nothing when there is nothing to say.

### guardrails — `policy-check.js` (PreToolUse, blocking)

Blocks four things on every file write: leading-underscore names you create,
`__main__` guards, `__all__`, and unpinned dependency versions. Exit 2 +
stderr = blocked.

It only inspects lines an edit actually *adds* — an `Edit` whose `new_string`
carries untouched context is not penalised for what was already there. The
`__main__` and `__all__` checks anchor to line start, so mentioning either
inside a string literal (a linter, a test fixture, this README) does not trip
them.

Test it standalone:

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"t.py","content":"__all__ = []\n"}}' \
  | node guardrails/scripts/policy-check.js; echo "exit=$?"   # exit=2
```

### pudi — `report-check.js` (PreToolUse, blocking)

Two mechanical checks behind `build-report`'s non-negotiables:

1. **A generated report dashboard makes zero network requests.** Off-host
   `<script src>`, `<link href>`, `<img src>`, `@import`, css `url()`,
   `fetch()`, or `XMLHttpRequest` in a report HTML file is blocked. Scoped by
   path — only `.html` under a `*reports/` directory or named
   `dashboard|report|summary|scan-report|quality-report.html`. Ordinary web
   work is untouched, so a CDN script tag in `src/app/index.html` passes.
2. **No intact credential pattern outside a fixture corpus.** AWS access key id
   pattern and private-key headers only — pattern-certain, not heuristic. A
   false positive here costs you a write, so entropy guessing stays in the
   scanner where it costs only a finding. Paths under `fixtures/` are exempt;
   that is the one place intact patterns belong.

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"scanner-reports/dashboard.html","content":"<script src=\"https://cdn.example.com/x.js\"></script>"}}' \
  | node pudi/scripts/report-check.js; echo "exit=$?"   # exit=2
```

### pudi — `complexity-watch.py` (PostToolUse, warn only)

After a `.py` write or edit, measures max cyclomatic complexity with `ast` and
compares against the previous measurement. Speaks only when complexity both
**rose** and **landed above 7** — normal churn under the threshold is not worth
a sentence. Emits one line of `additionalContext`; it never blocks, and any
internal error exits silently rather than interrupting work.

Non-Python files are skipped rather than guessed at. Tests, fixtures, and
vendored directories are skipped. The cache lives in the system temp directory
keyed by absolute path, so no repo gets a stray dotfile.

## Open

- **[OPEN]** Static type-checker for personal projects (mypy / pyright / none),
  strictness level, and whether a clean type-check gates anything.
- **[OPEN]** Commit-message format — Conventional Commits, ticket prefix, or
  free-form. `references/testing-and-commits.md` currently only says "explain
  why".

## History

Consolidated from eight loose skills in `~/.claude/skills/`. The `puditail`
suite was six skills; `puditail-audit` folded into `pudi-review` as a scope
argument, and `puditail-help` and `puditail-gain` were removed — the first was
a help card for a suite that no longer needs one, the second printed upstream
benchmark figures that could not be verified from this install.
