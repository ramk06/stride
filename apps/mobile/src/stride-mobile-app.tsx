import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivitiesScreen } from "./screens/ActivitiesScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { GearScreen } from "./screens/GearScreen";
import { GoalsScreen } from "./screens/GoalsScreen";
import { LoginScreen, OverlayScreen } from "./screens/OverlayScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { useAppStore } from "./state/app-store";
import type { ActivitySummary } from "./types/stride";
import { TabBar } from "./ui/stride-ui";

export function StrideMobileApp() {
  const activeTab = useAppStore((state) => state.activeTab);
  const overlay = useAppStore((state) => state.overlay);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const openOverlay = useAppStore((state) => state.openOverlay);
  const closeOverlay = useAppStore((state) => state.closeOverlay);
  const session = useAppStore((state) => state.session);
  const sessionHydrated = useAppStore((state) => state.sessionHydrated);
  const restoreSession = useAppStore((state) => state.restoreSession);
  const [selectedActivity, setSelectedActivity] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  if (!sessionHydrated) return <View style={{ flex: 1 }} />;
  if (!session) return <LoginScreen />;

  const content = (() => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardScreen
            onOpenGoals={() => setActiveTab("goals")}
            onOpenSync={() => openOverlay("sync")}
          />
        );
      case "activities":
        return (
          <ActivitiesScreen
            onAddActivity={() => openOverlay("add-activity")}
            onOpenDetails={(activity) => {
              setSelectedActivity(activity);
              openOverlay("activity-details");
            }}
          />
        );
      case "gear":
        return <GearScreen onAddGear={() => openOverlay("add-gear")} />;
      case "goals":
        return <GoalsScreen onCreateGoal={() => openOverlay("create-goal")} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return null;
    }
  })();

  return (
    <View style={{ flex: 1 }}>
      {content}
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      {overlay ? (
        <OverlayScreen overlay={overlay} activity={selectedActivity} onClose={closeOverlay} />
      ) : null}
    </View>
  );
}
