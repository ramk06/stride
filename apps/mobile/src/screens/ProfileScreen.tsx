import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { signOut } from "../lib/query-client";
import { useProfile } from "../hooks/use-stride-data";
import { AppHeader, AppText, Card, PrimaryButton, Screen } from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";

export function ProfileScreen() {
  const { data } = useProfile();

  if (!data) {
    return null;
  }

  const settings: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }> = [
    { icon: "options-outline", label: "Preferred units", value: "Metric" },
    { icon: "time-outline", label: "Timezone", value: "Asia/Kolkata" },
    { icon: "sync-outline", label: "Strava sync", value: "Connected" },
    { icon: "cloud-done-outline", label: "Backend status", value: "Secure session" },
  ];

  return (
    <Screen>
      <AppHeader title="Profile" />

      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <AppText variant="displayHero" color={colors.primary} style={styles.avatarText}>
            {data.initials || "ST"}
          </AppText>
        </View>
        <AppText variant="headlineMd">{data.name}</AppText>
        <AppText variant="bodySm" color={colors.secondary}>
          {data.trainingFocus} focus · {data.targetRace}
        </AppText>
        <View style={styles.telemetryBadge}>
          <View style={styles.pulse} />
          <AppText variant="labelCaps" color={colors.secondary}>
            Telemetry node ready
          </AppText>
        </View>
      </Card>

      <View style={styles.statRow}>
        <StatCard label="This week" value="0" unit="km" />
        <StatCard label="Activities" value="0" unit="runs" />
        <StatCard label="Streak" value="1" unit="wk" />
      </View>

      <Card style={{ gap: 0, paddingVertical: 4 }}>
        {settings.map((item, index) => (
          <View key={item.label} style={[styles.settingRow, index < settings.length - 1 && styles.settingDivider]}>
            <View style={styles.settingIcon}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <AppText variant="bodyMd" style={{ flex: 1 }}>
              {item.label}
            </AppText>
            <AppText variant="labelCaps" color={colors.secondary}>
              {item.value}
            </AppText>
          </View>
        ))}
      </Card>

      <PrimaryButton label="Sign out" onPress={() => void signOut()} icon="log-out-outline" />

      <AppText variant="caption" color={colors.secondary} style={styles.footer}>
        End-to-end encrypted telemetry · Stride v0.1
      </AppText>
    </Screen>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Card style={styles.statCard}>
      <AppText variant="labelCaps" color={colors.secondary}>
        {label}
      </AppText>
      <View style={styles.baselineRow}>
        <AppText variant="telemetry" style={{ fontSize: 24 }}>
          {value}
        </AppText>
        <AppText variant="caption" color={colors.secondary}>
          {unit}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 6,
    paddingVertical: space.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0,
  },
  telemetryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  statCard: {
    flex: 1,
    gap: 6,
  },
  baselineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 14,
  },
  settingDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    textTransform: "uppercase",
  },
});
