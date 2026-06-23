import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const isFirebaseConfigured = 
  !!process.env.FIREBASE_ADMIN_PROJECT_ID && 
  !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let adminAuth: any;

if (isFirebaseConfigured) {
  try {
    const app = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    adminAuth = getAuth(app);
  } catch (err) {
    console.error("Firebase admin init failed, falling back to mock:", err);
    adminAuth = createMockAuth();
  }
} else {
  adminAuth = createMockAuth();
}

function createMockAuth() {
  return {
    verifyIdToken: async (token: string) => {
      return {
        uid: "mock-uid",
        email: "mock-user@example.com",
        role: "REVIEWER",
      };
    }
  };
}

export { adminAuth };
