'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { withBasePath } from '@/lib/utils/basePath';

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

          {/* App screenshot */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
            <div className="border-t border-l border-r border-slate-800 overflow-hidden bg-slate-900 aspect-video relative max-w-5xl">
              <Image
                src={withBasePath('/images/app.png')}
                alt="Geomockery app — generating synthetic geospatial data"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
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
                body: 'Describe your dataset in plain text and let keyword matching suggest geometry type, quantity, and attributes.',
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
