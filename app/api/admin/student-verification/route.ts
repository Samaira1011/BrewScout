import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, error } = await requireRole(request, "ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const { verificationId, action } = body;

    if (!verificationId || !action) {
      return NextResponse.json({ error: "Missing verificationId or action" }, { status: 400 });
    }

    const verification = await prisma.studentVerification.findUnique({
      where: { id: verificationId },
      include: { user: true }
    });

    if (!verification) {
      return NextResponse.json({ error: "Student verification request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const pointsToAward = 50;
      const newPoints = (verification.user.points || 0) + pointsToAward;
      
      let newLevel = "BRONZE";
      if (newPoints >= 500) {
        newLevel = "GOLD";
      } else if (newPoints >= 200) {
        newLevel = "SILVER";
      }

      await prisma.$transaction([
        prisma.studentVerification.update({
          where: { id: verificationId },
          data: { status: "APPROVED", resolvedAt: new Date() }
        }),
        prisma.user.update({
          where: { id: verification.userId },
          data: { 
            isStudentVerified: true,
            points: newPoints,
            level: newLevel
          }
        }),
        prisma.pointTransaction.create({
          data: {
            userId: verification.userId,
            amount: pointsToAward,
            action: "STUDENT_VERIFIED",
            reference: verificationId
          }
        })
      ]);

      return NextResponse.json({ success: true, status: "APPROVED" });
    }

    if (action === "REJECT") {
      await prisma.studentVerification.update({
        where: { id: verificationId },
        data: { status: "REJECTED", resolvedAt: new Date() }
      });
      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin student verification POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
