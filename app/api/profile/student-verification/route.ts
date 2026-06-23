import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Helper to save base64 image locally
async function saveLocalFile(base64String: string, prefix: string): Promise<string> {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  
  const fileExt = mimeType.split("/")[1] || "jpg";
  const filename = `${prefix}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { collegeName, cardImage } = body;

    if (!collegeName || !cardImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save image locally
    const cardUrl = await saveLocalFile(cardImage, "student-card");

    // Upsert or create StudentVerification record
    const verification = await prisma.studentVerification.upsert({
      where: { userId: token.dbUserId },
      update: {
        collegeName,
        studentCardUrl: cardUrl,
        status: "PENDING",
        createdAt: new Date(),
        resolvedAt: null
      },
      create: {
        userId: token.dbUserId,
        collegeName,
        studentCardUrl: cardUrl,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, verification });
  } catch (err: any) {
    console.error("Failed to submit student verification:", err);
    return NextResponse.json({ error: err.message || "Failed to submit verification" }, { status: 500 });
  }
}
