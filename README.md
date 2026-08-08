# pudi-skills

Three Claude Code plugins. One idea holds them together:

**Skill descriptions are probabilistic. `exit 2` is not.**

A skill loads when the model decides its description matches. That is a
judgment call, and judgment calls miss. So every rule here that can be checked
mechanically is *also* a hook — the skill is the explanation, the hook is the
enforcement. When they disagree, the hook wins, because the hook actually ran.

| Plugin | Skills | Enforcement | Install it when |
|---|---|---|---|
| `pudi` | `pudi`, `pudi-review`, `pudi-debt`, `prd-writer` | PostToolUse, warn | Always |
| `guardrails` | `guardrails` | PreToolUse, **blocks** | Always |
| `scanner` | `add-analyzer`, `build-report`, `risk-radar` | PreToolUse, **blocks** | Only in a repo that has a code-quality scanner |

Three plugins, not one, so you can turn off what a given repo doesn't need.
`pudi` shapes *how much* you build. `guardrails` carries standards that don't
bend. `scanner` is a toolchain for one specific kind of project and stays out
of the way everywhere else.

## Install

Not installable from the git URL — the marketplace must come from a local
clone.

```bash
git clone https://github.com/pudiish/pudish.git
```

Then in Claude Code, pointing at wherever you cloned it:

```
/plugin marketplace add ./pudish
/plugin install pudi@pudi-skills
/plugin install guardrails@pudi-skills
/plugin install scanner@pudi-skills      # only for scanner repos
```

Update later: `git pull` in the clone, then `/plugin marketplace update pudi-skills`.

---

## `pudi` — build less

**`pudi`** — the ladder. Stop at the first step that holds: does this need to
exist → already in the codebase → stdlib → native platform → installed dep →
one line → minimum that works. Levels (`lite`/`full`/`ultra`) apply to the
message you say them in; nothing persists between messages.

The rule that matters most is the one people skip: *the ladder shortens the
solution, never the reading.* A small diff in the wrong place isn't lazy, it's
a second bug.

**`pudi-review`** — hunts over-engineering only, never correctness. Scope
`diff` (default) or `repo`. One line per finding: location, what to cut, what
replaces it. Ends with `net: -N lines`.

**`pudi-debt`** — harvests `pudi:` comments into a ledger so deferrals don't
rot into "later means never". Flags any marker with no upgrade trigger.

**`prd-writer`** — 13-section PRD structure with testable acceptance criteria.

### Hook: `complexity-watch.py` (PostToolUse, warn only)

After a `.py` write or edit, measures max cyclomatic complexity with `ast` —
exact, not an estimate — and compares to the previous measurement. Speaks only
when complexity **both rose and landed above 7**; ordinary churn under the
threshold isn't worth a sentence. One line of `additionalContext`, never
blocks, any internal error exits silently.

Non-Python files are skipped rather than guessed at. Tests, fixtures, and
vendored dirs are skipped. Cache lives in the system temp dir keyed by absolute
path, so no repo gets a stray dotfile.

---

## `guardrails` — standards that don't bend

Nine non-negotiables covering ask-don't-guess, minimal diffs, stable public
signatures, reuse-before-create, naming, error handling, dependencies, testing,
and commits. Detail lives in three `references/` files loaded only when the task
needs them.

Rule 1 (**ask, don't guess**) and `pudi`'s bias toward shipping pull opposite
ways on purpose. The split: ambiguous about *what* to build → stop and ask.
Ambiguous about *how much* → ship the lazy version and name what you skipped.

### Hook: `policy-check.js` (PreToolUse, blocking)

Rule 7 is the hook. Four things blocked on every write:

| Blocked | Notes |
|---|---|
| Leading-underscore names you create | `__init__`, `__name__` etc. allowlisted |
| `if __name__ == "__main__":` | anchored to line start |
| `__all__ = ...` | anchored to line start |
| Unpinned dependencies | `requirements.txt`, `pyproject.toml`, `package.json` |

**It only inspects lines an edit actually adds.** An `Edit` whose `new_string`
carries untouched context isn't penalised for what was already there — without
this, any file containing a pre-existing violation becomes permanently
uneditable, including by the edit that would fix it.

Unpinned-dependency coverage, all verified:

```
certifi                 blocked — no version at all
numpy                   blocked
urllib3<3               blocked — range specifier
django>=4               blocked
flask~=2.0              blocked
pkg @ git+https://...   blocked — VCS ref with no pinned revision
requests==2.31.0        passes
requests[socks]==2.31.0 passes — extras are fine, the pin is what matters
tomli==2.0.1 ; python_version < "3.11"   passes — env markers aren't ranges
```

For `pyproject.toml` only lines inside a `dependencies` array are read, so
`name = "my-project"` and `[tool.ruff] select = [...]` are not mistaken for
bare requirements.

Test it standalone — note `printf`, not `echo`: under zsh a `\n` inside single
quotes stays a literal backslash-n, which makes the JSON invalid, and the hook
fails open on unparseable input, so `echo` would show you a silent pass:

```bash
printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"t.py","content":"__all__ = []"}}' \
  | node guardrails/scripts/policy-check.js; echo "exit=$?"   # exit=2
```

---

## `scanner` — only for scanner repos

These three assume a code-quality scanner that emits `analysis.<feature>` JSON
and keeps a fixture corpus. **In any other repo they do nothing** — that's
deliberate, and `add-analyzer` says so itself, handing you back to `ruff` or
`eslint` rather than building a scanner to answer a lint question. Skip this
plugin unless you have that project.

**`add-analyzer`** — one analysis feature = one file, behind a design-first
gate that waits for an explicit "go" before any code. Unsupported language
returns `null`, never a guessed number. Thresholds live in
`references/recipes.md`, read when implementing, not when designing.

**`build-report`** — the human-readable outputs: self-contained HTML dashboard,
Markdown summary, badge, `FIXES.md`. Design language in
`references/dashboard-design.md`, read only when writing HTML.

**`risk-radar`** — ranks which files are likeliest to break next from churn,
author spread, and complexity:

```
risk = 0.45*norm(mean_complexity) + 0.35*norm(churn) + 0.20*norm(authors)
```

Weights ship in the output — a ranking with hidden weights is a black box, and
a black box is ignorable. Every row gets a plain-English reason. No git history
means the score is `null`, not a guess. Ships `scripts/risk_radar.py`,
stdlib-only, for repos with no scanner.

### Hook: `report-check.js` (PreToolUse, blocking)

Two mechanical checks behind `build-report`'s non-negotiables.

**1. A generated report dashboard makes zero network requests.** Off-host
`<script src>`, `<link href>`, `<img src>`, `@import`, css `url()`, `fetch()`,
or `XMLHttpRequest` is blocked. Scoped by path — only `.html` under a
`*reports/` directory or named `dashboard|report|summary|scan-report|quality-report.html`.
Ordinary web work is untouched: a CDN script tag in `src/app/index.html`
passes.

**2. No intact credential pattern outside a fixture corpus.** AWS access key id
pattern and private-key headers only — pattern-certain, never heuristic.
A false positive here costs you a write, so entropy guessing stays in the
scanner where it costs only a finding. Paths under `fixtures/` are exempt;
that's the one place intact patterns belong.

Like `policy-check.js`, this diffs `old_string` against `new_string` and checks
only added lines.

```bash
printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"scanner-reports/dashboard.html","content":"<script src=\"https://cdn.example.com/x.js\"></script>"}}' \
  | node scanner/scripts/report-check.js; echo "exit=$?"   # exit=2
```

---

## Known limits

Stated rather than discovered later:

- **`complexity-watch.py` fails open by design.** Any internal error exits
  silently. That's correct for a warn-only hook, but it means a broken hook is
  indistinguishable from a quiet one. It invokes `python3` — bare `python`
  doesn't exist on stock macOS and most modern Linux, and would have failed
  invisibly.
- **`pudi-review`'s `net: -N lines` is an estimate with no verification step.**
  Count only what you actually located and named. The `pudi-debt` ledger is the
  only real count of what was deliberately not built.
- **Secret detection is two patterns, on purpose.** AWS key ids and private-key
  headers. It will not catch a generic high-entropy token. That's the stated
  trade: in a blocking hook, a false positive costs a write.
- **`scanner` is dormant in most repos.** Three of eight skills only fire in a
  project with a scanner. If you don't have one, don't install the plugin.

## Open

- **[OPEN]** Static type-checker for personal projects (mypy / pyright / none),
  strictness, and whether a clean type-check gates anything.
- **[OPEN]** Commit-message format — Conventional Commits, ticket prefix, or
  free-form. `references/testing-and-commits.md` currently only says "explain
  why".

## History

Consolidated from eight loose skills in `~/.claude/skills/`. The `puditail`
suite was six skills; `puditail-audit` folded into `pudi-review` as a scope
argument, `puditail-help` and `puditail-gain` were removed — the first was a
help card for a suite that no longer needs one, the second printed upstream
benchmark figures that couldn't be verified from this install.

Later split three ways: the scanner skills left `pudi` because a plugin that
sits dormant in most repos shouldn't be bundled with one that fires on every
task — the same YAGNI argument `pudi` itself makes.
