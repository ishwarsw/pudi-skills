# pudi-skills

Two Claude Code plugins in one marketplace repo.

| Plugin | Skills | Has a hook |
|---|---|---|
| `pudi` | `pudi`, `pudi-review`, `pudi-debt`, `prd-writer` | no |
| `guardrails` | `guardrails` | yes — PreToolUse on Write/Edit/NotebookEdit |

The split is deliberate: `pudi` is prompt-only and shareable, `guardrails`
carries personal standards plus mechanical enforcement, so it can be toggled
off per project without losing the rest.

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
- **guardrails** — nine non-negotiables. Rule 7 is enforced by
  `guardrails/scripts/policy-check.js`, which blocks the write rather than
  asking nicely.

## The hook

`policy-check.js` blocks four things on every file write: leading-underscore
names you create, `__main__` guards, `__all__`, and unpinned dependency
versions. Exit 2 + stderr = blocked.

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
