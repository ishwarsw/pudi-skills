# Testing, logging, commits

## Testing

- Changed code path → run the affected test suite, keep it green.
- New/changed behavior needs a test that verifies it.
- A new boundary the change introduces (offloaded work runs where intended,
  async↔sync seam behaves) needs a test.
- Bug fix → add a regression test. Cover meaningful edge cases, not just
  happy path.
- Test code follows the same naming/no-underscore/wrapper rules as prod code.
- Delete temporary diagnostic scripts before calling the change done. Never
  commit them.

## Logging

- Match the established structured log style already in the code.
- Multi-step sequences (startup, shutdown, long ops) should log a
  begin/end pair so a stuck process is diagnosable.
- Never log secrets, credentials, tokens, or full request bodies that might
  contain them.

## Commit messages / PR descriptions

- Commit message explains *why*, not just what the diff shows.
- Subject: concise, specific. Body: motivation, approach, trade-offs,
  anything a reviewer needs.
- PR description summarizes the change and how it was verified.
- No secrets/credentials/tokens in commit messages or PR descriptions.
- Only commit what's in scope and only when asked — no unrelated changes,
  no temp scripts.
