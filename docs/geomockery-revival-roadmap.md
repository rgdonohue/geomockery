# Geomockery Roadmap

*Last revised: 2026-04-16*

This is the working forward plan. It supersedes the pre-audit revival plan that used to live in this file.

## Where we are

- **v0.1 launch surface is in place.** `/generate` works: boundary (draw / upload / viewport), points, basic lines, connected lines, polygons, GeoJSON + Shapefile export, CARTO Dark Matter basemap, rule-based prompt assist.
- **Connected lines shipped.** Main line + branches + optional loops, with drawn or uploaded no-go zones and branch lengths that scale with the boundary so the network is visible at realistic zooms. Commit `129a631`.
- **Truth pass is done.** `docs/AUDIT_REPORT.md` is current; Dec-2024 planning docs have been moved to `docs/archive/` and are explicitly marked as non-current.
- **Architecture decision still holds.** Client-side JavaScript with a static export is the right platform for the next 2–3 slices (see `docs/ARCHITECTURE_DECISION_MEMO.md`).

What the app is *not* yet:

- reproducible from a seed
- self-describing (no config travels with the downloaded file)
- structurally validated before export
- able to express line shapes beyond "straight segments" and "connected network sketch"

Those gaps are the next roadmap.

---

## Guiding principle

**Trust and legibility before feature breadth.**

Geomockery's value is *plausible, honest synthetic data*. Every additional knob or shape we add before the foundation is trustworthy is a knob that ships confusion. The product we are trying to be is a **fixture workbench** for geospatial developers, GIS educators, and QA engineers — not a demo of generative breadth.

Three rules that fall out of this:

1. **If we say we generated N features with settings X, a second run with the same N and X should produce the same file.** Today it does not.
2. **If someone opens a `.geojson` we produced a month from now, they should be able to tell how it was made.** Today they cannot.
3. **If we claim a shape ("connected lines", "migration corridor"), the UI, the code, and the docs should agree on what that shape is and is not.** We are now close on connected lines; we should stay disciplined as we add more shapes.

---

## Priority stack

```
1. Trust         ←  next slice (v0.2)
2. Shape library
3. Interoperability
4. AI as intent interpreter
5. Agent / MCP surface
```

The ordering is deliberate. AI and MCP are *multipliers*: they amplify whatever trust the underlying tool already has. If we add them before trust is real, we amplify noise.

---

## v0.2 — Fixture workbench (trust)

**Goal:** make generated output reproducible, self-describing, and structurally honest.

Scope:

- **Seed input** in the sidebar, wired through `src/lib/utils/random.js` so every `getRandom*` call is deterministic for a given seed. Default to a visible auto-generated seed, not silent `Math.random()`.
- **Config-beside-download.** When a user exports, write a small sibling `*.config.json` (or bundle it in the Shapefile zip) with: geometry type, line workflow mode, shape, density, count, seed, boundary bbox, exclusion summary, app version, timestamp.
- **Lightweight validation pass** before export: flag self-intersecting lines, zero-length segments, empty polygons. Surface a count in the summary panel, not a modal.
- **Honest generation log.** Replace the "generated N instead of M" warning with a structured summary: how many attempted, how many rejected, why (outside boundary / hit exclusion / min-separation / validation).
- **Connected-line branch audit.** Keep the on-map legend; add one line in the summary that says what the connected-line mode actually promises ("a sketch of a connected line network, not a real utility or road network").

Success looks like: a user can hand someone a Geomockery-exported zip and the recipient can answer "how was this made?" without opening the app.

Out of scope for v0.2: new shapes, new formats, any server component.

---

## v0.3 — Shape library

Once trust lands, we can credibly add more line shapes. The framing stays *shapes, not domains*: we are not claiming to generate "roads" or "pipelines", we are claiming to generate *a shape the user can label whatever they want*.

Candidate shapes, in rough order of usefulness:

| Shape | What it looks like | Realistic framing in UI |
|-------|-------------------|--------------------------|
| Path-through-points | A line that visits a set of user- or algorithm-placed anchors in a plausible order | "Route through waypoints" |
| Line of sight | Radial fans from a point, clipped at a user-settable distance and by exclusions | "Sight lines from a tower" |
| Migration corridor | A thick, wandering polyline between two regions, optionally with side tributaries | "Migration / flow corridor" |
| Trail route | Meandering single line biased along elevation or a user-drawn corridor polygon | "Trail / footpath sketch" |

Each new shape ships with:

- a one-sentence honest description in the UI
- a preset for density
- a deterministic path through the seed
- a line role or style so the map stays legible

Polygons and points get treated the same way later (shapes, not domains), but lines come first because they are where the current credibility gap is largest.

---

## v0.4 — Interoperability

The point of Geomockery is to feed *other* tools. The next pillar after trust and shapes is making those handoffs painless.

Targets:

- **GeoPackage, properly.** Either wire it through a browser-compatible library (sql.js / a modern `geopackage.js`) and call it *working*, or remove the UI affordance and stop carrying the disabled branch in `src/lib/geo/exporters.js`. "Disabled button" is worse than either.
- **CSV + WKT export** for points and simple lines so people can drop output into databases, QGIS, or spreadsheets without a spatial library.
- **CRS awareness.** Right now everything is WGS84 lon/lat. For v0.4 we at least label that in the UI and in the exported config, and document how to reproject downstream.
- **External-GIS smoke check.** One documented manual pass per release: open the Shapefile and the GeoPackage (if we ship it) in QGIS, confirm it reads.

Out of scope: on-the-fly reprojection inside the app. That is a Python/server conversation, not a browser conversation.

---

## v0.5 and beyond — AI as intent interpreter

The prompt box in the sidebar is a rule-based keyword parser today. That is the right baseline and we should be explicit about it.

When we *do* add LLM help, it should be strictly scoped:

- **Input:** a natural-language prompt plus the current sidebar state.
- **Output:** a proposed set of *sidebar parameters* (geometry, count, shape, density, seed, attribute fields), plus a short explanation.
- **Never:** LLM-generated coordinates, LLM-generated features, or LLM output that bypasses the deterministic generator.

This keeps the model in the role it is good at (understanding intent) and keeps the generator in the role it is good at (producing reproducible geometry). It also stays compatible with the static-export architecture: the model call can be a stateless fetch against whatever provider the deployment chooses.

This only makes sense *after* v0.2 (trust) and v0.3 (shapes). An LLM that confidently picks parameters for a generator you cannot reproduce is worse than no LLM at all.

---

## Agent / MCP surface (deferred)

Candidate MCP tool shape, when it is time:

- `generate_points`, `generate_lines`, `generate_polygons`
- `generate_from_template`
- `validate_dataset`
- `export_dataset`
- `summarize_generation`

Explicit constraint: **do not build the MCP surface until v0.2 and v0.3 are done.** An MCP wrapper around an unreproducible generator just scales the credibility problem across more clients.

---

## Non-goals (now)

- Real routing (OSM-constrained roads, valid utility topology, actual trail networks).
- Multi-user accounts, collaboration, or shared workspaces.
- Cloud-generated geometry, even if we later add an LLM for *intent*.
- A Python or hybrid rewrite. See the memo.
- Broad format support beyond the targets listed above.
- Raster / elevation generation.

If one of these becomes a launch-critical requirement, we revisit — in writing — before we commit code.

---

## Review cadence

- After each slice (v0.2, v0.3, v0.4), refresh `docs/AUDIT_REPORT.md` so the truth table reflects what actually shipped.
- Do not widen a slice mid-flight. If a new idea shows up, it goes on the *next* slice.
- Keep `docs/archive/` for retired planning. Do not resurrect archived docs; write new ones.

---

## Definition of done for the next release (v0.2)

Geomockery v0.2 ships when:

- a user can enter a seed and get the same output twice
- every export arrives with a sibling config describing how it was made
- the summary panel reports validation findings, not just counts
- the on-map legend and the sidebar agree on what each shape is
- `docs/AUDIT_REPORT.md` lists the trust features as **working**, not **broken** or **working with caveats**

That is the whole next milestone. Everything else waits.
