# PRD Template
 
*Reusable template for Product Requirements Documents. Copy this file per feature/initiative and fill in every section — do not delete a section, mark it "N/A" with a one-line reason if it truly doesn't apply.*
 
---
 
## How to use this template
 
- **Fill in order.** Sections build on each other (Problem → Assumptions → Requirements → Acceptance Criteria); skipping ahead tends to produce requirements that don't trace back to a problem.
- **Separate research from solutioning.** If this PRD rests on a research doc or strategy brief, link it in §2 rather than re-litigating the evidence here. This PRD is where you commit to solutions; upstream docs are where you gathered evidence.
- **Every assumption gets a row in §4**, not a mention in prose. Assumptions buried in paragraphs get forgotten; assumptions in a table get revisited.
- **Every requirement gets at least one acceptance criterion.** A requirement without a testable AC isn't a requirement yet.
- **Mark unresolved items instead of guessing.** Use `[OPEN — owner, date needed by]` inline rather than inventing an answer.
---
 
## Required sections
 
### 1. Metadata
| Field | Value |
|---|---|
| Title | |
| Status | Draft / In Review / Approved / Shipped |
| Version | v0.1 |
| Author (role) | |
| Date | |
| Stakeholders (approve / consulted / informed) | |
| Linked research / strategy docs | |
 
### 2. Problem Statement
One or two sentences: what problem, for whom, evidenced how. State the problem, not the solution. If this traces to a research or strategy doc, cite it rather than restating its evidence base.
 
### 3. Goals & Non-Goals
- **Goals:** what this initiative must accomplish, stated as outcomes, not features.
- **Non-goals:** explicitly out of scope, especially anything a reader might reasonably assume is included. This section prevents scope creep more than any other.
- **Deferred:** in scope eventually, but not this release — each with the signal that brings it back (a usage threshold, a customer count, a dependency landing). "Later" with no trigger is a non-goal that hasn't admitted it yet.
### 4. Explicit Assumptions
Every assumption this PRD depends on, falsifiable, with a stated consequence if wrong. Do not skip this table even for "obvious" assumptions.
 
| # | Assumption | Basis (evidence / source / judgment call) | If wrong |
|---|---|---|---|
| A1 | | | |
| A2 | | | |
 
### 5. Users & Roles
Primary user (who this is built for first) and secondary users/stakeholders (who else touches or is affected by this). Note any known bias in how these roles were identified (e.g., "evidence base skews toward PM-led orgs" — carry forward from upstream research if relevant).
 
### 6. Functional Requirements
What the system must *do*, prioritized (MoSCoW, RICE, or stated method). Each requirement gets an ID for traceability to acceptance criteria.
 
| ID | Requirement | Priority | Rationale |
|---|---|---|---|
| R1 | | Must / Should / Could | |
 
### 7. Non-functional Requirements
Qualities and constraints the system must satisfy regardless of specific features — performance, scalability, availability, security/privacy, accessibility, data quality/integrity, observability, and compliance. State each as a measurable target where possible (e.g. "p95 summary generation < 5s at 10k feedback items"), and use the same `NFR#` IDs so acceptance criteria can trace back.
 
| ID | Requirement | Category | Target / Threshold | Rationale |
|---|---|---|---|---|
| NFR1 | | Performance / Security / Availability / Data quality / … | | |
 
### 8. Acceptance Criteria
One or more per requirement (functional *and* non-functional), written so a reviewer can mark pass/fail without interpretation. Prefer Given/When/Then or a measurable checklist. See examples below.
 
### 9. Success Metrics
How you'll know this worked — leading and lagging indicators, with target values where known. If targets aren't known yet, say so explicitly rather than omitting the row.
 
### 10. Risks & Open Questions
Known risks (technical, data-quality, adoption, org) and questions that must be resolved before or during build. Distinguish "blocks launch" from "should resolve eventually."
 
| Risk / Question | Impact if unresolved | Owner | Status |
|---|---|---|---|
 
### 11. Dependencies
Systems, teams, data sources, or external decisions this PRD relies on that are outside the author's control.
 
### 12. Rollout Plan
Phasing, feature flags, audience sequencing, rollback criteria.
 
### 13. Appendix / References
Links to research notes, strategy docs, data sources, prior art, competitive references.
 
---
 
## Formatting standards
 
- **Headers:** use the numbered `##` sections above, in order, for every PRD — consistent structure lets reviewers scan by section number across documents.
- **Tables over prose** for anything enumerable: assumptions, requirements, risks, metrics. Prose is for the problem statement and narrative context only.
- **Traceability IDs:** functional requirements as `R1, R2…`, non-functional as `NFR1, NFR2…`, acceptance criteria as `R1-AC1, NFR1-AC1…` so criteria map unambiguously back to a requirement.
- **Status tags inline:** `[OPEN]`, `[DECIDED — date]`, `[BLOCKED — reason]` rather than leaving gaps or vague language.
- **Provenance on claims:** if a requirement rests on a specific data point or user quote from research, cite the source inline (e.g., "per Linear's account-tier filtering pattern") rather than presenting it as self-evident.
- **No invented specifics:** don't fill placeholder org details (headcounts, tool names, revenue figures) to make the doc look complete — mark them `[OPEN]` instead.
- **Version every revision:** bump the version number in §1 metadata on any substantive change, and note what changed and why in a running changelog at the bottom if the doc will be revised more than once.
---
 
## Examples of strong acceptance criteria
 
**Example 1 — Given/When/Then, functional requirement**
 
> **R1: Feedback items from a resolved stakeholder must roll up to their parent account, not stand alone.**
>
> - **R1-AC1:** Given a feedback item whose author's email domain matches an account record in the CRM, when the item is ingested, then the system attaches it to that account and displays the account name (not the individual's name) as the primary label in the feedback list view.
> - **R1-AC2:** Given two feedback items from different stakeholders at the same account requesting the same underlying capability, when both are ingested, then the system surfaces them as a single deduplicated entry showing a count of 2 and both contributing stakeholders, rather than two separate list rows.
> - **R1-AC3:** Given a feedback item whose author cannot be matched to any account record, when the item is ingested, then the system flags it as "unresolved identity" in a visible queue rather than silently dropping the ARR-weighting field or defaulting it to zero.
 
*Why this is strong: each criterion is independently testable, specifies the exact system behavior (not just the desired outcome), and covers the success path, the dedup path, and the failure path — the three cases most likely to hide a bug.*
 
**Example 2 — measurable/quantified, non-functional requirement**
 
> **R4: AI-generated feedback summaries must expose their evidence trail, not present conclusions as unattributed fact.**
>
> - **R4-AC1:** Every generated summary sentence that makes a claim about customer sentiment or request volume links to at least one source feedback item; a summary with zero linked sources fails review and cannot be published.
> - **R4-AC2:** When a summary is regenerated from an updated feedback set, the previous version remains accessible with a visible timestamp and diff, so no summary silently overwrites its own history.
> - **R4-AC3:** In a review of 20 randomly sampled generated summaries, at least 95% of claims are traceable to a source item that actually supports the claim (spot-checked by a human reviewer); if the sample falls below 95%, the release is blocked pending a fix, not shipped with a caveat.
 
*Why this is strong: it ties a qualitative trust concern (from the org's known "confident-but-wrong AI synthesis" risk) to a specific, auditable, numeric bar — and states the release-blocking consequence rather than leaving it implied.*
 
---
 
## Changelog
| Version | Date | Change | Author |
|---|---|---|---|
| v0.1 | | Initial template | |