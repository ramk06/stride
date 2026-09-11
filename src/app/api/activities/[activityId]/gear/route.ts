import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { assignGear } from "@/features/stride/live-data";
import { getRequestSessionUser } from "@/features/stride/persistence";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, context: RouteContext<"/api/activities/[activityId]/gear">) {
  const user = getRequestSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { activityId } = await context.params;
    const body = (await request.json()) as { gearId?: string };

    if (!body.gearId) {
      return NextResponse.json({ error: "Gear selection is required." }, { status: 422 });
    }

    return NextResponse.json(assignGear(user.id, activityId, body.gearId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to assign gear." },
      { status: 422 },
    );
  }
}