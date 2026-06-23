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

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const vibe = request.nextUrl.searchParams.get("vibe");

  let whereClause: any = {};

  if (q) {
    whereClause = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        {
          vibeTags: {
            some: {
              tag: {
                name: { contains: q, mode: "insensitive" }
              }
            }
          }
        }
      ]
    };
  } else if (vibe) {
    whereClause = {
      vibeTags: {
        some: {
          tag: {
            name: { contains: vibe, mode: "insensitive" }
          }
        }
      }
    };
  }

  const results = await prisma.cafePage.findMany({
    where: {
      ...whereClause,
      // Only return verified cafes in search results to maintain moderation integrity
      isVerified: true
    },
    include: {
      vibeTags: {
        include: {
          tag: true
        }
      },
      foodTypeTags: {
        include: {
          tag: true
        }
      }
    }
  });

  // Map database format to client expected format
  const mapped = results.map(c => ({
    slug: c.slug,
    name: c.name,
    area: c.neighborhood,
    address: c.address,
    rating: c.reviewCount > 0 ? Number((c.ratingSum / c.reviewCount).toFixed(1)) : 0,
    reviews: c.reviewCount,
    vibe: c.vibeTags.map(vt => vt.tag.name),
    food: c.foodTypeTags.map(ft => ft.tag.name),
    gradient: c.gradient,
    description: c.description
  }));

  return NextResponse.json({ cafes: mapped });
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId || (token.role !== "OWNER" && token.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      neighborhood,
      description,
      openingHours,
      gradient,
      instagramUrl,
      vibeTags,
      foodTags,
      menuDesc,
      coverImage,
      menuImage,
      proofImage,
      galleryImages // multiple gallery photos
    } = body;

    if (!name || !address || !city || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check slug collision
    const existing = await prisma.cafePage.findUnique({
      where: { slug }
    });

    if (existing) {
      slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
    }

    // Save files if uploaded
    let coverUrl = "";
    let menuPhotoUrl = "";
    let businessProofUrl = "";

    if (coverImage) {
      coverUrl = await saveLocalFile(coverImage, "cafe-cover");
    }
    if (menuImage) {
      menuPhotoUrl = await saveLocalFile(menuImage, "cafe-menu");
    }
    if (proofImage) {
      businessProofUrl = await saveLocalFile(proofImage, "cafe-proof");
    }

    // Find or create tags (supports custom tags!)
    const vibeTagDb = [];
    for (const tagName of (vibeTags || [])) {
      const tag = await prisma.vibeTag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      vibeTagDb.push(tag);
    }
    
    const foodTagDb = [];
    for (const tagName of (foodTags || [])) {
      const tag = await prisma.foodTypeTag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      foodTagDb.push(tag);
    }

    // Create cafe page
    const newCafe = await prisma.cafePage.create({
      data: {
        slug,
        name,
        address,
        city,
        neighborhood,
        description,
        openingHours,
        gradient,
        instagramUrl,
        menuDesc,
        menuPhotoUrl,
        businessProofUrl,
        isVerified: token.role === "ADMIN", // Auto-verify if admin creates it
        ownerId: token.dbUserId,
        vibeTags: {
          create: vibeTagDb.map(t => ({ vibeTagId: t.id }))
        },
        foodTypeTags: {
          create: foodTagDb.map(t => ({ foodTypeId: t.id }))
        }
      }
    });

    // Create primary CafePhoto if cover image was uploaded
    if (coverUrl) {
      await prisma.cafePhoto.create({
        data: {
          cafeId: newCafe.id,
          cloudinaryPublicId: coverUrl,
          cloudinaryUrl: coverUrl,
          isPrimary: true
        }
      });
    }

    // Save gallery files if uploaded
    if (galleryImages && galleryImages.length > 0) {
      for (const imgBase64 of galleryImages) {
        try {
          const galleryUrl = await saveLocalFile(imgBase64, "cafe-gallery");
          await prisma.cafePhoto.create({
            data: {
              cafeId: newCafe.id,
              cloudinaryPublicId: galleryUrl,
              cloudinaryUrl: galleryUrl,
              isPrimary: false
            }
          });
        } catch (err) {
          console.error("Failed to save gallery image:", err);
        }
      }
    }

    return NextResponse.json({ success: true, slug: newCafe.slug });
  } catch (err: any) {
    console.error("Failed to create cafe listing:", err);
    return NextResponse.json({ error: err.message || "Failed to create listing" }, { status: 500 });
  }
}
