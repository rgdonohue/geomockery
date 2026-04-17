# Geomockery Audit Report

## Context and method

This audit was refreshed on **2026-04-16** against the current repository state, after the connected-lines / no-go zone work landed in commit `129a631`.

Findings are grounded in the files currently present under `src/`, repo config, workflow config, and the current documentation set.

Validation performed in this pass:

- inspected current source, config, and docs
- confirmed the connected-lines generator (`src/lib/geo/generators.js`, `src/lib/geo/utilityNetworkConfig.js`) is wired into the generate page
- confirmed basemap (CARTO Dark Matter) and drawing tools are present in `GenerateMap.js`
- confirmed no-go zone draw + upload paths in the sidebar
- reviewed the doc set and archived stale Dec-2024 planning docs

Not exercised in this pass:

- a full manual browser happy path through `/generate`
- a live GitHub Pages deployment check
- Shapefile interoperability in external GIS software
- mobile or small-screen behavior

**Repo status:** **working with caveats**

The v0.1 launch surface holds: points, lines (basic and connected), polygons, GeoJSON / Shapefile export, and a working static build. Trust features — seeded reproducibility, generation metadata beside downloads, geometry validation — are still the main gap.

---

## Section 1 — Repo inventory

| Area | Current paths | Notes |
|------|---------------|-------|
| App shell | `src/app/layout.js`, `src/components/layout/Header.js`, `src/components/layout/Layout.js` | Next.js App Router app with shared layout components |
| Routes | `src/app/page.js`, `src/app/generate/page.js`, `src/app/about/page.js` | Three user-facing routes; no API routes |
| Generation engine | `src/lib/geo/generators.js`, `src/lib/geo/utilityNetworkConfig.js` | Point, basic line, connected line network, and polygon generation with Turf helpers |
| Export | `src/lib/geo/exporters.js` | GeoJSON and Shapefile wiring; GeoPackage path still throws |
| Prompt assistance | `src/lib/ai/aiProcessor.js`, `src/lib/ai/geoIntelligence.js`, `src/app/generate/components/AiConversation.js` | Rule-based keyword parser and map suggestions; no remote model |
| Map + boundary tools | `src/app/generate/components/GenerateMap.js`, `src/app/generate/components/GeoJSONUploader.js` | OpenLayers preview on CARTO Dark Matter basemap, drawing, file upload, URL import, no-go zone draw/upload |
| Attribute editing | `src/app/generate/components/FeatureAttributeEditor.js`, `src/data/schemas/attributeSchema.js` | Configurable attribute schema editor and schema defaults |
| Hooks | `src/hooks/useExport.js`, `src/hooks/useAiProcessor.js`, `src/hooks/index.js` | Small helper hooks; the generate page still manages most state directly |
| Config | `package.json`, `next.config.mjs`, `jsconfig.json`, `postcss.config.js`, `tailwind.config.js`, `.github/workflows/deploy.yml` | Static export, path aliases, Tailwind/PostCSS, GitHub Pages workflow |
| Docs | `README.md`, `docs/AUDIT_REPORT.md`, `docs/ARCHITECTURE_DECISION_MEMO.md`, `docs/geomockery-revival-roadmap.md`, `docs/archive/*` | Dec-2024 planning docs now sit under `docs/archive/` |
| Tests | `tests/` | No test source files found in the current repo |

---

## Section 2 — Documentation contradictions

The current `README.md`, `AGENTS.md`, and `CLAUDE.md` are aligned with the code. Older planning material that previously drifted into "AI-powered, 90 % complete MVP" framing has been moved under `docs/archive/` and is no longer linked from the README or roadmap.

| Topic | Current evidence | Status |
|-------|------------------|--------|
| "AI-powered" positioning | README and About page say explicitly that there is no server and no LLM; `src/lib/ai/aiProcessor.js` is keyword/template-driven | working |
| Export support claims | README lists GeoJSON and Shapefile as working and calls out GeoPackage as not implemented; `src/lib/geo/exporters.js` throws on GeoPackage and the UI disables it | working |
| Line generation claims | README now describes *basic* and *connected* line modes; code matches (`generateLine`, `generateUtilityNetwork`) | working |
| "Realistic" generation language | README explicitly calls connected lines a sketch, not a real network; `src/lib/geo/generators.js` matches that framing | working |
| Stale planning docs | `docs/DEV_STATUS.md`, `docs/PRD.md`, `docs/TASKS.md` moved to `docs/archive/` with an archive README explaining why they are not current guidance | working |

---

## Section 3 — Workflow truth table

Statuses use only the required labels: **working**, **working with caveats**, **broken**, **untested**.

| Workflow | Status | Evidence | Notes | Priority |
|----------|--------|----------|-------|----------|
| Generate point data | working with caveats | `src/lib/geo/generators.js` | Uniform random point generation inside bbox or constraining polygon; returns `null` after 100 failed attempts | high |
| Generate basic line data | working with caveats | `src/lib/geo/generators.js` | Straight two-point lines with length bounds; not routed or street-aware | high |
| Generate connected line network | working with caveats | `src/lib/geo/generators.js`, `src/lib/geo/utilityNetworkConfig.js` | Main line + branches + optional loops with exclusion awareness and a minimum separation constraint. Branch lengths now scale with boundary extent. Output is a plausible sketch, not a real utility/road network. Feature count can be lower than the requested approximation when constraints clip branches. | high |
| No-go zone drawing | working with caveats | `src/app/generate/components/GenerateMap.js`, `src/app/generate/page.js` | Users can draw exclusion polygons; generator respects them. Not manually exercised in browser in this pass. | high |
| No-go zone upload | working with caveats | `src/app/generate/components/GeoJSONUploader.js`, `src/app/generate/page.js` | Upload path is wired; URL import is still subject to normal browser CORS limits. | medium |
| Generate polygon data | working with caveats | `src/lib/geo/generators.js` | Jittered radial polygons; not parcel-like or topology-aware | high |
| Define boundary by drawing | working with caveats | `src/app/generate/components/GenerateMap.js` | OpenLayers draw interaction is wired; browser interaction not manually exercised in this pass | high |
| Define boundary by upload | working with caveats | `src/app/generate/components/GeoJSONUploader.js` | File import is wired; URL import subject to browser CORS | high |
| Generate attributes | working with caveats | `src/lib/geo/generators.js`, `src/app/generate/components/FeatureAttributeEditor.js`, `src/lib/ai/aiProcessor.js` | Attribute values are random/template-driven; no relationship modeling or export-time schema validation | medium |
| Configure generation parameters | working | `src/app/generate/page.js` | Geometry, quantity, line workflow mode, connected-line shape + density, line length, polygon area, export format, and attribute controls are present | medium |
| Preview generated data on map | working with caveats | `src/app/generate/components/GenerateMap.js` | CARTO Dark Matter basemap + vector features with an on-map legend for connected-line roles; browser rendering not manually exercised in this pass | high |
| Export GeoJSON | working with caveats | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | Download wiring exists through `file-saver`; exported file not manually opened in this pass | high |
| Export Shapefile | working with caveats | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | ZIP export wiring exists through `@mapbox/shp-write`; external GIS interoperability still untested | high |
| Export GeoPackage | broken | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | Function throws immediately and UI keeps the option disabled | low |
| Reset / clear | working | `src/app/generate/page.js`, `src/app/generate/components/GenerateMap.js` | UI clears generated state and the map feature source | low |
| Build / static export | working | `npm run build` was green as of commit `129a631` | Build completes successfully and exports `/`, `/about`, and `/generate` | high |
| Deployment path | working with caveats | `.github/workflows/deploy.yml`, `next.config.mjs` | GitHub Actions project-Pages path prefixing was validated in the prior audit; no recent live deploy check | high |
| Mobile or small-screen behavior | untested | responsive classes in `src/app/*.js` and `src/app/generate/page.js` | No manual browser check was performed in this pass | medium |

---

## Section 4 — Dependency and config risks

| Risk | Evidence | Status |
|------|----------|--------|
| GitHub Pages still needs live verification | `next.config.mjs` applies the repo base path for Actions-driven builds; no recent successful public Pages check is recorded here | working with caveats |
| GeoPackage remains in the code surface even though it is disabled | `src/lib/geo/exporters.js`, `src/hooks/useExport.js`, and the generate page still carry GeoPackage branches even though the feature is explicitly unavailable | working with caveats |
| Tailwind scans a non-existent `src/pages` path | `tailwind.config.js` still includes `./src/pages/**/*` even though the app uses only the App Router | working with caveats |
| Browserslist data can go stale | `npm run build` has previously emitted `caniuse-lite` update warnings | working with caveats |
| Connected-line generator has hidden knobs in code | `DEFAULT_UTILITY_NETWORK_SETTINGS` + `utilityNetworkConfig.js` still carry anchor-strategy / corridor-bias data that the simplified UI no longer exposes | working with caveats |
| Current package list is relatively lean | `package.json` contains only the active runtime dependencies needed for the current app story | working |

---

## Section 5 — Testing and quality gaps

- **Automated tests:** **broken**. No unit, integration, or end-to-end test files are present.
- **Linting:** **untested** as a gate. There is no standalone lint script in `package.json`, and no explicit ESLint config is present at the repo root.
- **Generated output validation:** **broken**. Exporters serialize and download data, but there is no structural validation pass before export.
- **Browser happy path:** **untested**. This pass did not manually confirm generate → preview → export through the browser UI.
- **Deployment smoke test:** **working with caveats**. The Pages export path was previously validated locally, but there is no recorded live public Pages check in this audit.
- **Reproducibility:** **broken** for seeded use cases. `src/lib/utils/random.js` includes seed helpers, but the active generation helpers still use `Math.random()` and the sidebar does not expose a seed input.
- **Mobile verification:** **untested**. Responsive classes are present, but no browser/device run was performed.

---

## Section 6 — Open blockers for the next slice

These are the smallest high-value items separating the repo from a *trustworthy* v0.2. They map onto the forward plan in `docs/geomockery-revival-roadmap.md`.

1. **Reproducibility is not wired.** Until a seed input is exposed and plumbed through the generators, two runs with the same settings can differ silently. This is the single biggest credibility gap for a "fixture workbench".
2. **Generation config does not travel with the data.** There is no `*.config.json` (or similar) written alongside exports, so downstream users cannot tell how a file was produced.
3. **Geometry validation is missing.** Exports are not checked for validity (self-intersection, zero-length lines, empty polygons) before download.
4. **Connected-line output can silently under-deliver.** When exclusions or separation constraints clip branches, the user sees "generated N of requested M" but has no structured log of what was rejected.
5. **Live deployment is still unverified on every release.** A short manual smoke checklist per release would close this.
6. **Older docs still oversell the product *if* someone finds them via search.** The Dec-2024 planning set has been moved to `docs/archive/` with a pointer; this is acceptable, but archived files should not be linked from live docs.

**Not a blocker for v0.1 or v0.2 if the docs stay honest:** GeoPackage. The current README and UI already present it as unavailable, which is acceptable for a small public release.

---

## Section 7 — Architecture decision memo

See `docs/ARCHITECTURE_DECISION_MEMO.md`.

**Current recommendation:** keep the current JavaScript, static-first architecture. The next wave of work is about **trust** (seeds, config export, validation) on top of that stack, not a platform change.
