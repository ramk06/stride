import {
  activitiesFixture,
  activityDetailsFixture,
  aiFixture,
  dashboardFixture,
  gearFixture,
  goalsFixture,
  profileFixture,
  stravaViewsFixture,
} from "./sample-data";
import type {
  ActivitiesData,
  ActivityDetail,
  DashboardData,
  FormResult,
  GearData,
  GearFormInput,
  GoalFormInput,
  GoalsData,
  MutationOutcome,
  PreviewMode,
  ProfileData,
  ResourceState,
  StravaConnectionData,
  StravaView,
  AIData,
} from "./types";

type StateCopy = { title: string; description: string };

function buildResource<T>(
  mode: PreviewMode,
  data: T,
  emptyCopy: StateCopy,
  errorCopy: StateCopy,
  offlineCopy: StateCopy,
): ResourceState<T> {
  switch (mode) {
    case "loading":
      return { status: "loading" };
    case "empty":
      return { status: "empty", ...emptyCopy };
    case "error":
      return { status: "error", ...errorCopy };
    case "offline":
      return { status: "offline", data, ...offlineCopy };
    default:
      return { status: "success", data };
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const dashboardApi = {
  getDashboard(mode: PreviewMode): ResourceState<DashboardData> {
    return buildResource(
      mode,
      dashboardFixture,
      {
        title: "No dashboard data yet",
        description:
          "Connect an activity source or add your first run to populate weekly progress.",
      },
      {
        title: "Dashboard unavailable",
        description: "Stride could not load your summary. Retry from the dashboard screen.",
      },
      {
        title: "Offline snapshot",
        description: "Showing the latest cached dashboard until Stride reconnects.",
      },
    );
  },
};

export const activitiesApi = {
  getActivities(mode: PreviewMode): ResourceState<ActivitiesData> {
    return buildResource(
      mode,
      activitiesFixture,
      {
        title: "No activities found",
        description: "Imported and manual workouts will appear here once available.",
      },
      {
        title: "Activity log unavailable",
        description: "Stride could not load activities from the current source.",
      },
      {
        title: "Offline activity log",
        description: "Showing the latest saved activities while network access is unavailable.",
      },
    );
  },

  getActivityDetail(
    activityId: string,
    mode: PreviewMode,
  ): ResourceState<ActivityDetail> {
    return buildResource(
      mode,
      activityDetailsFixture[activityId] ?? activityDetailsFixture["activity-intervals"],
      {
        title: "No activity details",
        description: "This activity has not synced detail metrics yet.",
      },
      {
        title: "Unable to load activity",
        description: "Stride could not load this activity detail screen.",
      },
      {
        title: "Offline activity snapshot",
        description: "Showing the latest known detail while waiting to reconnect.",
      },
    );
  },
};

export const gearApi = {
  getGear(mode: PreviewMode): ResourceState<GearData> {
    return buildResource(
      mode,
      gearFixture,
      {
        title: "No gear yet",
        description: "Add shoes, watches, or accessories to start tracking wear and rotation.",
      },
      {
        title: "Gear locker unavailable",
        description: "Stride could not load your gear locker.",
      },
      {
        title: "Offline gear locker",
        description: "Showing your last synced gear inventory until connectivity returns.",
      },
    );
  },

  async prepareCreateGear(
    _payload: GearFormInput,
    outcome: MutationOutcome,
  ): Promise<FormResult> {
    await wait(700);

    if (outcome === "error") {
      return {
        status: "error",
        title: "Stride API unavailable",
        description:
          "The payload is valid, but this prototype is not connected to POST /v1/gear yet. No data was saved.",
      };
    }

    return {
      status: "success",
      title: "Draft ready for backend handoff",
      description:
        "This form validated successfully and produced a request-ready payload for POST /v1/gear. No persistence occurs in this web prototype.",
    };
  },
};

export const goalsApi = {
  getGoals(mode: PreviewMode): ResourceState<GoalsData> {
    return buildResource(
      mode,
      goalsFixture,
      {
        title: "No goals yet",
        description: "Create a race, distance, pace, or custom target to start tracking progress.",
      },
      {
        title: "Goals unavailable",
        description: "Stride could not load goal progress right now.",
      },
      {
        title: "Offline goal snapshot",
        description: "Showing the last known goal progress while offline.",
      },
    );
  },

  async prepareCreateGoal(
    _payload: GoalFormInput,
    outcome: MutationOutcome,
  ): Promise<FormResult> {
    await wait(700);

    if (outcome === "error") {
      return {
        status: "error",
        title: "Goal endpoint unavailable",
        description:
          "The draft is valid, but POST /v1/goals is not wired yet in this prototype. No goal was created.",
      };
    }

    return {
      status: "success",
      title: "Goal draft ready",
      description:
        "This draft is ready for the future goals API contract. The web prototype validates the request but stores nothing.",
    };
  },
};

export const profileApi = {
  getProfile(mode: PreviewMode): ResourceState<ProfileData> {
    return buildResource(
      mode,
      profileFixture,
      {
        title: "No profile data",
        description: "Set up your runner profile to personalize goals, units, and training insights.",
      },
      {
        title: "Profile unavailable",
        description: "Stride could not load your profile settings.",
      },
      {
        title: "Offline profile snapshot",
        description: "Showing your last saved profile and preferences.",
      },
    );
  },
};

export const stravaApi = {
  getConnection(view: StravaView): StravaConnectionData {
    return stravaViewsFixture[view];
  },
};

export const aiApi = {
  getConversation(mode: PreviewMode): ResourceState<AIData> {
    return buildResource(
      mode,
      aiFixture,
      {
        title: "No AI thread yet",
        description: "Suggested questions will appear once a runner opens AI Buddy.",
      },
      {
        title: "AI Buddy unavailable",
        description: "The UI stays available, but the AI backend is currently disconnected.",
      },
      {
        title: "Offline AI shell",
        description: "Suggested prompts are available, but new responses require the backend.",
      },
    );
  },
};