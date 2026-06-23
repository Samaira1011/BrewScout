import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, error } = await requireRole(request, "ADMIN");
  if (error) return error;

  try {
    const body = await request.json();
    const { cafeId, action } = body;

    if (!cafeId || !action) {
      return NextResponse.json({ error: "Missing cafeId or action" }, { status: 400 });
    }

    const cafe = await prisma.cafePage.findUnique({
      where: { id: cafeId }
    });

    if (!cafe) {
      return NextResponse.json({ error: "Cafe listing not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await prisma.cafePage.update({
        where: { id: cafeId },
        data: { isVerified: true }
      });
      return NextResponse.json({ success: true, status: "APPROVED" });
    }
    
    if (action === "REJECT") {
      // If rejected, delete the page entirely to clean up the DB
      await prisma.cafePage.delete({
        where: { id: cafeId }
      });
      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin cafes POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
