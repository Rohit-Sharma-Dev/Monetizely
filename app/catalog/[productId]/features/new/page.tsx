"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function NewFeature() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/api/features", {
        productId,
        name: name.trim(),
      });
      router.push(`/catalog/${productId}`);
    } catch {
      setError("Failed to create feature. Please try again.");
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
        <span className="text-gray-900 font-medium">New Feature</span>
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add Feature</h1>
          <p className="text-gray-500 mt-1">
            Add a new feature to this product. You can configure its availability
            per tier in the feature matrix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="feature-name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Feature Name
            </label>
            <input
              id="feature-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Single Sign-On (SSO)"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              id="create-feature-submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                "Add Feature"
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
