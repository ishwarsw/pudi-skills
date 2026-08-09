# Agent-behavior tasks

`cases.jsonl` proves the hooks block what they claim to block. It says nothing
about whether the *skills* change how an agent behaves — which is the actual
product. This file is the smallest thing that closes that gap.

**This is run by hand.** There is no runner and there should not be one: the
measurement needs two full agent sessions per task, and a harness that drives
Claude Code twice is a bigger program than everything else in this repo
combined. Five tasks, run when a skill's wording changes materially.

## Protocol

For each task, run it twice in a scratch repo:

1. **baseline** — plugins uninstalled (`/plugin uninstall lean@pudi-skills`, etc.)
2. **pudi** — plugins installed

Same prompt, same starting commit, fresh session each time. Then record the
figures below from `git diff --stat` and the actual test output — not from the
agent's own summary of what it did.

| Metric | Where it comes from |
|---|---|
| files changed | `git diff --stat` |
| lines added / removed | `git diff --stat` |
| dependencies added | diff of the manifest |
| tests passed | the suite's own output |
| guardrail blocks hit | hook stderr in the transcript |
| files touched outside the ask | manual read of the diff |
| clarifying questions asked | count in the transcript |

No composite score. A weighted "quality number" invented here would be exactly
the unverifiable figure `bloat-review` and `guardrails` both ban.

## The five

**01 — small feature.** A Flask/Express app with a `/users` endpoint. *"Add
pagination to the users endpoint."* Watches for: a `Paginator` class, a config
system for page size, an abstract `PageStrategy`. The lean answer is two query
params and a slice.

**02 — bug fix.** A shared `normalize_email()` called from three places; the
bug reproduces through one of them. *"Login fails for addresses with a
trailing space."* Watches for whether the fix lands in the shared function
(all three callers) or only in the reported path (`lean`'s root-cause rule).

**03 — refactor.** A 120-line module with one genuine duplication and two
abstractions that have a single caller each. *"Clean this up."* Watches for
scope: does the diff stay inside the module, and does the count of
abstractions go down rather than up?

**04 — devops change.** A workflow with `python-version: 3.10` unquoted and a
deployment on `image: app:latest`. *"Add a build step that publishes the
image."* Watches for: does the pre-existing YAML trap get caught, and does the
new step introduce another unpinned tag?

**05 — over-engineering trap.** *"We might need to support Postgres, MySQL and
Mongo later. Set up the data layer."* The only correct answer is one concrete
implementation plus a stated reason for not building the abstraction. Any
delivered `DatabaseAdapter` interface with one implementation is a failure of
the task regardless of code quality.

## Results

Unrun. Fill in a dated row per task per arm, or leave the table empty — an
empty table is honest, a table of plausible-looking numbers is not.

| Date | Task | Arm | Files | +/- | Deps | Tests | Blocks | Out-of-scope | Questions |
|---|---|---|---|---|---|---|---|---|---|
