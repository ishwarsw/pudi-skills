# Code rules: naming, structure, safety, dependencies

## Naming

- Descriptive, full-word names. No 2-letter abbreviations (`tm`, `db`, `mgr`,
  `req`, `res`, `cfg`, `idx`), no single-char placeholders (`x`, `a`, `s`),
  no junk sequences (`data1`, `tmp`, `foo`, `val`, `obj`).
  | Forbidden | Required |
  |---|---|
  | `mgr = get_manager()` | `connection_manager = get_manager()` |
  | `for u in users:` | `for user in users:` |
  | `cfg = settings.log_format` | `log_format = settings.log_format` |
- Exceptions: `index` in a trivial numeric loop (prefer iterating directly);
  `except X as error:` (not `e`); framework-idiomatic names (`request`,
  `response`, ORM/session conventions) take precedence over the ban; a
  genuinely generic value (e.g. arbitrary-input serializer) may use a clear
  generic name — don't invent a fake-specific one to dodge the rule.
- Match the surrounding module's casing convention (snake_case
  functions/vars, PascalCase classes, UPPER_SNAKE_CASE constants).

## No unnecessary wrapper functions

A wrapper is **not** justified if it only forwards args to one function,
renames something, or has exactly one caller — inline it instead. A wrapper
**is** justified when it adapts a real interface boundary (layer seam, retry
policy, auth injection) with actual logic and 2+ callers, or is a
deliberate public seam.

## Function/module size

- One function, one describable thing — if you need "and" to describe it,
  it's probably two, but only split if the piece has real reason to exist
  independently (see wrapper rule above).
- Don't create a new module for one small function that has a natural home
  in an existing one.

## Error handling

- Never swallow exceptions silently (`except: pass` is forbidden).
- Catch only when you can do something meaningful: recover, add context and
  re-raise, translate at a boundary, or log-and-handle where the decision is
  actually owned. Otherwise let it propagate.
- Catch the narrowest type that fits — don't catch a broad base to mask a
  specific failure you could handle precisely.
- Don't double-log the same error at every level up the stack.
- Preserve original cause when wrapping (`raise NewError(...) from original`).

## Concurrency and resources

- Don't introduce new global resources (thread pools, connection pools,
  caches) when the codebase already has a shared bounded mechanism — use it.
- Anything that can grow with load (threads, tasks, connections) needs an
  explicit, configurable cap.
- Don't block a cooperative/async runtime with long sync work; offload
  through the existing mechanism. Never start a nested event loop inside a
  running one.
- If the existing shared mechanism genuinely doesn't fit the need, stop and
  raise it rather than forcing it or silently adding a new global resource.

## Type annotations

- New/changed public functions, methods, class attributes need accurate
  param/return type annotations (where the language supports them).
- A wrong/misleading type is worse than none — don't guess to satisfy the
  rule.
- Prefer precise types over `Any`/untyped dict/bare `object`; use an escape
  hatch only when the value is genuinely dynamic.
- Don't weaken or remove existing annotations to make something compile —
  fix the real mismatch, or raise it.

## Dependencies

- New deps go in the real dependency list, not an optional/dev extras group,
  unless genuinely test-only.
- [Rule 7 — mechanically enforced by the PreToolUse hook] Pin exact versions
  (`==`), not a floor (`>=`/`^`/`~=`).
- Don't declare a dep already provided transitively by a shared/core package
  — check first, avoid drifting duplicate pins.
- Don't invent version numbers — use the actual latest verified version or
  match what's already in use.
