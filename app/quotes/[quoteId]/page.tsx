"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { TERM_LABELS } from "@/lib/pricing";
import api from "@/lib/api";

interface QuoteLineItem {
  id: string;
  label: string;
  calculation: string;
  notes: string;
  amount: number;
  sortOrder: number;
}

interface QuoteAddon {
  id: string;
  featureName: string;
  seats: number | null;
  amount: number;
  calculation: string;
}

interface Quote {
  id: string;
  name: string;
  customer: string;
  seats: number;
  termLength: string;
  discountPct: number;
  totalAmount: number;
  createdAt: string;
  validUntil: string;
  tier: {
    name: string;
    product: { id: string; name: string };
  };
  lineItems: QuoteLineItem[];
  addons: QuoteAddon[];
}

export default function QuoteView() {
  const params = useParams();
  const quoteId = params.quoteId as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/api/quotes/${quoteId}`)
      .then((res) => setQuote(res.data))
      .catch(() => setError("Failed to load quote"))
      .finally(() => setLoading(false));
  }, [quoteId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );

  if (error || !quote)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error || "Quote not found"}
        </div>
      </div>
    );

  const hasDiscount = quote.discountPct > 0;

  // Compute subtotal from line items + addons
  const baseAmount = quote.lineItems.reduce((sum, li) => sum + li.amount, 0);
  const addonTotal = quote.addons.reduce((sum, a) => sum + a.amount, 0);
  const subtotal = baseAmount + addonTotal;
  const discountAmount = subtotal * (quote.discountPct / 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/quotes" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
          ← All Quotes
        </Link>
        <button
          id="copy-link-btn"
          onClick={handleCopyLink}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Document */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 py-10 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white/70 text-sm font-medium">Monetizely</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{quote.name}</h1>
              <p className="text-indigo-200 mt-1 text-sm">Prepared by Monetizely</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(quote.totalAmount)}</div>
              <div className="text-indigo-200 text-sm mt-1">Total Amount</div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-px bg-gray-200">
          <div className="bg-white p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quote Details
            </h2>
            <dl className="space-y-3">
              {[
                ["Customer", quote.customer],
                ["Quote Name", quote.name],
                ["Quote Date", formatDate(quote.createdAt)],
                ["Valid Until", formatDate(quote.validUntil)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              What&apos;s Being Purchased
            </h2>
            <dl className="space-y-3">
              {[
                ["Product", quote.tier.product.name],
                ["Tier", quote.tier.name],
                ["Seats", String(quote.seats)],
                ["Term", TERM_LABELS[quote.termLength] || quote.termLength],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Line Item
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    How it was calculated
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Notes
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Amount (USD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Base product line items */}
                {quote.lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {item.label}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs">
                      {item.calculation}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {item.notes}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}

                {/* Addons */}
                {quote.addons.map((addon) => (
                  <tr key={addon.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {addon.featureName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs">
                      {addon.calculation}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {addon.seats ? `${addon.seats} seats` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium text-gray-900">
                      {formatCurrency(addon.amount)}
                    </td>
                  </tr>
                ))}

                {/* Subtotal — only if discount > 0 */}
                {hasDiscount && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-5 py-3 font-semibold text-gray-700"
                    >
                      Subtotal
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                )}

                {/* Discount — only if discount > 0 */}
                {hasDiscount && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-3 font-semibold text-red-600"
                    >
                      Discount ({quote.discountPct}%)
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-red-600">
                      −{formatCurrency(discountAmount)}
                    </td>
                  </tr>
                )}

                {/* TOTAL */}
                <tr className="bg-indigo-600">
                  <td
                    colSpan={3}
                    className="px-5 py-4 font-bold text-white text-base"
                  >
                    TOTAL
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-white text-lg">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-xs text-gray-400">
            This quote was generated by{" "}
            <span className="font-semibold text-indigo-600">Monetizely</span>.
            Valid until {formatDate(quote.validUntil)}. All prices in USD.
          </p>
        </div>
      </div>
    </div>
  );
}
