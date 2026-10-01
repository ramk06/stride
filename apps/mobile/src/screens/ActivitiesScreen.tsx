import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useActivities } from "../hooks/use-stride-data";
import {
  AppHeader,
  AppText,
  Card,
  FilterChips,
  IconBadge,
  Pill,
  PrimaryButton,
  Screen,
} from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";
import type { ActivitySummary } from "../types/stride";

type FilterId = "all" | "run" | "trail" | "recovery";

export function ActivitiesScreen({
  onOpenDetails,
  onAddActivity,
}: {
  onOpenDetails: (activity: ActivitySummary) => void;
  onAddActivity: () => void;
}) {
  const { data } = useActivities();
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  const activities = data ?? [];
  const totalKm = activities.reduce((sum, item) => sum + item.distanceKm, 0);

  const visible = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "recovery" && activity.category === "EASY BASE") ||
          (filter !== "recovery" && activity.category === "RUN");
        return matchesFilter && activity.title.toLowerCase().includes(query.toLowerCase());
      }),
    [activities, filter, query],
  );

  const chips: Array<{ id: FilterId; label: string; icon?: keyof typeof Ionicons.glyphMap }> = [
    { id: "all", label: `All (${activities.length})` },
    { id: "run", label: "Run", icon: "walk-outline" },
    { id: "trail", label: "Trail" },
    { id: "recovery", label: "Recovery" },
  ];

  return (
    <Screen>
      <AppHeader title="Activities" />

      <View style={styles.titleBlock}>
        <View style={styles.rowBetween}>
          <AppText variant="headlineMd">Activities</AppText>
          <Pill label="Live log" tone="primary" />
        </View>
        <View style={styles.monthRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.primary} />
          <AppText variant="bodySm" color={colors.secondary}>
            This month ·{" "}
          </AppText>
          <AppText variant="labelCaps" color={colors.primary}>
            {totalKm.toFixed(1)} km
          </AppText>
          <AppText variant="bodySm" color={colors.secondary}>
            {" "}
            · {activities.length} runs
          </AppText>
        </View>
      </View>

      <Card style={styles.syncBanner}>
        <View style={styles.syncIcon}>
          <Ionicons name="flash" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelCaps" color={colors.onSurface}>
            Strava synced · 15m ago
          </AppText>
          <AppText variant="bodySm" color={colors.secondary} numberOfLines={1}>
            New activities import automatically
          </AppText>
        </View>
        <Ionicons name="sync-outline" size={20} color={colors.primary} />
      </Card>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.secondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search route, title, shoe, location..."
          placeholderTextColor={colors.secondary}
          style={styles.searchInput}
        />
      </View>

      <FilterChips chips={chips} value={filter} onChange={setFilter} />

      {visible.length === 0 ? (
        <Card>
          <AppText variant="headlineSm">No activities found</AppText>
          <AppText variant="bodySm" color={colors.secondary}>
            Try a different filter or log a manual run.
          </AppText>
        </Card>
      ) : (
        visible.map((activity) => (
          <Pressable key={activity.id} onPress={() => onOpenDetails(activity)}>
            <Card style={styles.activityCard}>
              <View style={styles.activityTop}>
                <IconBadge
                  icon={activity.category === "EASY BASE" ? "leaf-outline" : "speedometer-outline"}
                  bg={activity.category === "EASY BASE" ? colors.secondaryContainer : colors.primaryFixed}
                  fg={activity.category === "EASY BASE" ? colors.secondary : colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="headlineSm" numberOfLines={1}>
                    {activity.title}
                  </AppText>
                  <View style={styles.metaRow}>
                    <Pill
                      label={activity.category}
                      tone={activity.category === "EASY BASE" ? "neutral" : "primary"}
                    />
                    <AppText variant="caption" color={colors.secondary} numberOfLines={1} style={{ flex: 1 }}>
                      {activity.location} · {activity.dateLabel}
                    </AppText>
                  </View>
                </View>
              </View>

              <View style={styles.bento}>
                <Bento label="Distance" value={`${activity.distanceKm}`} unit="km" />
                <Bento label="Duration" value={activity.durationLabel} />
                <Bento label="Avg pace" value={activity.paceLabel.replace(" /km", "")} color={colors.primary} unit="/km" />
              </View>

              <View style={styles.footRow}>
                <View style={styles.inlineIcon}>
                  <Ionicons name="heart-outline" size={15} color={colors.error} />
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                    {activity.heartRate ? `${activity.heartRate} bpm` : "— bpm"}
                  </AppText>
                  <Ionicons name="trending-up-outline" size={15} color={colors.tertiary} style={{ marginLeft: 8 }} />
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                    {activity.elevationGainM ? `${activity.elevationGainM} m` : "— m"}
                  </AppText>
                </View>
                <View style={styles.inlineIcon}>
                  <Ionicons name="footsteps-outline" size={15} color={colors.secondary} />
                  <AppText variant="caption" color={colors.secondary} numberOfLines={1}>
                    {activity.gearName}
                  </AppText>
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      )}

      <PrimaryButton label="Log manual run" onPress={onAddActivity} icon="add" />
    </Screen>
  );
}

function Bento({ label, value, unit, color = colors.onSurface }: { label: string; value: string; unit?: string; color?: string }) {
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
  titleBlock: {
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  syncIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: "Hanken-Regular",
    fontSize: 15,
    color: colors.onSurface,
  },
  activityCard: {
    gap: space.md,
  },
  activityTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  bento: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.xl,
    padding: space.md,
  },
  footRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  inlineIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
});
