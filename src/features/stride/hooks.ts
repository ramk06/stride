"use client";

import { useEffect, useState } from "react";
import {
  activitiesApi,
  dashboardApi,
  gearApi,
  goalsApi,
  profileApi,
  stravaApi,
} from "./api";
import type {
  AIData,
  ActivitiesData,
  ActivityDetail,
  ActivityFormInput,
  DashboardData,
  FormResult,
  GearData,
  GearFormInput,
  GoalFormInput,
  GoalsData,
  MutationOutcome,
  ProfileData,
  PreviewMode,
  ResourceState,
  SessionUser,
  StravaConnectionData,
  StravaView,
} from "./types";

const isActivitiesEmpty = (data: ActivitiesData) => data.activities.length === 0;
const isGearEmpty = (data: GearData) => data.gear.length === 0;
const isGoalsEmpty = (data: GoalsData) => data.goals.length === 0;
const aiFallback: AIData = {
  title: "AI assistant",
  subtitle: "Keep the UI available, but do not fake model-backed coaching before the service exists.",
  suggestions: [
    "Summarize my last week of training",
    "What should I focus on before race day?",
    "How is my recovery trend looking?",
  ],
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(body.error || "Request failed.");
  }

  return body as T;
}

function useRemoteResource<T>(
  path: string | null,
  refreshKey: number,
  emptyTitle: string,
  emptyDescription: string,
  errorTitle: string,
  errorDescription: string,
  isEmpty?: (data: T) => boolean,
): ResourceState<T> {
  const requestKey = `${path ?? "none"}:${refreshKey}`;
  const [result, setResult] = useState<{ key: string; resource: ResourceState<T> }>({
    key: requestKey,
    resource: { status: "loading" },
  });

  useEffect(() => {
    if (!path) {
      return;
    }

    let active = true;

    requestJson<T>(path)
      .then((data) => {
        if (!active) {
          return;
        }

        if (isEmpty?.(data)) {
          setResult({
            key: requestKey,
            resource: { status: "empty", title: emptyTitle, description: emptyDescription },
          });
          return;
        }

        setResult({ key: requestKey, resource: { status: "success", data } });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setResult({
          key: requestKey,
          resource: {
            status: "error",
            title: errorTitle,
            description: error instanceof Error ? error.message : errorDescription,
          },
        });
      });

    return () => {
      active = false;
    };
  }, [path, requestKey, emptyDescription, emptyTitle, errorDescription, errorTitle, isEmpty]);

  return result.key === requestKey ? result.resource : { status: "loading" };
}

export function useDashboard(previewMode: PreviewMode): ResourceState<DashboardData>;
export function useDashboard(refreshKey: number): ResourceState<DashboardData>;
export function useDashboard(value: number | PreviewMode): ResourceState<DashboardData> {
  const remote = useRemoteResource<DashboardData>(
    typeof value === "number" ? "/api/dashboard" : null,
    typeof value === "number" ? value : 0,
    "No dashboard data yet",
    "Log an activity or create a goal to populate your dashboard.",
    "Dashboard unavailable",
    "Stride could not load your summary.",
  );

  return typeof value === "string" ? dashboardApi.getDashboard(value) : remote;
}

export function useActivities(previewMode: PreviewMode): ResourceState<ActivitiesData>;
export function useActivities(refreshKey: number): ResourceState<ActivitiesData>;
export function useActivities(value: number | PreviewMode): ResourceState<ActivitiesData> {
  const remote = useRemoteResource<ActivitiesData>(
    typeof value === "number" ? "/api/activities" : null,
    typeof value === "number" ? value : 0,
    "No activities yet",
    "Add your first workout to start building the training log.",
    "Activities unavailable",
    "Stride could not load your training log.",
    isActivitiesEmpty,
  );

  return typeof value === "string" ? activitiesApi.getActivities(value) : remote;
}

export function useActivityDetails(activityId: string | null, previewMode: PreviewMode): ResourceState<ActivityDetail>;
export function useActivityDetails(activityId: string | null, refreshKey: number): ResourceState<ActivityDetail>;
export function useActivityDetails(
  activityId: string | null,
  value: number | PreviewMode,
): ResourceState<ActivityDetail> {
  const remote = useRemoteResource<ActivityDetail>(
    typeof value === "number" && activityId ? `/api/activities/${activityId}` : null,
    typeof value === "number" ? value : 0,
    "No activity found",
    "Select an activity from the training log.",
    "Activity unavailable",
    "Stride could not load this activity.",
  );

  return typeof value === "string"
    ? activitiesApi.getActivityDetail(activityId ?? "activity-intervals", value)
    : remote;
}

export function useGear(previewMode: PreviewMode): ResourceState<GearData>;
export function useGear(refreshKey: number): ResourceState<GearData>;
export function useGear(value: number | PreviewMode): ResourceState<GearData> {
  const remote = useRemoteResource<GearData>(
    typeof value === "number" ? "/api/gear" : null,
    typeof value === "number" ? value : 0,
    "No gear yet",
    "Add shoes or devices to start tracking wear and rotation.",
    "Gear unavailable",
    "Stride could not load your gear locker.",
    isGearEmpty,
  );

  return typeof value === "string" ? gearApi.getGear(value) : remote;
}

export function useGoals(previewMode: PreviewMode): ResourceState<GoalsData>;
export function useGoals(refreshKey: number): ResourceState<GoalsData>;
export function useGoals(value: number | PreviewMode): ResourceState<GoalsData> {
  const remote = useRemoteResource<GoalsData>(
    typeof value === "number" ? "/api/goals" : null,
    typeof value === "number" ? value : 0,
    "No goals yet",
    "Create a measurable goal to track performance over time.",
    "Goals unavailable",
    "Stride could not load your goals.",
    isGoalsEmpty,
  );

  return typeof value === "string" ? goalsApi.getGoals(value) : remote;
}

export function useProfile(previewMode: PreviewMode): ResourceState<ProfileData>;
export function useProfile(refreshKey: number): ResourceState<ProfileData>;
export function useProfile(value: number | PreviewMode): ResourceState<ProfileData> {
  const remote = useRemoteResource<ProfileData>(
    typeof value === "number" ? "/api/profile" : null,
    typeof value === "number" ? value : 0,
    "No profile data",
    "Set up your account to continue.",
    "Profile unavailable",
    "Stride could not load your account profile.",
  );

  return typeof value === "string" ? profileApi.getProfile(value) : remote;
}

export function useStravaConnection(view: StravaView): StravaConnectionData;
export function useStravaConnection(refreshKey: number): ResourceState<StravaConnectionData>;
export function useStravaConnection(value: number | StravaView) {
  const remote = useRemoteResource<StravaConnectionData>(
    typeof value === "number" ? "/api/connections" : null,
    typeof value === "number" ? value : 0,
    "No connected app data",
    "Connected app details will appear here when available.",
    "Connections unavailable",
    "Stride could not load connected app status.",
  );

  return typeof value === "string" ? stravaApi.getConnection(value) : remote;
}

export function useConversation(mode: PreviewMode): ResourceState<AIData> {
  switch (mode) {
    case "loading":
      return { status: "loading" };
    case "empty":
      return {
        status: "empty",
        title: "No AI thread yet",
        description: "Suggested prompts appear here when the assistant feature is enabled.",
      };
    case "error":
      return {
        status: "error",
        title: "AI unavailable",
        description: "The assistant service is not connected in this V1.",
      };
    case "offline":
      return {
        status: "offline",
        data: aiFallback,
        title: "Offline AI shell",
        description: "You can browse prompts, but responses require the future backend service.",
      };
    default:
      return { status: "success", data: aiFallback };
  }
}

export async function fetchSession() {
  const response = await fetch("/api/session", { cache: "no-store" });

  if (response.status === 401) {
    return null;
  }

  const body = (await response.json()) as { user: SessionUser; error?: string };

  if (!response.ok) {
    throw new Error(body.error || "Unable to load session.");
  }

  return body.user;
}

export async function registerSession(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  await requestJson<{ ok: true }>("/api/account/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return fetchSession();
}

export async function signInSession(input: { email: string; password: string }) {
  await requestJson<{ ok: true }>("/api/account/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return fetchSession();
}

export async function signOutSession() {
  await requestJson<{ ok: true }>("/api/account/logout", { method: "POST" });
}

export async function submitActivityDraft(payload: ActivityFormInput): Promise<FormResult> {
  try {
    await requestJson<ActivityDetail>("/api/activities", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      status: "success",
      title: "Activity saved",
      description: "The workout is now part of your live training history.",
    };
  } catch (error) {
    return {
      status: "error",
      title: "Unable to save activity",
      description: error instanceof Error ? error.message : "Activity save failed.",
    };
  }
}

export async function submitGearDraft(
  payload: GearFormInput,
  _outcome?: MutationOutcome,
): Promise<FormResult> {
  void _outcome;

  try {
    await requestJson<GearData>("/api/gear", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      status: "success",
      title: "Gear saved",
      description: "This gear item is now tracked and included in mileage calculations.",
    };
  } catch (error) {
    return {
      status: "error",
      title: "Unable to save gear",
      description: error instanceof Error ? error.message : "Gear save failed.",
    };
  }
}

export async function submitGoalDraft(
  payload: GoalFormInput,
  _outcome?: MutationOutcome,
): Promise<FormResult> {
  void _outcome;

  try {
    await requestJson<GoalsData>("/api/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      status: "success",
      title: "Goal saved",
      description: "The goal is now active and visible across your dashboard.",
    };
  } catch (error) {
    return {
      status: "error",
      title: "Unable to save goal",
      description: error instanceof Error ? error.message : "Goal save failed.",
    };
  }
}

export async function submitGearAssignment(activityId: string, gearId: string): Promise<FormResult> {
  try {
    await requestJson<ActivityDetail>(`/api/activities/${activityId}/gear`, {
      method: "PUT",
      body: JSON.stringify({ gearId }),
    });

    return {
      status: "success",
      title: "Gear linked",
      description: "This activity is now assigned to the selected gear item.",
    };
  } catch (error) {
    return {
      status: "error",
      title: "Unable to link gear",
      description: error instanceof Error ? error.message : "Gear assignment failed.",
    };
  }
}