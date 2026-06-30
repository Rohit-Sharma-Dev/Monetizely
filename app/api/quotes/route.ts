import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TermLength } from "@prisma/client";
import {
  calcBaseProduct,
  calcFixedAddon,
  calcPerSeatAddon,
  calcPercentAddon,
  calcQuoteTotal,
} from "@/lib/pricing";

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        tier: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, customer, tierId, seats, termLength, discountPct, addons } =
      body;

    if (!name || !customer || !tierId || !seats || !termLength) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch tier + product
    const tier = await prisma.tier.findUnique({
      where: { id: tierId },
      include: { product: { select: { name: true } } },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Calculate base product cost (authoritative, server-side)
    const { amount: baseAmount, calculation: baseCalculation } =
      calcBaseProduct(Number(seats), tier.basePricePerSeat, termLength);

    const lineItems = [
      {
        label: `${tier.product.name} — ${tier.name}`,
        calculation: baseCalculation,
        notes: "Base product cost",
        amount: baseAmount,
        sortOrder: 0,
      },
    ];

    const addonResults: Array<{
      featureConfigId: string;
      featureName: string;
      seats: number | null;
      amount: number;
      calculation: string;
    }> = [];

    // Calculate each addon
    if (Array.isArray(addons)) {
      for (let i = 0; i < addons.length; i++) {
        const addon = addons[i];
        const featureConfig = await prisma.featureConfig.findUnique({
          where: { id: addon.featureConfigId },
          include: { feature: { select: { name: true } } },
        });

        if (!featureConfig) continue;

        let addonAmount = 0;
        let addonCalculation = "";

        if (featureConfig.pricingModel === "FIXED") {
          const result = calcFixedAddon(
            featureConfig.priceValue ?? 0,
            termLength
          );
          addonAmount = result.amount;
          addonCalculation = result.calculation;
        } else if (featureConfig.pricingModel === "PER_SEAT") {
          const result = calcPerSeatAddon(
            Number(addon.seats ?? 0),
            featureConfig.priceValue ?? 0,
            termLength
          );
          addonAmount = result.amount;
          addonCalculation = result.calculation;
        } else if (featureConfig.pricingModel === "PERCENT") {
          const result = calcPercentAddon(
            baseAmount,
            featureConfig.priceValue ?? 0
          );
          addonAmount = result.amount;
          addonCalculation = result.calculation;
        }

        addonResults.push({
          featureConfigId: featureConfig.id,
          featureName: featureConfig.feature.name,
          seats: addon.seats ?? null,
          amount: addonAmount,
          calculation: addonCalculation,
        });
      }
    }

    // Calculate totals
    const { total } = calcQuoteTotal(
      baseAmount,
      addonResults.map((a) => a.amount),
      Number(discountPct ?? 0)
    );

    // Set validUntil = createdAt + 30 days
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30);

    // Save in a Prisma transaction
    const quote = await prisma.$transaction(async (tx) => {
      const newQuote = await tx.quote.create({
        data: {
          name,
          customer,
          tierId,
          seats: Number(seats),
          termLength: termLength as TermLength,
          discountPct: Number(discountPct ?? 0),
          totalAmount: total,
          validUntil,
          lineItems: {
            create: lineItems,
          },
          addons: {
            create: addonResults.map((a) => ({
              featureConfigId: a.featureConfigId,
              featureName: a.featureName,
              seats: a.seats,
              amount: a.amount,
              calculation: a.calculation,
            })),
          },
        },
      });
      return newQuote;
    });

    return NextResponse.json({ id: quote.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
