# Geomockery

![Geomockery App Screenshot](public/images/app.png)

**Geomockery** is a **client-side** tool for generating **synthetic** geospatial features for demos, tests, and learning. Draw or upload a boundary, pick a geometry type, generate random features inside that area, preview them on a map, and export.

There is **no server** and **no LLM**: “prompt” and attribute behavior are driven by **templates, keywords, and rule-based defaults** in the browser—not remote AI.

---

## Project status

Current status: **working with caveats**.

The v0.1 launch surface is in place, and the v0.2 trust slice has landed: visible seeded generation, export config sidecars, and non-blocking structural validation. The main known gaps are automated regression tests, live deployment smoke checks, external GIS interoperability checks for exported files, and broader shape realism.

See [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md) for the source-grounded status table.

---

## What it does (v0.2)

- **Boundaries:** Map viewport, drawn polygon, or uploaded / URL GeoJSON.
- **Geometry:**
  - **Points** — uniform random inside the boundary.
  - **Lines — basic** — straight two-point segments with a length range.
  - **Lines — connected** — a sketch of a connected line network with a main line, branches, and optional loops. Supports user-drawn or uploaded *no-go zones* that lines must avoid.
  - **Polygons** — jittered radial shapes, not parcel-like or topology-aware.
- **Attributes:** Configurable fields with generated values (nominal, ordinal, quantitative, etc.) using the built-in rule engine.
- **Preview:** OpenLayers map preview of generated features on a CARTO Dark Matter basemap.
- **Reproducibility:** Every generation run uses a visible seed (numeric or word; word seeds are hashed). Same seed + same settings = same output in the current generator path.
- **Structural validation:** Generated features are checked for self-intersections, zero-length lines, degenerate polygons, and missing coordinates. Findings are surfaced in the summary panel without blocking export.
- **Export:** **GeoJSON** and **Shapefile** (ZIP via `@mapbox/shp-write`). Every export also writes a sibling `<filename>.config.json` describing how the dataset was produced (app version, seed, settings, validation summary, timestamp). **GeoPackage is not implemented** (the code path throws; do not rely on it).

---

## What it does *not* do (yet)

- Natural-language or cloud “AI” generation — the prompt box is a rule-based keyword parser.
- Network routing, street-following lines, or realistic urban clustering. Connected lines are a *plausible sketch*, not a real utility or road network.
- GeoPackage export.
- Automated regression tests or performance proof at very large feature counts (generation is a single-threaded client loop).
- Schema-based validation of attribute values before download (structural geometry validation runs; attribute validation does not).
- Confirmed export interoperability in external GIS software.

---

## Tech stack

- **Next.js 15** (static export), **React 19**, **TailwindCSS**
- **OpenLayers** (`ol`) for the map
- **Turf** (`@turf/turf`) for generation helpers
- **Shapefile:** `@mapbox/shp-write`

---

## Run locally

```bash
git clone https://github.com/rgdonohue/geomockery.git
cd geomockery
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production build (static export):**

```bash
npm run build
```

Output is written to `out/` (see `next.config.mjs`).

---

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds the static `out/` directory and deploys it to **GitHub Pages** with `actions/deploy-pages` on pushes to `main`. The workflow currently sets `GITHUB_PAGES_BASE_PATH=""` so the exported app loads from the site root for the custom domain.

---

## Project layout

```
src/
├── app/              # Next.js App Router pages (/, /generate, /about)
├── lib/
│   ├── geo/          # Generators, exporters, validation
│   ├── ai/           # Rule-based prompt / attribute helpers (no LLM)
│   └── utils/        # Random, helpers
├── hooks/            # useExport, useAiProcessor (barrel: src/hooks/index.js)
├── components/       # layout, forms, etc.
├── config/
└── data/
```

The `src/components/ui/` directory may exist but is **empty**—there is no shared UI kit in-tree.

---

## Contributing

Issues and PRs are welcome. Please keep changes focused; this project is optimized for a **small, honest** public release.

---

## License

MIT
