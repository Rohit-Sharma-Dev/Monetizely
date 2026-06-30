"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function NewTier() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [name, setName] = useState("");
  const [basePricePerSeat, setBasePricePerSeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !basePricePerSeat) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/api/tiers", {
        productId,
        name: name.trim(),
        basePricePerSeat: parseFloat(basePricePerSeat),
      });
      router.push(`/catalog/${productId}`);
    } catch {
      setError("Failed to create tier. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/catalog" className="hover:text-indigo-600 transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <Link
          href={`/catalog/${productId}`}
          className="hover:text-indigo-600 transition-colors"
        >
          Product
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Tier</span>
      </nav>

      <div className="card p-8">
        <div className="mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add Tier</h1>
          <p className="text-gray-500 mt-1">
            Define a pricing tier for this product.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="tier-name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Tier Name
            </label>
            <input
              id="tier-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starter, Growth, Enterprise"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="base-price"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Base Price Per Seat / Month
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="base-price"
                type="number"
                min="0"
                step="0.01"
                value={basePricePerSeat}
                onChange={(e) => setBasePricePerSeat(e.target.value)}
                placeholder="0.00"
                required
                className="w-full border border-gray-200 rounded-md pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              id="create-tier-submit"
              disabled={loading || !name.trim() || !basePricePerSeat}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                "Add Tier"
              )}
            </button>
            <Link href={`/catalog/${productId}`} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
