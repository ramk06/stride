import { NextResponse } from "next/server";
import { persistSession, applySessionCookie } from "@/features/stride/persistence";
import { signInAccount } from "@/features/stride/live-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 422 });
    }

    const user = signInAccount({ email: body.email, password: body.password });
    const token = persistSession(user.id);
    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    applySessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign in." },
      { status: 401 },
    );
  }
}