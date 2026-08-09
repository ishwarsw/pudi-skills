# Done-checklist

Run before calling any change "done":

- [ ] Every claim about the work is a figure you observed, or explicitly
      flagged as unmeasured — never an adjective standing in for a number.
      `"3 files, +47/-18, 24/24 tests pass"` or `"tests not run — no suite
      in this repo"`; never `"looks good"` or an estimated figure presented
      as measured.
- [ ] Doubts resolved by asking, not guessing; reasoning shown before acting.
- [ ] Diff contains only what was asked (no drive-by refactor/cleanup).
- [ ] No public signature/endpoint/return shape changed without approval.
- [ ] Reused existing shared utility instead of duplicating.
- [ ] Every name is a meaningful full word; no 2-letter/single-char names.
- [ ] No name you created starts with `_`.
- [ ] No new wrapper that just forwards/renames/has one caller.
- [ ] No `if __name__ == "__main__":` added. No `__all__` added.
- [ ] No narrating or change-explaining comments.
- [ ] Behavior changes individually justified (benefit + safety + downstream).
- [ ] No new unbounded/duplicate global resources.
- [ ] No exception swallowed silently.
- [ ] New/changed public signatures have accurate type annotations.
- [ ] Dependencies pinned (`==`), not duplicated from shared packages.
- [ ] New/changed behavior covered by a test; suite green; temp scripts deleted.
- [ ] Commit message / PR description explain *why*, no secrets.
