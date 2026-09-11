import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getActivityDetailData } from "@/features/stride/live-data";
import { getRequestSessionUser } from "@/features/stride/persistence";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext<"/api/activities/[activityId]">) {
  const user = getRequestSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { activityId } = await context.params;
    return NextResponse.json(getActivityDetailData(user.id, activityId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load activity." },
      { status: 404 },
    );
  }
}