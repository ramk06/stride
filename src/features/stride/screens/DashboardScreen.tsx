import { Badge, IconChip, ProgressBar, SectionHeader, SurfaceCard } from "@/components/stride/ui";
import { ActivityCard } from "@/features/stride/components/ActivityCard";
import { OfflineNotice } from "@/features/stride/feedback";
import type { DashboardData, TabId } from "@/features/stride/types";

export function DashboardScreen({
  data,
  offline,
  onOpenActivity,
  onSelectTab,
}: {
  data: DashboardData;
  offline?: { title: string; description: string };
  onOpenActivity: (activityId: string) => void;
  onSelectTab: (tab: TabId) => void;
}) {
  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <SurfaceCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{data.currentDateLabel}</p>
            <h2 className="mt-1 font-display text-[30px] font-semibold tracking-[-0.05em] text-text">
              {data.greeting}, {data.runnerName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="warning">4-day streak</Badge>
              <Badge tone="accent">{data.syncLabel}</Badge>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
            {data.runnerName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </SurfaceCard>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((metric) => (
          <SurfaceCard key={metric.label} className="rounded-[24px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {metric.label}
                </p>
                <p className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.05em] text-text">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-muted">{metric.detail}</p>
              </div>
              <IconChip icon={metric.icon} tone={metric.tone ?? "primary"} />
            </div>
          </SurfaceCard>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <SurfaceCard>
            <SectionHeader
              eyebrow="Weekly mileage"
              title={`${data.weeklyTotalKm.toFixed(1)} km this week`}
              action={<Badge tone="accent">{data.weeklyDelta}</Badge>}
            />
            <div className="mt-4 h-32 rounded-[22px] bg-surface-muted p-3">
              <div className="grid h-full grid-cols-7 gap-2">
                {data.weeklyMileage.map((day) => {
                  const height = Math.max(8, Math.round(day.distanceKm * 8));

                  return (
                    <div key={day.day} className="flex h-full flex-col justify-end gap-2 text-center">
                      <div className="rounded-t-[14px] bg-surface-strong" style={{ height }}>
                        <div
                          className={
                            day.distanceKm === 0
                              ? "h-full rounded-t-[14px] bg-surface-strong/40"
                              : day.planned
                                ? "h-full rounded-t-[14px] bg-accent/30"
                                : "h-full rounded-t-[14px] bg-primary"
                          }
                        />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        {day.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </SurfaceCard>
          <div className="space-y-3">
            <SectionHeader
              title="Recent activities"
              action={
                <button
                  type="button"
                  onClick={() => onSelectTab("activities")}
                  className="text-sm font-semibold text-primary"
                >
                  View all
                </button>
              }
            />
            {data.recentActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => onOpenActivity(activity.id)}
                className="w-full text-left"
              >
                <ActivityCard activity={activity} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <SurfaceCard>
            <SectionHeader
              eyebrow="Goal progress"
              title={data.activeGoal.title}
              action={<Badge tone="primary">{data.activeGoal.targetDate}</Badge>}
            />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{data.activeGoal.currentLabel}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                  {data.activeGoal.progressPercent}%
                </span>
              </div>
              <ProgressBar value={data.activeGoal.progressPercent} />
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{data.activeGoal.targetLabel}</span>
                <button
                  type="button"
                  onClick={() => onSelectTab("goals")}
                  className="font-semibold text-primary"
                >
                  View goals
                </button>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard>
            <SectionHeader
              eyebrow="Gear status"
              title={data.featuredGear.name}
              action={<Badge tone="warning">{data.featuredGear.statusLabel}</Badge>}
            />
            <div className="mt-4 space-y-3">
              <span className="text-sm text-muted">{data.featuredGear.notes}</span>
              <ProgressBar
                value={(data.featuredGear.mileageKm / data.featuredGear.targetMileageKm) * 100}
              />
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  {data.featuredGear.mileageKm} / {data.featuredGear.targetMileageKm} km
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTab("gear")}
                  className="font-semibold text-primary"
                >
                  View gear
                </button>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}