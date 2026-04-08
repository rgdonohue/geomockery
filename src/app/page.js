'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { withBasePath } from '@/lib/utils/basePath';

// Hardcoded point clusters that look like a real generated dataset
const DEMO_POINTS = [
  // Cluster A — dense urban area
  [605,262],[615,275],[623,263],[612,288],[621,300],[631,288],
  [598,278],[608,292],[617,306],[626,293],[635,283],[643,296],
  [628,308],[638,320],[618,313],[627,325],[601,306],[610,316],
  [634,268],[642,280],[650,268],[641,258],[649,273],[658,263],
  [651,281],[660,296],[619,250],[628,263],[637,250],[646,266],
  [655,256],[664,270],[604,266],[613,250],[622,238],
  // Cluster B — secondary area
  [808,258],[817,272],[825,260],[834,275],[842,262],[850,278],
  [820,285],[829,298],[837,285],[845,300],[853,288],[861,275],
  [815,308],[823,296],[831,310],[839,298],[847,313],[855,303],
  [863,290],[870,308],
  // Scattered outliers
  [340,182],[382,418],[462,328],[520,448],[902,178],
  [488,202],[420,380],[568,290],[740,422],[778,182],
];

function AppIllustration() {
  return (
    <svg
      viewBox="0 0 1000 563"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full block"
      style={{ background: '#0f172a' }}
    >
      {/* Sidebar background */}
      <rect x="0" y="0" width="265" height="563" fill="#1e293b" />
      {/* Sidebar border */}
      <line x1="265" y1="0" x2="265" y2="563" stroke="#334155" strokeWidth="1" />

      {/* Sidebar — label eyebrow */}
      <text x="24" y="38" fill="#6366f1" fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="monospace">GEOMOCKERY</text>
      <text x="24" y="58" fill="#f1f5f9" fontSize="16" fontWeight="800" fontFamily="sans-serif">Generate dataset</text>
      <text x="24" y="76" fill="#64748b" fontSize="10" fontFamily="sans-serif">Synthetic features for testing &amp; demos.</text>

      <line x1="24" y1="94" x2="241" y2="94" stroke="#334155" strokeWidth="1" />

      {/* GEOMETRY TYPE */}
      <text x="24" y="116" fill="#64748b" fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="monospace">GEOMETRY TYPE</text>
      <rect x="24" y="124" width="72" height="30" fill="#4f46e5" />
      <text x="60" y="143" fill="white" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">Points</text>
      <rect x="102" y="124" width="72" height="30" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="138" y="143" fill="#94a3b8" fontSize="11" fontWeight="500" textAnchor="middle" fontFamily="sans-serif">Lines</text>
      <rect x="180" y="124" width="72" height="30" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="216" y="143" fill="#94a3b8" fontSize="11" fontWeight="500" textAnchor="middle" fontFamily="sans-serif">Polygons</text>

      {/* QUANTITY */}
      <text x="24" y="178" fill="#64748b" fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="monospace">QUANTITY</text>
      <rect x="24" y="186" width="217" height="30" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="36" y="206" fill="#e2e8f0" fontSize="13" fontFamily="monospace">500</text>

      {/* GENERATION AREA */}
      <text x="24" y="240" fill="#64748b" fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="monospace">GENERATION AREA</text>
      <rect x="24" y="248" width="217" height="46" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1" />
      <rect x="36" y="260" width="18" height="18" fill="#4f46e5" />
      <text x="45" y="273" fill="white" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">1</text>
      <text x="62" y="272" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="sans-serif">Map viewport</text>
      <rect x="140" y="263" width="44" height="13" fill="#312e81" />
      <text x="162" y="273" fill="#a5b4fc" fontSize="8" fontWeight="700" textAnchor="middle" letterSpacing="1" fontFamily="monospace">DEFAULT</text>
      <text x="62" y="286" fill="#64748b" fontSize="9" fontFamily="sans-serif">Pan or zoom to set the extent.</text>

      {/* Summary + generate button area */}
      <line x1="0" y1="505" x2="265" y2="505" stroke="#4f46e5" strokeWidth="2" strokeOpacity="0.5" />
      <text x="24" y="526" fill="#64748b" fontSize="9" fontFamily="monospace">500 points · map viewport</text>
      <rect x="24" y="534" width="217" height="18" fill="#4f46e5" opacity="0.15" />
      <rect x="24" y="536" width="217" height="16" fill="#4f46e5" />
      <text x="132" y="548" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">Generate features</text>

      {/* Map area — subtle grid */}
      {[1,2,3].map(i => (
        <line key={`h${i}`} x1="265" y1={i * 140} x2="1000" y2={i * 140} stroke="#1e293b" strokeWidth="1" />
      ))}
      {[1,2,3,4,5].map(i => (
        <line key={`v${i}`} x1={265 + i * 147} x2={265 + i * 147} y1="0" y2="563" stroke="#1e293b" strokeWidth="1" />
      ))}

      {/* Generated points */}
      {DEMO_POINTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 7 === 0 ? 5 : i % 3 === 0 ? 4.5 : 4}
          fill="#818cf8"
          fillOpacity={0.75 + (i % 4) * 0.06}
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      ))}

      {/* Stats overlay bottom-right */}
      <rect x="842" y="495" width="148" height="54" fill="#0f172a" fillOpacity="0.92" stroke="#334155" strokeWidth="1" />
      <text x="856" y="514" fill="#64748b" fontSize="7" fontWeight="700" letterSpacing="2" fontFamily="monospace">FEATURES</text>
      <text x="856" y="537" fill="white" fontSize="24" fontWeight="800" fontFamily="sans-serif">500</text>
      <text x="916" y="514" fill="#64748b" fontSize="7" fontWeight="700" letterSpacing="2" fontFamily="monospace">TYPE</text>
      <text x="916" y="537" fill="white" fontSize="24" fontWeight="800" fontFamily="sans-serif">pts</text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                v0.1 · Open source · Browser-only
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
                <span className="text-white">GEO</span>
                <span className="text-pink-400">MOCKERY</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                Generate synthetic geospatial datasets for demos, testing, and development. No server, no account, no waiting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/generate"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white text-base font-bold hover:bg-indigo-500 transition-colors"
                >
                  Open the generator
                </Link>
                <a
                  href="https://github.com/rgdonohue/geomockery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-800 text-slate-200 text-base font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>

          {/* App illustration */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
            <div className="border-t border-l border-r border-slate-800 overflow-hidden max-w-5xl">
              <AppIllustration />
            </div>
          </div>
        </section>

        {/* Status strip */}
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-center">
          <p className="text-sm font-medium text-amber-800">
            Early v0.1 — core workflow is usable. Some edges are still being tightened.
          </p>
        </div>

        {/* Features */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Capabilities</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-black text-slate-900">
              What Geomockery does
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="5" cy="6" r="2" />
                    <circle cx="19" cy="8" r="2" />
                    <circle cx="7" cy="19" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                ),
                title: 'Points, Lines & Polygons',
                body: 'Generate any geometry type inside a drawn boundary, uploaded GeoJSON, or the current map viewport.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Custom attribute schemas',
                body: 'Define nominal, ordinal, quantitative, temporal, and identifier attributes. Values are generated automatically.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'GeoJSON & Shapefile export',
                body: 'Download your dataset immediately. Runs entirely in the browser — no server, no account required.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Draw or upload boundaries',
                body: 'Sketch a polygon directly on the map, or upload a GeoJSON file to constrain generation to any area.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Live map preview',
                body: 'Generated features appear on an interactive OpenLayers map immediately — inspect before you export.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Prompt-assisted setup',
                body: 'Describe your dataset in plain text and let built-in keyword matching prefill geometry type, quantity, and attributes. No LLM — this is a basic helper still in development.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="group">
                <div className="w-11 h-11 bg-indigo-50 flex items-center justify-center mb-5 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="bg-slate-950 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Why this exists</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-black text-white">
                Stop waiting for real data
              </h2>
              <p className="mt-4 text-slate-400 text-lg leading-relaxed">
                Geospatial developers constantly need data that is unavailable, restricted, or just too slow to obtain. Geomockery fills that gap.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-5">The problem</h3>
                <ul className="space-y-3 text-slate-300">
                  {[
                    'Real data isn\'t ready — and never will be on your timeline',
                    'Production data is off-limits for privacy or legal reasons',
                    'You need specific edge cases that don\'t naturally exist',
                    'Client data is under NDA but you still need to build',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-indigo-900/60 p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-5">Geomockery</h3>
                <ul className="space-y-3 text-slate-300">
                  {[
                    'Generate synthetic data in seconds, not weeks',
                    'Fully configurable geometry type, count, and attributes',
                    'Runs in the browser — no server, no API key',
                    'Export immediately as GeoJSON or Shapefile',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-5">
            Ready to generate?
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            Create synthetic geospatial features with configurable attributes in seconds.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white text-base font-bold hover:bg-indigo-500 transition-colors"
          >
            Open the generator
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src={withBasePath('/logo.svg')}
                alt="Geomockery Logo"
                width={28}
                height={28}
                className="opacity-80"
              />
              <span className="text-base font-black">
                <span className="text-white">GEO</span>
                <span className="text-pink-400">MOCKERY</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-xs">
              Synthetic geospatial data for testing, demos, and development.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Navigation</p>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/generate" className="hover:text-white transition-colors">Generate</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Project</p>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/rgdonohue/geomockery" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://github.com/rgdonohue/geomockery/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Issues
                  </a>
                </li>
                <li>
                  <a href="https://github.com/rgdonohue/geomockery/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    License
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-700">© {new Date().getFullYear()} Geomockery. Synthetic data only.</p>
        </div>
      </footer>
    </>
  );
}
