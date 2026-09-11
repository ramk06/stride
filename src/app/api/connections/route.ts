import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getConnectedAppsData } from "@/features/stride/live-data";
import { getRequestSessionUser } from "@/features/stride/persistence";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = getRequestSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getConnectedAppsData());
}