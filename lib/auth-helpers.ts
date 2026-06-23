import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!isFirebaseConfigured) {
    const mockEmail = cookieStore.get("mock-user-email")?.value;
    if (!mockEmail) return null;

    const normalizedEmail = mockEmail.toLowerCase();
    let mockRole = cookieStore.get("mock-user-role")?.value || "REVIEWER";
    if (normalizedEmail.includes("admin") || normalizedEmail === "samaira.guptains@gmail.com") {
      mockRole = "ADMIN";
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { firebaseUid: `mock-${normalizedEmail}` }
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: `mock-${normalizedEmail}`,
          email: normalizedEmail,
          role: mockRole
        }
      });
    } else if (user.role !== mockRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: mockRole }
      });
    }

    return user;
  }

  const token = cookieStore.get("__session")?.value;
  if (!token || token.startsWith("mock-")) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid }
    });
    return user;
  } catch (err) {
    console.error("Failed to verify firebase session cookie:", err);
    return null;
  }
}

export async function verifyFirebaseToken(request: NextRequest) {
  // If Firebase is not configured (keys missing), fallback to mock cookie auth for local development
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!isFirebaseConfigured) {
    const mockEmail = request.cookies.get("mock-user-email")?.value || "guest@example.com";
    const normalizedEmail = mockEmail.toLowerCase();
    let mockRole = request.cookies.get("mock-user-role")?.value || "REVIEWER";
    
    // Auto-detect admin
    if (normalizedEmail.includes("admin") || normalizedEmail === "samaira.guptains@gmail.com") {
      mockRole = "ADMIN";
    }
    
    // Find or create the mock user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { firebaseUid: `mock-${normalizedEmail}` }
        ]
      }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: `mock-${normalizedEmail}`,
          email: normalizedEmail,
          role: mockRole
        }
      });
    } else if (user.role !== mockRole) {
      // Keep role synced with cookie choice for easy dev switching
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: mockRole }
      });
    }

    return {
      uid: user.firebaseUid,
      email: user.email,
      role: user.role,
      dbUserId: user.id
    };
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : request.cookies.get("__session")?.value;
  if (!token || token.startsWith("mock-")) throw new Error("Unauthorized");
  
  const decoded = await adminAuth.verifyIdToken(token);
  
  // Find user in db to get internal ID
  const user = await prisma.user.findUnique({
    where: { firebaseUid: decoded.uid }
  });
  
  return {
    ...decoded,
    dbUserId: user?.id,
    role: user?.role || (decoded.email?.toLowerCase() === "samaira.guptains@gmail.com" ? "ADMIN" : "REVIEWER")
  };
}

