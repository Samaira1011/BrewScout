import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const { token, error } = await requireRole(request, "ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const { claimId, action } = body;

    if (!claimId || !action) {
      return NextResponse.json({ error: "Missing claimId or action" }, { status: 400 });
    }

    const claim = await prisma.claimRequest.findUnique({
      where: { id: claimId },
      include: { cafe: true, requester: true }
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Begin transaction to update claim, update cafe owner, and upgrade user role
      await prisma.$transaction([
        prisma.claimRequest.update({
          where: { id: claimId },
          data: { status: "APPROVED", resolvedAt: new Date() }
        }),
        prisma.cafePage.update({
          where: { id: claim.cafeId },
          data: { ownerId: claim.requesterId }
        }),
        prisma.user.update({
          where: { id: claim.requesterId },
          data: { role: "OWNER" }
        })
      ]);

      // Send welcome email with cafe/restaurant name to the newly approved business owner
      sendWelcomeEmail(claim.requester.email, "OWNER", claim.cafe.name).catch((err) =>
        console.error("admin/claims/route.ts: Welcome email dispatch failure", err)
      );

      return NextResponse.json({ success: true, status: "APPROVED" });
    }
    
    if (action === "REJECT") {
      await prisma.claimRequest.update({
        where: { id: claimId },
        data: { status: "REJECTED", resolvedAt: new Date() }
      });
      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin claims POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
