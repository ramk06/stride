export type TabId = "dashboard" | "activities" | "gear" | "goals" | "profile";

export type PreviewMode =
  | "success"
  | "loading"
  | "empty"
  | "error"
  | "offline";

export type ActivityType = "run" | "walk" | "cycling" | "hiking";

export type GearType = "running-shoes" | "watch" | "accessory" | "other";

export type GoalType =
  | "5K"
  | "10K"
  | "Half Marathon"
  | "Marathon"
  | "Weekly Distance"
  | "Monthly Distance"
  | "Number of Runs"
  | "Target Pace"
  | "Custom Goal";

export type StravaView = "connected" | "syncing" | "error";

export type MutationOutcome = "ready" | "error";

export type ResourceState<T> =
  | { status: "loading" }
  | { status: "empty"; title: string; description: string }
  | { status: "error"; title: string; description: string }
  | { status: "success"; data: T }
  | {
      status: "offline";
      data: T;
      title: string;
      description: string;
    };

export interface MetricSummary {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone?: "primary" | "accent" | "warning" | "success";
}

export interface DayMileage {
  day: string;
  distanceKm: number;
  planned?: boolean;
}

export interface ActivitySummary {
  id: string;
  title: string;
  type: ActivityType;
  label: string;
  dateLabel: string;
  location: string;
  distanceKm: number;
  duration: string;
  pace: string;
  heartRate?: number;
  elevationM?: number;
  cadenceSpm?: number;
  calories?: number;
  weather?: string;
  gearName?: string;
  syncedFrom?: "Strava" | "Stride";
  routeName?: string;
}

export interface ActivityDetail extends ActivitySummary {
  splits: Array<{
    kilometer: string;
    pace: string;
    heartRate?: number;
  }>;
  routePreviewPath?: string;
  aiPrompt: string;
}

export interface GoalSummary {
  id: string;
  type: GoalType;
  title: string;
  targetLabel: string;
  currentLabel: string;
  progressPercent: number;
  remainingLabel: string;
  targetDate: string;
  status: "active" | "completed";
  priority?: string;
}

export interface GearSummary {
  id: string;
  type: GearType;
  categoryLabel: string;
  brand: string;
  model: string;
  name: string;
  mileageKm: number;
  targetMileageKm: number;
  statusLabel: string;
  notes: string;
}

export interface DashboardData {
  greeting: string;
  runnerName: string;
  syncLabel: string;
  currentDateLabel: string;
  summary: MetricSummary[];
  weeklyTotalKm: number;
  weeklyDelta: string;
  weeklyMileage: DayMileage[];
  recentActivities: ActivitySummary[];
  activeGoal: GoalSummary;
  featuredGear: GearSummary;
  aiPrompt: string;
}

export interface ActivitiesData {
  filters: ActivityType[];
  activities: ActivitySummary[];
}

export interface GearData {
  metrics: MetricSummary[];
  gear: GearSummary[];
}

export interface GoalsData {
  metrics: MetricSummary[];
  goals: GoalSummary[];
}

export interface ProfileData {
  name: string;
  email: string;
  initials: string;
  stats: MetricSummary[];
  profileItems: Array<{ label: string; value: string }>;
  settings: Array<{ label: string; value: string; icon: string }>;
}

export interface StravaConnectionData {
  status: StravaView;
  lastSynced: string;
  summary: string;
  importWindow: string;
  coverage: string;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AIData {
  title: string;
  subtitle: string;
  suggestions: string[];
}

export interface GearFormInput {
  type: GearType;
  brand: string;
  model: string;
  name: string;
  purchaseDate: string;
  startingMileageKm: string;
  expectedMileageKm: string;
  notes: string;
  imageUrl: string;
}

export interface ActivityFormInput {
  title: string;
  type: ActivityType;
  startedAt: string;
  location: string;
  distanceKm: string;
  durationMinutes: string;
  heartRate: string;
  elevationM: string;
  cadenceSpm: string;
  calories: string;
  notes: string;
}

export interface GoalFormInput {
  type: GoalType;
  title: string;
  targetDistanceKm: string;
  targetDate: string;
  targetPace: string;
  targetTime: string;
  frequency: string;
}

export interface FormResult {
  status: "success" | "error";
  title: string;
  description: string;
}