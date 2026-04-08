'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { withBasePath } from '@/lib/utils/basePath';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">About</span>
            <h1 className="mt-2 text-4xl md:text-6xl font-black tracking-tight text-white">
              Why Geomockery exists
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed">
              Geospatial developers constantly need plausible test data — and it's almost never available when they need it.
            </p>
          </div>
        </section>

        {/* The problem */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-500">The problem</span>
              <h2 className="mt-2 text-3xl font-black text-slate-900 mb-8">The developer dilemma</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Every geospatial developer has been stuck in this cycle. Real data is unavailable, restricted, or just too slow to obtain.
              </p>
              <ul className="space-y-4">
                {[
                  { label: 'Real data isn\'t ready', detail: 'And it never will be on your timeline' },
                  { label: 'Privacy restrictions', detail: 'Production data is completely off-limits' },
                  { label: 'Missing edge cases', detail: 'Specific scenarios that don\'t exist in the wild' },
                  { label: 'NDA constraints', detail: 'Client data is protected but you still need to build' },
                ].map(({ label, detail }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center bg-red-50 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{label}</span>
                      <span className="text-slate-500"> — {detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 text-white p-10">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">The solution</span>
              <h3 className="mt-2 text-2xl font-black mb-6">Geomockery</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Generate plausible synthetic geospatial data in seconds. Configurable, browser-only, and immediately exportable.
              </p>
              <ul className="space-y-4">
                {[
                  'Points, lines, and polygons inside any boundary',
                  'Custom attribute schemas with auto-generated values',
                  'GeoJSON and Shapefile export, no server required',
                  'Draw or upload your own boundary for any area',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">How it works</span>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Four steps to a dataset</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Navigate',
                  body: 'Find any area on the interactive map and pan or zoom to your target region.',
                },
                {
                  step: '02',
                  title: 'Configure',
                  body: 'Choose geometry type, feature count, and define custom attribute schemas.',
                },
                {
                  step: '03',
                  title: 'Generate',
                  body: 'Click generate. Features appear on the map immediately for review.',
                },
                {
                  step: '04',
                  title: 'Export',
                  body: 'Download as GeoJSON or Shapefile ZIP and use immediately in your app.',
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="bg-white border border-slate-200 p-6">
                  <div className="text-3xl font-black text-slate-200 mb-4">{step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Principles</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">What guides the project</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Developer first',
                body: 'Built by developers who know the real pain points of working with geospatial data in the absence of suitable test data.',
              },
              {
                title: 'Open source',
                body: 'Community-driven. The full source is on GitHub and contributions are welcome.',
              },
              {
                title: 'Privacy by design',
                body: 'All generation happens in the browser. No data leaves your machine. No API key, no account, no telemetry.',
              },
              {
                title: 'Honest about limitations',
                body: 'Data is synthetic and suitable for testing, demos, and development — not inference or analysis against real-world patterns.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-4">Try it now</h2>
            <p className="text-slate-400 mb-8">
              Generate a synthetic dataset in under two minutes.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
            >
              Open the generator
            </Link>
          </div>
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
                  <a href="https://github.com/rgdonohue/geomockery" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </li>
                <li>
                  <a href="https://github.com/rgdonohue/geomockery/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Issues</a>
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
