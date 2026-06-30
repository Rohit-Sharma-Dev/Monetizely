"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import {
  calcBaseProduct,
  calcFixedAddon,
  calcPerSeatAddon,
  calcPercentAddon,
  calcQuoteTotal,
  TERM_LABELS,
  TERM_MONTHS,
} from "@/lib/pricing";



// interface Product {
//   id: string;
//   name: string;
//   tiers: Tier[];
// }

interface ProductSummary {
  id: string;
  name: string;
  tierCount: number;
  featureCount: number;
}

interface Product {
  id: string;
  name: string;
  tiers: Tier[];
  features: unknown[];
}

// Types
interface Tier {
  id: string;
  name: string;
  basePricePerSeat: number;
}

interface FeatureConfig {
  id: string;
  status: "INCLUDED" | "ADDON" | "UNAVAILABLE";
  pricingModel: "FIXED" | "PER_SEAT" | "PERCENT" | null;
  priceValue: number | null;
  feature: { id: string; name: string };
  tierId: string;
}

interface AddonSelection {
  featureConfigId: string;
  featureName: string;
  pricingModel: "FIXED" | "PER_SEAT" | "PERCENT";
  priceValue: number;
  checked: boolean;
  seats: number;
}

// Step indicator component
function StepIndicator({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          done
            ? "bg-indigo-600 text-white"
            : active
            ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? "✓" : step}
      </div>
      <div
        className={`text-xs mt-1.5 font-medium ${
          active ? "text-indigo-600" : done ? "text-gray-500" : "text-gray-300"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export default function NewQuote() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [quoteName, setQuoteName] = useState("");
  const [customer, setCustomer] = useState("");

  // Step 2
  // const [products, setProducts] = useState<Product[]>([]);

  const [products, setProducts] = useState<ProductSummary[]>([]);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");

  // Step 3
  const [seats, setSeats] = useState(1);
  const [termLength, setTermLength] = useState("ANNUAL");

  // Step 4 — addons
  const [addonSelections, setAddonSelections] = useState<AddonSelection[]>([]);
  const [addonsLoaded, setAddonsLoaded] = useState(false);

  // Step 5
  const [discountPct, setDiscountPct] = useState(0);

  // Load products on mount
  useEffect(() => {
    api.get("/api/products").then((res) => setProducts(res.data));
  }, []);

//   const selectedProduct = products.find((p) => p.id === selectedProductId);
//   console.log(products);
  
//   const selectedTier = selectedProduct?.tiers?.find(
//   (t) => t.id === selectedTierId
// ) ?? null;

useEffect(() => {
  if (!selectedProductId) {
    setSelectedProduct(null);
    return;
  }

  api.get(`/api/products/${selectedProductId}`).then((res) => {
    setSelectedProduct(res.data);
  });
}, [selectedProductId]);

const selectedTier =
  selectedProduct?.tiers.find((t) => t.id === selectedTierId) ?? null;

  // Load addon configs when entering step 4
  useEffect(() => {
    if (step === 4 && selectedTierId && !addonsLoaded) {
      api.get(`/api/products/${selectedProductId}`).then((res) => {
        const productData = res.data;
        const tier = productData.tiers.find((t: { id: string }) => t.id === selectedTierId);
        if (!tier) return;

        const addonConfigs: FeatureConfig[] = tier.featureConfigs.filter(
          (fc: FeatureConfig) => fc.status === "ADDON"
        );

        setAddonSelections(
          addonConfigs.map((fc) => ({
            featureConfigId: fc.id,
            featureName: fc.feature.name,
            pricingModel: fc.pricingModel ?? "FIXED",
            priceValue: fc.priceValue ?? 0,
            checked: false,
            seats: 1,
          }))
        );
        setAddonsLoaded(true);
      });
    }
  }, [step, selectedTierId, selectedProductId, addonsLoaded]);

  // --- Live pricing calculations ---
  const baseResult =
    selectedTier && seats > 0
      ? calcBaseProduct(seats, selectedTier.basePricePerSeat, termLength)
      : { amount: 0, calculation: "" };

  const selectedAddons = addonSelections.filter((a) => a.checked);

  const addonAmounts = selectedAddons.map((addon) => {
    if (addon.pricingModel === "FIXED")
      return calcFixedAddon(addon.priceValue, termLength).amount;
    if (addon.pricingModel === "PER_SEAT")
      return calcPerSeatAddon(addon.seats, addon.priceValue, termLength).amount;
    if (addon.pricingModel === "PERCENT")
      return calcPercentAddon(baseResult.amount, addon.priceValue).amount;
    return 0;
  });

  const { subtotal, discountAmount, total } = calcQuoteTotal(
    baseResult.amount,
    addonAmounts,
    discountPct
  );

  // --- Submit ---
  const handleSave = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/api/quotes", {
        name: quoteName,
        customer,
        tierId: selectedTierId,
        seats,
        termLength,
        discountPct,
        addons: selectedAddons.map((a) => ({
          featureConfigId: a.featureConfigId,
          seats: a.pricingModel === "PER_SEAT" ? a.seats : undefined,
        })),
      });
      router.push(`/quotes/${res.data.id}`);
    } catch {
      setError("Failed to save quote. Please try again.");
      setSubmitting(false);
    }
  };

  // Step content
  const canProceedStep1 = quoteName.trim() && customer.trim();
  const canProceedStep2 = selectedProductId && selectedTierId;
  const canProceedStep3 = seats > 0 && termLength;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/quotes" className="hover:text-indigo-600">
          Quotes
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Quote</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-10 px-4">
        {[
          [1, "Details"],
          [2, "Product"],
          [3, "Seats & Term"],
          [4, "Add-ons"],
          [5, "Review"],
        ].map(([s, label], i, arr) => (
          <div key={s} className="flex items-center">
            <StepIndicator
              step={Number(s)}
              current={step}
              label={String(label)}
            />
            {i < arr.length - 1 && (
              <div
                className={`h-px w-10 sm:w-16 mx-2 mt-[-20px] transition-colors ${
                  step > Number(s) ? "bg-indigo-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {/* Step 1: Quote Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Quote Details
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Give this quote a name and the customer it&apos;s for.
            </p>
            <div>
              <label
                htmlFor="quote-name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Quote Name
              </label>
              <input
                id="quote-name"
                type="text"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
                placeholder="e.g. Acme Corp — Analytics Suite 2025"
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="customer-name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Product & Tier */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Select Product & Tier
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Choose which product and pricing tier this quote is for.
            </p>
            <div>
              <label
                htmlFor="product-select"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Product
              </label>
              <select
                id="product-select"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedTierId("");
                  setAddonsLoaded(false);
                }}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <div>
                <label
                  htmlFor="tier-select"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Tier
                </label>
                <select
                  id="tier-select"
                  value={selectedTierId}
                  onChange={(e) => {
                    setSelectedTierId(e.target.value);
                    setAddonsLoaded(false);
                  }}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a tier…</option>
                  {/* {selectedProduct.tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {formatCurrency(t.basePricePerSeat)}/seat/month
                    </option>
                  ))} */}
                  {selectedProduct?.tiers.map((t) => (
  <option key={t.id} value={t.id}>
    {t.name} — {formatCurrency(t.basePricePerSeat)}/seat/month
  </option>
))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Seats & Term */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Seats & Term Length
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              How many seats and what contract length?
            </p>
            <div>
              <label
                htmlFor="seats-input"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Number of Seats
              </label>
              <input
                id="seats-input"
                type="number"
                min="1"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term Length
              </label>
              <div className="space-y-2">
                {(["MONTHLY", "ANNUAL", "TWO_YEAR"] as const).map((term) => (
                  <label
                    key={term}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      termLength === term
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="term"
                      value={term}
                      checked={termLength === term}
                      onChange={() => setTermLength(term)}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {TERM_LABELS[term]}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Live preview */}
            {selectedTier && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                  Base Product Preview
                </div>
                <div className="text-sm text-indigo-800 mb-1">
                  {baseResult.calculation}
                </div>
                <div className="text-xl font-bold text-indigo-900">
                  {formatCurrency(baseResult.amount)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Add-ons */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Optional Add-ons
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Select any additional features to include in this quote.
            </p>

            {addonSelections.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No optional add-ons available for this tier.
              </div>
            ) : (
              <div className="space-y-3">
                {addonSelections.map((addon, i) => {
                  let previewAmount = 0;
                  let previewCalc = "";
                  if (addon.pricingModel === "FIXED") {
                    const r = calcFixedAddon(addon.priceValue, termLength);
                    previewAmount = r.amount;
                    previewCalc = r.calculation;
                  } else if (addon.pricingModel === "PER_SEAT") {
                    const r = calcPerSeatAddon(
                      addon.seats,
                      addon.priceValue,
                      termLength
                    );
                    previewAmount = r.amount;
                    previewCalc = r.calculation;
                  } else if (addon.pricingModel === "PERCENT") {
                    const r = calcPercentAddon(
                      baseResult.amount,
                      addon.priceValue
                    );
                    previewAmount = r.amount;
                    previewCalc = r.calculation;
                  }

                  return (
                    <div
                      key={addon.featureConfigId}
                      className={`border rounded-lg p-4 transition-all ${
                        addon.checked
                          ? "border-indigo-300 bg-indigo-50/50"
                          : "border-gray-200"
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`addon-${i}`}
                          checked={addon.checked}
                          onChange={(e) => {
                            const updated = [...addonSelections];
                            updated[i] = { ...addon, checked: e.target.checked };
                            setAddonSelections(updated);
                          }}
                          className="mt-0.5 accent-indigo-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {addon.featureName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {previewCalc}
                          </div>

                          {/* PER_SEAT: show seat input */}
                          {addon.pricingModel === "PER_SEAT" && addon.checked && (
                            <div className="mt-2 flex items-center gap-2">
                              <label className="text-xs text-gray-600">
                                Seats:
                              </label>
                              <input
                                id={`addon-seats-${i}`}
                                type="number"
                                min="1"
                                value={addon.seats}
                                onChange={(e) => {
                                  const updated = [...addonSelections];
                                  updated[i] = {
                                    ...addon,
                                    seats: parseInt(e.target.value) || 1,
                                  };
                                  setAddonSelections(updated);
                                }}
                                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(previewAmount)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {TERM_MONTHS[termLength]} mo
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Addon subtotal */}
            {selectedAddons.length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  Add-on subtotal ({selectedAddons.length} selected)
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(addonAmounts.reduce((a, b) => a + b, 0))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Save */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Review & Save
            </h2>

            {/* Discount */}
            <div>
              <label
                htmlFor="discount-input"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Discount (%)
              </label>
              <div className="relative w-32">
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountPct}
                  onChange={(e) =>
                    setDiscountPct(parseFloat(e.target.value) || 0)
                  }
                  className="w-full border border-gray-200 rounded-md pr-7 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  %
                </span>
              </div>
            </div>

            {/* Summary table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">
                      Line Item
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">
                      Calculation
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Base product */}
                  <tr>
                    <td className="px-4 py-3 text-gray-800">
                      {selectedProduct?.name} — {selectedTier?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {baseResult.calculation}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(baseResult.amount)}
                    </td>
                  </tr>

                  {/* Addons */}
                  {selectedAddons.map((addon, i) => {
                    const amount = addonAmounts[i] || 0;
                    let calc = "";
                    if (addon.pricingModel === "FIXED")
                      calc = calcFixedAddon(addon.priceValue, termLength).calculation;
                    else if (addon.pricingModel === "PER_SEAT")
                      calc = calcPerSeatAddon(addon.seats, addon.priceValue, termLength).calculation;
                    else if (addon.pricingModel === "PERCENT")
                      calc = calcPercentAddon(baseResult.amount, addon.priceValue).calculation;

                    return (
                      <tr key={addon.featureConfigId}>
                        <td className="px-4 py-3 text-gray-800">
                          {addon.featureName}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {calc}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal — only if discount > 0 */}
                  {discountPct > 0 && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={2}
                        className="px-4 py-2.5 font-medium text-gray-700"
                      >
                        Subtotal
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  )}

                  {/* Discount — only if discount > 0 */}
                  {discountPct > 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-2.5 text-red-600 font-medium">
                        Discount ({discountPct}%)
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-600 font-medium">
                        −{formatCurrency(discountAmount)}
                      </td>
                    </tr>
                  )}

                  {/* Total */}
                  <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                    <td
                      colSpan={2}
                      className="px-4 py-3 font-bold text-gray-900 text-base"
                    >
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 text-base">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
            >
              ← Back
            </button>
          ) : (
            <Link href="/quotes" className="btn-secondary">
              Cancel
            </Link>
          )}

          {step < 5 ? (
            <button
              id={`step-${step}-next`}
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="btn-primary"
            >
              Continue →
            </button>
          ) : (
            <button
              id="save-quote-btn"
              onClick={handleSave}
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Quote →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
