import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        tier: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        lineItems: { orderBy: { sortOrder: "asc" } },
        addons: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
