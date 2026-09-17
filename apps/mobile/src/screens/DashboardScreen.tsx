import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useDashboard, useGear, useGoals } from "../hooks/use-stride-data";
import { PageHeader, PrimaryButton, Screen, appPalette } from "../ui/stride-ui";

export function DashboardScreen({ onOpenGoals, onOpenSync }: { onOpenGoals: () => void; onOpenSync: () => void }) {
  const { data } = useDashboard();
  const { data: goals } = useGoals();
  const { data: gear } = useGear();

  if (!data || !goals?.[0] || !gear?.[0]) {
    return null;
  }
  const goal = goals[0];
  const primaryGear = gear[0];
  const completion = Math.round((data.summary.weeklyDistanceKm / data.summary.weeklyTargetKm) * 100);
  const dailyBars = [8.2, 6, 0, 8.2, 4, 12, 0];

  return (
    <Screen>
      <PageHeader title="Home" />
      <View style={styles.greeting}><Text style={styles.heading}>Good morning, {data.profile.name.split(" ")[0]}</Text><View style={styles.sync}><Ionicons name="flash" size={13} color={appPalette.primary} /><Text style={styles.syncText}>12M AGO</Text></View></View>
      <View style={styles.streak}><Text style={styles.streakText}>4-DAY STREAK</Text><Text style={styles.muted}>Keep the cadence high</Text></View>
      <View style={styles.metricGrid}>
        <Metric label="WEEK DIST" value={`${data.summary.weeklyDistanceKm}`} unit="km" note="+12%" icon="git-compare-outline" />
        <Metric label="AVG PACE" value={data.summary.averagePace} unit="/km" note="Stable" icon="speedometer-outline" />
        <Metric label="DURATION" value={data.summary.durationLabel} unit={`${data.summary.trainingDays} runs logged`} note="On Track" icon="timer-outline" />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>WEEKLY TARGET PROGRESS</Text><Text style={styles.progressTitle}>{data.summary.weeklyDistanceKm} km <Text style={styles.progressSub}>/ {data.summary.weeklyTargetKm}.0 km ({completion}%)</Text></Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${completion}%` }]} /></View>
        <View style={styles.bars}>{dailyBars.map((value, index) => <View key={index} style={styles.barGroup}><View style={[styles.bar, { height: Math.max(4, value * 9) }, index === 3 && styles.barActive]} /><Text style={styles.day}>{["M", "T", "W", "TH", "F", "S", "S"][index]}</Text></View>)}</View>
      </View>
      <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Latest Workout</Text><Text style={styles.action}>FULL LOG</Text></View>
      <View style={styles.card}><View style={styles.workoutTitle}><Text style={styles.dot}>●</Text><Text style={styles.cardTitle}>{data.summary.latestWorkout.title}</Text><Text style={styles.action}>IMPORTED</Text></View><Text style={styles.muted}>{data.summary.latestWorkout.dateLabel} · {data.summary.latestWorkout.location}</Text><View style={styles.workoutMetrics}><MiniMetric label="DIST" value={`${data.summary.latestWorkout.distanceKm}`} /><MiniMetric label="TIME" value={data.summary.latestWorkout.durationLabel} /><MiniMetric label="PACE" value={data.summary.latestWorkout.paceLabel.replace(" /km", "")} /><MiniMetric label="AVG HR" value={`${data.summary.latestWorkout.heartRate}`} /></View><View style={styles.routeLine} /></View>
      <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Active Race Target</Text><Text onPress={onOpenGoals} style={styles.action}>VIEW GOALS</Text></View>
      <View style={styles.compactCard}><Ionicons name="flag-outline" size={26} color={appPalette.accent} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{goal.title}</Text><Text style={styles.muted}>Target: {goal.targetKm} km · Race Date: Oct 26</Text><Text style={styles.muted}>Longest weekly prep: <Text style={styles.strong}>{goal.currentKm} km</Text></Text><View style={styles.track}><View style={[styles.fill, { width: `${goal.progressPercent}%` }]} /></View></View></View>
      <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Gear Locker</Text><Text style={styles.action}>VIEW LOCKER</Text></View>
      <View style={styles.compactCard}><Ionicons name="footsteps-outline" size={28} color={appPalette.primary} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{primaryGear.name}</Text><Text style={styles.muted}>{primaryGear.type} · Rotated on road & light trails</Text><Text style={styles.strong}>{primaryGear.mileageKm} <Text style={styles.muted}>/ {primaryGear.distanceLimitKm} KM</Text></Text><View style={styles.warningTrack}><View style={[styles.warningFill, { width: `${(primaryGear.mileageKm / primaryGear.distanceLimitKm) * 100}%` }]} /></View></View></View>
      <View style={styles.insight}><Ionicons name="bulb-outline" size={24} color="#FFFFFF" /><View style={{ flex: 1 }}><Text style={styles.insightLabel}>AI BUDDY INSIGHT</Text><Text style={styles.insightText}>Your aerobic threshold improved by <Text style={styles.strong}>4s/km</Text> over the last 3 tempo runs.</Text></View><Ionicons name="arrow-forward" size={22} color={appPalette.primary} onPress={onOpenSync} /></View>
      <PrimaryButton label="Review race goal" onPress={onOpenGoals} />
    </Screen>
  );
}

function Metric({ label, value, unit, note, icon }: { label: string; value: string; unit: string; note: string; icon: keyof typeof Ionicons.glyphMap }) { return <View style={styles.metric}><View style={styles.metricTop}><Text style={styles.label}>{label}</Text><Ionicons name={icon} size={15} color={appPalette.primary} /></View><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{unit}</Text><Text style={styles.metricNote}>{note}</Text></View>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <View><Text style={styles.label}>{label}</Text><Text style={styles.miniValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  greeting: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -4 }, heading: { color: appPalette.text, fontSize: 26, fontWeight: "700" }, sync: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: appPalette.surfaceMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, syncText: { color: appPalette.text, fontSize: 10, fontWeight: "700", letterSpacing: 1 }, streak: { flexDirection: "row", gap: 8, alignItems: "center" }, streakText: { color: appPalette.primary, backgroundColor: appPalette.surfaceHigh, borderRadius: 999, fontSize: 10, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 4 }, muted: { color: appPalette.muted, fontSize: 13 }, metricGrid: { flexDirection: "row", gap: 10 }, metric: { flex: 1, minHeight: 152, backgroundColor: appPalette.surface, borderRadius: 16, padding: 12, justifyContent: "space-between", shadowColor: "#0B1C30", shadowOpacity: .04, shadowRadius: 8, elevation: 1 }, metricTop: { flexDirection: "row", justifyContent: "space-between" }, label: { color: appPalette.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 }, metricValue: { color: appPalette.text, fontSize: 29, fontWeight: "700" }, metricNote: { color: appPalette.accent, fontSize: 11, fontWeight: "700", letterSpacing: .5 }, card: { backgroundColor: appPalette.surface, borderRadius: 16, padding: 14, gap: 9 }, progressTitle: { color: appPalette.text, fontSize: 19, fontWeight: "700" }, progressSub: { color: appPalette.muted, fontSize: 13, fontWeight: "400" }, track: { height: 9, borderRadius: 99, backgroundColor: appPalette.surfaceHigh, overflow: "hidden" }, fill: { height: "100%", borderRadius: 99, backgroundColor: appPalette.primary }, bars: { height: 96, flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end" }, barGroup: { alignItems: "center", gap: 5, flex: 1, justifyContent: "flex-end" }, bar: { backgroundColor: "#CFE1FC", borderRadius: 8, width: "58%" }, barActive: { backgroundColor: appPalette.primary }, day: { color: appPalette.muted, fontSize: 9, fontWeight: "700" }, sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionTitle: { color: appPalette.text, fontSize: 20, fontWeight: "700" }, action: { color: appPalette.primary, fontSize: 11, fontWeight: "700", letterSpacing: .8 }, workoutTitle: { flexDirection: "row", alignItems: "center", gap: 7 }, dot: { color: appPalette.primary, fontSize: 12 }, cardTitle: { color: appPalette.text, flex: 1, fontSize: 18, fontWeight: "600" }, workoutMetrics: { backgroundColor: appPalette.surfaceMuted, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", padding: 12 }, miniValue: { color: appPalette.text, fontSize: 18, fontWeight: "700" }, routeLine: { borderBottomColor: appPalette.accent, borderBottomWidth: 3, borderRadius: 99, height: 18, marginHorizontal: 10, opacity: .8 }, compactCard: { backgroundColor: appPalette.surface, borderRadius: 16, flexDirection: "row", gap: 12, padding: 14 }, strong: { color: appPalette.text, fontWeight: "700" }, warningTrack: { height: 7, borderRadius: 99, backgroundColor: appPalette.surfaceHigh, marginTop: 5, overflow: "hidden" }, warningFill: { height: "100%", backgroundColor: "#F59E0B", borderRadius: 99 }, insight: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#DCE9FF", borderRadius: 16 }, insightLabel: { color: appPalette.primary, fontSize: 10, fontWeight: "700", letterSpacing: 1 }, insightText: { color: appPalette.text, fontSize: 14, lineHeight: 19 }
});
