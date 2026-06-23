import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cafe = await prisma.cafePage.findUnique({
      where: { slug: params.slug }
    });

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }

    // Must be owner or admin
    if (cafe.ownerId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, terms, startsAt, endsAt } = body;

    if (!title || !description || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newDeal = await prisma.flashDeal.create({
      data: {
        cafeId: cafe.id,
        title,
        description,
        terms: terms || null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt)
      }
    });

    return NextResponse.json({ success: true, deal: newDeal });
  } catch (err: any) {
    console.error("Failed to create deal:", err);
    return NextResponse.json({ error: err.message || "Failed to create deal" }, { status: 500 });
  }
}
