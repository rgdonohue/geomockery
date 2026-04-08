# Geomockery Audit and Launch Plan

## Goal

Bring Geomockery to a credible, launchable v0.1 by following a strict sequence:

1. audit the current project honestly
2. identify the smallest viable product worth launching
3. harden the core generation workflow
4. validate build and deployment
5. launch a small public release
6. defer non-essential complexity until after release

This file is written for agent execution and human review.

---

## Ground Rules

### 1. Do not assume the docs are accurate
Treat all project claims as hypotheses until verified in code, config, or manual testing.

### 2. Prefer evidence over optimism
If something is not tested, mark it as untested.  
If something appears to work but is fragile, mark it as working with caveats.

### 3. Do not widen scope during audit
The audit is not the time to add features, rewrite architecture, or improve aesthetics.

### 4. Do not add agent/MCP complexity before product coherence
Agent integration is explicitly deferred until after a stable launch slice exists.

### 5. Keep changes small and reviewable
Prefer focused tasks with explicit validation criteria.

---

## Phase 1 — Audit and Truth Pass

## Objective

Create a single source of truth about what Geomockery currently is and does.

## Tasks

### Task 1.1 — Inventory the project
Inspect the repository structure and summarize:

- app/framework structure
- generation-related modules
- map preview components
- export-related code
- configuration files
- deployment configuration
- documentation files
- test files, if any

## Output
Create a concise inventory section in the audit report.

---

### Task 1.2 — Identify documentation contradictions
Compare README, task/status docs, comments, config, and code.

Look for contradictions such as:

- maturity claims that exceed implementation
- declared features that are disabled or incomplete
- deployment claims that are not reflected in config
- format support claims that do not match working code
- roadmap items presented as completed functionality

## Output
Create a “Documentation Contradictions” section in the audit report.

---

### Task 1.3 — Audit core workflows
Verify the status of each of the following workflows:

- generate point data
- generate line data
- generate polygon data
- define boundary by drawing
- define boundary by upload
- configure generation parameters
- preview generated data on map
- export GeoJSON
- export shapefile
- reset/clear
- build
- deployment path

Classify each workflow as:

- working
- working with caveats
- broken
- untested

## Output
Create a truth table with one row per workflow and the following columns:

- workflow
- status
- evidence
- notes
- priority

Do not guess. If a workflow cannot be validated, mark it untested.

---

### Task 1.4 — Dependency and config review
Inspect package/config files and identify:

- unused dependencies
- duplicated dependencies
- dependencies that appear inconsistent with actual functionality
- disabled features still reflected in dependencies
- build or export risks
- deployment assumptions

## Output
Create a “Dependency and Config Risks” section in the audit report.

---

### Task 1.5 — Test and quality review
Determine:

- whether tests exist
- what types of tests exist
- whether linting is configured and useful
- whether there is any validation around generated outputs
- what the current quality assurance gaps are

## Output
Create a “Quality and Testing Gaps” section in the audit report.

---

### Task 1.6 — Architecture decision memo
Produce a short decision memo answering:

**Should Geomockery continue with the current architecture, move generation logic to Python, or adopt a hybrid architecture?**

The memo must compare:

- current viability
- geospatial library fit
- developer ergonomics
- deployment complexity
- testability
- timeline risk
- expected benefit

Important constraints:

- do not rewrite the architecture during this phase
- do not recommend migration without clear reasoning
- bias toward the smallest path that can produce a credible launch

## Output
Write a short memo with one recommended path and reasoning.

---

## Phase 2 — Define v0.1 Launch Slice

## Objective

Define the smallest version of Geomockery that is genuinely useful and launchable.

## v0.1 must support

- user can define an extent or boundary
- user can choose geometry type
- user can specify feature count
- user can generate synthetic data
- user can preview results
- user can export at least one reliable format
- user can understand what was generated
- user can see that the data is synthetic
- generation settings can be summarized clearly

## Explicit non-goals for v0.1

- broad enterprise positioning
- advanced LLM workflows
- deep MCP orchestration
- multi-user functionality
- speculative “smart” features with weak validation
- major architecture rewrites unless absolutely necessary

## Task 2.1 — Propose the v0.1 scope
Based on the audit, produce a recommended v0.1 scope with:

- included features
- excluded features
- required fixes
- launch blockers
- nice-to-have items

## Output
Write a “Recommended v0.1 Scope” section.

---

## Phase 3 — Fix the Highest-Value Gaps

## Objective

Address the minimum set of issues needed for a stable public launch.

## Priorities

### Priority A
Fix the most important broken workflow in the core value loop.

### Priority B
Ensure one export format is reliable.

### Priority C
Add generation metadata and synthetic-data clarity.

### Priority D
Add minimal testing around the happy path.

### Priority E
Ensure deployment works.

## Suggested implementation order

1. fix critical generation or preview bugs
2. stabilize export path
3. clean dependency issues that affect reliability
4. add metadata/summary output
5. add warnings and synthetic-data labeling
6. add minimal tests
7. verify production build and deployment

## Constraints

- do not start broad UX redesign during this phase
- do not add agent integrations here
- do not expand format support unless it directly blocks launch
- do not rewrite working systems for stylistic reasons

---

## Phase 4 — Launch Readiness

## Objective

Prepare a small honest release.

## Task 4.1 — README rewrite
Update README to match actual functionality.

README should include:

- what Geomockery is
- who it is for
- current supported workflows
- known limitations
- how to run locally
- how to deploy
- what is planned next

Do not oversell.

---

### Task 4.2 — Example datasets and screenshots
Create a small launch package including:

- 2 to 3 example outputs
- screenshots or a short demo GIF/video
- concise explanation of the primary use cases

---

### Task 4.3 — Release prep
Prepare:

- changelog entry
- version tag recommendation
- short launch note
- list of known issues

---

## Phase 5 — Post-Launch Backlog

## Objective

Only after launch, identify the next most valuable improvements.

## Candidates for post-launch work

- additional templates
- reproducible seed-based generation improvements
- richer metadata export
- better plausibility controls
- MCP server/tool interface
- agent usage guides
- improved UX onboarding
- expanded export formats
- optional Python or hybrid backend path if justified

---

## Deliverables

Produce the following outputs in this order:

### Deliverable 1
A concise audit report with sections for:

- repo inventory
- documentation contradictions
- workflow truth table
- dependency/config risks
- testing/quality gaps
- launch blockers

### Deliverable 2
A short architecture decision memo.

### Deliverable 3
A recommended v0.1 scope.

### Deliverable 4
A prioritized implementation task list with validation steps.

### Deliverable 5
A launch readiness checklist.

---

## Preferred Working Style for the Agent

### Planning
Think before editing.  
Summarize intended changes before making them when a task is broad.

### Editing
Make small, focused changes.  
Avoid unrelated refactors.

### Validation
After each meaningful code change, report:

- what changed
- how it was validated
- what remains uncertain

### Communication
Be explicit about uncertainty.  
If something could not be verified, say so clearly.

---

## Suggested Prompts for Use with This Plan

### Audit prompt
Use this first:

> Audit this repository for launch readiness. Create a single source-of-truth report with these sections:
> 1. repo inventory
> 2. documentation contradictions
> 3. workflow truth table
> 4. dependency/config risks
> 5. testing/quality gaps
> 6. launch blockers
> 7. architecture decision memo
> Do not change code yet. Validate claims using code, config, and build/deploy files. Mark anything you cannot verify as untested or uncertain.

### v0.1 scope prompt
Use after the audit:

> Based on the completed audit, propose the smallest credible v0.1 for Geomockery. Distinguish clearly between required launch features, deferred features, and risky distractions. Bias toward shipping a small honest release over adding novelty.

### implementation prompt
Use after the v0.1 scope is accepted:

> Turn the audit and v0.1 scope into 8 focused implementation tasks. Each task must be independently reviewable, include validation criteria, and avoid unnecessary refactors. Prioritize generation reliability, export reliability, and deployment readiness.

---

## Stop Conditions

Pause and report before proceeding if any of the following is true:

- the core generation workflow does not actually function
- the export path is fundamentally broken
- deployment assumptions are false
- the current architecture cannot support a credible launch without significant rework
- documentation drift is so severe that scope must be redefined first

---

## Success Criteria

This plan succeeds when:

- the project has one coherent story
- working and non-working parts are clearly identified
- a small credible v0.1 has been defined
- the highest-value fixes are known and prioritized
- launch readiness is no longer ambiguous
- future agent and MCP work can proceed on a stable foundation

---

## Final Reminder

Do not try to impress with ambition.

Reduce uncertainty.
Clarify reality.
Stabilize the core.
Launch the smallest honest thing.
Then build outward.