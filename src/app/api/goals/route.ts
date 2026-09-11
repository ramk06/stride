import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createGoal, getGoalsData } from "@/features/stride/live-data";
import { getRequestSessionUser } from "@/features/stride/persistence";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = getRequestSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getGoalsData(user.id));
}

export async function POST(request: NextRequest) {
  const user = getRequestSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    return NextResponse.json(createGoal(user.id, body), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save goal." },
      { status: 422 },
    );
  }
}