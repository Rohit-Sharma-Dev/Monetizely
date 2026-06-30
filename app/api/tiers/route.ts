import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { productId, name, basePricePerSeat } = await request.json();

    if (!productId || !name?.trim() || basePricePerSeat == null) {
      return NextResponse.json(
        { error: "productId, name, and basePricePerSeat are required" },
        { status: 400 }
      );
    }

    // Get all existing features for this product
    const existingFeatures = await prisma.feature.findMany({
      where: { productId },
    });

    // Create tier + auto-create UNAVAILABLE FeatureConfig for every existing feature
    const tier = await prisma.tier.create({
      data: {
        productId,
        name: name.trim(),
        basePricePerSeat: Number(basePricePerSeat),
        featureConfigs: {
          create: existingFeatures.map((f) => ({
            featureId: f.id,
            status: "UNAVAILABLE" as const,
          })),
        },
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create tier" },
      { status: 500 }
    );
  }
}
