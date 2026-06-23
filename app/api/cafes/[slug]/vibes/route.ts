import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cafe = await prisma.cafePage.findUnique({
      where: { slug: params.slug }
    });

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }

    const body = await request.json();
    const { vibe } = body;

    if (!vibe || typeof vibe !== "string") {
      return NextResponse.json({ error: "Vibe name is required" }, { status: 400 });
    }

    const cleanVibe = vibe.trim();
    if (cleanVibe.length < 2 || cleanVibe.length > 25) {
      return NextResponse.json({ error: "Vibe name must be between 2 and 25 characters" }, { status: 400 });
    }

    // Find or create the VibeTag (case-insensitive upsert or match)
    // To maintain unique names, we can look up by a case-insensitive check first
    let vibeTag = await prisma.vibeTag.findFirst({
      where: {
        name: {
          equals: cleanVibe,
          mode: "insensitive"
        }
      }
    });

    if (!vibeTag) {
      vibeTag = await prisma.vibeTag.create({
        data: { name: cleanVibe }
      });
    }

    // Check if the relation already exists
    const relationExists = await prisma.cafeVibeTag.findUnique({
      where: {
        cafeId_vibeTagId: {
          cafeId: cafe.id,
          vibeTagId: vibeTag.id
        }
      }
    });

    if (!relationExists) {
      await prisma.cafeVibeTag.create({
        data: {
          cafeId: cafe.id,
          vibeTagId: vibeTag.id
        }
      });
    }

    return NextResponse.json({ success: true, vibe: vibeTag.name });
  } catch (err: any) {
    console.error("Failed to add custom vibe:", err);
    return NextResponse.json({ error: err.message || "Failed to add custom vibe" }, { status: 500 });
  }
}
