import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { saveLocalFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const token = await verifyFirebaseToken(request);
    if (!token || !token.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      phoneNumber, 
      photoBase64, 
      bio, 
      instagram, 
      twitter, 
      city, 
      favoriteCoffee, 
      gender, 
      dob 
    } = body;

    let photoUrl: string | undefined = undefined;
    if (photoBase64) {
      photoUrl = await saveLocalFile(photoBase64, "avatar");
    }

    // Construct the database update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (city !== undefined) updateData.city = city;
    if (favoriteCoffee !== undefined) updateData.favoriteCoffee = favoriteCoffee;
    if (gender !== undefined) updateData.gender = gender;
    
    if (dob !== undefined) {
      updateData.dob = dob ? new Date(dob) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: token.dbUserId },
      data: updateData
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("Failed to update profile:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
