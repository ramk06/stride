"use client";

import { useState } from "react";
import {
  Badge,
  EmptyState,
  ErrorState,
  FormField,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  SkeletonCard,
  SurfaceCard,
} from "@/components/stride/ui";
import { ActivityMetricCard } from "@/features/stride/components/ActivityCard";
import { OfflineNotice } from "@/features/stride/feedback";
import { submitGearAssignment, useActivityDetails } from "@/features/stride/hooks";
import type { GearSummary } from "@/features/stride/types";

export function ActivityDetailsScreen({
  activityId,
  refreshKey,
  gearOptions,
  onUpdated,
}: {
  activityId: string;
  refreshKey: number;
  gearOptions: GearSummary[];
  onUpdated: () => void;
}) {
  const [selectedGearId, setSelectedGearId] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const [assignmentState, setAssignmentState] = useState<"idle" | "saving" | "error" | "success">("idle");
  const resource = useActivityDetails(activityId, refreshKey);

  if (resource.status === "loading") {
    return <SkeletonCard lines={4} />;
  }

  if (resource.status === "empty") {
    return <EmptyState title={resource.title} description={resource.description} />;
  }

  if (resource.status === "error") {
    return <ErrorState title={resource.title} description={resource.description} />;
  }

  const data = resource.data;
  const offline = resource.status === "offline" ? resource : undefined;

  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <SurfaceCard>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone={data.type === "run" ? "primary" : "accent"}>{data.type}</Badge>
                <Badge tone="accent">{data.dateLabel}</Badge>
              </div>
              <h3 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.04em] text-text">
                {data.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{data.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActivityMetricCard label="Distance" value={`${data.distanceKm.toFixed(2)} km`} />
            <ActivityMetricCard label="Duration" value={data.duration} />
            <ActivityMetricCard label="Pace" value={data.pace} />
            <ActivityMetricCard
              label="Heart rate"
              value={data.heartRate ? `${data.heartRate} bpm` : "-"}
            />
            <ActivityMetricCard
              label="Cadence"
              value={data.cadenceSpm ? `${data.cadenceSpm} spm` : "-"}
            />
            <ActivityMetricCard
              label="Elevation"
              value={data.elevationM ? `${data.elevationM} m` : "-"}
            />
            <ActivityMetricCard label="Calories" value={data.calories ? `${data.calories}` : "-"} />
            <ActivityMetricCard label="Weather" value={data.weather ?? "-"} />
          </div>
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SectionHeader eyebrow="Route" title="Route summary" />
        <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface-muted p-4">
          <div className="rounded-[20px] bg-[linear-gradient(180deg,#dff2ff_0%,#f8fbff_100%)] p-4">
            <svg
              viewBox="0 0 340 160"
              className="h-48 w-full overflow-visible rounded-[18px] bg-surface"
            >
              <path
                d={data.routePreviewPath ?? "M18 120 C80 72,140 98,206 74 S280 54,322 80"}
                fill="none"
                stroke="#0d71a9"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="18" cy="120" r="8" fill="#c4511a" />
              <circle cx="322" cy="80" r="8" fill="#12795b" />
            </svg>
            <p className="mt-3 text-sm text-muted">
              GPS import is not part of this V1. The surface stays stable so a real provider can be added later without rebuilding the activity page.
            </p>
          </div>
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SectionHeader eyebrow="Splits" title="KM | Pace | HR" />
        <div className="mt-4 overflow-hidden rounded-[22px] border border-border">
          <div className="grid grid-cols-3 bg-surface-muted px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <span>KM</span>
            <span>Pace</span>
            <span>HR</span>
          </div>
          {data.splits.map((split) => (
            <div
              key={split.kilometer}
              className="grid grid-cols-3 border-t border-border px-4 py-3 text-sm text-text"
            >
              <span>{split.kilometer}</span>
              <span>{split.pace}</span>
              <span>{split.heartRate ?? "-"}</span>
            </div>
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SectionHeader eyebrow="Gear" title={data.gearName ?? "Assign gear"} />
        <div className="mt-4 space-y-4">
          {gearOptions.length > 0 ? (
            <>
              <FormField label="Linked gear">
                <SelectInput value={selectedGearId} onChange={(event) => setSelectedGearId(event.target.value)}>
                  <option value="">Select a gear item</option>
                  {gearOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <PrimaryButton
                type="button"
                disabled={!selectedGearId || assignmentState === "saving"}
                onClick={async () => {
                  setAssignmentState("saving");
                  const result = await submitGearAssignment(activityId, selectedGearId);
                  setAssignmentState(result.status === "success" ? "success" : "error");
                  setAssignmentMessage(result.description);
                  if (result.status === "success") {
                    onUpdated();
                  }
                }}
              >
                {assignmentState === "saving" ? "Saving..." : "Assign gear"}
              </PrimaryButton>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Add a gear item first to connect this activity to shoes or devices.
            </p>
          )}
          {assignmentMessage ? <p className="text-sm text-muted">{assignmentMessage}</p> : null}
        </div>
      </SurfaceCard>
    </div>
  );
}