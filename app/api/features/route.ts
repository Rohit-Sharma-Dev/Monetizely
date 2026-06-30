import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { productId, name } = await request.json();

    if (!productId || !name?.trim()) {
      return NextResponse.json(
        { error: "productId and name are required" },
        { status: 400 }
      );
    }

    // Get all existing tiers for this product
    const existingTiers = await prisma.tier.findMany({
      where: { productId },
    });

    // Create feature + auto-create UNAVAILABLE FeatureConfig for every existing tier
    const feature = await prisma.feature.create({
      data: {
        productId,
        name: name.trim(),
        featureConfigs: {
          create: existingTiers.map((t) => ({
            tierId: t.id,
            status: "UNAVAILABLE" as const,
          })),
        },
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}
