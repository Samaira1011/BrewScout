import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Only the author or an ADMIN can delete a review
    if (review.authorId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: params.id }
    });

    // Adjust cafe page rating sum and count
    await prisma.cafePage.update({
      where: { id: review.cafeId },
      data: {
        reviewCount: { decrement: 1 },
        ratingSum: { decrement: review.rating }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE review failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
