import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, signature } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Convert base64 to Buffer
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Check file size (10 MB limit)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Receipt image exceeds 10MB limit" }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate filename
    const fileExt = mimeType.split("/")[1] || "jpg";
    const filename = `receipt-${crypto.randomUUID()}.${fileExt}`;
    const filePath = path.join(uploadDir, filename);


    // Write file
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      size: buffer.length,
      mimeType
    });
  } catch (err: any) {
    console.error("Receipt upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
