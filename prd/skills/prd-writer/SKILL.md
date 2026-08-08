---
name: prd-writer
description: Use this skill when drafting, rewriting, structuring, or reviewing a product requirements document (PRD). Apply the prd-template structure, sections, and acceptance-criteria style by default.
license: MIT
---

# PRD Writer

Write PRDs that commit to solutions and can be reviewed without interpretation. The structure below comes from `references/prd-template.md`; treat that file as canonical and leave it unmodified — copy it per initiative rather than editing it in place.

## When to fire

Fire on explicit requests: "draft a PRD," "turn this brief into requirements," "write acceptance criteria for X," "review my PRD," "add a section for Y."

Fire also on the implicit cases, which are more common:

- A strategy brief, research doc, or set of notes exists and the user asks what to build, or asks to move from evidence to scope.
- The user asks for requirements, scope boundaries, non-goals, or success metrics for a specific capability.
- The user asks to revise, tighten, or stress-test part of an existing PRD — a single section still gets the full document's conventions.

Do **not** fire for upstream work: market research, discovery synthesis, positioning, pricing, or GTM planning. Those are separate artifacts, and pulling requirements into them destroys the research/solutioning boundary that makes the PRD trustworthy later. If the user is genuinely still in discovery, say which artifact the work belongs in and offer to write that instead.

## Standing constraints

These hold across every section and matter more than any individual formatting rule.

- **Separate research from solutioning.** Link upstream docs in §2 and §13; do not re-litigate their evidence inside the PRD. The PRD is where commitments happen.
- **Never invent organizational specifics.** No headcounts, org charts, tool names, vendors, revenue figures, or dates that were not provided. Write `[OPEN — owner, date needed by]` instead. A placeholder that looks plausible is worse than a visible gap, because it stops being questioned.
- **Record directives; do not absorb them.** When a decision arrives from leadership or review that contradicts an upstream document, log it as an assumption row with its basis and its "if wrong" consequence, and state plainly in §2 what the decision narrows. Silent absorption is how a document ends up claiming more than it delivers.
- **Every assumption is a table row in §4**, not a sentence in prose. Assumptions in prose get forgotten; assumptions in a table get revisited.
- **Every requirement gets at least one acceptance criterion.** A requirement with no testable AC is not a requirement yet.
- **Cite provenance inline** when a requirement rests on a specific source or data point, rather than presenting it as self-evident.

## Required sections

Use all thirteen, numbered, in this order. Do not delete a section — mark it `N/A` with a one-line reason if it truly does not apply.

1. **Metadata** — Title, Status, Version, Author (role), Date, Stakeholders (approve / consulted / informed), Linked research/strategy docs. Use exactly these fields; resist the urge to add more, and put any substantive gap (e.g. no named approver) inside the existing row.
2. **Problem Statement** — one or two sentences: what problem, for whom, evidenced how. State the problem, not the solution. Name the slice of the problem this PRD actually addresses, and flag it if that slice is narrower than the upstream brief's framing.
3. **Goals & Non-Goals** — goals as outcomes, not features. Non-goals cover anything a reader would reasonably assume is included; this section prevents scope creep more than any other.
4. **Explicit Assumptions** — table: `# | Assumption | Basis | If wrong`. The "if wrong" column names which requirements or NFRs change, not just that something changes.
5. **Users & Roles** — primary user first, then secondary users and stakeholders. Note known bias in how the roles were identified. Take a position on which roles are actually served in this release; listing a role without a requirement that serves it is an unstated shortfall.
6. **Functional Requirements** — table with IDs `R1, R2…`, priority, and rationale. State the prioritization method (MoSCoW, RICE, or other) and the test for the top tier.
7. **Non-functional Requirements** — table with IDs `NFR1, NFR2…`, category, target/threshold, rationale. Cover performance, scalability, availability, security/privacy, accessibility, data quality/integrity, observability, retention, and compliance. Measurable targets where possible; `[OPEN]` where no basis exists.
8. **Acceptance Criteria** — one or more per requirement, functional *and* non-functional, using the AC style below.
9. **Success Metrics** — leading and lagging indicators with targets. If a target is unknown, say so in the row rather than omitting it, and name the measurement work needed to set it.
10. **Risks & Open Questions** — table: `Risk / Question | Impact if unresolved | Owner | Status`. Distinguish "blocks launch" from "should resolve eventually," and mark accepted-but-unresolved risks as such.
11. **Dependencies** — systems, teams, data sources, and external decisions outside the author's control.
12. **Rollout Plan** — phasing, feature flags, audience sequencing, rollback criteria. If scope is being held rather than phased, say so and use this section for internal build sequencing, making clear that sequencing is not descoping.
13. **Appendix / References** — upstream research, strategy docs, prior art, template.

**Formatting:** tables for anything enumerable, prose only for problem statement and narrative context. Traceability IDs `R1`, `NFR1`, `R1-AC1`, `NFR1-AC1`. Inline status tags `[OPEN]`, `[DECIDED — date]`, `[BLOCKED — reason]`, `[PROPOSED — …]` rather than vague language. Bump the version in §1 on any substantive change and keep a changelog at the bottom saying what changed and why.

## Acceptance-criteria style

Write each criterion so a reviewer can mark pass/fail without interpretation: a specific trigger, a specific system behavior, and a threshold where the evidence supports one. Prefer Given/When/Then, or a measurable checklist.

For each requirement, cover three paths — the success path, the ambiguous or duplicate path, and the failure path. Those are where the bugs hide.

Recurring AC failures worth checking for by name:

- **Undefined terms.** A threshold on "claims per summary" is unauditable until "claim" is defined, because two reviewers get different denominators. Define the term in §8 before using it in a threshold.
- **Two tolerances on one property.** Zero-tolerance in one criterion and 95% in another, applied to the same thing, is irreconcilable. Split it into two properties: what is mechanically checkable (100%, automated gate) versus what requires judgment (sampled, with a stated sample size and interval).
- **Sample sizes that cannot distinguish the claim.** n=20 cannot separate 95% from 85%. If a percentage gate matters, size the sample to the difference it must detect, and mark the statistical basis `[PROPOSED — confirm with eng/data]`.
- **Principles dressed as tests.** "Confirmed by the absence of feature X" is not testable — nothing automated can assert a future feature will not exist. Convert it to an enforceable constraint (e.g. a write must carry an authenticated human actor identity, verified by a test asserting rejection).
- **Unachievable requirements.** A deletion requirement is not achievable unless derived content carries item-level lineage. If an AC depends on an architectural property, state that property as a build-time constraint, not a policy aspiration.
- **Missing states.** Every primary view needs a defined state for no data yet (cold start), no results for this filter, insufficient data to compute, in progress, and failed. A new deployment *begins* in cold start, so it is the default experience, not an edge case.

## Never accept the first draft

The first draft's job is to exist. Its value is that it exposes gaps that cannot be seen from an outline. Plan on at least two revisions before circulating, and one after any review.

The loop: draft → review passes → revise → bump version and record the change in the changelog. Stop when a review pass produces only cosmetic edits.

Run these review passes, either as self-review or by reading the draft in each persona's voice:

- **Engineer** — Is every AC testable? What happens on re-run, retry, or backfill? Is deletion technically possible? Are ambiguous matches handled? Which requirement is the estimability risk?
- **Product director** — Is scope defensible? Does every Must fail the "central claim is unsupportable without it" test? Can the ROI case be made when every value-side target is `[OPEN]`? Is there a build/buy or competitive question that will be the first thing asked at go/no-go?
- **UX researcher / designer** — Which roles does this actually serve? Can a user reach the verbatim source behind an aggregate, or only a count? Cold-start and error states? Accessibility — is any signal carried by colour alone? Is there a plan to validate anything with users, or only mechanically?

Then sweep for the failures that show up in almost every first draft:

- A requirement presupposes a capability that no requirement produces (internal inconsistency).
- A named risk has no requirement mitigating it, or a requirement has no risk row for its failure mode.
- Roles listed in §5 that nothing in §6 serves.
- No pre-launch baseline for the headline benefit, making the primary claim unmeasurable in either direction.
- Every metric `[OPEN]` with no plan to close any of them.
- Retention, accessibility, idempotency, or observability missing from §7 entirely.
- Template drift — sections renamed, fields added, ordering changed.
- Editorial additions not present in the upstream brief, included without being flagged as such.

When revising, state what changed and why in the changelog rather than quietly improving the text. A PRD's credibility comes from its revision history being legible, and a reverted decision is worth recording as much as an adopted one.
