# Geomockery Launch Readiness Audit Report

## Context and method

This audit was refreshed on **2026-04-08** against the current repository state. Findings are grounded in the files currently present under `src/`, repo config, workflow config, and the current documentation set.

Validation performed in this pass:

- inspected current source, config, and docs
- ran a clean local `npm run build` successfully on **2026-04-08**
- ran a GitHub Pages-style build successfully with `GITHUB_ACTIONS=true` and `GITHUB_REPOSITORY=rgdonohue/geomockery`
- confirmed static export output for `/`, `/about`, and `/generate`
- confirmed the Pages-style export prefixes routes and public assets with `/geomockery/`

Not exercised in this pass:

- browser-based happy path interactions
- GitHub Pages deployment on a live URL
- Shapefile interoperability in external GIS software
- mobile or small-screen behavior

**Repo status:** **working with caveats**

The codebase is past the initial truth pass, but not yet at launch readiness. The core browser demo is wired and the static build works, while runtime trust gaps, stale docs, and deployment validation are still open.

---

## Section 1 — Repo inventory

| Area | Current paths | Notes |
|------|---------------|-------|
| App shell | `src/app/layout.js`, `src/components/layout/Header.js`, `src/components/layout/Layout.js` | Next.js App Router app with shared layout components |
| Routes | `src/app/page.js`, `src/app/generate/page.js`, `src/app/about/page.js` | Three user-facing routes; no API routes in the current tree |
| Generation engine | `src/lib/geo/generators.js` | Point, line, and polygon generation with Turf helpers |
| Export | `src/lib/geo/exporters.js` | GeoJSON and Shapefile wiring; GeoPackage path still throws |
| Prompt assistance | `src/lib/ai/aiProcessor.js`, `src/lib/ai/geoIntelligence.js`, `src/app/generate/components/AiConversation.js` | Rule-based prompt parsing and map suggestions; no remote model |
| Map + boundary tools | `src/app/generate/components/GenerateMap.js`, `src/app/generate/components/GeoJSONUploader.js` | OpenLayers preview, drawing, file upload, URL import |
| Attribute editing | `src/app/generate/components/FeatureAttributeEditor.js`, `src/data/schemas/attributeSchema.js` | Configurable attribute schema editor and schema defaults |
| Hooks | `src/hooks/useExport.js`, `src/hooks/useAiProcessor.js`, `src/hooks/index.js` | Small helper hooks; current generate page manages most state directly |
| Config | `package.json`, `next.config.mjs`, `jsconfig.json`, `postcss.config.js`, `tailwind.config.js`, `.github/workflows/deploy.yml` | Static export, path aliases, Tailwind/PostCSS, GitHub Pages workflow |
| Docs | `README.md`, `docs/AUDIT_REPORT.md`, `docs/ARCHITECTURE_DECISION_MEMO.md`, `docs/geomockery-revival-roadmap.md`, `docs/DEV_STATUS.md`, `docs/TASKS.md`, `docs/PRD.md` | README and roadmap are the most useful current-facing docs |
| Tests | `tests/` | No test source files found in the current repo |

---

## Section 2 — Documentation contradictions

The current `README.md` is mostly aligned with the code. The main drift is now in older planning and status docs.

| Topic | Current evidence | Status |
|------|------------------|--------|
| “AI-powered” positioning in older docs | `docs/DEV_STATUS.md` and `docs/PRD.md` still describe AI-powered generation, while `README.md` now correctly states there is no server and no LLM and `src/lib/ai/aiProcessor.js` is keyword/template-driven | broken |
| Near-complete MVP claims | `docs/DEV_STATUS.md` says “90% Complete MVP” and “ready for user testing,” but the repo still has no tests, no verified deploy, and no recorded browser validation | broken |
| Export support claims | `docs/PRD.md` still treats GeoPackage as part of core export support, while `src/lib/geo/exporters.js` throws immediately for GeoPackage and the UI disables it | broken |
| “Realistic” generation language | Older docs describe realistic distributions and routing, while `src/lib/geo/generators.js` produces uniform random points, straight lines, and jittered polygons | working with caveats |
| Existing audit report drift | The previous audit report was stale relative to the current tree; this refresh replaces that outdated view | working |

---

## Section 3 — Workflow truth table

Statuses use only the required labels: **working**, **working with caveats**, **broken**, **untested**.

| Workflow | Status | Evidence | Notes | Priority |
|----------|--------|----------|-------|----------|
| Generate point data | working with caveats | `src/lib/geo/generators.js` | Uniform random point generation inside bbox or constraining polygon; returns `null` after 100 failed attempts | high |
| Generate line data | working with caveats | `src/lib/geo/generators.js` | Straight two-point lines with length bounds; not routed or street-aware | high |
| Generate polygon data | working with caveats | `src/lib/geo/generators.js` | Jittered radial polygons; not parcel-like or topology-aware | high |
| Define boundary by drawing | working with caveats | `src/app/generate/components/GenerateMap.js` | OpenLayers draw interaction is wired; browser interaction not manually exercised in this pass | high |
| Define boundary by upload | working with caveats | `src/app/generate/components/GeoJSONUploader.js` | File import is wired; URL import is vulnerable to normal browser CORS limits | high |
| Generate attributes | working with caveats | `src/lib/geo/generators.js`, `src/app/generate/components/FeatureAttributeEditor.js`, `src/lib/ai/aiProcessor.js` | Attribute values are random/template-driven; no relationship modeling or export-time schema validation | medium |
| Configure generation parameters | working | `src/app/generate/page.js` | Geometry, quantity, line length, polygon area, export format, and attribute controls are present | medium |
| Preview generated data on map | working with caveats | `src/app/generate/components/GenerateMap.js` | Generated features are added to an OpenLayers vector source; browser rendering not manually exercised in this pass | high |
| Export GeoJSON | working with caveats | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | Download wiring exists through `file-saver`; exported file not manually opened in this pass | high |
| Export Shapefile | working with caveats | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | ZIP export wiring exists through `@mapbox/shp-write`; external GIS interoperability is still untested | high |
| Export GeoPackage | broken | `src/lib/geo/exporters.js`, `src/app/generate/page.js` | Function throws immediately and UI keeps the option disabled | low |
| Reset / clear | working | `src/app/generate/page.js`, `src/app/generate/components/GenerateMap.js` | UI clears generated state and the map feature source | low |
| Build / static export | working | clean `npm run build` on 2026-04-08 | Build completed successfully and exported `/`, `/about`, and `/generate` without relying on external font fetches | high |
| Deployment path | working with caveats | `.github/workflows/deploy.yml`, `next.config.mjs`, Pages-style export verification | GitHub Actions project-Pages path prefixing is now validated locally, but no successful live deployment URL was verified in this pass | high |
| Mobile or small-screen behavior | untested | responsive classes in `src/app/*.js` and `src/app/generate/page.js` | No manual browser check was performed in this pass | medium |

---

## Section 4 — Dependency and config risks

| Risk | Evidence | Status |
|------|----------|--------|
| GitHub Pages still needs live verification | `next.config.mjs` now applies a repo base path automatically for GitHub Actions project-Pages builds, and the exported HTML was verified locally; the remaining risk is live repo settings or Pages environment mismatch | working with caveats |
| GeoPackage remains in the code surface even though it is disabled | `src/lib/geo/exporters.js`, `src/hooks/useExport.js`, and the generate page still carry GeoPackage branches even though the feature is explicitly unavailable | working with caveats |
| Tailwind scans a non-existent `src/pages` path | `tailwind.config.js` still includes `./src/pages/**/*` even though the app uses only the App Router | working with caveats |
| Browserslist data is stale | `npm run build` emitted a `caniuse-lite` update warning on 2026-04-08 | working with caveats |
| Switching build modes in one checkout can dirty generated state | A plain build after a Pages-mode build hit `.next` state issues, while a clean checkout build succeeded | working with caveats |
| Current package list is relatively lean | `package.json` now contains only the active runtime dependencies needed for the current app story; no obvious dead package set from the prior audit remains | working |

---

## Section 5 — Testing and quality gaps

- **Automated tests:** **broken**. No unit, integration, or end-to-end test files were found.
- **Linting:** **untested** as a quality gate. There is no standalone lint script in `package.json`, and no explicit ESLint config is present in the repo root.
- **Generated output validation:** **broken**. Exporters serialize and download data, but there is no structural validation pass before export.
- **Browser happy path:** **untested**. This pass did not manually confirm generate -> preview -> export through the browser UI.
- **Deployment smoke test:** **working with caveats**. A Pages-style export was verified locally, but there is still no recorded successful public Pages check in this audit.
- **Reproducibility:** **broken** for seeded use cases. `src/lib/utils/random.js` includes seed helpers, but the active generation helpers still use `Math.random()`.
- **Mobile verification:** **untested**. Responsive classes are present, but no browser/device run was performed.

---

## Section 6 — Launch blockers

These are the smallest high-value items still separating the repo from a credible public v0.1.

1. **Browser validation is missing.** The core demo needs one recorded happy-path run through `/generate`: boundary selection, feature generation, preview, GeoJSON download, and Shapefile download.
2. **Live deployment is still unverified.** The Pages export path issue is fixed and validated locally, but the public URL still needs one real deploy check.
3. **Older docs still oversell the product.** `docs/DEV_STATUS.md` and `docs/PRD.md` still describe an AI-powered, near-complete MVP story that no longer matches the audited repo.
4. **There is no smoke coverage around the demo.** At minimum, the repo needs a documented manual validation checklist or a lightweight automated smoke test for build plus one happy path.
5. **Trust features remain incomplete.** Seeded reproducibility, generation summary metadata, and explicit synthetic-data labeling are still missing or only partially expressed in UI copy.

**Not a blocker for v0.1 if the docs stay honest:** GeoPackage. The current README and UI already present it as unavailable, which is acceptable for a small public release.

---

## Section 7 — Architecture decision memo

See `docs/ARCHITECTURE_DECISION_MEMO.md`.

**Current recommendation:** keep the current JavaScript, static-first architecture for v0.1 and harden the browser demo before considering Python or a hybrid backend.
