---
name: devops
description: >
  Write and debug infrastructure YAML — Kubernetes manifests, GitHub Actions
  workflows, docker-compose, Helm values, CI pipelines — and triage them at
  runtime. Use when authoring or fixing a manifest, workflow, pipeline, or
  compose file, when a deploy, pod, job, or build is failing, and on "pod is
  crashlooping", "workflow won't trigger", "image pull error", "yaml won't
  parse", "why did the pipeline fail". Not for application code.
license: MIT
---

# DevOps

Two jobs: write YAML that means what it looks like, and find why the running
thing is broken.

## YAML that parses is not YAML that is correct

If a value is a string but looks like a number, a boolean, a version, or a
time — quote it. `3.10` becomes float `3.1`, `NO` becomes `false`, `12:30`
becomes sexagesimal `750`; the parser won't warn you, the deploy will. Full
trap table and the commands that verify a manifest for real (never hand-check
by reading it back): `references/yaml-traps.md`.

## Debugging: go down a layer, don't go sideways

The summary line is never the error. Find the real one, then check the layer
beneath the failure — not another config knob at the same level.

1. **Reproduce**, and know whether it is every time or intermittent. Intermittent
   means resources, races, or one bad replica — not syntax.
2. **Read the actual error.** `kubectl describe` events and previous-container
   logs, not the dashboard status.
3. **Shrink it.** Smallest manifest or single job step that still fails.
4. **Change one thing.** Two changes and a pass tells you nothing.

State what you actually observed before proposing a fix. A confident guess at a
deploy failure costs an outage.

## Details

- Writing or reviewing YAML — the full trap table and parser-verification
  commands: `references/yaml-traps.md`
- Runtime triage — CrashLoopBackOff, ImagePullBackOff, Pending, OOMKilled,
  workflow-not-triggering, and the commands for each: `references/triage.md`
- Manifest defaults worth setting every time (limits, probes, security context,
  pinned tags): `references/manifest-defaults.md`

Read the one that matches what you are doing.

## Boundaries

`guardrails` still applies: no unpinned versions — that includes container
image tags (`:latest` is the same defect as `>=`) and unpinned GitHub Actions.
Never print or commit a secret value; reference it from a secret store. Cluster
mutations (`apply`, `delete`, `scale`, `rollout undo`) against anything not
clearly local get confirmed first.
