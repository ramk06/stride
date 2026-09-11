"use client";

import { useMemo, useState } from "react";
import { Badge, IconChip, PrimaryButton, ProgressBar, SurfaceCard } from "@/components/stride/ui";
import { OfflineNotice } from "@/features/stride/feedback";
import type { GoalsData } from "@/features/stride/types";

export function GoalsScreen({
  data,
  offline,
  onAddGoal,
}: {
  data: GoalsData;
  offline?: { title: string; description: string };
  onAddGoal: () => void;
}) {
  const [goalScope, setGoalScope] = useState<"active" | "completed">("active");

  const scopedGoals = useMemo(() => {
    return data.goals.filter((goal) => goal.status === goalScope);
  }, [data.goals, goalScope]);

  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
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
      <SurfaceCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 rounded-full bg-surface-muted p-1">
            {(["active", "completed"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGoalScope(item)}
                className={
                  goalScope === item
                    ? "rounded-full bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-primary shadow-sm"
                    : "rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                }
              >
                {item}
              </button>
            ))}
          </div>
          <PrimaryButton type="button" className="min-h-10 px-4 py-2 text-sm" onClick={onAddGoal}>
            New goal
          </PrimaryButton>
        </div>
      </SurfaceCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {scopedGoals.map((goal) => (
          <SurfaceCard key={goal.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={goal.status === "active" ? "primary" : "accent"}>{goal.type}</Badge>
                    {goal.priority ? <span className="text-sm text-muted">{goal.priority}</span> : null}
                  </div>
                  <h3 className="mt-3 font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
                    {goal.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{goal.targetLabel}</p>
                </div>
                <Badge tone={goal.status === "active" ? "warning" : "success"}>{goal.targetDate}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{goal.currentLabel}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text">
                  {goal.progressPercent}%
                </span>
              </div>
              <ProgressBar value={goal.progressPercent} />
              <p className="text-sm text-muted">{goal.remainingLabel}</p>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}