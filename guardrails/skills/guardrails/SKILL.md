---
name: guardrails
description: >
  Mandatory engineering rules for any coding task — writing, editing,
  refactoring, fixing, or reviewing code. Use whenever you are about to touch
  source code, choose names, add a dependency, change behavior, write tests,
  or commit. Not for pure Q&A or read-only exploration with no code change.
  Covers: ask-don't-guess, minimal diffs, stable signatures, naming, no
  wrapper functions, error handling, deps, testing, logging, commits.
license: MIT
---

# Guardrails

Ishwar's engineering standards. **MUST**/**MUST NOT** = non-negotiable. When a
rule and a request conflict: **stop and ask**, state your reasoning, don't
guess. These are his rules to change — ask him, and he can say yes.

Tiers, precedence across skills, and the full ask-or-ship split live in
[`docs/POLICY.md`](../../../docs/POLICY.md) — that file is canonical, this is
not a second copy of it. Rule 7 below is tagged with its tier inline because
the tag changes what the hook does; read POLICY.md before assuming a rule is
universal rather than taste.

## The non-negotiables (always apply)

1. **Ask, don't guess.** Ambiguous, underspecified, or multiple valid
   interpretations → stop and ask, show your reasoning before acting. Don't
   invent facts to fill a gap (paths, versions, expected behavior). A wrong
   assumption costs the whole change + rework; a question costs a moment.
2. **Minimal change.** Smallest diff that fully satisfies the request. No
   unrelated refactor/rename/reformat/"tidy". No scope creep. If a clean fix
   genuinely needs a broader change, surface the trade-off first.
3. **Stable public signatures.** Never change name/params/return
   shape/behavior of an existing public function/class/endpoint without
   explicit approval. New optional kwarg with safe default = fine.
4. **Reuse before create.** Search shared/common modules before writing a
   new utility. Duplicating existing logic is forbidden.
5. **No blanket transformations.** Sweeping "change everything" edits are
   decided per-item with a stated reason, never a codebase-wide sweep on
   your own initiative.
6. **No comments unless the *why* is non-obvious** (hidden constraint,
   workaround, subtle invariant). Never narrate *what* the code does or
   explain the change itself — that's for commit messages.
7. **Hook-enforced hard rules.** *(preference tier)* No leading-underscore
   names (`_foo`, `__foo`) that you create. No `if __name__ == "__main__":`
   blocks. No `__all__`. *(reproducibility tier)*
   **Dependency resolution must be reproducible** — an exact `==`/exact
   version, *or* a range backed by a committed lockfile beside the manifest
   (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`,
   `uv.lock`, `pdm.lock`). Use whatever the repo already uses; never add a
   package manager to satisfy this. `requirements.txt` has no lockfile
   companion, so it stays strictly pinned. A PreToolUse hook
   (`scripts/policy-check.js`, shipped with this plugin) mechanically blocks
   these four on every Write/Edit/NotebookEdit regardless of whether this
   skill loaded — this section is the human-readable mirror of that
   enforcement, not the only copy of it. Don't relitigate them mid-task; if
   one is genuinely wrong for a case, say so and ask.
   **A block is authoritative** (POLICY.md precedence #4) — don't route around
   it via `bash`/`cat`/`sed`, split the violation across edits, re-encode the
   value, or disable the hook. Wrong rule → say so as its own change, never
   weaken enforcement as a side effect.
8. **Justify behavior changes.** Before changing how existing code behaves:
   state the benefit, the safety (no hidden blocker/regression), and the
   downstream impact. Missing any of the three → leave it as-is, raise it.
9. **Never commit/push without explicit ask.** Same for force-push, branch
   delete, PR creation — confirm first.

## Ask or ship

Rule 1 and `lean`'s bias toward shipping pull opposite ways; POLICY.md's
ask-or-ship table resolves it by what kind of ambiguity it is, not a blanket
rule. Where `lean` and guardrails disagree outright, guardrails wins — its
`demo()`/self-check suggestion is overridden by rule 7, so a check goes in a
`test_*.py`.

## Load more detail only if the task needs it

- Writing/reviewing **names, wrappers, error handling, concurrency, types,
  dependencies** → read `references/code-rules.md`
- Task involves **tests, logging, or commit/PR messages** → read
  `references/testing-and-commits.md`
- Unsure if you're covered, or need the full checklist before calling a
  change "done" → read `references/checklist.md`

Don't preload these — pull the one file that matches what you're actually
about to do.
