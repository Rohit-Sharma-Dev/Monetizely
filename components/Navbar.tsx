"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/catalog", label: "Catalog" },
    { href: "/quotes", label: "Quotes" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Monetizely
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quotes/new"
              className="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              + New Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 border-t border-gray-100 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quotes/new"
              onClick={() => setMenuOpen(false)}
              className="block mt-2 mx-4 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md text-center"
            >
              + New Quote
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
