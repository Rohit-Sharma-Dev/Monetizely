import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Monetizely — build professional quotes for your SaaS products with tiered pricing and feature add-ons.",
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          Professional Quoting Tool
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Build quotes that{" "}
          <span className="text-indigo-600">close deals</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Define your product catalog with tiered pricing, configure feature
          matrices, and generate professional quotes in minutes.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
        <Link
          href="/catalog"
          className="group card p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 transition-colors duration-200">
            <svg
              className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Manage Catalog
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Create products, define pricing tiers, add features, and configure
            the feature matrix for each tier.
          </p>
          <span className="text-indigo-600 text-sm font-medium group-hover:underline flex items-center gap-1">
            Open Catalog
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Link>

        <Link
          href="/quotes/new"
          className="group card p-8 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 transition-colors duration-200">
            <svg
              className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Build a Quote
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Select a product tier, configure seats and term length, add
            optional features, and generate a professional quote.
          </p>
          <span className="text-emerald-600 text-sm font-medium group-hover:underline flex items-center gap-1">
            New Quote
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {[
          { label: "Instant pricing", icon: "⚡" },
          { label: "No auth needed", icon: "🔓" },
          { label: "Shareable links", icon: "🔗" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
