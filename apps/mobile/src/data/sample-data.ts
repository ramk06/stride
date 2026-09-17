import type {
  ActivitySummary,
  DashboardSummary,
  GearSummary,
  GoalSummary,
  RunnerProfile,
} from "../types/stride";

export const runnerProfile: RunnerProfile = {
  name: "Rohan Togapurkar",
  trainingFocus: "Half Marathon",
  targetRace: "Pune Half Marathon",
};

export const dashboardSummary: DashboardSummary = {
  weeklyDistanceKm: 28.4,
  longRunKm: 14.6,
  trainingDays: 3,
  nextRaceInDays: 48,
  averagePace: "5:08",
  durationLabel: "2h 25m",
  weeklyTargetKm: 40,
  latestWorkout: {
    id: "run-latest",
    title: "Morning Trail Tempo Run",
    dateLabel: "Today · 6:42 AM",
    distanceKm: 8.2,
    paceLabel: "5:09 /km",
    durationLabel: "42:15",
    category: "RUN",
    location: "Sunny, 14C",
    heartRate: 156,
    elevationGainM: 114,
    gearName: "Nike Pegasus 41",
  },
};

export const activities: ActivitySummary[] = [
  {
    id: "run-1",
    title: "Progression Run",
    dateLabel: "Tue, 16 Sep",
    distanceKm: 12.4,
    paceLabel: "5:18 /km",
    durationLabel: "1:05:43",
    category: "RUN",
    location: "Track & Promenade",
    heartRate: 162,
    elevationGainM: 84,
    gearName: "Saucony Endorphin Speed 3",
  },
  {
    id: "run-2",
    title: "Easy Recovery",
    dateLabel: "Mon, 15 Sep",
    distanceKm: 6.2,
    paceLabel: "6:02 /km",
    durationLabel: "37:20",
    category: "EASY BASE",
    location: "Neighborhood South",
    heartRate: 138,
    elevationGainM: 32,
    gearName: "Nike Pegasus 41",
  },
  {
    id: "run-3",
    title: "Weekend Long Run",
    dateLabel: "Sun, 14 Sep",
    distanceKm: 18.0,
    paceLabel: "5:41 /km",
    durationLabel: "1:42:18",
    category: "AEROBIC",
    location: "River Trail Loop",
    heartRate: 148,
    elevationGainM: 165,
    gearName: "Nike Pegasus 41",
  },
];

export const goals: GoalSummary[] = [
  {
    id: "goal-half-marathon",
    title: "Autumn Half Marathon",
    targetDate: "October 26, 2026",
    progressPercent: 69,
    targetKm: 21.1,
    currentKm: 14.6,
    daysRemaining: 48,
    targetPace: "4:58",
  },
];

export const gear: GearSummary[] = [
  {
    id: "shoe-1",
    name: "Nike Pegasus 41",
    mileageKm: 487,
    status: "Approaching Replacement",
    distanceLimitKm: 700,
    brand: "Nike",
    type: "Road Daily Trainer",
    condition: "warning",
  },
  {
    id: "shoe-2",
    name: "Saucony Endorphin Speed 3",
    mileageKm: 182,
    status: "Healthy Foam Condition",
    distanceLimitKm: 600,
    brand: "Saucony",
    type: "Tempo / Speedwork",
    condition: "healthy",
  },
  {
    id: "shoe-3",
    name: "Asics Gel-Nimbus 26",
    mileageKm: 94,
    status: "Fresh Foam Condition",
    distanceLimitKm: 800,
    brand: "Asics",
    type: "Recovery / Max Cushion",
    condition: "fresh",
  },
];
