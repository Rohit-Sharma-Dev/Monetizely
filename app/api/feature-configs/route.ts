import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ConfigStatus, PricingModel } from "@prisma/client";

export async function PATCH(request: Request) {
  try {
    const { tierId, featureId, status, pricingModel, priceValue } =
      await request.json();

    if (!tierId || !featureId || !status) {
      return NextResponse.json(
        { error: "tierId, featureId, and status are required" },
        { status: 400 }
      );
    }

    const config = await prisma.featureConfig.upsert({
      where: {
        tierId_featureId: { tierId, featureId },
      },
      update: {
        status: status as ConfigStatus,
        pricingModel: pricingModel ? (pricingModel as PricingModel) : null,
        priceValue: priceValue != null ? Number(priceValue) : null,
      },
      create: {
        tierId,
        featureId,
        status: status as ConfigStatus,
        pricingModel: pricingModel ? (pricingModel as PricingModel) : null,
        priceValue: priceValue != null ? Number(priceValue) : null,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update feature config" },
      { status: 500 }
    );
  }
}
