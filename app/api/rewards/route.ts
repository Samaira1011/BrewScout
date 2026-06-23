import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVoucherBackupEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  try {
    const vouchers = await prisma.rewardVoucher.findMany({
      where: { isActive: true },
      include: { cafe: true }
    });

    const quests = await prisma.quest.findMany({
      where: {
        isActive: true,
        endsAt: { gte: new Date() }
      },
      include: { cafe: true }
    });

    return NextResponse.json({ vouchers, quests });
  } catch (err: any) {
    console.error("Failed to fetch rewards:", err);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voucherId } = body;

    if (!voucherId) {
      return NextResponse.json({ error: "Voucher ID is required" }, { status: 400 });
    }

    const voucher = await prisma.rewardVoucher.findUnique({
      where: { id: voucherId },
      include: { cafe: true }
    });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Voucher not found or inactive" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: token.dbUserId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.points < voucher.pointsCost) {
      return NextResponse.json({ error: "Insufficient points balance" }, { status: 400 });
    }

    // Generate unique claim code e.g. VIBE-A1B2C3
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const claimCode = `VIBE-${randomHex}`;

    const newPoints = user.points - voucher.pointsCost;
    
    // Resolve new level
    let newLevel = "BRONZE";
    if (newPoints >= 500) {
      newLevel = "GOLD";
    } else if (newPoints >= 200) {
      newLevel = "SILVER";
    }

    const redeemed = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: newPoints,
          level: newLevel
        }
      }),
      prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: -voucher.pointsCost,
          action: "VOUCHER_REDEEMED",
          reference: voucherId
        }
      }),
      prisma.redeemedVoucher.create({
        data: {
          userId: user.id,
          voucherId: voucher.id,
          claimCode
        }
      })
    ]);

    // Send the email ticket backup asynchronously
    sendVoucherBackupEmail(user.email, voucher.cafe.name, voucher.title, claimCode).catch(err =>
      console.error("rewards/route.ts: Voucher backup email failure", err)
    );

    return NextResponse.json({ success: true, claimCode, redeemedVoucher: redeemed[2] });
  } catch (err: any) {
    console.error("Voucher redemption failed:", err);
    return NextResponse.json({ error: err.message || "Failed to redeem voucher" }, { status: 500 });
  }
}
