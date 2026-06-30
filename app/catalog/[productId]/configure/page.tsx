"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface FeatureConfig {
  id: string;
  tierId: string;
  featureId: string;
  status: "INCLUDED" | "ADDON" | "UNAVAILABLE";
  pricingModel: "FIXED" | "PER_SEAT" | "PERCENT" | null;
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

type CellKey = `${string}:${string}`;

interface CellState {
  status: "INCLUDED" | "ADDON" | "UNAVAILABLE";
  pricingModel: "FIXED" | "PER_SEAT" | "PERCENT" | null;
  priceValue: string;
  saving: boolean;
  saved: boolean;
}

const STATUS_LABELS = {
  INCLUDED: "Included",
  ADDON: "Add-on",
  UNAVAILABLE: "Not available",
};

const PRICING_LABELS = {
  FIXED: "Fixed monthly",
  PER_SEAT: "Per seat / month",
  PERCENT: "% of product cost",
};

export default function ConfigureMatrix() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cells, setCells] = useState<Record<CellKey, CellState>>({});
  const debounceTimers = useRef<Record<CellKey, ReturnType<typeof setTimeout>>>({});

  // Load product
  useEffect(() => {
    api.get(`/api/products/${productId}`).then((res) => {
      const p: Product = res.data;
      setProduct(p);

      // Pre-populate cells from existing featureConfigs
      const initial: Record<CellKey, CellState> = {};
      for (const tier of p.tiers) {
        for (const fc of tier.featureConfigs) {
          const key: CellKey = `${tier.id}:${fc.feature.id}`;
          initial[key] = {
            status: fc.status,
            pricingModel: fc.pricingModel,
            priceValue: fc.priceValue != null ? String(fc.priceValue) : "",
            saving: false,
            saved: false,
          };
        }
      }
      setCells(initial);
      setLoading(false);
    });
  }, [productId]);

  const saveCell = useCallback(
    (tierId: string, featureId: string, state: CellState) => {
      const key: CellKey = `${tierId}:${featureId}`;
      setCells((prev) => ({ ...prev, [key]: { ...prev[key], saving: true, saved: false } }));

      api
        .patch("/api/feature-configs", {
          tierId,
          featureId,
          status: state.status,
          pricingModel: state.status === "ADDON" ? state.pricingModel : null,
          priceValue:
            state.status === "ADDON" && state.priceValue !== ""
              ? parseFloat(state.priceValue)
              : null,
        })
        .then(() => {
          setCells((prev) => ({
            ...prev,
            [key]: { ...prev[key], saving: false, saved: true },
          }));
          setTimeout(() => {
            setCells((prev) => ({
              ...prev,
              [key]: { ...prev[key], saved: false },
            }));
          }, 2000);
        })
        .catch(() => {
          setCells((prev) => ({ ...prev, [key]: { ...prev[key], saving: false } }));
        });
    },
    []
  );

  const handleChange = (
    tierId: string,
    featureId: string,
    updates: Partial<CellState>
  ) => {
    const key: CellKey = `${tierId}:${featureId}`;
    setCells((prev) => {
      const updated = { ...prev[key], ...updates };
      // Debounce the API call
      if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
      debounceTimers.current[key] = setTimeout(() => {
        saveCell(tierId, featureId, updated);
      }, 500);
      return { ...prev, [key]: updated };
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );

  if (!product) return null;

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      INCLUDED: "bg-emerald-100 text-emerald-700",
      ADDON: "bg-amber-100 text-amber-700",
      UNAVAILABLE: "bg-gray-100 text-gray-500",
    };
    return (
      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || ""}`}
      >
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
      </span>
    );
  };

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/catalog" className="hover:text-indigo-600 transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <Link
          href={`/catalog/${productId}`}
          className="hover:text-indigo-600 transition-colors"
        >
          {product.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Feature Matrix</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feature Matrix — {product.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure which features are included, optional add-ons, or
            unavailable per tier. Changes auto-save.
          </p>
        </div>
        <Link href={`/catalog/${productId}`} className="btn-secondary text-sm">
          ← Back
        </Link>
      </div>

      {product.tiers.length === 0 || product.features.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p>
            You need at least one tier and one feature to configure the matrix.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="card min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 border-r border-gray-200">
                    Feature
                  </th>
                  {product.tiers.map((tier) => (
                    <th
                      key={tier.id}
                      className="text-center px-4 py-3 text-sm font-semibold text-gray-700 min-w-[220px]"
                    >
                      <div>{tier.name}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        ${tier.basePricePerSeat}/seat/mo
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {product.features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 sticky left-0 bg-white border-r border-gray-100">
                      {feature.name}
                    </td>
                    {product.tiers.map((tier) => {
                      const key: CellKey = `${tier.id}:${feature.id}`;
                      const cell = cells[key] ?? {
                        status: "UNAVAILABLE" as const,
                        pricingModel: null,
                        priceValue: "",
                        saving: false,
                        saved: false,
                      };

                      return (
                        <td
                          key={tier.id}
                          className="px-4 py-3 align-top"
                        >
                          <div className="space-y-2">
                            {/* Status select */}
                            <select
                              id={`status-${tier.id}-${feature.id}`}
                              value={cell.status}
                              onChange={(e) =>
                                handleChange(tier.id, feature.id, {
                                  status: e.target.value as CellState["status"],
                                  pricingModel:
                                    e.target.value === "ADDON"
                                      ? cell.pricingModel ?? "FIXED"
                                      : null,
                                })
                              }
                              className="w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                              <option value="INCLUDED">✅ Included</option>
                              <option value="ADDON">➕ Add-on</option>
                              <option value="UNAVAILABLE">❌ Not available</option>
                            </select>

                            {/* Addon pricing */}
                            {cell.status === "ADDON" && (
                              <div className="space-y-1.5 bg-amber-50 border border-amber-100 rounded-md p-2.5">
                                <select
                                  id={`pricing-${tier.id}-${feature.id}`}
                                  value={cell.pricingModel ?? "FIXED"}
                                  onChange={(e) =>
                                    handleChange(tier.id, feature.id, {
                                      pricingModel: e.target.value as CellState["pricingModel"],
                                    })
                                  }
                                  className="w-full text-xs border border-amber-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                                >
                                  <option value="FIXED">Fixed monthly</option>
                                  <option value="PER_SEAT">Per seat / month</option>
                                  <option value="PERCENT">% of product cost</option>
                                </select>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                    {cell.pricingModel === "PERCENT" ? "%" : "$"}
                                  </span>
                                  <input
                                    id={`price-${tier.id}-${feature.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cell.priceValue}
                                    onChange={(e) =>
                                      handleChange(tier.id, feature.id, {
                                        priceValue: e.target.value,
                                      })
                                    }
                                    placeholder="0"
                                    className="w-full text-xs border border-amber-200 rounded pl-5 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Status pill */}
                            <div className="flex items-center gap-1.5 h-4">
                              {cell.saving && (
                                <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                              )}
                              {cell.saved && (
                                <span className="text-xs text-emerald-600 font-medium animate-pulse-green">
                                  ✓ Saved
                                </span>
                              )}
                              {!cell.saving && !cell.saved && (
                                <StatusBadge status={cell.status} />
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
