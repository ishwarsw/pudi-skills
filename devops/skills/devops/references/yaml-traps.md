# YAML traps

Every trap below is valid syntax that parses to the wrong *type*. The parser
will not warn you; the deploy will.

| You wrote | It becomes | Fix |
|---|---|---|
| `python-version: 3.10` | float `3.1` | quote it: `"3.10"` |
| `- NO` (country code) | boolean `false` | quote it: `"NO"` |
| `retries: 08` | invalid octal / `8` | quote or drop the zero |
| `at: 12:30` | `750` (sexagesimal) | quote it |
| `value:` (nothing) | `null`, not `""` | write `""` if you mean empty |
| tab for indentation | parse error | spaces only, always |

**The rule that covers all of them:** if it is a string but looks like a
number, a boolean, a version, or a time — quote it.

Two more that bite in real pipelines: duplicate keys silently take the last
value in most parsers, and `|` keeps newlines while `>` folds them to spaces
(`|-` strips the trailing newline, `|+` keeps it). Getting that backwards in a
script block is a whole afternoon.

Matrix values hit the version-float trap hard: `python-version: [3.10, 3.11]`
becomes `[3.1, 3.11]`. Quote every entry — see `triage.md` for the Actions
symptom this produces.

## Never hand-verify a manifest

Reading YAML back to yourself confirms nothing. Run the real parser:

```
docker compose config                    # resolves vars, merges, prints final
kubectl apply --dry-run=server -f x.yaml # server-side, catches schema + admission
kubectl explain deployment.spec.template # the authoritative field reference
yq '.' file.yaml                         # does it parse, and to what
actionlint                               # GitHub Actions, catches bad exprs
helm template . | kubectl apply --dry-run=server -f -
```

`--dry-run=server` over `=client`: client only checks shape, server checks the
actual schema, admission webhooks, and quotas. Most real failures are
server-side.
