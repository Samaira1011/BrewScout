import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
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


const authorNames: Record<string, string> = {
  "maya@example.com": "Maya R.",
  "arjun@example.com": "Arjun K.",
  "nisha@example.com": "Nisha P."
};

function getAuthorName(email: string) {
  if (authorNames[email]) return authorNames[email];
  const prefix = email.split("@")[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  return `${diffWeeks} weeks ago`;
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const cafe = await prisma.cafePage.findUnique({
      where: { slug: params.slug },
      include: {
        vibeTags: { include: { tag: true } },
        foodTypeTags: { include: { tag: true } },
        reviews: {
          where: { isRemoved: false, isApproved: true },
          orderBy: { createdAt: "desc" },
          include: { 
            author: true,
            receipt: true
          }
        }
      }
    });

    if (!cafe) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mappedReviews = cafe.reviews.map(r => ({
      author: getAuthorName(r.author.email),
      rating: r.rating,
      verified: r.isVerified,
      body: r.body || "",
      receiptUrl: r.receipt?.cloudinaryPublicId || null,
      date: getRelativeTimeString(r.createdAt)
    }));

    const mappedCafe = {
      slug: cafe.slug,
      name: cafe.name,
      area: cafe.neighborhood,
      address: cafe.address,
      rating: cafe.reviewCount > 0 ? Number((cafe.ratingSum / cafe.reviewCount).toFixed(1)) : 0,
      reviews: cafe.reviewCount,
      vibe: cafe.vibeTags.map(vt => vt.tag.name),
      food: cafe.foodTypeTags.map(ft => ft.tag.name),
      gradient: cafe.gradient,
      description: cafe.description
    };

    return NextResponse.json({ ...mappedCafe, reviews: mappedReviews });
  } catch (err: any) {
    console.error("GET cafe failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const token = await verifyFirebaseToken(request);
    
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyJson = await request.json();
    const { rating, body, receiptUrl } = bodyJson;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const cafe = await prisma.cafePage.findUnique({
      where: { slug: params.slug }
    });

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
    }

    // Check if user has already reviewed this cafe
    const existingReview = await prisma.review.findUnique({
      where: {
        cafeId_authorId: {
          cafeId: cafe.id,
          authorId: token.dbUserId
        }
      }
    });

    if (existingReview) {
      // If the edited review was already approved, remove its influence from the cafe page stats first
      if (existingReview.isApproved) {
        await prisma.cafePage.update({
          where: { id: cafe.id },
          data: {
            ratingSum: { decrement: existingReview.rating },
            reviewCount: { decrement: 1 }
          }
        });
      }

      // Update existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          body,
          // Reset to pending verification if a new receipt is provided
          isVerified: receiptUrl ? false : existingReview.isVerified,
          isApproved: false, // Must be re-approved by admin
          createdAt: new Date()
        }
      });

      if (receiptUrl) {
        // Delete old receipt record
        await prisma.receipt.deleteMany({
          where: { reviewId: existingReview.id }
        });
        
        // Save new receipt record
        await prisma.receipt.create({
          data: {
            reviewId: existingReview.id,
            cloudinaryPublicId: receiptUrl,
            mimeType: "image/jpeg",
            sizeBytes: 100000
          }
        });
      }
    } else {
      // Create new review (unapproved by default)
      const newReview = await prisma.review.create({
        data: {
          cafeId: cafe.id,
          authorId: token.dbUserId,
          rating,
          body,
          isVerified: false,
          isApproved: false
        }
      });

      if (receiptUrl) {
        await prisma.receipt.create({
          data: {
            reviewId: newReview.id,
            cloudinaryPublicId: receiptUrl,
            mimeType: "image/jpeg",
            sizeBytes: 100000
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to post review:", err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
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

    // Check permissions (must be owner or admin)
    if (cafe.ownerId !== token.dbUserId && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      galleryImages,
      existingGalleryUrls
    } = body;

    if (!name || !address || !city || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let menuPhotoUrl = cafe.menuPhotoUrl;
    let businessProofUrl = cafe.businessProofUrl;
    let coverUrl = "";

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

    // Clean up old tag relations in a transaction to keep integrity
    await prisma.$transaction([
      prisma.cafeVibeTag.deleteMany({ where: { cafeId: cafe.id } }),
      prisma.cafeFoodTypeTag.deleteMany({ where: { cafeId: cafe.id } }),
      prisma.cafePage.update({
        where: { id: cafe.id },
        data: {
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
          vibeTags: {
            create: vibeTagDb.map(t => ({ vibeTagId: t.id }))
          },
          foodTypeTags: {
            create: foodTagDb.map(t => ({ foodTypeId: t.id }))
          }
        }
      })
    ]);

    // Update cover image if new one is uploaded
    if (coverUrl) {
      await prisma.cafePhoto.deleteMany({
        where: { cafeId: cafe.id, isPrimary: true }
      });
      await prisma.cafePhoto.create({
        data: {
          cafeId: cafe.id,
          cloudinaryPublicId: coverUrl,
          cloudinaryUrl: coverUrl,
          isPrimary: true
        }
      });
    }

    // Delete gallery photos that were removed by the owner
    await prisma.cafePhoto.deleteMany({
      where: {
        cafeId: cafe.id,
        isPrimary: false,
        NOT: {
          cloudinaryUrl: { in: existingGalleryUrls || [] }
        }
      }
    });

    // Save new gallery files if uploaded
    if (galleryImages && galleryImages.length > 0) {
      for (const imgBase64 of galleryImages) {
        try {
          const galleryUrl = await saveLocalFile(imgBase64, "cafe-gallery");
          await prisma.cafePhoto.create({
            data: {
              cafeId: cafe.id,
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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to update cafe listing:", err);
    return NextResponse.json({ error: err.message || "Failed to update listing" }, { status: 500 });
  }
}


