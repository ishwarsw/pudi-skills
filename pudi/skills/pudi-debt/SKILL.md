---
name: pudi-debt
description: >
  Harvest every `pudi:` comment in the codebase into a debt ledger, so the
  deliberate shortcuts and deferrals get tracked instead of rotting into "later
  means never". Use on "pudi debt", "what did pudi defer", "list the
  shortcuts", "what did we mark to do later". Reports only, changes nothing.
license: MIT
---

# Pudi Debt

Every deliberate pudi shortcut is marked with a `pudi:` comment naming its
ceiling and upgrade path. This collects them into one ledger so a deferral
can't quietly become permanent.

## Scan

Grep the repo for comment markers, skipping `node_modules`, `.git`, and build
output — the comment prefix keeps prose that merely mentions the convention
out of the ledger:

`grep -rnE '(#|//) ?pudi:' .`  (add other comment prefixes if your stack uses them)

## Output

One row per marker, grouped by file. The convention is
`pudi: <ceiling>, <upgrade path>`, so pull both straight from the comment:

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

Any marker naming no upgrade path or trigger gets a `no-trigger` tag — those
are the ones that silently rot. Want an owner per row? add
`git blame -L<line>,<line>`.

End with `<N> markers, <M> with no trigger.` Nothing found:
`No pudi: debt. Clean ledger.`

## Boundaries

Reads and reports only. To persist it, ask and it writes the ledger to a file.
