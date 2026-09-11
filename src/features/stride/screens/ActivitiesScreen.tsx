"use client";

import { useMemo, useState } from "react";
import { EmptyState, PrimaryButton, SurfaceCard, cx } from "@/components/stride/ui";
import { ActivityCard } from "@/features/stride/components/ActivityCard";
import { OfflineNotice } from "@/features/stride/feedback";
import type { ActivitiesData, ActivityType } from "@/features/stride/types";

export function ActivitiesScreen({
  data,
  offline,
  onOpenActivity,
  onAddActivity,
}: {
  data: ActivitiesData;
  offline?: { title: string; description: string };
  onOpenActivity: (activityId: string) => void;
  onAddActivity: () => void;
}) {
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");
  const [activitySearch, setActivitySearch] = useState("");

  const filteredActivities = useMemo(() => {
    return data.activities.filter((activity) => {
      const matchesType = activityFilter === "all" || activity.type === activityFilter;
      const query = activitySearch.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        [activity.title, activity.location, activity.gearName, activity.routeName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesType && matchesSearch;
    });
  }, [activityFilter, activitySearch, data.activities]);

  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <SurfaceCard>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Training log
              </p>
              <p className="mt-1 text-sm text-muted">
                Search saved workouts or add a new activity directly from this screen.
              </p>
            </div>
            <PrimaryButton type="button" className="min-h-10 px-4 py-2 text-sm" onClick={onAddActivity}>
              Log activity
            </PrimaryButton>
          </div>
          <div className="flex items-center gap-2 rounded-[22px] bg-surface-muted px-4 py-3">
            <span className="material-symbols-outlined text-[18px] text-muted">search</span>
            <input
              value={activitySearch}
              onChange={(event) => setActivitySearch(event.target.value)}
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
              placeholder="Search route, shoe, title, or location"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", ...data.filters] as Array<ActivityType | "all">).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActivityFilter(filter)}
                className={cx(
                  "whitespace-nowrap rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  activityFilter === filter ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </SurfaceCard>
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No matching activities"
          description="Adjust the search or filter to see more workouts."
        />
      ) : (
        filteredActivities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => onOpenActivity(activity.id)}
            className="w-full text-left"
          >
            <ActivityCard activity={activity} />
          </button>
        ))
      )}
    </div>
  );
}