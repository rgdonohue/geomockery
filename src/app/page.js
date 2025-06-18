'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import AiDemoSection from './components/AiDemoSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10">
            {Array.from({ length: 12 * 6 }).map((_, i) => (
              <div key={i} className="border border-gray-900" />
            ))}
          </div>
          
          <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-black text-6xl md:text-8xl tracking-tight mb-6 text-indigo-900">
                <span className="inline-block transform -rotate-2">GEO</span>
                <span className="inline-block text-pink-600 transform rotate-2">MOCKERY</span>
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-indigo-700 max-w-3xl mx-auto mb-12">
                Generate realistic geospatial data with just a few clicks
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  href="/generate" 
                  className="inline-block py-5 px-8 bg-indigo-600 text-white text-xl font-black uppercase tracking-wider border-4 border-indigo-800 shadow-brutalist hover:translate-y-[-4px] transition-transform"
                >
                  Generate Data
                </Link>
                <a 
                  href="https://github.com/rgdonohue/geomockery" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-5 px-8 bg-white text-indigo-700 text-xl font-black uppercase tracking-wider border-4 border-indigo-500 shadow-brutalist hover:translate-y-[-4px] transition-transform"
                >
                  View on GitHub
                </a>
              </div>
            </div>
            
            {/* Map Preview */}
            <div className="border-8 border-indigo-500 shadow-brutalist transform rotate-1 max-w-5xl mx-auto bg-gray-100 aspect-video relative overflow-hidden">
              <Image 
                src="/images/app.png" 
                alt="Geomockery App Screenshot - Generate realistic geospatial data" 
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-indigo-900 opacity-10"></div>
              <div className="absolute top-8 left-8 bg-pink-500 border-4 border-pink-700 py-3 px-6 transform -rotate-2">
                <span className="text-xl font-black text-white">LIVE APP</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Development Status Banner */}
        <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-amber-100 border-4 border-amber-400 shadow-brutalist transform -rotate-1 p-4 text-center">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🚧</span>
              <p className="text-lg font-black text-amber-800">
                <span className="text-amber-900">DEVELOPMENT STATUS:</span> Approaching alpha release - core features functional, expect some rough edges!
              </p>
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </section>
        
        {/* Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-indigo-900 mb-16 text-center uppercase tracking-tight">
            <span className="inline-block transform rotate-1 border-b-8 border-pink-500 pb-2">
              Capabilities
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature Card 1 */}
            <div className="bg-white border-8 border-cyan-500 shadow-brutalist transform -rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-cyan-500 flex items-center justify-center mb-6 transform rotate-3 border-4 border-cyan-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Points, Lines & Polygons</h3>
              <p className="text-lg font-bold text-indigo-700">
                Generate any geometry type with realistic spatial distribution and properties.
              </p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-white border-8 border-fuchsia-500 shadow-brutalist transform rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-fuchsia-500 flex items-center justify-center mb-6 transform -rotate-3 border-4 border-fuchsia-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Custom Attributes</h3>
              <p className="text-lg font-bold text-indigo-700">
                Define your own attribute schemas with AI-powered value generation.
              </p>
            </div>
            
            {/* Feature Card 3 */}
            <div className="bg-white border-8 border-lime-500 shadow-brutalist transform -rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-lime-500 flex items-center justify-center mb-6 transform rotate-3 border-4 border-lime-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Multiple Export Formats</h3>
              <p className="text-lg font-bold text-indigo-700">
                Download your generated data as GeoJSON, Shapefile, or GeoPackage.
              </p>
            </div>
            
            {/* Feature Card 4 */}
            <div className="bg-white border-8 border-amber-500 shadow-brutalist transform rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-amber-500 flex items-center justify-center mb-6 transform -rotate-3 border-4 border-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Draw on Map</h3>
              <p className="text-lg font-bold text-indigo-700">
                Define custom areas by drawing directly on the map or uploading your own GeoJSON.
              </p>
            </div>
            
            {/* Feature Card 5 */}
            <div className="bg-white border-8 border-indigo-500 shadow-brutalist transform -rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-indigo-500 flex items-center justify-center mb-6 transform rotate-3 border-4 border-indigo-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Advanced Generation</h3>
              <p className="text-lg font-bold text-indigo-700">
                Control quantity, distribution, and complex property relationships.
              </p>
            </div>
            
            {/* Feature Card 6 */}
            <div className="bg-white border-8 border-pink-500 shadow-brutalist transform rotate-1 p-8 hover:translate-y-[-8px] transition-transform">
              <div className="w-16 h-16 bg-pink-500 flex items-center justify-center mb-6 transform -rotate-3 border-4 border-pink-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-indigo-900 mb-4">Coming Soon: Batch Mode</h3>
              <p className="text-lg font-bold text-indigo-700">
                Generate large datasets with API access for integration with other tools.
              </p>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-indigo-50">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-indigo-900 mb-8 uppercase tracking-tight">
              <span className="inline-block transform -rotate-1 border-b-8 border-cyan-500 pb-2">
                Why Geomockery?
              </span>
            </h2>
            <p className="text-xl md:text-2xl font-bold text-indigo-600 max-w-4xl mx-auto leading-relaxed">
              Every geospatial developer knows the pain of waiting for "real" data
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-white border-8 border-red-400 shadow-brutalist transform -rotate-1 p-6">
                <h3 className="text-2xl font-black text-red-600 mb-4">THE PROBLEM</h3>
                <ul className="space-y-3 text-lg font-bold text-gray-700">
                  <li>🚧 Real data isn't ready (and never will be on time)</li>
                  <li>🔒 Privacy concerns make production data off-limits</li>
                  <li>📊 You need specific edge cases that don't exist</li>
                  <li>🏗️ Client data is under NDA but you still need to build</li>
                </ul>
              </div>
              
              <div className="bg-white border-8 border-green-500 shadow-brutalist transform rotate-1 p-6">
                <h3 className="text-2xl font-black text-green-600 mb-4">OUR SOLUTION</h3>
                <ul className="space-y-3 text-lg font-bold text-gray-700">
                  <li>⚡ Generate realistic data in seconds, not weeks</li>
                  <li>🎯 Custom-tailored for your exact use case</li>
                  <li>🛡️ 100% privacy-safe with zero real-world exposure</li>
                  <li>🎨 Creative and fun - make data generation enjoyable</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white border-8 border-purple-500 shadow-brutalist transform rotate-2 p-8">
              <h3 className="text-3xl font-black text-purple-600 mb-6 text-center">
                FROM CONCEPT TO CODE
              </h3>
              <div className="space-y-4 text-lg font-bold text-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🗺️</span>
                  <span>Navigate to any area on the map</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <span>Define your data requirements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <span>Generate features with one click</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💾</span>
                  <span>Export in your preferred format</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎉</span>
                  <span>Use immediately in your app</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-purple-100 border-4 border-purple-300 transform -rotate-1">
                <p className="text-lg font-black text-purple-800 text-center">
                  "Stop waiting for data.<br/>Start building with confidence."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Demo Section */}
        <AiDemoSection />
        
        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-8 border-indigo-900 shadow-brutalist transform rotate-1 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 transform -rotate-1">
              Ready to Generate Some Data?
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white mb-12 max-w-3xl mx-auto">
              Create realistic geospatial features with custom attributes in seconds
            </p>
            <Link 
              href="/generate" 
              className="inline-block py-5 px-12 bg-white text-indigo-900 text-xl font-black uppercase tracking-wider border-4 border-indigo-900 shadow-brutalist hover:translate-y-[-4px] transition-transform"
            >
              Start Generating Now
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="relative h-12 w-12 mr-3 transform -rotate-3">
                  <Image
                    src="/logo.svg"
                    alt="Geomockery Logo"
                    width={48}
                    height={48}
                    className="drop-shadow-md"
                  />
                </div>
                <div className="transform rotate-1">
                  <span className="text-2xl font-black tracking-tight text-white">GEO</span>
                  <span className="text-2xl font-black tracking-tight text-pink-400">MOCKERY</span>
                </div>
              </div>
              <p className="mt-2 text-indigo-200 font-medium">
                Generate realistic geospatial data for testing and development
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-pink-400">Navigation</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-pink-400 font-medium">Home</Link></li>
                  <li><Link href="/generate" className="hover:text-pink-400 font-medium">Generate</Link></li>
                  <li><Link href="/about" className="hover:text-pink-400 font-medium">About</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4 text-pink-400">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com/rgdonohue/geomockery" className="hover:text-pink-400 font-medium">GitHub</a></li>
                  <li><a href="https://github.com/rgdonohue/geomockery/issues" className="hover:text-pink-400 font-medium">Issues</a></li>
                  <li><a href="https://github.com/rgdonohue/geomockery/blob/main/LICENSE" className="hover:text-pink-400 font-medium">License</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-indigo-800 text-center">
            <p className="text-indigo-300">
              © {new Date().getFullYear()} Geomockery. Made with bold minimalism.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
