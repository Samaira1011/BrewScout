import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { saveLocalFile } from "@/lib/upload";

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

    // Must be owner or admin
    if (cafe.ownerId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, eventAt, coverImage } = body;

    if (!title || !description || !eventAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let coverUrl = "";
    if (coverImage) {
      coverUrl = await saveLocalFile(coverImage, "event-cover");
    }

    const newEvent = await prisma.event.create({
      data: {
        cafeId: cafe.id,
        title,
        description,
        eventAt: new Date(eventAt),
        coverCloudinaryPublicId: coverUrl || null,
        coverCloudinaryUrl: coverUrl || null
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error("Failed to create event:", err);
    return NextResponse.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}
