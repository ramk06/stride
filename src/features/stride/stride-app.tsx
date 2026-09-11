"use client";

import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  Badge,
  BottomNav,
  EmptyState,
  ErrorState,
  FormField,
  IconChip,
  PreviewModePicker,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  SecondaryButton,
  SelectInput,
  SkeletonCard,
  SurfaceCard,
  TextAreaInput,
  TextInput,
  cx,
} from "@/components/stride/ui";
import { defaultGoalForm, goalTypeOptions } from "./sample-data";
import {
  submitGearDraft,
  submitGoalDraft,
  useActivities,
  useActivityDetails,
  useConversation,
  useDashboard,
  useGear,
  useGoals,
  useProfile,
  useStravaConnection,
} from "./hooks";
import type {
  ActivitySummary,
  ActivityType,
  GearFormInput,
  GearSummary,
  GoalFormInput,
  GoalSummary,
  MutationOutcome,
  PreviewMode,
  ResourceState,
  StravaView,
  TabId,
} from "./types";

type OverlayState =
  | { type: "activity"; activityId: string }
  | { type: "gear-form" }
  | { type: "goal-form" }
  | { type: "strava" }
  | { type: "ai" }
  | null;

type SubmissionState = "idle" | "submitting" | "success" | "error";

const initialPreviewModes: Record<TabId, PreviewMode> = {
  dashboard: "success",
  activities: "success",
  gear: "success",
  goals: "success",
  profile: "success",
};

const initialGearForm: GearFormInput = {
  type: "running-shoes",
  brand: "",
  model: "",
  name: "",
  purchaseDate: "",
  startingMileageKm: "0",
  expectedMileageKm: "700",
  notes: "",
  imageUrl: "",
};

export function StrideApp() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [previewModes, setPreviewModes] = useState(initialPreviewModes);
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [goalScope, setGoalScope] = useState<"active" | "completed">("active");
  const [gearCategory, setGearCategory] = useState<
    "all" | "running-shoes" | "watch" | "accessory" | "other"
  >("all");
  const [routePreview, setRoutePreview] = useState<
    "route" | "loading" | "empty" | "error"
  >("route");
  const [stravaView, setStravaView] = useState<StravaView>("connected");
  const [aiDraft, setAiDraft] = useState("");
  const [gearForm, setGearForm] = useState(initialGearForm);
  const [gearErrors, setGearErrors] = useState<Record<string, string>>({});
  const [gearSubmissionState, setGearSubmissionState] = useState<SubmissionState>("idle");
  const [gearSubmissionCopy, setGearSubmissionCopy] = useState({
    title: "",
    description: "",
  });
  const [gearOutcome, setGearOutcome] = useState<MutationOutcome>("ready");
  const [goalForm, setGoalForm] = useState<GoalFormInput>(defaultGoalForm);
  const [goalErrors, setGoalErrors] = useState<Record<string, string>>({});
  const [goalSubmissionState, setGoalSubmissionState] = useState<SubmissionState>("idle");
  const [goalSubmissionCopy, setGoalSubmissionCopy] = useState({
    title: "",
    description: "",
  });
  const [goalOutcome, setGoalOutcome] = useState<MutationOutcome>("ready");

  const selectedActivityId =
    overlay?.type === "activity" ? overlay.activityId : "activity-intervals";

  const dashboard = useDashboard(previewModes.dashboard);
  const activities = useActivities(previewModes.activities);
  const activityDetail = useActivityDetails(selectedActivityId, previewModes.activities);
  const gear = useGear(previewModes.gear);
  const goals = useGoals(previewModes.goals);
  const profile = useProfile(previewModes.profile);
  const strava = useStravaConnection(stravaView);
  const ai = useConversation(previewModes.profile);

  const filteredActivities = useMemo(() => {
    if (activities.status !== "success" && activities.status !== "offline") {
      return [] as ActivitySummary[];
    }

    return activities.data.activities.filter((activity) => {
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
  }, [activities, activityFilter, activitySearch]);

  const scopedGoals = useMemo(() => {
    if (goals.status !== "success" && goals.status !== "offline") {
      return [] as GoalSummary[];
    }

    return goals.data.goals.filter((goal) => goal.status === goalScope);
  }, [goals, goalScope]);

  const filteredGear = useMemo(() => {
    if (gear.status !== "success" && gear.status !== "offline") {
      return [] as GearSummary[];
    }

    return gear.data.gear.filter((item) => {
      return gearCategory === "all" ? true : item.type === gearCategory;
    });
  }, [gear, gearCategory]);

  function updatePreviewMode(mode: PreviewMode) {
    setPreviewModes((current) => ({ ...current, [activeTab]: mode }));
  }

  function navigateTab(tab: TabId) {
    setOverlay(null);
    setActiveTab(tab);
  }

  function validateGearForm() {
    const nextErrors: Record<string, string> = {};

    if (!gearForm.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!gearForm.model.trim()) nextErrors.model = "Model is required.";
    if (!gearForm.name.trim()) nextErrors.name = "Name is required.";
    if (!gearForm.purchaseDate) nextErrors.purchaseDate = "Purchase date is required.";
    if (!gearForm.expectedMileageKm.trim()) {
      nextErrors.expectedMileageKm = "Expected mileage is required.";
    }

    setGearErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGearSubmit() {
    if (!validateGearForm()) {
      setGearSubmissionState("error");
      setGearSubmissionCopy({
        title: "Fix form issues",
        description: "Stride will not send an invalid gear payload to the future API.",
      });
      return;
    }

    setGearSubmissionState("submitting");
    const result = await submitGearDraft(gearForm, gearOutcome);

    setGearSubmissionState(result.status === "success" ? "success" : "error");
    setGearSubmissionCopy({ title: result.title, description: result.description });
  }

  function validateGoalForm() {
    const nextErrors: Record<string, string> = {};

    if (!goalForm.title.trim()) nextErrors.title = "Goal title is required.";
    if (!goalForm.targetDate) nextErrors.targetDate = "Target date is required.";

    const needsDistance = [
      "5K",
      "10K",
      "Half Marathon",
      "Marathon",
      "Weekly Distance",
      "Monthly Distance",
      "Custom Goal",
    ].includes(goalForm.type);

    if (needsDistance && !goalForm.targetDistanceKm.trim()) {
      nextErrors.targetDistanceKm = "Target distance is required for this goal type.";
    }

    if (goalForm.type === "Target Pace" && !goalForm.targetPace.trim()) {
      nextErrors.targetPace = "Target pace is required.";
    }

    setGoalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGoalSubmit() {
    if (!validateGoalForm()) {
      setGoalSubmissionState("error");
      setGoalSubmissionCopy({
        title: "Fix form issues",
        description: "Stride keeps goal validation in the UI boundary before API submission.",
      });
      return;
    }

    setGoalSubmissionState("submitting");
    const result = await submitGoalDraft(goalForm, goalOutcome);

    setGoalSubmissionState(result.status === "success" ? "success" : "error");
    setGoalSubmissionCopy({ title: result.title, description: result.description });
  }

  return (
    <div className="min-h-screen bg-background px-0 sm:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background sm:border-x sm:border-border sm:bg-surface sm:shadow-[0_30px_80px_rgba(13,27,47,0.10)]">
        {overlay ? renderOverlay() : null}
        {!overlay ? (
          <>
            <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 pb-4 pt-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
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
                    <h1 className="font-display text-[28px] font-semibold tracking-[-0.04em] text-text">
                      {headerTitle(activeTab)}
                    </h1>
                    <p className="mt-1 text-sm text-muted">{headerSubtitle(activeTab)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOverlay({ type: "strava" })}
                  className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-left shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    sync
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Synced
                  </span>
                </button>
              </div>
            </header>

            <main className="flex-1 px-4 pb-28 pt-4">
              <div className="space-y-4">
                <PreviewModePicker
                  value={previewModes[activeTab]}
                  onChange={updatePreviewMode}
                />
                {renderTabContent()}
              </div>
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
        return renderResource(dashboard, renderDashboard);
      case "activities":
        return renderResource(activities, renderActivities);
      case "gear":
        return renderResource(gear, renderGear);
      case "goals":
        return renderResource(goals, renderGoals);
      case "profile":
        return renderResource(profile, renderProfile);
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

  function renderDashboard(data: NonNullable<typeof dashboard extends ResourceState<infer T> ? T : never>, offline?: { title: string; description: string }) {
    return (
      <div className="space-y-4">
        {offline ? (
          <SurfaceCard className="rounded-[22px] border-accent/15 bg-accent-soft/40 p-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              {offline.title}
            </p>
            <p className="mt-1 text-sm text-muted">{offline.description}</p>
          </SurfaceCard>
        ) : null}

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
              RS
            </div>
          </div>
        </SurfaceCard>

        <div className="grid grid-cols-2 gap-3">
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
                        className={cx(
                          "h-full rounded-t-[14px]",
                          day.distanceKm === 0
                            ? "bg-surface-strong/40"
                            : day.planned
                              ? "bg-accent/30"
                              : "bg-primary",
                        )}
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
                onClick={() => setActiveTab("activities")}
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
              onClick={() => setOverlay({ type: "activity", activityId: activity.id })}
              className="w-full text-left"
            >
              {renderActivityCard(activity)}
            </button>
          ))}
        </div>

        <SurfaceCard>
          <SectionHeader
            eyebrow="Goal preview"
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
                onClick={() => setActiveTab("goals")}
                className="font-semibold text-primary"
              >
                View goals
              </button>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            eyebrow="Gear preview"
            title={data.featuredGear.name}
            action={<Badge tone="warning">{data.featuredGear.statusLabel}</Badge>}
          />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{data.featuredGear.notes}</span>
            </div>
            <ProgressBar
              value={(data.featuredGear.mileageKm / data.featuredGear.targetMileageKm) * 100}
            />
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                {data.featuredGear.mileageKm} / {data.featuredGear.targetMileageKm} km
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("gear")}
                className="font-semibold text-primary"
              >
                View gear
              </button>
            </div>
          </div>
        </SurfaceCard>

        <button
          type="button"
          onClick={() => setOverlay({ type: "ai" })}
          className="w-full text-left"
        >
          <SurfaceCard className="bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex items-start gap-3">
              <IconChip icon="neurology" tone="primary" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  AI Buddy
                </p>
                <p className="mt-1 text-sm leading-6 text-text">{data.aiPrompt}</p>
              </div>
            </div>
          </SurfaceCard>
        </button>
      </div>
    );
  }

  function renderActivities(data: NonNullable<typeof activities extends ResourceState<infer T> ? T : never>, offline?: { title: string; description: string }) {
    return (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
        <SurfaceCard>
          <div className="space-y-3">
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
                    activityFilter === filter
                      ? "bg-text text-surface"
                      : "bg-surface-muted text-muted",
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
              onClick={() => setOverlay({ type: "activity", activityId: activity.id })}
              className="w-full text-left"
            >
              {renderActivityCard(activity)}
            </button>
          ))
        )}
      </div>
    );
  }

  function renderGear(data: NonNullable<typeof gear extends ResourceState<infer T> ? T : never>, offline?: { title: string; description: string }) {
    return (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
        <div className="grid grid-cols-2 gap-3">
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
          <div className="flex items-center justify-between gap-3">
            <SectionHeader eyebrow="Categories" title="Gear locker" />
            <PrimaryButton type="button" className="min-h-10 px-4 py-2 text-sm" onClick={() => setOverlay({ type: "gear-form" })}>
              Add gear
            </PrimaryButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "running-shoes", label: "Running shoes" },
              { id: "watch", label: "Watches" },
              { id: "accessory", label: "Accessories" },
              { id: "other", label: "Other" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setGearCategory(item.id as "all" | "running-shoes" | "watch" | "accessory" | "other")
                }
                className={cx(
                  "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  gearCategory === item.id ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </SurfaceCard>
        {filteredGear.map((item) => {
          const percent = item.targetMileageKm > 0 ? (item.mileageKm / item.targetMileageKm) * 100 : 0;
          const tone = item.statusLabel.includes("Approaching") ? "warning" : "accent";

          return (
            <SurfaceCard key={item.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-surface-muted font-display text-lg font-bold text-primary">
                  {item.brand.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[20px] font-semibold tracking-[-0.03em] text-text">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted">{item.categoryLabel}</p>
                    </div>
                    <Badge tone={tone === "warning" ? "warning" : "accent"}>{item.statusLabel}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>
                        {item.mileageKm} / {item.targetMileageKm || 0} km
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text">
                        {item.targetMileageKm > 0 ? `${Math.round(percent)}% used` : "Tracked"}
                      </span>
                    </div>
                    {item.targetMileageKm > 0 ? <ProgressBar value={percent} /> : null}
                    <p className="text-sm leading-6 text-muted">{item.notes}</p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    );
  }

  function renderGoals(data: NonNullable<typeof goals extends ResourceState<infer T> ? T : never>, offline?: { title: string; description: string }) {
    return (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
        <div className="grid grid-cols-2 gap-3">
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 rounded-full bg-surface-muted p-1">
              {(["active", "completed"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGoalScope(item)}
                  className={cx(
                    "rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                    goalScope === item ? "bg-surface text-primary shadow-sm" : "text-muted",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <PrimaryButton type="button" className="min-h-10 px-4 py-2 text-sm" onClick={() => setOverlay({ type: "goal-form" })}>
              New goal
            </PrimaryButton>
          </div>
        </SurfaceCard>
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
    );
  }

  function renderProfile(data: NonNullable<typeof profile extends ResourceState<infer T> ? T : never>, offline?: { title: string; description: string }) {
    return (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
        <SurfaceCard>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft font-display text-xl font-bold text-accent">
              {data.initials}
            </div>
            <div>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.04em] text-text">
                {data.name}
              </h2>
              <p className="text-sm text-muted">{data.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setOverlay({ type: "strava" })}>
                  <Badge tone="accent">Strava integration</Badge>
                </button>
                <button type="button" onClick={() => setOverlay({ type: "ai" })}>
                  <Badge tone="primary">AI Buddy</Badge>
                </button>
              </div>
            </div>
          </div>
        </SurfaceCard>
        <div className="grid grid-cols-3 gap-3">
          {data.stats.map((metric) => (
            <SurfaceCard key={metric.label} className="rounded-[22px] p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {metric.label}
              </p>
              <p className="mt-2 font-mono text-[20px] font-semibold tracking-[-0.04em] text-text">
                {metric.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">{metric.detail}</p>
            </SurfaceCard>
          ))}
        </div>
        <SurfaceCard>
          <SectionHeader eyebrow="Runner profile" title="Training preferences" />
          <div className="mt-4 space-y-3">
            {data.profileItems.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-surface-muted px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-text">{item.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Settings" title="Account and app" />
          <div className="mt-4 space-y-2">
            {data.settings.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[22px] bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-3">
                  <IconChip icon={item.icon} tone="accent" />
                  <div>
                    <p className="text-sm font-semibold text-text">{item.label}</p>
                    <p className="text-sm text-muted">{item.value}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-muted">chevron_right</span>
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Handoff" title="Backend-ready boundaries" />
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>
              Screens stay presentation-focused while feature hooks expose data contracts that can map to TanStack Query later.
            </p>
            <div className="rounded-[22px] bg-surface-muted p-4 font-mono text-[12px] leading-6 text-text">
              <p>{"DashboardScreen -> useDashboard() -> GET /v1/dashboard"}</p>
              <p>{"ActivitiesScreen -> useActivities() -> GET /v1/activities"}</p>
              <p>{"ActivityDetails -> useActivityDetails() -> GET /v1/activities/:id"}</p>
              <p>{"GearScreen -> useGear() -> GET /v1/gear"}</p>
              <p>{"GoalsScreen -> useGoals() -> GET /v1/goals"}</p>
              <p>{"ProfileScreen -> useProfile() -> GET /v1/profile"}</p>
              <p>{"StravaScreen -> useStravaConnection() -> GET /v1/strava"}</p>
              <p>{"AIBuddy -> useConversation() -> GET /v1/ai"}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  function renderActivityCard(activity: ActivitySummary) {
    return (
      <SurfaceCard className="rounded-[24px] p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone={activity.type === "run" ? "primary" : "accent"}>{activity.type}</Badge>
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
            <MetricPill icon="favorite" value={activity.heartRate ? `${activity.heartRate} bpm` : "-"} />
            <MetricPill icon="landscape" value={activity.elevationM ? `${activity.elevationM} m` : "-"} />
            <MetricPill icon="steps" value={activity.gearName ?? "Gear pending"} />
          </div>
        </div>
      </SurfaceCard>
    );
  }

  function renderOverlay() {
    if (!overlay) return null;

    const titleMap: Record<Exclude<OverlayState, null>["type"], string> = {
      activity: "Activity details",
      "gear-form": "Add gear",
      "goal-form": "Create goal",
      strava: "Strava integration",
      ai: "AI Buddy",
    };

    return (
      <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-[430px] flex-col bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 pb-4 pt-5 backdrop-blur">
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
        <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-10 pt-4">
          {overlay.type === "activity" ? renderActivityOverlay() : null}
          {overlay.type === "gear-form" ? renderGearFormOverlay() : null}
          {overlay.type === "goal-form" ? renderGoalFormOverlay() : null}
          {overlay.type === "strava" ? renderStravaOverlay() : null}
          {overlay.type === "ai" ? renderAiOverlay() : null}
        </main>
      </div>
    );
  }

  function renderActivityOverlay() {
    return renderResource(activityDetail, (data, offline) => (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
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
              <ActivityMetricCard label="Heart rate" value={data.heartRate ? `${data.heartRate} bpm` : "-"} />
              <ActivityMetricCard label="Cadence" value={data.cadenceSpm ? `${data.cadenceSpm} spm` : "-"} />
              <ActivityMetricCard label="Elevation" value={data.elevationM ? `${data.elevationM} m` : "-"} />
              <ActivityMetricCard label="Calories" value={data.calories ? `${data.calories}` : "-"} />
              <ActivityMetricCard label="Weather" value={data.weather ?? "-"} />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader eyebrow="Route" title="Map container" />
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { id: "route", label: "Route" },
              { id: "loading", label: "Loading" },
              { id: "empty", label: "No route" },
              { id: "error", label: "Error" },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoutePreview(item.id)}
                className={cx(
                  "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  routePreview === item.id ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface-muted p-4">
            {routePreview === "loading" ? (
              <div className="flex h-48 animate-pulse items-center justify-center rounded-[20px] bg-surface-strong">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Loading route tiles
                </span>
              </div>
            ) : null}
            {routePreview === "empty" ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-[20px] bg-surface">
                <span className="material-symbols-outlined text-[24px] text-muted">map</span>
                <p className="text-sm text-muted">No GPS route is available for this activity.</p>
              </div>
            ) : null}
            {routePreview === "error" ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-[20px] bg-error-soft/40">
                <span className="material-symbols-outlined text-[24px] text-error">error</span>
                <p className="text-sm text-muted">
                  Route data could not be loaded. Keep the container for future retry handling.
                </p>
              </div>
            ) : null}
            {routePreview === "route" ? (
              <div className="rounded-[20px] bg-[linear-gradient(180deg,#dff2ff_0%,#f8fbff_100%)] p-4">
                <svg viewBox="0 0 340 160" className="h-48 w-full overflow-visible rounded-[18px] bg-surface">
                  <path d={data.routePreviewPath ?? "M18 120 C80 72,140 98,206 74 S280 54,322 80"} fill="none" stroke="#0d71a9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="18" cy="120" r="8" fill="#c4511a" />
                  <circle cx="322" cy="80" r="8" fill="#12795b" />
                </svg>
                <p className="mt-3 text-sm text-muted">
                  This is a route container only. A real map provider, tile layer, and GPS polyline can be injected later.
                </p>
              </div>
            ) : null}
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
              <div key={split.kilometer} className="grid grid-cols-3 border-t border-border px-4 py-3 text-sm text-text">
                <span>{split.kilometer}</span>
                <span>{split.pace}</span>
                <span>{split.heartRate ?? "-"}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader eyebrow="Gear" title={data.gearName ?? "Gear pending"} />
          <p className="mt-4 text-sm leading-6 text-muted">
            Activity-to-gear assignment belongs in the Stride backend and can be updated later without rewriting this screen.
          </p>
        </SurfaceCard>

        <button type="button" onClick={() => setOverlay({ type: "ai" })} className="w-full text-left">
          <SurfaceCard className="bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex items-start gap-3">
              <IconChip icon="neurology" tone="primary" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  Ask AI Buddy about this run
                </p>
                <p className="mt-1 text-sm leading-6 text-text">{data.aiPrompt}</p>
              </div>
            </div>
          </SurfaceCard>
        </button>
      </div>
    ));
  }

  function renderGearFormOverlay() {
    return (
      <div className="space-y-4">
        <SurfaceCard className="border-accent/15 bg-accent-soft/40">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            Prototype adapter
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            This form validates locally and prepares a future POST /v1/gear request. It does not persist anything in the frontend.
          </p>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Add gear" title="Gear details" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FormField label="Type" error={gearErrors.type}>
              <SelectInput
                value={gearForm.type}
                onChange={(event) => setGearForm((current) => ({ ...current, type: event.target.value as GearFormInput["type"] }))}
              >
                <option value="running-shoes">Running shoes</option>
                <option value="watch">Watch</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </SelectInput>
            </FormField>
            <FormField label="Brand" error={gearErrors.brand}>
              <TextInput value={gearForm.brand} onChange={(event) => setGearForm((current) => ({ ...current, brand: event.target.value }))} placeholder="Nike" />
            </FormField>
            <FormField label="Model" error={gearErrors.model}>
              <TextInput value={gearForm.model} onChange={(event) => setGearForm((current) => ({ ...current, model: event.target.value }))} placeholder="Pegasus 41" />
            </FormField>
            <FormField label="Name" error={gearErrors.name}>
              <TextInput value={gearForm.name} onChange={(event) => setGearForm((current) => ({ ...current, name: event.target.value }))} placeholder="Daily trainer" />
            </FormField>
            <FormField label="Purchase date" error={gearErrors.purchaseDate}>
              <TextInput type="date" value={gearForm.purchaseDate} onChange={(event) => setGearForm((current) => ({ ...current, purchaseDate: event.target.value }))} />
            </FormField>
            <FormField label="Starting mileage">
              <TextInput value={gearForm.startingMileageKm} onChange={(event) => setGearForm((current) => ({ ...current, startingMileageKm: event.target.value }))} placeholder="0" />
            </FormField>
            <FormField label="Expected mileage" error={gearErrors.expectedMileageKm}>
              <TextInput value={gearForm.expectedMileageKm} onChange={(event) => setGearForm((current) => ({ ...current, expectedMileageKm: event.target.value }))} placeholder="700" />
            </FormField>
            <FormField label="Image URL">
              <TextInput value={gearForm.imageUrl} onChange={(event) => setGearForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." />
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Notes">
              <TextAreaInput value={gearForm.notes} onChange={(event) => setGearForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Rotation role, surface, or fit notes" />
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["ready", "error"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGearOutcome(item)}
                className={cx(
                  "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  gearOutcome === item ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {item === "ready" ? "Ready response" : "API unavailable"}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <SecondaryButton type="button" className="flex-1" onClick={() => setOverlay(null)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" className="flex-1" onClick={handleGearSubmit}>
              {gearSubmissionState === "submitting" ? "Preparing..." : "Prepare request"}
            </PrimaryButton>
          </div>
        </SurfaceCard>
        {gearSubmissionState !== "idle" ? (
          <SurfaceCard className={gearSubmissionState === "success" ? "border-success/20 bg-success-soft/50" : "border-error/20 bg-error-soft/40"}>
            <p className="font-display text-lg font-semibold text-text">{gearSubmissionCopy.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{gearSubmissionCopy.description}</p>
          </SurfaceCard>
        ) : null}
      </div>
    );
  }

  function renderGoalFormOverlay() {
    const showDistance = [
      "5K",
      "10K",
      "Half Marathon",
      "Marathon",
      "Weekly Distance",
      "Monthly Distance",
      "Custom Goal",
    ].includes(goalForm.type);
    const showPace = goalForm.type === "Target Pace" || ["5K", "10K", "Half Marathon", "Marathon"].includes(goalForm.type);
    const showTime = ["5K", "10K", "Half Marathon", "Marathon"].includes(goalForm.type);

    return (
      <div className="space-y-4">
        <SurfaceCard className="border-accent/15 bg-accent-soft/40">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            Goal flow
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Goal fields adapt by type. Submission prepares a future POST /v1/goals request without inventing persistence.
          </p>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Create goal" title="Target configuration" />
          <div className="mt-4 space-y-3">
            <FormField label="Goal type">
              <SelectInput
                value={goalForm.type}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    type: event.target.value as GoalFormInput["type"],
                  }))
                }
              >
                {goalTypeOptions.map((goalType) => (
                  <option key={goalType} value={goalType}>
                    {goalType}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Title" error={goalErrors.title}>
              <TextInput value={goalForm.title} onChange={(event) => setGoalForm((current) => ({ ...current, title: event.target.value }))} placeholder="10K race target" />
            </FormField>
            {showDistance ? (
              <FormField label="Target" error={goalErrors.targetDistanceKm}>
                <TextInput value={goalForm.targetDistanceKm} onChange={(event) => setGoalForm((current) => ({ ...current, targetDistanceKm: event.target.value }))} placeholder="10" />
              </FormField>
            ) : null}
            <FormField label="Target date" error={goalErrors.targetDate}>
              <TextInput type="date" value={goalForm.targetDate} onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))} />
            </FormField>
            {showPace ? (
              <FormField label="Target pace" error={goalErrors.targetPace}>
                <TextInput value={goalForm.targetPace} onChange={(event) => setGoalForm((current) => ({ ...current, targetPace: event.target.value }))} placeholder="5:00/km" />
              </FormField>
            ) : null}
            {showTime ? (
              <FormField label="Target time">
                <TextInput value={goalForm.targetTime} onChange={(event) => setGoalForm((current) => ({ ...current, targetTime: event.target.value }))} placeholder="50:00" />
              </FormField>
            ) : null}
            <FormField label="Planning cadence">
              <TextInput value={goalForm.frequency} onChange={(event) => setGoalForm((current) => ({ ...current, frequency: event.target.value }))} placeholder="Weekly check-ins" />
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["ready", "error"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGoalOutcome(item)}
                className={cx(
                  "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  goalOutcome === item ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {item === "ready" ? "Ready response" : "API unavailable"}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <SecondaryButton type="button" className="flex-1" onClick={() => setOverlay(null)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" className="flex-1" onClick={handleGoalSubmit}>
              {goalSubmissionState === "submitting" ? "Preparing..." : "Prepare request"}
            </PrimaryButton>
          </div>
        </SurfaceCard>
        {goalSubmissionState !== "idle" ? (
          <SurfaceCard className={goalSubmissionState === "success" ? "border-success/20 bg-success-soft/50" : "border-error/20 bg-error-soft/40"}>
            <p className="font-display text-lg font-semibold text-text">{goalSubmissionCopy.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{goalSubmissionCopy.description}</p>
          </SurfaceCard>
        ) : null}
      </div>
    );
  }

  function renderStravaOverlay() {
    return (
      <div className="space-y-4">
        <SurfaceCard>
          <SectionHeader eyebrow="Connection state" title="Strava through Stride API" />
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { id: "connected", label: "Connected" },
              { id: "syncing", label: "Syncing" },
              { id: "error", label: "Error" },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStravaView(item.id)}
                className={cx(
                  "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                  stravaView === item.id ? "bg-text text-surface" : "bg-surface-muted text-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] bg-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
                  {strava.status === "connected"
                    ? "Strava connected"
                    : strava.status === "syncing"
                      ? "Syncing your activities"
                      : "Sync unavailable"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">{strava.summary}</p>
              </div>
              <Badge tone={strava.status === "error" ? "error" : strava.status === "syncing" ? "warning" : "accent"}>
                {strava.status}
              </Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>Last synced: {strava.lastSynced}</p>
              <p>{strava.importWindow}</p>
              <p>{strava.coverage}</p>
            </div>
            {strava.status === "syncing" ? (
              <div className="mt-4">
                <ProgressBar value={64} />
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <PrimaryButton type="button" className="flex-1">
                {strava.status === "connected" ? "Sync activities" : "Try again"}
              </PrimaryButton>
              <SecondaryButton type="button" className="flex-1">
                {strava.status === "connected" ? "Disconnect" : "Back to profile"}
              </SecondaryButton>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Architecture" title="Backend-owned OAuth and sync" />
          <div className="mt-4 rounded-[22px] bg-surface-muted p-4 font-mono text-[12px] leading-6 text-text">
            <p>{"Mobile UI -> Stride API -> Background worker -> Strava API"}</p>
            <p>Mobile UI never holds Strava client secrets.</p>
            <p>Profile, gear, and goals remain available if Strava is unavailable.</p>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  function renderAiOverlay() {
    return renderResource(ai, (data, offline) => (
      <div className="space-y-4">
        {offline ? renderOfflineNotice(offline) : null}
        <SurfaceCard>
          <SectionHeader eyebrow="Optional feature" title={data.title} />
          <p className="mt-2 text-sm text-muted">{data.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setAiDraft(suggestion)}
                className="rounded-full bg-surface-muted px-3 py-2 text-left text-sm text-text"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <SectionHeader eyebrow="Conversation" title="Chat shell" />
          <div className="mt-4 rounded-[22px] bg-surface-muted p-4">
            <p className="text-sm leading-6 text-muted">
              AI Buddy is deliberately not faked here. Connect /v1/ai when the backend is ready and keep the rest of Stride fully usable without it.
            </p>
          </div>
          <div className="mt-4 space-y-3">
            <TextAreaInput
              value={aiDraft}
              onChange={(event) => setAiDraft(event.target.value)}
              placeholder="Write a running question to send once the AI backend is connected"
            />
            <PrimaryButton type="button" className="w-full" disabled>
              Backend required for responses
            </PrimaryButton>
          </div>
        </SurfaceCard>
      </div>
    ));
  }

  function renderOfflineNotice(offline: { title: string; description: string }) {
    return (
      <SurfaceCard className="rounded-[22px] border-accent/15 bg-accent-soft/40 p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          {offline.title}
        </p>
        <p className="mt-1 text-sm text-muted">{offline.description}</p>
      </SurfaceCard>
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
      return "How you are doing as a runner, in one glance.";
    case "activities":
      return "Training history ready for real activity APIs and detail screens.";
    case "gear":
      return "Shoes, watches, and accessories with lifecycle tracking.";
    case "goals":
      return "Race, distance, pace, and consistency targets in one flow.";
    case "profile":
      return "Runner settings, connected services, and frontend handoff details.";
    default:
      return "";
  }
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
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className={cx("mt-1 text-sm font-semibold text-text", accent && "text-primary")}>{value}</p>
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

function ActivityMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-surface-muted p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}