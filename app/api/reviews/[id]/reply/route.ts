import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { cafe: true }
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Must be the owner of the cafe page or an admin
    if (review.cafe.ownerId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bodyJson = await request.json();
    const { body } = bodyJson;

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
    }

    const reply = await prisma.reply.upsert({
      where: { reviewId: review.id },
      update: {
        body,
        createdAt: new Date()
      },
      create: {
        reviewId: review.id,
        authorId: token.dbUserId,
        body
      }
    });

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error("Failed to create review reply:", err);
    return NextResponse.json({ error: err.message || "Failed to submit reply" }, { status: 500 });
  }
}
