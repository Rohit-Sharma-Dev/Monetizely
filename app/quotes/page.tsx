"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { TERM_LABELS } from "@/lib/pricing";

interface Quote {
  id: string;
  name: string;
  customer: string;
  seats: number;
  termLength: string;
  discountPct: number;
  totalAmount: number;
  createdAt: string;
  tier: {
    name: string;
    product: { name: string };
  };
}

export default function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/quotes")
      .then((res) => setQuotes(res.data))
      .catch(() => setError("Failed to load quotes"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 mt-1">All generated customer quotes.</p>
        </div>
        <Link
          href="/quotes/new"
          id="new-quote-btn"
          className="btn-primary flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Quote
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && quotes.length === 0 && (
        <div className="card text-center py-20">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No quotes yet
          </h2>
          <p className="text-gray-500 mb-6">
            Build your first quote to get started.
          </p>
          <Link href="/quotes/new" className="btn-primary inline-flex">
            New Quote
          </Link>
        </div>
      )}

      {!loading && quotes.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full striped-table">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quote Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product / Tier
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-indigo-50/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {quote.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{quote.customer}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800">
                      {quote.tier.product.name}
                    </div>
                    <div className="text-xs text-gray-400">{quote.tier.name}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(quote.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
