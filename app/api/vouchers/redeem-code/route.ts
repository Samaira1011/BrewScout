import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId || (token.role !== "OWNER" && token.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { claimCode } = body;

    if (!claimCode || !claimCode.trim()) {
      return NextResponse.json({ error: "Claim code is required" }, { status: 400 });
    }

    const normalizedCode = claimCode.trim().toUpperCase();

    const redemption = await prisma.redeemedVoucher.findFirst({
      where: { 
        claimCode: normalizedCode,
        isUsed: false
      },
      include: {
        user: true,
        voucher: {
          include: { cafe: true }
        }
      }
    });

    if (!redemption) {
      return NextResponse.json({ error: "Invalid or already used claim code" }, { status: 404 });
    }

    // Verify that the owner actually owns the cafe that issued this voucher (or is admin)
    if (redemption.voucher.cafe.ownerId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: This voucher belongs to another cafe" }, { status: 403 });
    }

    await prisma.redeemedVoucher.update({
      where: { id: redemption.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      userEmail: redemption.user.email,
      voucherTitle: redemption.voucher.title,
      cafeName: redemption.voucher.cafe.name
    });
  } catch (err: any) {
    console.error("Voucher claim redemption code failed:", err);
    return NextResponse.json({ error: err.message || "Failed to validate code" }, { status: 500 });
  }
}
