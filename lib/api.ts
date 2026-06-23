import { NextResponse } from "next/server";

export function errorResponse(status: number, error: string, field?: string) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
}
