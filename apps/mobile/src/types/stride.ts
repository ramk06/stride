export type TabId = "dashboard" | "activities" | "gear" | "goals" | "profile";

export type OverlayId =
  | "activity-details"
  | "add-activity"
  | "add-gear"
  | "create-goal"
  | "sync"
  | null;

export interface RunnerProfile {
  name: string;
  trainingFocus: string;
  targetRace: string;
}

export interface DashboardSummary {
  weeklyDistanceKm: number;
  longRunKm: number;
  trainingDays: number;
  nextRaceInDays: number;
  averagePace: string;
  durationLabel: string;
  weeklyTargetKm: number;
  latestWorkout: ActivitySummary | null;
}

export interface ActivitySummary {
  id: string;
  title: string;
  dateLabel: string;
  distanceKm: number;
  paceLabel: string;
  durationLabel: string;
  category: "RUN" | "AEROBIC" | "EASY BASE";
  location: string;
  heartRate: number;
  elevationGainM: number;
  gearName: string;
}

export interface GoalSummary {
  id: string;
  title: string;
  targetDate: string;
  progressPercent: number;
  targetKm: number;
  currentKm: number;
  daysRemaining: number;
  targetPace: string;
}

export interface GearSummary {
  id: string;
  name: string;
  mileageKm: number;
  status: string;
  distanceLimitKm: number;
  brand: string;
  type: string;
  condition: "warning" | "healthy" | "fresh";
}
