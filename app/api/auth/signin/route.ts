import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWelcomeEmail, sendSignInAlert } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { token, isMockGoogle, mockEmail } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token using Firebase Admin SDK or local mock override
    let decoded;
    if (isMockGoogle && mockEmail) {
      decoded = {
        uid: `mock-${mockEmail.toLowerCase()}`,
        email: mockEmail.toLowerCase(),
      };
    } else {
      decoded = await adminAuth.verifyIdToken(token);
    }

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let isNewUser = false;

    // Ensure user exists in our DB
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid }
    });

    if (!user) {
      // Find by email in case of seeded or mock user linking
      user = await prisma.user.findUnique({
        where: { email: decoded.email }
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decoded.uid }
        });
      } else {
        // Create user with default role
        let role = "REVIEWER";
        const emailLower = decoded.email.toLowerCase();
        if (emailLower.includes("admin") || emailLower === "samaira.guptains@gmail.com") {
          role = "ADMIN";
        }
        user = await prisma.user.create({
          data: {
            firebaseUid: decoded.uid,
            email: decoded.email,
            role
          }
        });
        isNewUser = true;
      }
    }

    // Dispatch dynamic emails asynchronously to not block network response
    if (isNewUser) {
      sendWelcomeEmail(user.email, user.role).catch(err => 
        console.error("signin/route.ts: Welcome email failure", err)
      );
    } else {
      sendSignInAlert(user.email, user.points, user.level).catch(err => 
        console.error("signin/route.ts: Login alert email failure", err)
      );
    }

    const response = NextResponse.json({ success: true, user });

    // Set the __session cookie containing the Firebase ID Token
    response.cookies.set("__session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json({ error: error.message || "Failed to sign in" }, { status: 500 });
  }
}
