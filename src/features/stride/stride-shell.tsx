"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { BottomNav, EmptyState, ErrorState, SkeletonCard } from "@/components/stride/ui";
import { useActivities, useDashboard, useGear, useGoals, useProfile } from "./hooks";
import type {
  ActivitiesData,
  DashboardData,
  GearData,
  GoalsData,
  ProfileData,
  ResourceState,
  SessionUser,
  TabId,
} from "./types";
import { ActivitiesScreen } from "./screens/ActivitiesScreen";
import { ActivityDetailsScreen } from "./screens/ActivityDetailsScreen";
import { AddActivityScreen } from "./screens/AddActivityScreen";
import { AddGearScreen } from "./screens/AddGearScreen";
import { CreateGoalScreen } from "./screens/CreateGoalScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { GearScreen } from "./screens/GearScreen";
import { GoalsScreen } from "./screens/GoalsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SyncScreen } from "./screens/SyncScreen";

type OverlayState =
  | { type: "activity"; activityId: string }
  | { type: "activity-form" }
  | { type: "gear-form" }
  | { type: "goal-form" }
  | { type: "connections" }
  | null;

export function StrideApp({
  sessionUser,
  onSignOut,
}: {
  sessionUser: SessionUser;
  onSignOut: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const dashboard = useDashboard(refreshKey);
  const activities = useActivities(refreshKey);
  const gear = useGear(refreshKey);
  const goals = useGoals(refreshKey);
  const profile = useProfile(refreshKey);

  const initials = sessionUser.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function navigateTab(tab: TabId) {
    setOverlay(null);
    setActiveTab(tab);
  }

  function refreshData() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        {overlay ? renderOverlay() : null}
        {!overlay ? (
          <>
            <header className="sticky top-4 z-20 mb-6 rounded-[28px] border border-white/70 bg-background/88 px-5 py-5 shadow-[0_18px_50px_rgba(13,27,47,0.08)] backdrop-blur">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">
                      S
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold tracking-[-0.04em] text-text">
                        STRIDE
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        Running first
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h1 className="font-display text-[28px] font-semibold tracking-[-0.04em] text-text sm:text-[32px]">
                      {headerTitle(activeTab)}
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted sm:text-[15px]">
                      {headerSubtitle(activeTab)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setOverlay({ type: "connections" })}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-left shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      Connected apps
                    </span>
                  </button>
                  <div className="flex items-center gap-3 rounded-full bg-surface px-2 py-2 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent">
                      {initials}
                    </div>
                    <div className="pr-2">
                      <p className="text-sm font-semibold text-text">{sessionUser.fullName}</p>
                      <p className="text-xs text-muted">{sessionUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="rounded-full bg-surface-muted px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 pb-8">
              {renderTabContent()}
            </main>
            <BottomNav activeTab={activeTab} onChange={navigateTab} />
          </>
        ) : null}
      </div>
    </div>
  );

  function renderTabContent() {
    switch (activeTab) {
      case "dashboard":
        return renderResource<DashboardData>(dashboard, (data, offline) => (
          <DashboardScreen
            data={data}
            offline={offline}
            onOpenActivity={(activityId) => setOverlay({ type: "activity", activityId })}
            onSelectTab={navigateTab}
          />
        ));
      case "activities":
        return renderResource<ActivitiesData>(activities, (data, offline) => (
          <ActivitiesScreen
            data={data}
            offline={offline}
            onOpenActivity={(activityId) => setOverlay({ type: "activity", activityId })}
            onAddActivity={() => setOverlay({ type: "activity-form" })}
          />
        ));
      case "gear":
        return renderResource<GearData>(gear, (data, offline) => (
          <GearScreen
            data={data}
            offline={offline}
            onAddGear={() => setOverlay({ type: "gear-form" })}
          />
        ));
      case "goals":
        return renderResource<GoalsData>(goals, (data, offline) => (
          <GoalsScreen
            data={data}
            offline={offline}
            onAddGoal={() => setOverlay({ type: "goal-form" })}
          />
        ));
      case "profile":
        return renderResource<ProfileData>(profile, (data, offline) => (
          <ProfileScreen
            data={data}
            offline={offline}
            onOpenStrava={() => setOverlay({ type: "connections" })}
            onSignOut={onSignOut}
          />
        ));
      default:
        return null;
    }
  }

  function renderResource<T>(
    resource: ResourceState<T>,
    renderContent: (
      data: T,
      offline?: { title: string; description: string },
    ) => ReactElement,
  ) {
    switch (resource.status) {
      case "loading":
        return <SkeletonCard lines={4} />;
      case "empty":
        return <EmptyState title={resource.title} description={resource.description} />;
      case "error":
        return <ErrorState title={resource.title} description={resource.description} />;
      case "offline":
        return renderContent(resource.data, {
          title: resource.title,
          description: resource.description,
        });
      case "success":
        return renderContent(resource.data);
      default:
        return null;
    }
  }

  function renderOverlay() {
    if (!overlay) return null;

    const titleMap: Record<Exclude<OverlayState, null>["type"], string> = {
      activity: "Activity details",
      "activity-form": "Log activity",
      "gear-form": "Add gear",
      "goal-form": "Create goal",
      connections: "Connected apps",
    };

    return (
      <div className="fixed inset-0 z-40 overflow-y-auto bg-text/12 backdrop-blur-sm">
        <div className="mx-auto flex min-h-full w-full max-w-5xl items-start justify-center sm:p-6">
          <div className="flex min-h-screen w-full flex-col bg-background sm:min-h-0 sm:overflow-hidden sm:rounded-[32px] sm:border sm:border-border sm:bg-surface sm:shadow-[0_30px_80px_rgba(13,27,47,0.14)]">
            <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 pb-4 pt-5 backdrop-blur sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-text"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    STRIDE
                  </p>
                  <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
                    {titleMap[overlay.type]}
                  </h2>
                </div>
                <div className="w-11" />
              </div>
            </header>
            <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-4 sm:px-6">
              {overlay.type === "activity" ? (
                <ActivityDetailsScreen
                  activityId={overlay.activityId}
                  refreshKey={refreshKey}
                  gearOptions={gear.status === "success" ? gear.data.gear : []}
                  onUpdated={refreshData}
                />
              ) : null}
              {overlay.type === "activity-form" ? (
                <AddActivityScreen onClose={() => setOverlay(null)} onSaved={refreshData} />
              ) : null}
              {overlay.type === "gear-form" ? (
                <AddGearScreen onClose={() => setOverlay(null)} onSaved={refreshData} />
              ) : null}
              {overlay.type === "goal-form" ? (
                <CreateGoalScreen onClose={() => setOverlay(null)} onSaved={refreshData} />
              ) : null}
              {overlay.type === "connections" ? <SyncScreen refreshKey={refreshKey} /> : null}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

function headerTitle(tab: TabId) {
  switch (tab) {
    case "dashboard":
      return "Dashboard";
    case "activities":
      return "Activities";
    case "gear":
      return "Gear Locker";
    case "goals":
      return "Goals";
    case "profile":
      return "Profile";
    default:
      return "STRIDE";
  }
}

function headerSubtitle(tab: TabId) {
  switch (tab) {
    case "dashboard":
      return "Your training health, recent work, and current priorities in one place.";
    case "activities":
      return "Search, review, and manage every workout from a single training log.";
    case "gear":
      return "Track shoes, devices, and mileage so replacements never surprise you.";
    case "goals":
      return "Set measurable targets and keep progress visible across the season.";
    case "profile":
      return "Manage account details, preferences, and connected services.";
    default:
      return "";
  }
}