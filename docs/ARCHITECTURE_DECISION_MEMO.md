# Geomockery Architecture Decision Memo

**Date:** 2026-04-08
**Revisited:** 2026-04-16 — decision stands. See the postscript at the end.

## Question

Should Geomockery stay on the current JavaScript architecture, move generation logic to Python, or adopt a hybrid approach?

## Decision

Keep the current **JavaScript + Next.js static export** architecture for v0.1.

Current architecture status: **working with caveats**.

## Why this is the right call now

Geomockery already functions as a browser-first demo with a working static build and a coherent portfolio story:

- no backend required
- easy local setup
- easy static hosting
- easy to demo in an interview or portfolio walkthrough

The current risks are not primarily architectural. They are about **trust, validation, and launch polish**:

- browser happy-path validation is still missing
- deployment is still unverified
- test coverage is absent
- reproducibility and metadata are not wired yet
- older docs still oversell the product

A Python rewrite would increase scope and delay without solving the current highest-value risks.

## Option comparison

| Factor | Current JavaScript stack | Python rewrite | Hybrid architecture |
|--------|--------------------------|----------------|---------------------|
| Current viability | working with caveats | broken until rebuilt | broken until integrated |
| Geospatial library fit | Good enough for current bbox, containment, area, and simple synthetic generation | Stronger for heavier GIS, topology, and richer offline processing | Strongest long-term flexibility, but unnecessary now |
| Developer ergonomics | One runtime, one app, easy portfolio demo | Split front-end and back-end concerns immediately | Two runtimes and an integration seam |
| Deployment complexity | Lowest; static hosting works | Higher; requires server hosting and ops decisions | Highest; browser app plus service layer |
| Testability | Good enough once smoke and unit tests are added | Good for generator testing, but adds API/system testing | More surface area to test |
| Timeline risk | Lowest | High | Medium-high |
| Expected benefit for v0.1 | High because it preserves momentum and demoability | Low for the immediate launch slice | Low for the immediate launch slice |

## Recommendation details

For the current product story, JavaScript is sufficient:

- `@turf/turf` covers the current generation logic
- OpenLayers handles the preview and boundary workflow already
- static export keeps the app easy to host and easy to show
- the app’s value today is a **small honest synthetic-data demo**, not a heavy geospatial processing platform

Python or hybrid only starts to make sense if the product later requires one or more of these:

- network-constrained or road-aware line generation
- richer topology or parcel-like polygon workflows
- heavier offline processing or larger datasets than the browser can comfortably handle
- API-driven generation for other tools or services

## Consequences

For v0.1, the architecture work should be:

1. keep the current browser-first stack
2. validate the core demo path in the browser and on the deployed URL
3. add the smallest useful smoke coverage
4. improve trust with honest docs, synthetic-data labeling, and generation summary metadata
5. revisit Python or hybrid only after the launch slice is stable

## Bottom line

Do not migrate the architecture now.

Ship the static browser demo first. Strengthen trust and validation around the current implementation. Re-open the Python or hybrid question only if future requirements clearly exceed what the current browser-first model can support.

---

## Postscript — 2026-04-16

Since this memo was written, the repo added a **connected-lines** generator (main line + branches + optional loops) with no-go zone support. That extension landed entirely in client-side JavaScript (`@turf/turf` + OpenLayers) without forcing an architecture change, which is consistent with the original recommendation.

What this confirms:

- Client-side JS is still *sufficient* for the kind of generation Geomockery is positioned to do: plausible sketches inside a boundary, not routed networks.
- The bottleneck is no longer "which language runs the generator". It is **trust**: can a user reproduce a dataset, explain how it was made, and verify it is structurally valid before shipping it downstream?

What this changes in the forward plan:

- The next wave of work (see `docs/geomockery-revival-roadmap.md`) focuses on seeded reproducibility, generation config exported beside every download, and light geometry validation. All three are well-suited to the current JS stack.
- A Python or hybrid move only becomes interesting if we commit to *real* network routing (OSM-constrained roads, utility network topology with valid junctions) or to dataset sizes the browser cannot comfortably generate. Neither is on the near-term roadmap.

Revisit this memo again if either condition changes.
