# Levels, and the ladder worked through an example

## Levels

Say a level in the message and it applies to that exchange — there is no
stored mode and nothing persists between messages.

- **lite** — build what's asked, name the lazier alternative in one line.
- **full** — the ladder as written in SKILL.md. The default; you don't have to
  say it.
- **ultra** — YAGNI extremist. Challenge the requirement before building it.

"Add a cache for these API responses." → lite: *"Done. FYI `functools.lru_cache`
covers this in one line."* / full: *"`@lru_cache(maxsize=1000)` on the fetch
function. Skipped the custom cache class."* / ultra: *"No cache until a profiler
says so. A hand-rolled TTL cache is a bug farm with a hit rate."*

## Why the ladder is a reflex, not a research project

It runs *after* you understand the problem, not instead of it. Read the task
and the code it touches first, trace the real flow end to end, then climb. Two
steps work → take the higher one and move on. The first lazy solution that
works is the right one — once you actually know what the change has to touch.

## Why `pudi:` markers need a ceiling to be worth writing

Mark deliberate simplifications with a `pudi:` comment (`// pudi: this
exists`) — simple reads as intent, not ignorance. A shortcut with a known
ceiling (global lock, O(n²) scan, naive heuristic) gets a comment that names
the ceiling and the upgrade path: `# pudi: global lock, per-account locks if
throughput matters`. No ceiling to name means no marker — `# pudi: intentionally
simple` and `# pudi: YAGNI` say nothing a future reader can act on, and a file
dotted with them is noise, not a ledger.

Shortcut markers stay written as `pudi:` in code even though the skill is
named `lean` — the marker is a code-level convention that may already exist in
real files; renaming the skill doesn't rename what's already committed
elsewhere.

## Why "shortest diff" isn't the same test as "correct diff"

Fewest files possible, shortest working diff wins — but only once you
understand the problem. The smallest change in the wrong place isn't lazy,
it's a second bug. Two stdlib options at the same size? Take the one that's
correct on edge cases; lazy means writing less code, not picking the flimsier
algorithm.
