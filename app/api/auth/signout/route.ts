import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("mock-user-email", "", { maxAge: 0, path: "/" });
  response.cookies.set("mock-user-role", "", { maxAge: 0, path: "/" });
  response.cookies.set("__session", "", { maxAge: 0, path: "/" });
  return response;
}
