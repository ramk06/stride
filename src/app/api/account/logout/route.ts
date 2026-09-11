import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSessionByToken } from "@/features/stride/persistence";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  deleteSessionByToken(request.cookies.get("stride_session")?.value);

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}