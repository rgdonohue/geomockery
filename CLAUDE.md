# CLAUDE.md

## Project
Geomockery is a geospatial tool for generating plausible synthetic spatial datasets for demos, testing, development, and education.

## Current Phase
Audit / truth pass.

## Current Objective
Establish a verified picture of the repository's actual state and define the smallest credible v0.1 launch.

## Rules for this phase
- Do not change code unless explicitly asked.
- Do not assume documentation is accurate.
- Validate claims using code, config, package files, and build/deploy files.
- Mark uncertain items as untested or uncertain.
- Prefer evidence over inference.
- Do not widen scope into new features, redesign, or architecture changes.

## Required status labels
- working
- working with caveats
- broken
- untested

## Required outputs for audit work
- `docs/AUDIT_REPORT.md`
- `docs/ARCHITECTURE_DECISION_MEMO.md`

## Current priorities
1. repo inventory
2. documentation contradictions
3. workflow truth table
4. dependency/config risks
5. testing/quality gaps
6. launch blockers
7. architecture decision memo

## Not in scope right now
- new features
- UX redesign
- MCP integration
- major refactors
- speculative architecture rewrite