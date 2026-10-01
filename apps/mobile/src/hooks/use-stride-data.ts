import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/query-client";
import { useAppStore } from "../state/app-store";
import type { ActivitySummary, DashboardSummary, GearSummary, GoalSummary, RunnerProfile } from "../types/stride";

type ActivityView = {
  id: string;
  title: string;
  sport: "run" | "trail" | "walk";
  startedAt: string;
  distanceMeters: number;
  movingSeconds: number;
  elapsedSeconds: number;
  gearId?: string | null;
};

type GearView = {
  id: string;
  name: string;
  type: "shoe" | "equipment";
  brand: string;
  openingMileageMeters: number;
  expectedLifeMeters?: number | null;
  usageMeters: number;
  retiredAt?: string | null;
};

type GoalView = {
  id: string;
  title: string;
  type: "distance" | "count" | "longest";
  target: number;
  period: "week" | "month" | "custom";
  startsOn: string;
  endsOn: string;
  progress: number;
  archivedAt?: string | null;
};

type DashboardView = {
  distanceMeters: number;
  movingSeconds: number;
  activityCount: number;
  profile: { displayName: string; units: string; timezone: string; experience: string };
  latest: ActivityView | null;
};

const formatDuration = (seconds: number) => `${Math.floor(seconds / 3600) ? `${Math.floor(seconds / 3600)}h ` : ""}${Math.floor((seconds % 3600) / 60)}m`;
const formatPace = (activity: ActivityView) => {
  if (!activity.distanceMeters) return "-";
  const secondsPerKm = activity.movingSeconds / (activity.distanceMeters / 1000);
  return `${Math.floor(secondsPerKm / 60)}:${String(Math.round(secondsPerKm % 60)).padStart(2, "0")} /km`;
};
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const mapActivity = (activity: ActivityView): ActivitySummary => ({
  id: activity.id,
  title: activity.title,
  dateLabel: formatDate(activity.startedAt),
  distanceKm: Math.round(activity.distanceMeters / 10) / 100,
  paceLabel: formatPace(activity),
  durationLabel: formatDuration(activity.movingSeconds),
  category: activity.sport === "trail" ? "RUN" : activity.sport === "walk" ? "EASY BASE" : "RUN",
  location: "Manual activity",
  heartRate: 0,
  elevationGainM: 0,
  gearName: activity.gearId ? "Assigned gear" : "No gear assigned",
});
const mapGear = (item: GearView): GearSummary => ({
  id: item.id,
  name: item.name,
  mileageKm: Math.round(item.usageMeters / 10) / 100,
  status: item.retiredAt ? "Retired" : "Active",
  distanceLimitKm: Math.round((item.expectedLifeMeters ?? 0) / 10) / 100,
  brand: item.brand,
  type: item.type === "shoe" ? "Running shoe" : "Equipment",
  condition: item.retiredAt ? "warning" : "healthy",
});
const mapGoal = (item: GoalView): GoalSummary => ({
  id: item.id,
  title: item.title,
  targetDate: item.endsOn,
  progressPercent: item.target ? Math.min(100, Math.round((item.progress / item.target) * 100)) : 0,
  targetKm: item.type === "distance" ? item.target / 1000 : item.target,
  currentKm: item.type === "distance" ? item.progress / 1000 : item.progress,
  daysRemaining: Math.max(0, Math.ceil((new Date(`${item.endsOn}T00:00:00Z`).getTime() - Date.now()) / 86_400_000)),
  targetPace: "-",
});

function accountKey() {
  return useAppStore.getState().session?.userId ?? "signed-out";
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", accountKey()],
    queryFn: async () => {
      const data = await apiRequest<DashboardView>("/dashboard");
      const latestWorkout = data.latest ? mapActivity(data.latest) : null;
      const summary: DashboardSummary = {
        weeklyDistanceKm: data.distanceMeters / 1000,
        longRunKm: latestWorkout?.distanceKm ?? 0,
        trainingDays: data.activityCount,
        nextRaceInDays: 0,
        averagePace: latestWorkout?.paceLabel ?? "-",
        durationLabel: formatDuration(data.movingSeconds),
        weeklyTargetKm: 0,
        latestWorkout,
      };
      const profile: RunnerProfile = { name: data.profile.displayName, trainingFocus: data.profile.experience, targetRace: "No target set" };
      return { summary, profile };
    },
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["activities", accountKey()],
    queryFn: async () => (await apiRequest<{ items: ActivityView[] }>("/activities?limit=50")).items.map(mapActivity),
  });
}

export function useGear() {
  return useQuery({
    queryKey: ["gear", accountKey()],
    queryFn: async () => (await apiRequest<{ items: GearView[] }>("/gear?limit=50")).items.map(mapGear),
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals", accountKey()],
    queryFn: async () => (await apiRequest<{ items: GoalView[] }>("/goals?limit=50")).items.map(mapGoal),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile", accountKey()],
    queryFn: async () => {
      const profile = await apiRequest<DashboardView["profile"]>("/users/me/profile");
      return { name: profile.displayName, trainingFocus: profile.experience, targetRace: "No target set", email: "", initials: profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), stats: [], profileItems: [], settings: [] };
    },
  });
}
