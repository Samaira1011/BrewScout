import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, error } = await requireRole(request, "ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const { reportId, action } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: "Missing reportId or action" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        review: {
          include: { cafe: true }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (action === "RESOLVE_KEEP") {
      // Just mark this report as resolved
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "RESOLVED", resolvedAt: new Date() }
      });
      return NextResponse.json({ success: true, status: "RESOLVED_KEEP" });
    }

    if (action === "RESOLVE_REMOVE") {
      const reviewId = report.reviewId;
      const review = report.review;

      // Begin transaction to delete receipt, other reports, and then the review itself, and adjust cafe totals
      await prisma.$transaction(async (tx) => {
        // 1. Delete receipt
        await tx.receipt.deleteMany({
          where: { reviewId }
        });

        // 2. Delete all reports for this review
        await tx.report.deleteMany({
          where: { reviewId }
        });

        // 3. Delete the review
        await tx.review.delete({
          where: { id: reviewId }
        });

        // 4. Adjust cafe page aggregates
        await tx.cafePage.update({
          where: { id: review.cafeId },
          data: {
            reviewCount: { decrement: 1 },
            ratingSum: { decrement: review.rating }
          }
        });
      });

      return NextResponse.json({ success: true, status: "RESOLVED_REMOVE" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin reports POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
