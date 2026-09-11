import { Badge, SurfaceCard, cx } from "@/components/stride/ui";
import type { ActivitySummary } from "@/features/stride/types";

export function ActivityCard({ activity }: { activity: ActivitySummary }) {
  return (
    <SurfaceCard className="rounded-[24px] p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone={activity.type === "run" ? "primary" : "accent"}>
                {activity.type}
              </Badge>
              <span className="text-sm text-muted">{activity.label}</span>
            </div>
            <h3 className="mt-3 truncate font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
              {activity.title}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {activity.dateLabel} · {activity.location}
            </p>
          </div>
          <Badge tone={activity.syncedFrom === "Strava" ? "warning" : "accent"}>
            {activity.syncedFrom ?? "Stride"}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-surface-muted p-3">
          <ActivityMetric label="Distance" value={`${activity.distanceKm.toFixed(2)} km`} />
          <ActivityMetric label="Duration" value={activity.duration} />
          <ActivityMetric label="Pace" value={activity.pace} accent />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <MetricPill
            icon="favorite"
            value={activity.heartRate ? `${activity.heartRate} bpm` : "-"}
          />
          <MetricPill
            icon="landscape"
            value={activity.elevationM ? `${activity.elevationM} m` : "-"}
          />
          <MetricPill icon="steps" value={activity.gearName ?? "Gear pending"} />
        </div>
      </div>
    </SurfaceCard>
  );
}

export function ActivityMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] bg-surface-muted p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}

function ActivityMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className={cx("mt-1 text-sm font-semibold text-text", accent && "text-primary")}>
        {value}
      </p>
    </div>
  );
}

function MetricPill({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2">
      <span className="material-symbols-outlined text-[16px] text-muted">{icon}</span>
      <span className="text-sm text-text">{value}</span>
    </div>
  );
}