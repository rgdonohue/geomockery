# AGENTS.md

## Project phase
Feature work.

## Agent expectations
- Prefer the smallest useful next step; avoid unrelated refactors and scope drift.
- Do not silently remove user-visible behavior (basemap, drawing, export) without explicit instruction.
- Use the following status labels only:
  - working
  - working with caveats
  - broken
  - untested
- Report uncertainty clearly.
- Ground claims in code, config, and runtime checks when possible.

## Current deliverables
- Context-aware line / utility network mode on the generate page.
- Basemap preserved so boundaries and generated features remain geographically readable.
- No-go zone flows for lines (draw + upload) as implemented in the UI.

## Current priorities
1. Restore and keep basemap rendering on `/generate`.
2. Ship and stabilize context-aware line generation (constraints, exclusions).
3. Regression-check points, polygons, and export paths.
4. Keep documentation aligned with actual behavior.
