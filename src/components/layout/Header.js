'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white border-b-8 border-indigo-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center transform hover:scale-105 transition-transform">
            <Link href="/" className="flex items-center">
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
                <span className="text-2xl font-black tracking-tight text-indigo-900">GEO</span>
                <span className="text-2xl font-black tracking-tight text-pink-600">MOCKERY</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <NavLink href="/" exact>HOME</NavLink>
            <NavLink href="/generate">GENERATE</NavLink>
            <NavLink href="/about">ABOUT</NavLink>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 border-4 border-indigo-500 text-indigo-700 hover:text-indigo-500 hover:border-indigo-300 focus:outline-none transform rotate-2"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-indigo-300">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-indigo-50">
            <MobileNavLink href="/" exact>HOME</MobileNavLink>
            <MobileNavLink href="/generate">GENERATE</MobileNavLink>
            <MobileNavLink href="/about">ABOUT</MobileNavLink>
          </div>
        </div>
      )}
      
      {/* Brutalist decorative element */}
      <div className="h-4 bg-gradient-to-r from-pink-500 via-yellow-500 to-cyan-500"></div>
    </header>
  );
}

// Desktop navigation link
function NavLink({ href, exact, children, ...props }) {
  const pathname = usePathname();
  const isCurrentPath = exact ? pathname === href : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`
        inline-block py-3 px-5 font-black tracking-wider text-lg border-4 
        transform hover:-translate-y-1 transition-transform
        ${isCurrentPath 
          ? 'bg-indigo-500 text-white border-indigo-700 shadow-brutalist rotate-2' 
          : 'bg-white text-indigo-700 border-indigo-300 hover:border-indigo-500 hover:shadow-md -rotate-1'
        }
      `}
      {...props}
    >
      {children}
    </Link>
  );
}

// Mobile navigation link
function MobileNavLink({ href, exact, children, ...props }) {
  const pathname = usePathname();
  const isCurrentPath = exact ? pathname === href : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`
        block p-3 font-black text-lg border-4 transform rotate-1
        ${isCurrentPath 
          ? 'bg-indigo-500 text-white border-indigo-700' 
          : 'bg-white text-indigo-700 border-indigo-300 hover:border-indigo-500'
        }
      `}
      {...props}
    >
      {children}
    </Link>
  );
} 