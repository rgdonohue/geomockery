'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { withBasePath } from '@/lib/utils/basePath';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8">
              <Image
                src={withBasePath('/logo.svg')}
                alt="Geomockery Logo"
                width={32}
                height={32}
                className="drop-shadow-sm"
              />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-indigo-900">GEO</span>
              <span className="text-pink-500">MOCKERY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" exact>Home</NavLink>
            <NavLink href="/generate">Generate</NavLink>
            <NavLink href="/about">About</NavLink>
            <a
              href="https://github.com/rgdonohue/geomockery"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {!mobileMenuOpen ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink href="/" exact>Home</MobileNavLink>
            <MobileNavLink href="/generate">Generate</MobileNavLink>
            <MobileNavLink href="/about">About</MobileNavLink>
            <a
              href="https://github.com/rgdonohue/geomockery"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm font-semibold text-indigo-600"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, exact, children }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, exact, children }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`block px-3 py-2 text-sm font-semibold ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </Link>
  );
}
