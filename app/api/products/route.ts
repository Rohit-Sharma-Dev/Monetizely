import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: { tiers: true, features: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        tierCount: p._count.tiers,
        featureCount: p._count.features,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
