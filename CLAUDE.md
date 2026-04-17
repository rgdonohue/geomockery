# CLAUDE.md

## Project
Geomockery is a geospatial tool for generating plausible synthetic spatial datasets for demos, testing, development, and education.

## Current Phase
Feature work — context-aware line generation.

## Current Objective
Ship a credible context-aware utility-line workflow (connected segments, exclusions, basemap) on top of the existing v0.1 generate surface without regressing points/polygons or export paths.

## Rules for this phase
- Keep diffs scoped to the feature; avoid unrelated refactors or silent removal of user-visible behavior (e.g. basemap, draw tools).
- Preserve the v0.1 launch surface: `/generate` must remain usable for basic flows.
- Prefer evidence from running the app or `npm run build` over assumptions about behavior.
- Mark uncertain items as untested when not verified in browser or CI.
- Do not widen scope into MCP integration, full UX redesign, or speculative architecture rewrites.

## Required status labels
- working
- working with caveats
- broken
- untested

## Current deliverables
- Context-aware line / utility network mode with constraint-aware generation where implemented.
- Basemap preserved (CARTO Dark Matter) so the map stays geographically legible.
- No-go zone support for line workflows (draw + upload) as wired in the generate UI.

## Current priorities
1. Restore and keep the basemap rendering on `/generate`.
2. Stabilize context-aware (utility) line generation and exclusions.
3. Regression-check basic point/polygon generation and export.
4. Keep docs honest about what is synthetic vs. “real” infrastructure.

## Not in scope right now
- MCP integration
- Full UX redesign
- Major refactors
- Speculative architecture rewrite
