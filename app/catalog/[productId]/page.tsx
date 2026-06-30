"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface FeatureConfig {
  id: string;
  tierId: string;
  featureId: string;
  status: string;
  pricingModel: string | null;
  priceValue: number | null;
  feature: { id: string; name: string };
}

interface Tier {
  id: string;
  name: string;
  basePricePerSeat: number;
  featureConfigs: FeatureConfig[];
}

interface Feature {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  tiers: Tier[];
  features: Feature[];
}

export default function ProductDetail() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/products/${productId}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );

  if (error || !product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error || "Product not found"}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/catalog" className="hover:text-indigo-600 transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Heading */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-500 mt-1">
            {product.tiers.length} tier{product.tiers.length !== 1 ? "s" : ""} ·{" "}
            {product.features.length} feature
            {product.features.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href={`/catalog/${productId}/configure`}
          id="configure-matrix-btn"
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
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Configure Feature Matrix
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tiers */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Tiers</h2>
            <Link
              href={`/catalog/${productId}/tiers/new`}
              id="add-tier-btn"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
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
              Add Tier
            </Link>
          </div>

          {product.tiers.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No tiers yet.</p>
              <Link
                href={`/catalog/${productId}/tiers/new`}
                className="text-indigo-600 text-sm hover:underline mt-1 inline-block"
              >
                Add your first tier
              </Link>
            </div>
          ) : (
            <table className="w-full striped-table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Base Price/seat/month
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {product.tiers.map((tier) => (
                  <tr key={tier.id}>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {tier.name}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700 font-mono text-sm">
                      {formatCurrency(tier.basePricePerSeat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Features */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Features</h2>
            <Link
              href={`/catalog/${productId}/features/new`}
              id="add-feature-btn"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
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
              Add Feature
            </Link>
          </div>

          {product.features.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No features yet.</p>
              <Link
                href={`/catalog/${productId}/features/new`}
                className="text-indigo-600 text-sm hover:underline mt-1 inline-block"
              >
                Add your first feature
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {product.features.map((feature) => (
                <li
                  key={feature.id}
                  className="px-6 py-3 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-gray-800 text-sm">{feature.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
