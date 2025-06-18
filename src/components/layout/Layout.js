'use client';

import Header from './Header';

/**
 * Layout component that wraps content with a consistent header
 */
export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-12">
        {children}
      </main>
    </>
  );
} 