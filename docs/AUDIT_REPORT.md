# Geomockery Launch Readiness Audit Report

## Context and methodology

This report documents a source-level audit of the Geomockery repository. Findings are grounded in the current codebase: `package.json`, `package-lock.json`, `next.config.mjs`, application source under `src/`, documentation under `docs/` and `README.md`, and the GitHub Actions workflow. Where runtime behavior (browser, GitHub Pages) was not exercised in this pass, items are labeled **untested**.

**Build verification:** On 2026-03-30, `npm ci` followed by `npm run build` completed successfully, producing a static export (Next.js reported static prerender for all routes and export steps finished without error).

---

## Section 1 — Repo inventory

**Stack (from `package.json` and `next.config.mjs`):** Next.js **15.2.3**, React **19**, static export (`output: 'export'`), TailwindCSS 3.x, OpenLayers (`ol`), Turf (`@turf/turf`).

**Source scale:** JavaScript under `src/` totals **5,275 lines** (all `*.js` / `*.jsx` files, `wc` aggregate).

**Primary modules (line counts are current):**

| Area | Path | Lines | Role |
|------|------|------:|------|
| Generation | `src/lib/geo/generators.js` | 271 | Point, line, polygon generation via Turf |
| Export | `src/lib/geo/exporters.js` | 95 | GeoJSON, Shapefile (`@mapbox/shp-write`), GeoPackage (throws) |
| “AI” / prompts | `src/lib/ai/aiProcessor.js` | 463 | Keyword/template-driven parsing and defaults (client-side) |
| Geo prompt helpers | `src/lib/ai/geoIntelligence.js` | 372 | Pattern lists and city bounds (no network LLM) |
| Map UI | `src/app/generate/components/GenerateMap.js` | 424 | OpenLayers: draw, generate, preview |
| Generate page | `src/app/generate/page.js` | 726 | Main orchestration |
| Upload | `src/app/generate/components/GeoJSONUploader.js` | 296 | File / URL GeoJSON |

**Config and automation:** `next.config.mjs` (static export, image unoptimized, path aliases), `tailwind.config.js`, two PostCSS entrypoints (see Section 4), `.github/workflows/deploy.yml` (install, `npm run export`, upload `out/`, deploy to GitHub Pages on `main` push).

**Empty or placeholder areas (verified on disk):**

- `tests/` — subfolders `components`, `fixtures`, `lib`, `utils` exist; no test source files (only `.DS_Store` under `tests/`).
- `src/components/ui/` — empty directory.
- `src/data/examples/` — empty directory.
- `docs/api/` — empty directory.

**Broken / risky routes:**

- `src/app/reasoning/page.js` — `fetch('/api/reasoning', …)`; there is **no** `src/app/api` route in the repo (glob confirms zero API route files). Static export has no server at runtime for this path.

**Status label for repo health:** **working with caveats** (core app builds; reasoning page and hook exports are structurally problematic — see below).

---

## Section 2 — Documentation contradictions

Contrasts are between **documented claims** and **observable implementation**.

| Topic | Docs / README claim | Code reality | Status |
|--------|----------------------|--------------|--------|
| “AI-powered” / intelligence | README and branding describe AI-powered generation and smart distribution | `aiProcessor.js` and `geoIntelligence.js` use **templates, keywords, and regex-style matching**; **no LLM API**, no embeddings, no remote inference | **working with caveats** (rule-based only) |
| GeoPackage | README lists GeoPackage among export formats | `featuresAsGeoPackage` in `exporters.js` **throws** with a fixed message; UI labels GeoPackage as coming soon | **broken** as an export feature |
| Realistic clustering / street-following | README: e.g. coffee shops “distributed realistically,” “delivery routes that follow actual street patterns” | `generators.js`: points are **uniform random** in bbox (with optional polygon constraint); lines are **two-point segments** from `turf.destination`; polygons are **roughly circular** with vertex jitter | **working with caveats** (marketing oversells geometry) |
| DEV_STATUS “90% MVP,” “1–2 weeks” | `docs/DEV_STATUS.md` dated **December 2024** | Project still has known gaps (this audit); timeline claim is **stale** | Documentation **out of date** |
| Architecture diagram `components/ui/` | `README.md` tree lists `components/ui/` | Directory **exists but is empty** | **broken** (diagram implies components that are not present) |
| 50,000+ features “efficiently” | README performance bullet | Generation is a **single-threaded loop** in the client; no Web Workers in the hot path; **no benchmark evidence** in repo | **untested** at scale |
| Responsive / mobile | DEV_STATUS marks responsive design complete | **No automated or manual browser verification** in this audit | **untested** |
| Shapefile “fully functional” | DEV_STATUS | Implementation calls `@mapbox/shp-write` `zip()`; **output correctness not validated** against desktop GIS in this pass | **working with caveats** |

---

## Section 3 — Workflow truth table

Statuses use the required labels: **working**, **working with caveats**, **broken**, **untested**. Line references point to the current files.

| Workflow | Status | Evidence | Notes | Priority |
|----------|--------|----------|-------|----------|
| Generate points | working with caveats | `generators.js` `generatePoint` ~7–50 | Uniform random in bounds; optional polygon filter; returns **null** after 100 failed attempts | P1 |
| Generate lines | working with caveats | `generators.js` `generateLine` ~55–109 | Straight two-point lines; not graph routing | P1 |
| Generate polygons | working with caveats | `generators.js` `generatePolygon` ~114–178 | Noisy circular-ish polygons; not cadastral realism | P1 |
| Define boundary by drawing | working | `GenerateMap.js` ~120–163 | `ol/interaction/Draw`, polygon mode, GeoJSON to parent | P2 |
| Define boundary by upload | working | `GeoJSONUploader.js` (296 lines) | Upload + URL import; JSON validation in component | P2 |
| Configure parameters | working | `generate/page.js` ~14–30 | Geometry, quantity, line length, polygon area, attributes state | P2 |
| Preview on map | working | `GenerateMap.js` ~196–329 | Features added to vector source after generation | P1 |
| Export GeoJSON | working | `exporters.js` `exportAsGeoJSON` ~63–69 | Blob + `file-saver` | P1 |
| Export Shapefile | working with caveats | `exporters.js` ~26–48, 74–81 | ZIP via `@mapbox/shp-write`; sync `zip()` call | P2 |
| Export GeoPackage | broken | `exporters.js` ~55–58, 87–95 | Always throws before useful `.gpkg` bytes | P3 (defer) |
| Reset / clear features | working | `generate/page.js` ~138–143, UI ~643+ | `handleClearFeatures` clears state and calls `clearFeatures` on map ref | P3 |
| Production build / static export | working | Verified 2026-03-30: `npm ci` + `npm run build` | Clean compile and export; `out/` produced | P1 |
| GitHub Pages deployment | untested | `.github/workflows/deploy.yml` | Workflow present; **no evidence in this audit** that a Pages deploy succeeded | P1 |

---

## Section 4 — Dependency and config risks

**Unused or redundant dependencies (verified: no `import` in `src/` for these):**

| Package | Declared in `package.json` | Notes |
|---------|---------------------------|--------|
| `shp-write` | `^0.3.2` | Deprecated meta-package; code imports **`@mapbox/shp-write`** only |
| `shpjs` | `^6.1.0` | Zero imports in `src/` |
| `@observablehq/plot` | `^0.6.17` | Zero imports in `src/` |
| `d3-array` | `^3.2.4` | Zero imports in `src/` |
| `@ngageoint/geopackage` | `^4.2.6` | Zero imports in `src/`; GeoPackage path does not use it |

**Config conflicts:**

- **Two PostCSS configs:** `postcss.config.js` (CommonJS, `tailwindcss` + `autoprefixer`) vs `postcss.config.mjs` (ESM, plugin `@tailwindcss/postcss`). **`@tailwindcss/postcss` is not listed in `package.json` dependencies.** Which file Next resolves can affect builds; current build succeeded with installed tree but this is **non-obvious and risky**.
- **`tailwind.config.js` content paths** include `./src/pages/**/*` — there is **no `src/pages/`** (App Router only). Harmless for scanning but misleading.

**Code issues:**

- `src/hooks/index.js` — exports **named** hooks then re-exports `default` from the same modules; `useFeatureGeneration.js`, `useExport.js`, and `useAiProcessor.js` expose **only named exports**, so **default re-exports are invalid** if consumed.
- `src/hooks/useFeatureGeneration.js` — calls `generatePoint` / `generateLine` / `generatePolygon` with a **single object argument**; actual functions expect **positional** `(bounds, attributes, …)`. The generate page does **not** use this hook (grep shows no `@/hooks` imports in `src/`), so this is **dead, inconsistent code**.
- `random.js` defines `randomGenerator` and `createSeededRandom`, but `getRandomFloat` / `getRandomInt` / etc. use **`Math.random()`** only; generators do not use seeded RNG — **outputs are not reproducible** by seed.
- `npm audit` after install reported **15** vulnerabilities (severities mixed); not triaged in this pass — treat as **dependency risk** until reviewed.

**Status:** **working with caveats** (build passes; hygiene issues above).

---

## Section 5 — Testing and quality gaps

- **Automated tests:** **untested** as a capability — no test files under `tests/`, no Jest/Vitest/playwright config in repo root.
- **Lint:** `package.json` has `"lint": "next lint"` but **no** `.eslintrc*` or `eslint.config.*` found — Next may use defaults only; **no custom quality bar**.
- **Formatting:** No Prettier or editorconfig observed in audit — **no enforced style**.
- **Generated output validation:** Features are not validated against a schema before export (structural checks are minimal).
- **CI:** `.github/workflows/deploy.yml` runs **build/export only** — no lint, no test job.
- **Accessibility:** No a11y test tooling or audit artifacts in repo — **untested**.
- **Reproducibility:** Seeded helpers exist but are **not wired** — same settings do not guarantee same geometry.

---

## Section 6 — Launch blockers and recommended follow-ups

**Treat as must-fix before a credible public v0.1:**

1. **Reasoning page vs static app:** `/reasoning` calls a non-existent API — remove, stub client-side, or document as non-functional.
2. **Dependency bloat:** Remove or justify the five unused packages listed in Section 4.
3. **PostCSS single source of truth:** Keep one config aligned with installed plugins (likely retain `postcss.config.js` unless migrating to Tailwind v4 toolchain).
4. **Dead / broken hook surface:** Fix `src/hooks/index.js` and either repair or delete `useFeatureGeneration.js`.
5. **Documentation honesty:** Update README (and related docs) to match rule-based prompts, geometry limitations, and GeoPackage status.

**Verified in this audit:** production **build** is **working** (see Context).

**Still untested here:** end-to-end **GitHub Pages** deploy, browser UX, Shapefile interoperability with external GIS.

**Should-fix for credibility (post–must-fix):**

- At least one smoke test for generation + GeoJSON export.
- Optional: wire seed to RNG for reproducible demos.
- Optional: metadata or disclaimer on exported files (synthetic data).

---

## Section 7 — Architecture decision memo

**Question:** Should Geomockery stay on the current **JavaScript / Next static client** stack, move to **Python**, or use a **hybrid**?

**Recommendation: Keep JavaScript. Ship the current architecture.**

| Factor | JavaScript (current) | Python | Hybrid |
|--------|----------------------|--------|--------|
| Delivery today | Core loop implemented; static hosting; **no server required** | Full rewrite of UI + generation | Two runtimes, integration cost |
| Geospatial fit | Turf covers bbox, point-in-polygon, distance, area for current generators | Stronger for heavy topology / networks | Overkill for current scope |
| Ops | GitHub Pages–friendly | Hosting + runtime for API | Highest operational surface |
| Time to v0.1 | **Low** — fix docs, dead routes, deps, hooks | **High** | **Medium–high** |

**Rationale:** Present generators are **random / template-driven** and do not require Python’s GIS stack. A Python rewrite **delays launch** without changing the user-visible story until product requirements demand richer geometry (e.g., network-constrained lines, parcel topology). If that arises later, a **backend service** can be added without prejudicing today’s static-first model.

---

## Document control

| Field | Value |
|-------|--------|
| Report | `docs/AUDIT_REPORT.md` |
| Audit date | 2026-03-30 |
| Related planning | `.cursor/plans/geomockery-audit-and-launch.md` (reference only; not modified as part of this deliverable) |
