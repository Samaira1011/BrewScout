import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, error } = await requireRole(request, "ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ error: "Missing reviewId or action" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { receipt: true }
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "VERIFY") {
      const pointsToAward = 10 + (review.receipt ? 50 : 0);
      
      const author = await prisma.user.findUnique({
        where: { id: review.authorId }
      });
      
      const newPoints = (author?.points || 0) + pointsToAward;
      let newLevel = "BRONZE";
      if (newPoints >= 500) {
        newLevel = "GOLD";
      } else if (newPoints >= 200) {
        newLevel = "SILVER";
      }

      await prisma.$transaction([
        prisma.review.update({
          where: { id: reviewId },
          data: { 
            isApproved: true,
            isVerified: !!review.receipt
          }
        }),
        prisma.cafePage.update({
          where: { id: review.cafeId },
          data: {
            reviewCount: { increment: 1 },
            ratingSum: { increment: review.rating }
          }
        }),
        prisma.user.update({
          where: { id: review.authorId },
          data: {
            points: newPoints,
            level: newLevel
          }
        }),
        prisma.pointTransaction.create({
          data: {
            userId: review.authorId,
            amount: pointsToAward,
            action: review.receipt ? "RECEIPT_VERIFIED" : "REVIEW_SUBMITTED",
            reference: reviewId
          }
        })
      ]);
      return NextResponse.json({ success: true, verified: true });
    } 
    
    if (action === "REJECT") {
      // Cascade delete relations and the review
      await prisma.$transaction([
        prisma.reviewPhoto.deleteMany({ where: { reviewId } }),
        prisma.receipt.deleteMany({ where: { reviewId } }),
        prisma.reply.deleteMany({ where: { reviewId } }),
        prisma.report.deleteMany({ where: { reviewId } }),
        prisma.removedReviewNotice.deleteMany({ where: { reviewId } }),
        prisma.review.delete({ where: { id: reviewId } })
      ]);
      return NextResponse.json({ success: true, verified: false });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin reviews POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
