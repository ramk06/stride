import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useGear } from "../hooks/use-stride-data";
import {
  AppHeader,
  AppText,
  Card,
  FilterChips,
  IconBadge,
  Pill,
  PillButton,
  PrimaryButton,
  ProgressBar,
  Screen,
} from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";
import type { GearSummary } from "../types/stride";

type CategoryId = "shoes" | "watches" | "accessories";

export function GearScreen({ onAddGear }: { onAddGear: () => void }) {
  const { data } = useGear();
  const [category, setCategory] = useState<CategoryId>("shoes");

  const gear = data ?? [];
  const totalKm = gear.reduce((sum, item) => sum + item.mileageKm, 0);

  const chips: Array<{ id: CategoryId; label: string }> = [
    { id: "shoes", label: `Running Shoes (${gear.length})` },
    { id: "watches", label: "GPS Watches (0)" },
    { id: "accessories", label: "Accessories (0)" },
  ];

  return (
    <Screen>
      <AppHeader title="Gear" />

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleWithBadge}>
            <AppText variant="headlineMd">Gear Locker</AppText>
            <View style={styles.countBadge}>
              <AppText variant="labelCaps" color={colors.onPrimaryFixed}>
                {gear.length}
              </AppText>
            </View>
          </View>
          <AppText variant="bodySm" color={colors.secondary}>
            Telemetry tracking & foam longevity
          </AppText>
        </View>
        <PillButton label="Add Gear" icon="add" onPress={onAddGear} />
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Active shoes" value={`${gear.length}`} note="In current rotation" icon="footsteps-outline" iconColor={colors.primary} />
        <SummaryCard
          label="Logged distance"
          value={totalKm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          unit="km"
          note="Across active footprint"
          icon="pulse-outline"
          iconColor={colors.tertiary}
        />
      </View>

      <FilterChips chips={chips} value={category} onChange={setCategory} />

      {category !== "shoes" || gear.length === 0 ? (
        <Card>
          <AppText variant="headlineSm">Nothing here yet</AppText>
          <AppText variant="bodySm" color={colors.secondary}>
            {category === "shoes" ? "Add your current shoes to start tracking foam longevity." : "This category is coming in a future release."}
          </AppText>
        </Card>
      ) : (
        gear.map((item) => <GearCard key={item.id} item={item} />)
      )}

      <Card style={styles.science}>
        <View style={styles.scienceIcon}>
          <Ionicons name="bulb-outline" size={22} color={colors.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="headlineSm" style={{ fontSize: 15 }}>
            Gear Longevity Science
          </AppText>
          <AppText variant="bodySm" color={colors.secondary} style={{ marginTop: 2 }}>
            Midsole foam compresses after 600–700 km. Rotating between shoes reduces repetitive strain injury risk by 39%.
          </AppText>
        </View>
      </Card>

      <PrimaryButton label="Add gear" onPress={onAddGear} icon="add" />
    </Screen>
  );
}

function GearCard({ item }: { item: GearSummary }) {
  const percent = item.distanceLimitKm ? Math.round((item.mileageKm / item.distanceLimitKm) * 100) : 0;
  const warning = percent >= 65;
  const barColor = warning ? colors.primary : colors.tertiary;
  const remaining = Math.max(0, item.distanceLimitKm - item.mileageKm);

  return (
    <Card style={styles.gearCard}>
      <View style={styles.gearTop}>
        <View style={styles.thumb}>
          <Ionicons name="footsteps-outline" size={40} color={barColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.rowBetween}>
            <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1 }}>
              {item.name}
            </AppText>
            <Pill
              label={`${percent}%`}
              tone={warning ? "primary" : "tertiary"}
              icon={warning ? "warning-outline" : "checkmark-circle-outline"}
            />
          </View>
          <AppText variant="bodySm" color={colors.secondary}>
            {item.brand} · {item.type}
          </AppText>
          <AppText variant="caption" color={barColor} style={{ marginTop: 4 }}>
            {warning ? "Approaching replacement" : "Healthy foam condition"}
          </AppText>
        </View>
      </View>

      <View style={styles.gauge}>
        <View style={styles.rowBetween}>
          <AppText variant="telemetry">
            {item.mileageKm}
            <AppText variant="labelCaps" color={colors.secondary}>
              {" "}/ {item.distanceLimitKm || "—"} km
            </AppText>
          </AppText>
          <AppText variant="labelCaps" color={barColor}>
            {remaining} km left
          </AppText>
        </View>
        <ProgressBar percent={percent} color={barColor} />
        <View style={styles.rowBetween}>
          <View style={styles.inlineIcon}>
            <Ionicons name="calendar-outline" size={14} color={colors.secondary} />
            <AppText variant="caption" color={colors.secondary}>
              Rotation active
            </AppText>
          </View>
          <View style={styles.inlineIcon}>
            <Ionicons name="walk-outline" size={14} color={colors.secondary} />
            <AppText variant="caption" color={colors.secondary}>
              {Math.max(1, Math.round(item.mileageKm / 10))} runs logged
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.logButton}>
          <AppText variant="bodySm" color={colors.onSurface} style={styles.semibold}>
            Log Details
          </AppText>
        </Pressable>
        <Pressable style={styles.retire}>
          <Ionicons name="archive-outline" size={16} color={colors.secondary} />
          <AppText variant="bodySm" color={colors.secondary}>
            Retire
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  note,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  unit?: string;
  note: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  return (
    <Card style={styles.summaryCard}>
      <View style={styles.rowBetween}>
        <AppText variant="labelCaps" color={colors.secondary}>
          {label}
        </AppText>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.baselineRow}>
        <AppText variant="metricHuge" style={styles.summaryValue}>
          {value}
        </AppText>
        {unit ? (
          <AppText variant="labelCaps" color={colors.secondary}>
            {unit}
          </AppText>
        ) : null}
      </View>
      <AppText variant="caption" color={colors.secondary}>
        {note}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: space.md,
  },
  summaryCard: {
    flex: 1,
    minHeight: 130,
    justifyContent: "space-between",
  },
  summaryValue: {
    fontSize: 34,
    lineHeight: 38,
  },
  baselineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  gearCard: {
    gap: space.md,
  },
  gearTop: {
    flexDirection: "row",
    gap: space.md,
    alignItems: "center",
  },
  thumb: {
    width: 86,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  gauge: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
  },
  inlineIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
  },
  logButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    paddingVertical: 12,
  },
  retire: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  semibold: {
    fontFamily: "Hanken-SemiBold",
  },
  science: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.surfaceHigh,
  },
  scienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
});
