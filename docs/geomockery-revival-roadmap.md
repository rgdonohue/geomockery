# Geomockery Revival Roadmap

## Purpose

This document is the working plan for bringing **Geomockery** from an interesting prototype to a credible, launched geospatial tool.

The immediate goals are:

1. establish the truth about the current state of the project
2. harden the core workflow so it works reliably
3. define a credible v0.1 product
4. launch a small honest release
5. add agent and MCP integrations only after the foundation is stable

This is not a feature wishlist. It is a sequencing document.

---

## Core Principle

**Do not confuse possibility with readiness.**

Geomockery has a strong concept and good interview value because it addresses a real gap: realistic synthetic geospatial data for testing, demos, education, and development. But concept strength does not equal product readiness.

The first task is not adding more intelligence, more automation, or more UI polish.

The first task is to answer, clearly and honestly:

- what works
- what kind of works
- what is broken
- what is untested
- what the product actually is

---

## Product Thesis

Geomockery should be framed as a tool for generating **plausible synthetic geospatial datasets** for real geospatial workflows.

### Primary use cases

#### 1. Privacy-safe demo data
Generate synthetic spatial datasets for client demos, portfolio apps, prototypes, and presentations when real data is sensitive, proprietary, or unavailable.

#### 2. QA and performance fixtures
Generate controlled geospatial test data for validating map interfaces, APIs, spatial processing pipelines, and performance boundaries.

#### 3. Teaching and training data
Generate GIS-ready datasets for tutorials, workshops, classrooms, and self-guided learning without licensing, privacy, or access barriers.

### Non-goals for v0.1

These may be valuable later, but they are not launch blockers:

- full natural language generation system
- deep LLM orchestration
- multi-user accounts
- enterprise workflows
- advanced collaborative features
- “AI magic” features with weak validation
- broad format support beyond the most useful export targets

---

## v0.1 Definition

Geomockery v0.1 is successful if a user can:

1. define a spatial extent or boundary
2. choose a geometry type
3. specify feature count and basic parameters
4. optionally define an attribute schema or use a template
5. generate a plausible synthetic dataset
6. preview it on a map
7. export valid output
8. understand what was generated and how

### v0.1 must feel trustworthy in these ways

- generation is deterministic when a seed is provided
- exported data is valid or clearly flagged if not
- the app explains that the data is synthetic
- the user can understand the generation settings
- the workflow is simple enough to demo in under 2 minutes

---

## Current Strategic Priorities

### Priority 1: Truth pass
Before adding features, audit the project and establish reality.

### Priority 2: Core value loop
Make the main generation workflow reliable and legible.

### Priority 3: Launch slice
Ship a small public release with a stable story and working demo.

### Priority 4: Agent and MCP integration
Only after the product is coherent and stable.

### Priority 5: UX expansion and richer templates
Only after launch basics are in place.

---

## Phase A — Truth Pass and Audit

## Objective

Create a single source of truth about the current repo state.

## Deliverables

- one audit report
- one prioritized issue list
- one architecture decision memo
- updated project docs that match reality

## Audit questions

### Functional status
For each major workflow, determine whether it is:

- working
- working with caveats
- broken
- untested

### Workflows to audit

- create point data
- create line data
- create polygon data
- define boundary by drawing
- define boundary by upload
- generate attributes
- preview on map
- export GeoJSON
- export shapefile
- reset / clear
- mobile or small-screen behavior
- build process
- deployment process

### Code health questions

- Are there dead files or abandoned experiments in the repo?
- Are dependencies aligned with current functionality?
- Are docs overstating implementation?
- Are there duplicated or conflicting package choices?
- Is the build clean?
- Is linting useful and passing?
- Is there any test coverage?
- What parts of the system are hardest to trust right now?

## Architecture decision memo

The audit must produce a short written decision memo on this question:

**Should the generation engine remain in JavaScript, move to Python, or become a hybrid architecture?**

The memo should compare:

- current implementation viability
- library/ecosystem fit
- ease of deployment
- testability
- geospatial robustness
- maintenance burden
- impact on launch timing

Do not rewrite the architecture during the audit. Decide first.

---

## Phase B — Core Value Loop Hardening

## Objective

Make the primary generation workflow dependable enough for real demos and credible use.

## Required capabilities

### Input
User can specify:

- geometry type
- feature count
- spatial extent or boundary
- CRS where relevant
- optional seed
- optional schema or template

### Output
User receives:

- plausible synthetic features
- visible map preview
- exportable dataset
- generation summary
- synthetic-data caveat
- reproducibility metadata

## Functional improvements to prioritize

### 1. Seeded reproducibility
Add deterministic generation where possible so the same config can regenerate the same dataset.

### 2. Generation metadata
Export or display metadata including:

- geometry type
- count
- seed
- extent
- schema/template
- timestamp
- generation settings

### 3. Geometry validation
Validate generated features before export and surface warnings clearly.

### 4. Better templates
Provide a small number of useful presets rather than abstract flexibility alone.

Suggested initial templates:

- retail/store locations
- utility assets
- parcel-like polygons
- environmental monitoring stations
- service or delivery routes

### 5. Plausibility controls
Improve generation logic so the data looks intentional, not arbitrary.

Examples:

- clustered points where clustering makes sense
- linework with plausible structure
- polygons that resemble meaningful land units rather than random shapes

---

## Phase C — Launch Slice

## Objective

Launch a small, honest public version.

## v0.1 launch checklist

- public URL
- working generation demo
- stable README
- release tag
- changelog
- screenshots or short demo GIF/video
- three example datasets
- one short “why this exists” explanation
- one short “how to use this in geospatial development” guide

## Launch philosophy

Do not wait for completeness.

Launch when the app is:

- coherent
- stable enough for demo use
- documented honestly
- visually clear
- useful for at least one real geospatial workflow

A small truthful release beats a large haunted prototype.

---

## Phase D — Agent and MCP Integration

## Objective

Make Geomockery useful inside AI-assisted development workflows after the core app is stable.

## Candidate integrations

### MCP server or tool interface
Potential tool functions:

- generate_points
- generate_lines
- generate_polygons
- generate_dataset_from_template
- validate_generated_data
- export_dataset
- summarize_generation_settings

### Agent-use scenarios

- generate test data for MapLibre prototypes
- generate fixtures for FastAPI endpoints
- create GIS training datasets
- produce mock layers for UI screenshots and demos
- create edge-case geometry sets for QA

## Important constraint

Do not let MCP integration become an excuse to avoid shipping the product itself.

If the browser app is not trustworthy, agent integration will only scale confusion.

---

## Phase E — UX and Trust Improvements

## Objective

Improve the clarity, confidence, and usability of the app.

## UX principles

### 1. Trust over ornament
The user should understand what the system generated, what assumptions shaped it, and whether the result is fit for their purpose.

### 2. Short path to success
The basic flow should be easy enough for a first-time user to complete quickly.

### 3. Explain synthetic status clearly
Make it obvious that the output is synthetic and may be suitable for testing, teaching, or demos rather than inference or analysis.

## UI improvements to prioritize

- compact dataset summary panel
- visible seed/config display
- export summary
- validation warnings
- template descriptions
- sensible defaults
- clean empty states
- example-driven onboarding

---

## Testing Strategy

## Minimum testing needed for launch

### Unit-level
Test generator functions and data-shaping utilities.

### Validation-level
Test that output is structurally valid and exportable.

### End-to-end
Test one happy-path workflow through the UI:

- set parameters
- generate dataset
- preview on map
- export output

### Smoke tests
Run lightweight checks for build and deployment.

## Questions to answer through testing

- What feature counts remain performant?
- Which generation modes fail most often?
- Which geometry types are least trustworthy?
- Does export remain stable across templates?
- What is the practical limit for browser-only generation?

---

## Documentation Plan

## Required docs

### 1. README
Should explain:

- what Geomockery is
- who it is for
- what it currently does
- how to run it
- how to deploy it
- what is not finished

### 2. Audit report
One file that records repo truth after the audit.

### 3. Architecture decision memo
One file comparing JS, Python, and hybrid options.

### 4. Launch guide
Short instructions for creating and publishing the v0.1 release.

### 5. Agent usage guide
Short notes on how to use Cursor, Claude CLI, and Codex CLI with this project.

---

## Suggested Agent Workflow

## Cursor
Use Cursor for:

- repo-wide audit assistance
- UI iteration
- browser-based verification
- saved plans in `.cursor/plans/`
- follow-up execution after planning

## Claude CLI / Claude agent
Use Claude for:

- architectural critique
- design review
- product framing
- test strategy
- identifying structural contradictions or hidden risks

## Codex CLI
Use Codex for:

- tightly scoped implementation tasks
- review of diffs
- explicit validation checklists
- test and lint-oriented code tasks

## General rule
Use agents to reduce friction, not to manufacture complexity.

---

## Immediate Next Steps

## Week 1

### Day 1
- create audit branch
- run repo audit
- create truth table for workflows
- identify doc contradictions

### Day 2
- write architecture decision memo
- identify top 5 blockers
- decide launch scope

### Day 3
- fix the most important broken workflow
- remove or flag misleading docs and claims

### Day 4
- add or improve validation and metadata
- clean dependency issues

### Day 5
- add minimal tests
- verify build and deployment path

## Week 2

### Day 6
- add 2 to 3 meaningful templates
- improve summary panel and warnings

### Day 7
- tighten README and onboarding
- generate example datasets

### Day 8
- test public deployment
- create demo GIF/screenshots

### Day 9
- cut release candidate
- fix final blockers

### Day 10
- publish v0.1
- write launch note
- capture follow-up backlog

---

## Not Now List

These are explicitly deferred unless they become launch-critical:

- deep LLM-first generation workflows
- broad format support beyond the highest-value exports
- advanced styling or map theming work
- user accounts
- collaborative workspaces
- analytics dashboards
- enterprise positioning
- speculative automation features without validation
- major architecture rewrites before the audit memo is complete

---

## Definition of Success

Geomockery revival is successful when:

- the repo tells one coherent story
- the app has a working public demo
- the core workflow is stable enough to show in interviews
- the product value is legible to geospatial developers
- the release is honest about what it can and cannot do
- future improvements have a sane foundation

---

## Final Reminder

The trap is not lack of ideas.

The trap is dispersal.

Do the boring truth work first.
Then make the core workflow solid.
Then launch something real.
Then expand.

That order is the whole game.