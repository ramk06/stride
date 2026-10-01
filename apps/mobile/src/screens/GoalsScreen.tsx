import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useGoals } from "../hooks/use-stride-data";
import {
  AppHeader,
  AppText,
  Card,
  IconBadge,
  Pill,
  PillButton,
  PrimaryButton,
  ProgressBar,
  SegmentedTabs,
} from "../ui/stride-ui";
import { Screen } from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";
import type { GoalSummary } from "../types/stride";

type TabId = "active" | "completed";

export function GoalsScreen({ onCreateGoal }: { onCreateGoal: () => void }) {
  const { data } = useGoals();
  const [tab, setTab] = useState<TabId>("active");

  const goals = data ?? [];

  return (
    <Screen>
      <AppHeader title="Goals" />

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="labelCaps" color={colors.secondary}>
            Targets & telemetry
          </AppText>
          <AppText variant="headlineLg">Target Matrix</AppText>
        </View>
        <PillButton label="New Goal" icon="add" onPress={onCreateGoal} />
      </View>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "active", label: `Active (${goals.length})` },
          { id: "completed", label: "Completed (0)" },
        ]}
      />

      {tab === "active" ? (
        goals.length === 0 ? (
          <Card>
            <AppText variant="headlineSm">No active goals</AppText>
            <AppText variant="bodySm" color={colors.secondary}>
              Lock a race target or a volume goal to sync your plan.
            </AppText>
          </Card>
        ) : (
          <>
            {goals.map((goal, index) => (
              <GoalCard key={goal.id} goal={goal} volume={index % 2 === 1} />
            ))}
            <Card style={styles.streak}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headlineSm" style={{ fontSize: 15 }}>
                  Consistency streak
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Keep logging to build a verified streak across the quarter.
                </AppText>
              </View>
            </Card>
          </>
        )
      ) : (
        <Card>
          <AppText variant="headlineSm">No completed goals yet</AppText>
          <AppText variant="bodySm" color={colors.secondary}>
            Finished targets and milestones will be celebrated here.
          </AppText>
        </Card>
      )}

      <PrimaryButton label="Create goal" onPress={onCreateGoal} icon="add" />
    </Screen>
  );
}

function GoalCard({ goal, volume }: { goal: GoalSummary; volume: boolean }) {
  return (
    <Card style={styles.goalCard}>
      <View style={styles.rowBetween}>
        <View style={styles.badgeRow}>
          <Pill label={volume ? "Volume" : "Race target"} tone={volume ? "tertiary" : "primary"} icon={volume ? "speedometer" : "flag"} />
          <AppText variant="labelCaps" color={colors.secondary}>
            {volume ? "Cycle" : "A-priority"}
          </AppText>
        </View>
        <View style={styles.daysPill}>
          <Ionicons name="timer-outline" size={14} color={colors.primary} />
          <AppText variant="labelCaps" color={colors.primary}>
            {goal.daysRemaining} days left
          </AppText>
        </View>
      </View>

      <View style={styles.goalTitle}>
        <IconBadge icon={volume ? "speedometer-outline" : "flag-outline"} bg={volume ? colors.tertiaryFixed : colors.primaryFixed} fg={volume ? colors.tertiary : colors.primary} size={48} />
        <View style={{ flex: 1 }}>
          <AppText variant="headlineSm" numberOfLines={1}>
            {goal.title}
          </AppText>
          <AppText variant="bodySm" color={colors.secondary}>
            Ends {goal.targetDate}
          </AppText>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Distance" value={`${goal.targetKm}`} unit="km" />
        <Metric label="Current" value={`${goal.currentKm}`} unit="km" />
        <Metric label="Target pace" value={goal.targetPace} color={colors.primary} />
      </View>

      <View style={styles.readiness}>
        <View style={styles.rowBetween}>
          <AppText variant="bodySm" color={colors.onSurface} style={styles.semibold}>
            Progress: {goal.currentKm} km
          </AppText>
          <AppText variant="labelCaps" color={colors.primary}>
            {goal.progressPercent}% ready
          </AppText>
        </View>
        <ProgressBar percent={goal.progressPercent} height={10} />
      </View>

      <Pressable style={styles.cta}>
        <AppText variant="bodyMd" color={colors.onSurface} style={styles.semibold}>
          View goal details & milestones
        </AppText>
        <Ionicons name="arrow-forward" size={16} color={colors.onSurface} />
      </Pressable>
    </Card>
  );
}

function Metric({ label, value, unit, color = colors.onSurface }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="labelCaps" color={colors.secondary}>
        {label}
      </AppText>
      <AppText variant="telemetry" color={color}>
        {value}
        {unit ? (
          <AppText variant="caption" color={colors.secondary}>
            {" "}
            {unit}
          </AppText>
        ) : null}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  goalCard: {
    gap: space.md,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  daysPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  goalTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    padding: space.md,
  },
  readiness: {
    gap: space.sm,
  },
  semibold: {
    fontFamily: "Hanken-SemiBold",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    paddingVertical: 12,
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.surfaceContainer,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
  },
});
