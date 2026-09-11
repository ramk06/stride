import { randomUUID } from "node:crypto";
import type {
  ActivitiesData,
  ActivityDetail,
  ActivitySummary,
  DashboardData,
  GearData,
  GearFormInput,
  GearSummary,
  GoalFormInput,
  GoalSummary,
  MetricSummary,
  ProfileData,
} from "./types";
import { getDatabase, hashPassword, normalizeEmail, verifyPassword } from "./persistence";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  timezone: string;
  units: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  title: string;
  type: ActivitySummary["type"];
  started_at: string;
  location: string;
  distance_km: number;
  duration_minutes: number;
  pace_label: string;
  heart_rate: number | null;
  elevation_m: number | null;
  cadence_spm: number | null;
  calories: number | null;
  notes: string;
  gear_name: string | null;
};

type GearRow = {
  id: string;
  type: GearSummary["type"];
  brand: string;
  model: string;
  name: string;
  purchase_date: string;
  starting_mileage_km: number;
  expected_mileage_km: number;
  notes: string;
  image_url: string;
  retired_at: string | null;
};

type GoalRow = {
  id: string;
  type: GoalSummary["type"];
  title: string;
  target_distance_km: number;
  target_date: string;
  target_pace: string;
  target_time: string;
  frequency: string;
  status: GoalSummary["status"];
};

export type ActivityFormInput = {
  title: string;
  type: ActivitySummary["type"];
  startedAt: string;
  location: string;
  distanceKm: string;
  durationMinutes: string;
  heartRate: string;
  elevationM: string;
  cadenceSpm: string;
  calories: string;
  notes: string;
};

function nowIso() {
  return new Date().toISOString();
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(value),
  );
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
  }

  return `${remainder} min`;
}

function formatPace(distanceKm: number, durationMinutes: number) {
  const secondsPerKm = Math.round((durationMinutes * 60) / distanceKm);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

function getUserById(userId: string) {
  return getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRow | undefined;
}

function getActivityRows(userId: string) {
  return getDatabase()
    .prepare(
      `
        SELECT activities.*, gear.name AS gear_name
        FROM activities
        LEFT JOIN activity_gear_assignments ON activity_gear_assignments.activity_id = activities.id
        LEFT JOIN gear ON gear.id = activity_gear_assignments.gear_id
        WHERE activities.user_id = ?
        ORDER BY activities.started_at DESC
      `,
    )
    .all(userId) as ActivityRow[];
}

function getGearRows(userId: string) {
  return getDatabase()
    .prepare(
      `
        SELECT *
        FROM gear
        WHERE user_id = ?
        ORDER BY retired_at IS NOT NULL, created_at DESC
      `,
    )
    .all(userId) as GearRow[];
}

function getGoalRows(userId: string) {
  return getDatabase()
    .prepare(
      `
        SELECT *
        FROM goals
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
    )
    .all(userId) as GoalRow[];
}

function categoryLabel(type: GearSummary["type"]) {
  switch (type) {
    case "running-shoes":
      return "Running shoes";
    case "watch":
      return "Watch";
    case "accessory":
      return "Accessory";
    default:
      return "Other";
  }
}

function toActivitySummary(row: ActivityRow): ActivitySummary {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    label: formatShortDate(row.started_at),
    dateLabel: formatLongDate(row.started_at),
    location: row.location,
    distanceKm: row.distance_km,
    duration: formatDuration(row.duration_minutes),
    pace: row.pace_label,
    heartRate: row.heart_rate ?? undefined,
    elevationM: row.elevation_m ?? undefined,
    cadenceSpm: row.cadence_spm ?? undefined,
    calories: row.calories ?? undefined,
    gearName: row.gear_name ?? undefined,
    syncedFrom: "Stride",
    routeName: row.notes ? `${row.title} route` : undefined,
  };
}

function buildWeeklyMileage(rows: ActivityRow[]) {
  const start = new Date();
  const weekday = start.getDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  start.setDate(start.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + index);

    const distanceKm = rows.reduce((total, row) => {
      const rowDate = new Date(row.started_at);
      return rowDate.toDateString() === currentDay.toDateString() ? total + row.distance_km : total;
    }, 0);

    return {
      day: currentDay.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      distanceKm: Number(distanceKm.toFixed(1)),
    };
  });
}

function buildGearUsageMap(userId: string) {
  const rows = getDatabase()
    .prepare(
      `
        SELECT activity_gear_assignments.gear_id AS gear_id, SUM(activities.distance_km) AS total_distance
        FROM activity_gear_assignments
        INNER JOIN activities ON activities.id = activity_gear_assignments.activity_id
        WHERE activity_gear_assignments.user_id = ?
        GROUP BY activity_gear_assignments.gear_id
      `,
    )
    .all(userId) as Array<{ gear_id: string; total_distance: number | null }>;

  return new Map(rows.map((row) => [row.gear_id, Number((row.total_distance ?? 0).toFixed(1))]));
}

function toGearSummary(row: GearRow, gearUsage: Map<string, number>): GearSummary {
  const mileageKm = Number(((gearUsage.get(row.id) ?? 0) + row.starting_mileage_km).toFixed(1));
  const ratio = row.expected_mileage_km > 0 ? mileageKm / row.expected_mileage_km : 0;
  const statusLabel =
    row.expected_mileage_km <= 0
      ? "Tracked"
      : ratio >= 1
        ? "Replace now"
        : ratio >= 0.8
          ? "Approaching limit"
          : "In rotation";

  return {
    id: row.id,
    type: row.type,
    categoryLabel: categoryLabel(row.type),
    brand: row.brand,
    model: row.model,
    name: row.name,
    mileageKm,
    targetMileageKm: row.expected_mileage_km,
    statusLabel,
    notes: row.notes || `${row.brand} ${row.model}`,
  };
}

function toGoalSummary(row: GoalRow, activities: ActivityRow[]): GoalSummary {
  const totalDistance = activities.reduce((sum, activity) => sum + activity.distance_km, 0);
  const totalRuns = activities.filter((activity) => activity.type === "run").length;

  let progressPercent = 0;
  let targetLabel = row.target_date;
  let currentLabel = `${totalRuns} runs completed`;
  let remainingLabel = "Add more training sessions to move this goal forward.";

  if (row.type === "Number of Runs") {
    const targetRuns = row.target_distance_km > 0 ? row.target_distance_km : 12;
    progressPercent = targetRuns > 0 ? (totalRuns / targetRuns) * 100 : 0;
    targetLabel = `${targetRuns.toFixed(0)} runs by ${formatShortDate(row.target_date)}`;
    remainingLabel = `${Math.max(0, targetRuns - totalRuns).toFixed(0)} runs remaining`;
  } else if (row.type === "Target Pace") {
    progressPercent = activities.length > 0 ? 65 : 0;
    targetLabel = row.target_pace ? `${row.target_pace} target pace` : `Pace target by ${formatShortDate(row.target_date)}`;
    currentLabel = activities[0]?.pace_label ?? "No pace recorded yet";
    remainingLabel = row.target_pace ? `Working toward ${row.target_pace}` : "Add a target pace to track this goal.";
  } else {
    progressPercent = row.target_distance_km > 0 ? (totalDistance / row.target_distance_km) * 100 : 0;
    targetLabel = `${row.target_distance_km.toFixed(0)} km by ${formatShortDate(row.target_date)}`;
    currentLabel = `${totalDistance.toFixed(1)} km logged`;
    remainingLabel = `${Math.max(0, row.target_distance_km - totalDistance).toFixed(1)} km remaining`;
  }

  const normalized = Math.max(0, Math.min(100, Math.round(progressPercent)));

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    targetLabel,
    currentLabel,
    progressPercent: normalized,
    remainingLabel,
    targetDate: formatShortDate(row.target_date),
    status: normalized >= 100 ? "completed" : row.status,
    priority: row.frequency || undefined,
  };
}

export function registerAccount(input: { fullName: string; email: string; password: string }) {
  const database = getDatabase();
  const normalized = normalizeEmail(input.email);
  const existing = database.prepare("SELECT id FROM users WHERE email = ?").get(normalized) as
    | { id: string }
    | undefined;

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const userId = randomUUID();
  const now = nowIso();

  database
    .prepare(
      `
        INSERT INTO users (id, email, password_hash, full_name, timezone, units, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(userId, normalized, hashPassword(input.password), input.fullName.trim(), "UTC", "metric", now, now);

  seedStarterData(userId);

  return getUserById(userId)!;
}

export function signInAccount(input: { email: string; password: string }) {
  const user = getDatabase()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizeEmail(input.email)) as UserRow | undefined;

  if (!user || !verifyPassword(input.password, user.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  return user;
}

export function getDashboardData(userId: string): DashboardData {
  const user = getUserById(userId);
  const activities = getActivityRows(userId);
  const gearUsage = buildGearUsageMap(userId);
  const gear = getGearRows(userId).map((row) => toGearSummary(row, gearUsage));
  const goals = getGoalRows(userId).map((row) => toGoalSummary(row, activities));
  const weeklyMileage = buildWeeklyMileage(activities);
  const weeklyTotalKm = Number(weeklyMileage.reduce((sum, row) => sum + row.distanceKm, 0).toFixed(1));
  const featuredGear = gear.find((item) => item.targetMileageKm > 0) ?? gear[0];

  const summary: MetricSummary[] = [
    {
      label: "Weekly distance",
      value: `${weeklyTotalKm.toFixed(1)} km`,
      detail: `${activities.filter((row) => row.type === "run").length} runs recorded`,
      icon: "distance",
      tone: "primary",
    },
    {
      label: "Latest pace",
      value: activities[0]?.pace_label ?? "--",
      detail: "Most recent running pace",
      icon: "speed",
      tone: "accent",
    },
    {
      label: "Active goals",
      value: `${goals.filter((goal) => goal.status === "active").length}`,
      detail: "Goals currently in progress",
      icon: "flag",
      tone: "warning",
    },
    {
      label: "Gear tracked",
      value: `${gear.length}`,
      detail: "Shoes and devices under management",
      icon: "steps",
      tone: "success",
    },
  ];

  return {
    greeting: getGreeting(),
    runnerName: user?.full_name.split(" ")[0] ?? "Runner",
    syncLabel: "Local live data",
    currentDateLabel: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    summary,
    weeklyTotalKm,
    weeklyDelta: activities.length > 0 ? "Updated now" : "Ready to start",
    weeklyMileage,
    recentActivities: activities.slice(0, 4).map(toActivitySummary),
    activeGoal:
      goals.find((goal) => goal.status === "active") ??
      {
        id: "empty-goal",
        type: "Weekly Distance",
        title: "Create your first goal",
        targetLabel: "No target configured",
        currentLabel: "0 km logged",
        progressPercent: 0,
        remainingLabel: "Create a goal to start seeing progress here.",
        targetDate: "Any time",
        status: "active",
      },
    featuredGear:
      featuredGear ??
      {
        id: "empty-gear",
        type: "running-shoes",
        categoryLabel: "Running shoes",
        brand: "Stride",
        model: "Unset",
        name: "Add your first gear item",
        mileageKm: 0,
        targetMileageKm: 500,
        statusLabel: "Tracked",
        notes: "Start with the shoes you use most often.",
      },
    aiPrompt: "",
  };
}

export function getActivitiesData(userId: string): ActivitiesData {
  const activities = getActivityRows(userId).map(toActivitySummary);
  return {
    filters: Array.from(new Set(activities.map((activity) => activity.type))),
    activities,
  };
}

export function getActivityDetailData(userId: string, activityId: string): ActivityDetail {
  const activity = getActivityRows(userId).find((row) => row.id === activityId);

  if (!activity) {
    throw new Error("Activity not found.");
  }

  return {
    ...toActivitySummary(activity),
    splits: buildSplits(activity.distance_km, activity.pace_label, activity.heart_rate ?? undefined),
    routePreviewPath: undefined,
    aiPrompt: "",
  };
}

export function createActivity(userId: string, input: ActivityFormInput) {
  const title = input.title.trim();
  const location = input.location.trim() || "Unspecified";
  const distanceKm = Number(input.distanceKm);
  const durationMinutes = Number(input.durationMinutes);

  if (!title) {
    throw new Error("Activity title is required.");
  }

  if (!input.startedAt) {
    throw new Error("Activity date is required.");
  }

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new Error("Distance must be greater than zero.");
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error("Duration must be greater than zero.");
  }

  const activityId = randomUUID();
  const now = nowIso();

  getDatabase()
    .prepare(
      `
        INSERT INTO activities (
          id, user_id, title, type, started_at, location, distance_km, duration_minutes,
          pace_label, heart_rate, elevation_m, cadence_spm, calories, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      activityId,
      userId,
      title,
      input.type,
      input.startedAt,
      location,
      distanceKm,
      durationMinutes,
      formatPace(distanceKm, durationMinutes),
      parseOptionalNumber(input.heartRate),
      parseOptionalNumber(input.elevationM),
      parseOptionalNumber(input.cadenceSpm),
      parseOptionalNumber(input.calories),
      input.notes.trim(),
      now,
      now,
    );

  return getActivityDetailData(userId, activityId);
}

export function getGearData(userId: string): GearData {
  const gearUsage = buildGearUsageMap(userId);
  const gear = getGearRows(userId).map((row) => toGearSummary(row, gearUsage));
  const assignedRuns = getActivityRows(userId).filter((activity) => activity.gear_name).length;

  return {
    metrics: [
      { label: "Tracked items", value: `${gear.length}`, detail: "Gear records available", icon: "inventory_2", tone: "accent" },
      { label: "Needs review", value: `${gear.filter((item) => item.statusLabel === "Replace now").length}`, detail: "At or over target mileage", icon: "warning", tone: "warning" },
      { label: "In rotation", value: `${gear.filter((item) => item.statusLabel === "In rotation").length}`, detail: "Ready for active use", icon: "directions_run", tone: "success" },
      { label: "Assigned runs", value: `${assignedRuns}`, detail: "Activities linked to gear", icon: "link", tone: "primary" },
    ],
    gear,
  };
}

export function createGear(userId: string, input: GearFormInput) {
  if (!input.brand.trim() || !input.model.trim() || !input.name.trim() || !input.purchaseDate) {
    throw new Error("Complete the required gear fields before saving.");
  }

  const now = nowIso();

  getDatabase()
    .prepare(
      `
        INSERT INTO gear (
          id, user_id, type, brand, model, name, purchase_date, starting_mileage_km,
          expected_mileage_km, notes, image_url, retired_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      randomUUID(),
      userId,
      input.type,
      input.brand.trim(),
      input.model.trim(),
      input.name.trim(),
      input.purchaseDate,
      parseOptionalNumber(input.startingMileageKm) ?? 0,
      parseOptionalNumber(input.expectedMileageKm) ?? 0,
      input.notes.trim(),
      input.imageUrl.trim(),
      null,
      now,
      now,
    );

  return getGearData(userId);
}

export function assignGear(userId: string, activityId: string, gearId: string) {
  const activity = getDatabase().prepare("SELECT id FROM activities WHERE id = ? AND user_id = ?").get(activityId, userId) as { id: string } | undefined;
  const gear = getDatabase().prepare("SELECT id FROM gear WHERE id = ? AND user_id = ?").get(gearId, userId) as { id: string } | undefined;

  if (!activity || !gear) {
    throw new Error("Activity or gear item was not found.");
  }

  getDatabase()
    .prepare(
      `
        INSERT INTO activity_gear_assignments (activity_id, gear_id, user_id, assigned_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(activity_id) DO UPDATE SET gear_id = excluded.gear_id, assigned_at = excluded.assigned_at
      `,
    )
    .run(activityId, gearId, userId, nowIso());

  return getActivityDetailData(userId, activityId);
}

export function getGoalsData(userId: string) {
  const activities = getActivityRows(userId);
  const goals = getGoalRows(userId).map((row) => toGoalSummary(row, activities));
  const activeGoals = goals.filter((goal) => goal.status === "active");

  return {
    metrics: [
      { label: "Active goals", value: `${activeGoals.length}`, detail: "Goals currently in progress", icon: "flag", tone: "primary" },
      { label: "Completed", value: `${goals.filter((goal) => goal.status === "completed").length}`, detail: "Goals reached so far", icon: "task_alt", tone: "success" },
      { label: "On track", value: `${activeGoals.filter((goal) => goal.progressPercent >= 60).length}`, detail: "Goals above 60% progress", icon: "trending_up", tone: "accent" },
      { label: "Needs focus", value: `${activeGoals.filter((goal) => goal.progressPercent < 60).length}`, detail: "Goals needing attention", icon: "insights", tone: "warning" },
    ],
    goals,
  };
}

export function createGoal(userId: string, input: GoalFormInput) {
  if (!input.title.trim() || !input.targetDate) {
    throw new Error("Goal title and target date are required.");
  }

  const now = nowIso();

  getDatabase()
    .prepare(
      `
        INSERT INTO goals (
          id, user_id, type, title, target_distance_km, target_date, target_pace,
          target_time, frequency, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      randomUUID(),
      userId,
      input.type,
      input.title.trim(),
      parseOptionalNumber(input.targetDistanceKm) ?? 0,
      input.targetDate,
      input.targetPace.trim(),
      input.targetTime.trim(),
      input.frequency.trim(),
      "active",
      now,
      now,
    );

  return getGoalsData(userId);
}

export function getProfileData(userId: string): ProfileData {
  const user = getUserById(userId);

  if (!user) {
    throw new Error("Profile not found.");
  }

  const activities = getActivityRows(userId);
  const gear = getGearRows(userId);
  const goals = getGoalRows(userId);

  return {
    name: user.full_name,
    email: user.email,
    initials: user.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    stats: [
      { label: "Runs", value: `${activities.filter((item) => item.type === "run").length}`, detail: "Recorded running workouts", icon: "directions_run", tone: "primary" },
      { label: "Gear", value: `${gear.length}`, detail: "Tracked gear items", icon: "steps", tone: "accent" },
      { label: "Goals", value: `${goals.length}`, detail: "Configured performance goals", icon: "flag", tone: "warning" },
    ],
    profileItems: [
      { label: "Timezone", value: user.timezone },
      { label: "Units", value: user.units === "metric" ? "Metric" : "Imperial" },
      { label: "Member since", value: formatShortDate(user.created_at) },
    ],
    settings: [
      { label: "Connected apps", value: "Manual tracking active", icon: "sync" },
      { label: "Security", value: "Hashed password and session cookie", icon: "shield_lock" },
      { label: "Storage", value: "SQLite local persistence", icon: "database" },
    ],
  };
}

export function getConnectedAppsData() {
  return {
    status: "connected" as const,
    lastSynced: "Manual tracking enabled",
    summary: "This V1 keeps your training log, goals, and gear in STRIDE first. External sync can be added later without discarding your stored data.",
    importWindow: "Manual entry",
    coverage: "Dashboard, activities, gear, goals",
  };
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function buildSplits(distanceKm: number, pace: string, heartRate?: number) {
  const totalSplits = Math.max(1, Math.round(distanceKm));
  return Array.from({ length: totalSplits }, (_, index) => ({
    kilometer: `${index + 1}`,
    pace,
    heartRate,
  }));
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function seedStarterData(userId: string) {
  const database = getDatabase();
  const createdAt = nowIso();
  const today = new Date();

  const primaryGearId = randomUUID();
  const watchGearId = randomUUID();

  database
    .prepare(
      `
        INSERT INTO gear (
          id, user_id, type, brand, model, name, purchase_date, starting_mileage_km,
          expected_mileage_km, notes, image_url, retired_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      primaryGearId,
      userId,
      "running-shoes",
      "Nike",
      "Pegasus 41",
      "Daily trainer",
      toDateInput(today),
      120,
      700,
      "Primary rotation pair for easy and steady sessions.",
      "",
      null,
      createdAt,
      createdAt,
    );

  database
    .prepare(
      `
        INSERT INTO gear (
          id, user_id, type, brand, model, name, purchase_date, starting_mileage_km,
          expected_mileage_km, notes, image_url, retired_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      watchGearId,
      userId,
      "watch",
      "Garmin",
      "Forerunner 265",
      "Race watch",
      toDateInput(today),
      0,
      0,
      "Primary watch for workouts and race pacing.",
      "",
      null,
      createdAt,
      createdAt,
    );

  const seededActivities = [
    {
      id: randomUUID(),
      title: "Tempo progression",
      type: "run" as const,
      daysAgo: 1,
      location: "City Park Loop",
      distanceKm: 8.4,
      durationMinutes: 43,
      heartRate: 161,
      elevationM: 62,
      cadenceSpm: 176,
      calories: 614,
      notes: "Last 3 km progressed toward threshold effort.",
      gearId: primaryGearId,
    },
    {
      id: randomUUID(),
      title: "Recovery run",
      type: "run" as const,
      daysAgo: 3,
      location: "Riverside path",
      distanceKm: 5.2,
      durationMinutes: 31,
      heartRate: 142,
      elevationM: 18,
      cadenceSpm: 170,
      calories: 388,
      notes: "Easy effort after strength day.",
      gearId: primaryGearId,
    },
    {
      id: randomUUID(),
      title: "Long aerobic run",
      type: "run" as const,
      daysAgo: 6,
      location: "East trail",
      distanceKm: 14.6,
      durationMinutes: 86,
      heartRate: 149,
      elevationM: 124,
      cadenceSpm: 172,
      calories: 1012,
      notes: "Comfortable effort with steady cadence.",
      gearId: primaryGearId,
    },
  ];

  const insertActivity = database.prepare(
    `
      INSERT INTO activities (
        id, user_id, title, type, started_at, location, distance_km, duration_minutes,
        pace_label, heart_rate, elevation_m, cadence_spm, calories, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );

  const assignGearStatement = database.prepare(
    `
      INSERT INTO activity_gear_assignments (activity_id, gear_id, user_id, assigned_at)
      VALUES (?, ?, ?, ?)
    `,
  );

  seededActivities.forEach((activity) => {
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - activity.daysAgo);
    startedAt.setHours(6 + activity.daysAgo, 15, 0, 0);
    const iso = startedAt.toISOString();

    insertActivity.run(
      activity.id,
      userId,
      activity.title,
      activity.type,
      iso,
      activity.location,
      activity.distanceKm,
      activity.durationMinutes,
      formatPace(activity.distanceKm, activity.durationMinutes),
      activity.heartRate,
      activity.elevationM,
      activity.cadenceSpm,
      activity.calories,
      activity.notes,
      createdAt,
      createdAt,
    );

    assignGearStatement.run(activity.id, activity.gearId, userId, createdAt);
  });

  database
    .prepare(
      `
        INSERT INTO goals (
          id, user_id, type, title, target_distance_km, target_date, target_pace,
          target_time, frequency, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      randomUUID(),
      userId,
      "Weekly Distance",
      "Hold 30 km this week",
      30,
      futureDate(14),
      "",
      "",
      "Weekly review",
      "active",
      createdAt,
      createdAt,
    );
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}