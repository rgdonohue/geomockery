'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5">
            {Array.from({ length: 12 * 6 }).map((_, i) => (
              <div key={i} className="border border-gray-900" />
            ))}
          </div>
          
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="font-black text-5xl md:text-7xl tracking-tight mb-8 text-indigo-900">
              <span className="inline-block transform -rotate-2">ABOUT</span>
              <span className="inline-block text-pink-600 transform rotate-2 ml-4">GEOMOCKERY</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-indigo-700 max-w-4xl mx-auto leading-relaxed mb-12">
              The story of why we built the geospatial data generator that developers actually want to use
            </p>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-red-600 mb-8 transform -rotate-1">
                THE DEVELOPER<br/>DILEMMA
              </h2>
              <div className="space-y-6 text-lg font-bold text-gray-700">
                <p>
                  Every geospatial developer has been stuck in this frustrating cycle:
                </p>
                <div className="bg-red-50 border-8 border-red-400 shadow-brutalist transform rotate-1 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">🚧</span>
                      <span><strong>"The real data isn't ready yet"</strong> - and it never will be on time</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">🔒</span>
                      <span><strong>Privacy concerns</strong> make production data completely off-limits</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">📊</span>
                      <span><strong>You need specific edge cases</strong> that don't exist in real datasets</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">🏗️</span>
                      <span><strong>Client data is under NDA</strong> but you still need to build the app</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-8 border-red-500 shadow-brutalist transform -rotate-2 p-8">
              <h3 className="text-3xl font-black text-red-600 mb-6 text-center">
                TRADITIONAL "SOLUTIONS"
              </h3>
              <div className="space-y-4 text-lg font-bold text-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">😤</span>
                  <span>Generic placeholder data that doesn't reflect reality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⏰</span>
                  <span>Manually crafting test datasets (soul-crushing)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📐</span>
                  <span>Oversimplified shapes that miss spatial relationships</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <span>CSV files with lat/lon that bear no resemblance to real use</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-red-100 border-4 border-red-300 transform rotate-1">
                <p className="text-xl font-black text-red-800 text-center">
                  "There has to be a better way!"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-br from-green-50 to-cyan-50">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-green-600 mb-8 transform rotate-1">
              ENTER GEOMOCKERY
            </h2>
            <p className="text-xl md:text-2xl font-bold text-green-700 max-w-4xl mx-auto leading-relaxed">
              We built the geospatial data generator that actually understands what developers need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border-8 border-green-500 shadow-brutalist transform -rotate-1 p-6">
              <div className="w-16 h-16 bg-green-500 flex items-center justify-center mb-6 transform rotate-3 border-4 border-green-700 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-black text-green-600 mb-4 text-center">SPEED</h3>
              <p className="text-lg font-bold text-gray-700 text-center">
                Generate realistic data in seconds, not weeks of waiting
              </p>
            </div>
            
            <div className="bg-white border-8 border-cyan-500 shadow-brutalist transform rotate-1 p-6">
              <div className="w-16 h-16 bg-cyan-500 flex items-center justify-center mb-6 transform -rotate-3 border-4 border-cyan-700 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-black text-cyan-600 mb-4 text-center">PRECISION</h3>
              <p className="text-lg font-bold text-gray-700 text-center">
                Custom-tailored data for your exact use case
              </p>
            </div>
            
            <div className="bg-white border-8 border-purple-500 shadow-brutalist transform -rotate-1 p-6">
              <div className="w-16 h-16 bg-purple-500 flex items-center justify-center mb-6 transform rotate-3 border-4 border-purple-700 mx-auto">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-black text-purple-600 mb-4 text-center">PRIVACY</h3>
              <p className="text-lg font-bold text-gray-700 text-center">
                100% privacy-safe with zero real-world data exposure
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-8 border-indigo-900 shadow-brutalist transform rotate-1 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 transform -rotate-1">
              OUR MISSION
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white mb-8 max-w-4xl mx-auto leading-relaxed">
              Make geospatial data generation as creative and intuitive as the apps you're building
            </p>
            <div className="bg-white border-4 border-indigo-900 p-6 transform -rotate-1 max-w-3xl mx-auto">
              <p className="text-xl font-black text-indigo-900 mb-4">
                "Stop waiting for data. Start building with confidence."
              </p>
              <p className="text-lg font-bold text-indigo-700">
                We believe that creating test data should be creative, not painful.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-indigo-900 mb-16 text-center uppercase tracking-tight">
            <span className="inline-block transform -rotate-1 border-b-8 border-amber-500 pb-2">
              How It Works
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white border-8 border-amber-500 shadow-brutalist transform rotate-1 p-6 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-black text-amber-600 mb-3">1. NAVIGATE</h3>
              <p className="text-lg font-bold text-gray-700">Find any area on the interactive map</p>
            </div>
            
            <div className="bg-white border-8 border-orange-500 shadow-brutalist transform -rotate-1 p-6 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-black text-orange-600 mb-3">2. CONFIGURE</h3>
              <p className="text-lg font-bold text-gray-700">Define geometry types and custom attributes</p>
            </div>
            
            <div className="bg-white border-8 border-red-500 shadow-brutalist transform rotate-1 p-6 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-black text-red-600 mb-3">3. GENERATE</h3>
              <p className="text-lg font-bold text-gray-700">Create realistic features with one click</p>
            </div>
            
            <div className="bg-white border-8 border-green-500 shadow-brutalist transform -rotate-1 p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-green-600 mb-3">4. EXPORT</h3>
              <p className="text-lg font-bold text-gray-700">Download and use immediately in your app</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-indigo-50">
          <h2 className="text-4xl md:text-5xl font-black text-indigo-900 mb-16 text-center uppercase tracking-tight">
            <span className="inline-block transform rotate-1 border-b-8 border-pink-500 pb-2">
              Our Values
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white border-8 border-pink-400 shadow-brutalist transform -rotate-1 p-6">
                <h3 className="text-2xl font-black text-pink-600 mb-4">DEVELOPER FIRST</h3>
                <p className="text-lg font-bold text-gray-700">
                  Built by developers who understand the real pain points of geospatial development.
                </p>
              </div>
              
              <div className="bg-white border-8 border-blue-400 shadow-brutalist transform rotate-1 p-6">
                <h3 className="text-2xl font-black text-blue-600 mb-4">OPEN SOURCE</h3>
                <p className="text-lg font-bold text-gray-700">
                  Community-driven development with transparency and collaboration at the core.
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white border-8 border-yellow-400 shadow-brutalist transform rotate-1 p-6">
                <h3 className="text-2xl font-black text-yellow-600 mb-4">CREATIVE FOCUS</h3>
                <p className="text-lg font-bold text-gray-700">
                  Making data generation a creative, enjoyable process rather than a tedious chore.
                </p>
              </div>
              
              <div className="bg-white border-8 border-green-400 shadow-brutalist transform -rotate-1 p-6">
                <h3 className="text-2xl font-black text-green-600 mb-4">PRIVACY RESPECT</h3>
                <p className="text-lg font-bold text-gray-700">
                  Zero real-world data collection - your privacy and your users' privacy matter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 border-8 border-cyan-900 shadow-brutalist transform -rotate-1 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 transform rotate-1">
              Ready to Generate?
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white mb-12 max-w-3xl mx-auto">
              Join the developers who've stopped waiting for data and started building with confidence
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/generate" 
                className="inline-block py-5 px-12 bg-white text-cyan-900 text-xl font-black uppercase tracking-wider border-4 border-cyan-900 shadow-brutalist hover:translate-y-[-4px] transition-transform"
              >
                Try Geomockery Now
              </Link>
              <a 
                href="https://github.com/rgdonohue/geomockery" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block py-5 px-12 bg-cyan-900 text-white text-xl font-black uppercase tracking-wider border-4 border-white shadow-brutalist hover:translate-y-[-4px] transition-transform"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
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
          <p className="text-indigo-200 font-medium mb-8">
            Made with passion by developers who got tired of waiting for data
          </p>
          <div className="flex justify-center space-x-8">
            <Link href="/" className="hover:text-pink-400 font-medium">Home</Link>
            <Link href="/generate" className="hover:text-pink-400 font-medium">Generate</Link>
            <a href="https://github.com/rgdonohue/geomockery" className="hover:text-pink-400 font-medium">GitHub</a>
          </div>
          <div className="mt-8 pt-8 border-t border-indigo-800">
            <p className="text-indigo-300">
              © {new Date().getFullYear()} Geomockery. Built with boldness and brutalist design.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
} 