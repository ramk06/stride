import { NextResponse } from "next/server";
import { persistSession, applySessionCookie } from "@/features/stride/persistence";
import { registerAccount } from "@/features/stride/live-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };

    if (!body.fullName || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required." },
        { status: 422 },
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 422 },
      );
    }

    const user = registerAccount({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
    });
    const token = persistSession(user.id);
    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    applySessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 },
    );
  }
}