import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { useDashboard, useGear, useGoals } from "../hooks/use-stride-data";
import {
  AppHeader,
  AppText,
  Card,
  IconBadge,
  Pill,
  ProgressBar,
  Screen,
  SectionHeader,
} from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";

const weekBars = [
  { day: "M", value: 8.2, height: 0.6 },
  { day: "T", value: 6.0, height: 0.4 },
  { day: "W", value: 0, height: 0.06 },
  { day: "TH", value: 8.2, height: 0.85, today: true },
  { day: "F", value: 4.0, height: 0.14 },
  { day: "S", value: 12, height: 0.16 },
  { day: "S", value: 0, height: 0.06 },
];

export function DashboardScreen({ onOpenGoals, onOpenSync }: { onOpenGoals: () => void; onOpenSync: () => void }) {
  const { data } = useDashboard();
  const { data: goals } = useGoals();
  const { data: gear } = useGear();

  if (!data) {
    return null;
  }

  const goal = goals?.[0];
  const primaryGear = gear?.[0];
  const latestWorkout = data.summary.latestWorkout;
  const firstName = data.profile.name.split(" ")[0] || "Runner";
  const target = data.summary.weeklyTargetKm;
  const distance = data.summary.weeklyDistanceKm;
  const completion = target ? Math.round((distance / target) * 100) : 0;
  const toGo = target ? Math.max(0, target - distance) : 0;
  const gearPercent = primaryGear?.distanceLimitKm ? Math.round((primaryGear.mileageKm / primaryGear.distanceLimitKm) * 100) : 0;

  return (
    <Screen>
      <AppHeader title="Home" />

      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="headlineMd" numberOfLines={1}>
            Good morning, {firstName}
          </AppText>
          <View style={styles.greetingMeta}>
            <Pill label="🔥 4-day streak" tone="primary" />
            <AppText variant="caption" color={colors.secondary}>
              Keep the cadence high
            </AppText>
          </View>
        </View>
        <View style={styles.syncPill}>
          <Ionicons name="flash" size={13} color={colors.strava} />
          <AppText variant="labelCaps" color={colors.onSurfaceVariant}>
            12m ago
          </AppText>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard label="Week dist" value={`${distance.toFixed(1)}`} unit="km" trend="+12%" trendColor={colors.tertiary} icon="git-compare-outline" />
        <MetricCard label="Avg pace" value={data.summary.averagePace.replace(" /km", "")} unit="/km" trend="Stable" trendColor={colors.onSurfaceVariant} icon="speedometer-outline" />
        <MetricCard label="Duration" value={data.summary.durationLabel} unit={`${data.summary.trainingDays} runs`} trend="On track" trendColor={colors.secondary} icon="timer-outline" />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <AppText variant="labelCaps" color={colors.secondary}>
              Weekly target progress
            </AppText>
            <View style={styles.baselineRow}>
              <AppText variant="headlineSm" style={styles.bold}>
                {distance.toFixed(1)} km
              </AppText>
              <AppText variant="bodySm" color={colors.secondary}>
                {target ? ` / ${target.toFixed(1)} km (${completion}%)` : " · No weekly target set"}
              </AppText>
            </View>
          </View>
          {target ? <Pill label={`${toGo.toFixed(1)} km to go`} tone="tertiary" /> : null}
        </View>
        <ProgressBar percent={completion} />
        <View style={styles.bars}>
          {weekBars.map((bar, index) => (
            <View key={index} style={styles.barGroup}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(4, bar.height * 96) },
                  bar.today ? styles.barToday : null,
                  !bar.today && bar.value === 0 ? styles.barRest : null,
                ]}
              />
              <AppText variant="caption" color={bar.today ? colors.primary : colors.secondary}>
                {bar.day}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <View>
        <SectionHeader title="Latest Workout" actionLabel="Full log" onPress={onOpenGoals} />
        {latestWorkout ? (
          <Card style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View style={styles.titleWithDot}>
                <View style={styles.dot} />
                <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1 }}>
                  {latestWorkout.title}
                </AppText>
              </View>
              <Pill label="Manual" tone="strava" icon="flash-outline" />
            </View>
            <AppText variant="caption" color={colors.secondary}>
              {latestWorkout.dateLabel} · {latestWorkout.location}
            </AppText>
            <View style={styles.bento}>
              <BentoMetric label="Dist" value={`${latestWorkout.distanceKm}`} unit="km" />
              <BentoMetric label="Time" value={latestWorkout.durationLabel} />
              <BentoMetric label="Pace" value={latestWorkout.paceLabel.replace(" /km", "")} color={colors.primary} />
              <BentoMetric label="Avg HR" value={latestWorkout.heartRate ? `${latestWorkout.heartRate}` : "—"} />
            </View>
            <View style={styles.shoeRow}>
              <View style={styles.inlineIcon}>
                <Ionicons name="footsteps-outline" size={16} color={colors.secondary} />
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  {latestWorkout.gearName}
                </AppText>
              </View>
              <AppText variant="labelCaps" color={colors.secondary}>
                {latestWorkout.elevationGainM ? `+${latestWorkout.elevationGainM}m gain` : "Logged"}
              </AppText>
            </View>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText variant="headlineSm">No runs logged yet</AppText>
            <AppText variant="bodySm" color={colors.secondary}>
              Your first manual run will appear here.
            </AppText>
          </Card>
        )}
      </View>

      <View>
        <SectionHeader title="Active Race Target" actionLabel="View goals" onPress={onOpenGoals} />
        {goal ? (
          <Card style={styles.sectionCard}>
            <View style={styles.goalTop}>
              <IconBadge icon="flag" bg={colors.tertiaryFixed} fg={colors.tertiary} />
              <View style={{ flex: 1 }}>
                <AppText variant="headlineSm" numberOfLines={1}>
                  {goal.title}
                </AppText>
                <AppText variant="bodySm" color={colors.secondary}>
                  Target {goal.targetKm} km · Ends {goal.targetDate}
                </AppText>
              </View>
              <Pill label={`T-${goal.daysRemaining} days`} tone="tertiary" />
            </View>
            <View style={styles.baselineRow}>
              <AppText variant="bodySm" color={colors.secondary}>
                Progress: <AppText variant="bodySm" color={colors.onSurface} style={styles.bold}>{goal.currentKm} km</AppText>
              </AppText>
              <AppText variant="labelCaps" color={colors.primary} style={{ marginLeft: "auto" }}>
                {goal.progressPercent}% complete
              </AppText>
            </View>
            <ProgressBar percent={goal.progressPercent} />
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText variant="headlineSm">No active goals</AppText>
            <AppText variant="bodySm" color={colors.secondary}>
              Create a goal to track progress from your runs.
            </AppText>
          </Card>
        )}
      </View>

      <View>
        <SectionHeader title="Gear Locker" actionLabel="View locker" />
        {primaryGear ? (
          <Card style={styles.sectionCard}>
            <View style={styles.goalTop}>
              <IconBadge icon="footsteps" bg={colors.surfaceHigh} fg={colors.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyLg" style={styles.semibold}>
                  {primaryGear.name}
                </AppText>
                <AppText variant="caption" color={colors.secondary}>
                  {primaryGear.type}
                </AppText>
              </View>
              {gearPercent >= 65 ? <Pill label="Replace soon" tone="warning" /> : null}
            </View>
            <View style={styles.baselineRow}>
              <AppText variant="telemetry" style={{ fontSize: 14 }}>
                {primaryGear.mileageKm}
                <AppText variant="caption" color={colors.secondary}>
                  {" "}/ {primaryGear.distanceLimitKm || "—"} km
                </AppText>
              </AppText>
              <AppText variant="labelCaps" color={colors.warningText} style={{ marginLeft: "auto" }}>
                {gearPercent}% foam
              </AppText>
            </View>
            <ProgressBar percent={gearPercent} color={colors.warning} />
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText variant="headlineSm">No gear added</AppText>
            <AppText variant="bodySm" color={colors.secondary}>
              Add your current shoes to track usage.
            </AppText>
          </Card>
        )}
      </View>

      <Card style={styles.insight}>
        <View style={styles.insightIcon}>
          <Ionicons name="sparkles" size={18} color={colors.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelCaps" color={colors.primary}>
            AI buddy insight
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurface} style={{ marginTop: 2 }}>
            Insights appear once enough Stride training data is available. Keep logging to unlock pacing guidance.
          </AppText>
        </View>
        <Ionicons name="arrow-forward" size={22} color={colors.primary} onPress={onOpenSync} />
      </Card>
    </Screen>
  );
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  trendColor,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.rowBetween}>
        <AppText variant="labelCaps" color={colors.secondary}>
          {label}
        </AppText>
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <View>
        <AppText variant="telemetry" style={styles.metricValue}>
          {value}
        </AppText>
        <AppText variant="caption" color={colors.secondary}>
          {unit}
        </AppText>
      </View>
      <AppText variant="labelCaps" color={trendColor}>
        {trend}
      </AppText>
    </View>
  );
}

function BentoMetric({ label, value, unit, color = colors.onSurface }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <View style={styles.bentoItem}>
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
  greetingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  greetingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: 6,
  },
  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metricGrid: {
    flexDirection: "row",
    gap: space.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl,
    padding: space.md,
    justifyContent: "space-between",
    gap: 8,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  metricValue: {
    fontSize: 26,
    lineHeight: 28,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  baselineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  bold: {
    fontFamily: "SpaceGrotesk-Bold",
  },
  semibold: {
    fontFamily: "Hanken-SemiBold",
  },
  bars: {
    height: 110,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 4,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  bar: {
    width: "70%",
    backgroundColor: colors.surfaceHighest,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  barToday: {
    backgroundColor: colors.primary,
  },
  barRest: {
    backgroundColor: colors.surfaceContainer,
  },
  sectionCard: {
    marginTop: space.sm,
  },
  titleWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bento: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.xl,
    padding: space.md,
  },
  bentoItem: {
    gap: 2,
  },
  shoeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  insight: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.surfaceContainer,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
