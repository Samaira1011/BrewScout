import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { token, roleChoice, isMock, email } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token using Firebase Admin SDK or local mock override
    let decoded;
    if (isMock && email) {
      decoded = {
        uid: `mock-${email.toLowerCase()}`,
        email: email.toLowerCase()
      };
    } else {
      decoded = await adminAuth.verifyIdToken(token);
    }

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Determine user role
    let role = "REVIEWER";
    const emailLower = decoded.email.toLowerCase();
    if (emailLower.includes("admin") || emailLower === "samaira.guptains@gmail.com") {
      role = "ADMIN";
    } else if (roleChoice === "Manage my business") {
      role = "OWNER";
    }

    // First check if user exists in DB via Firebase UID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: decoded.uid },
          { email: decoded.email }
        ]
      }
    });

    if (user) {
      return NextResponse.json({ 
        error: "This email is already registered. Please sign in instead." 
      }, { status: 400 });
    }

    // Create new user in DB
    user = await prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: decoded.email,
        role
      }
    });

    // Dispatch welcome email asynchronously
    sendWelcomeEmail(user.email, user.role).catch(err =>
      console.error("register/route.ts: Welcome email failure", err)
    );

    const response = NextResponse.json({ success: true, user });

    // Set the __session cookie containing the Firebase ID Token
    // Firebase Hosting requires '__session' cookie name for Server-Side Rendering
    response.cookies.set("__session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
