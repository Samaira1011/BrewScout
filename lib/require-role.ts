import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";
import { verifyFirebaseToken } from "@/lib/auth-helpers";

export async function requireRole(request: NextRequest, role: string) {
  try {
    const token = await verifyFirebaseToken(request);
    if (token.role !== role) return { error: errorResponse(403, "Forbidden") };
    return { token };
  } catch {
    return { error: errorResponse(401, "Unauthorized") };
  }
}
