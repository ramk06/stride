import { PropsWithChildren, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import type { TabId } from "../types/stride";
import { useAppStore } from "../state/app-store";
import { colors, radius, space, type as typePresets } from "./theme";

type Variant = keyof typeof typePresets;

export function AppText({
  variant = "bodyMd",
  color = colors.onSurface,
  style,
  children,
  ...rest
}: TextProps & { variant?: Variant; color?: string; style?: StyleProp<TextStyle>; children?: ReactNode }) {
  return (
    <Text {...rest} style={[typePresets[variant] as TextStyle, { color }, style]}>
      {children}
    </Text>
  );
}

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function AppHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <AppText variant="headlineSm" style={styles.brand}>
        STRIDE
      </AppText>
      <View style={styles.headerRight}>
        <AppText variant="headlineSm">{title}</AppText>
        <Pressable
          accessibilityLabel="Open profile"
          onPress={() => useAppStore.getState().setActiveTab("profile")}
          style={styles.avatar}
        >
          <AppText variant="labelCaps" color={colors.primary}>
            RT
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type Tone = "primary" | "tertiary" | "neutral" | "warning" | "strava" | "dark";

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryFixed, fg: colors.primary },
  tertiary: { bg: colors.tertiaryFixed, fg: colors.tertiary },
  neutral: { bg: colors.surfaceContainer, fg: colors.secondary },
  warning: { bg: colors.warningSurface, fg: colors.warningText },
  strava: { bg: colors.stravaSurface, fg: colors.strava },
  dark: { bg: colors.onSurface, fg: colors.white },
};

export function Pill({ label, tone = "neutral", icon }: { label: string; tone?: Tone; icon?: keyof typeof Ionicons.glyphMap }) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={palette.fg} /> : null}
      <AppText variant="labelCaps" color={palette.fg} style={styles.pillText}>
        {label}
      </AppText>
    </View>
  );
}

export function ProgressBar({
  percent,
  color = colors.primary,
  track = colors.surfaceHigh,
  height = 8,
}: {
  percent: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { backgroundColor: track, height, borderRadius: height }]}>
      <View style={{ width: `${clamped}%`, height: "100%", backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onPress }: { title: string; actionLabel?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="headlineSm" color={colors.onSurface} style={styles.sectionTitle}>
        {title}
      </AppText>
      {actionLabel ? (
        <Pressable onPress={onPress} hitSlop={8} style={styles.sectionAction}>
          <AppText variant="labelCaps" color={colors.primary}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <Pressable key={tab.id} onPress={() => onChange(tab.id)} style={[styles.segmentItem, active && styles.segmentItemActive]}>
            <AppText variant="labelCaps" color={active ? colors.primary : colors.secondary}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
}: {
  chips: Array<{ id: T; label: string; icon?: keyof typeof Ionicons.glyphMap }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable key={chip.id} onPress={() => onChange(chip.id)} style={[styles.chip, active ? styles.chipActive : null]}>
            {chip.icon ? <Ionicons name={chip.icon} size={13} color={active ? colors.white : colors.secondary} /> : null}
            <AppText variant="labelCaps" color={active ? colors.white : colors.secondary}>
              {chip.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function IconBadge({
  icon,
  bg = colors.surfaceHigh,
  fg = colors.secondary,
  size = 40,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  bg?: string;
  fg?: string;
  size?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.xl, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={icon} size={size * 0.55} color={fg} />
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <AppText variant="headlineSm" color={colors.onPrimary}>
        {label}
      </AppText>
      {icon ? <Ionicons name={icon} size={18} color={colors.onPrimary} /> : null}
    </Pressable>
  );
}

export function PillButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={styles.pillButton}>
      {icon ? <Ionicons name={icon} size={17} color={colors.onPrimary} /> : null}
      <AppText variant="bodyMd" color={colors.onPrimary} style={styles.pillButtonText}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (tab: TabId) => void }) {
  const tabs: Array<{ id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "activities", label: "Activities", icon: "pulse" },
    { id: "gear", label: "Gear", icon: "footsteps" },
    { id: "goals", label: "Goals", icon: "flag" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  return (
    <SafeAreaView style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const name = (active ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap;
        return (
          <Pressable key={tab.id} onPress={() => onChange(tab.id)} style={styles.tabItem}>
            <Ionicons name={name} size={24} color={active ? colors.primary : colors.secondary} />
            <AppText variant="caption" color={active ? colors.primary : colors.secondary} style={active ? styles.tabLabelActive : undefined}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

// Legacy palette retained for overlay forms that still reference flat tokens.
export const appPalette = {
  background: colors.background,
  surface: colors.surfaceLowest,
  surfaceMuted: colors.surfaceLow,
  surfaceHigh: colors.surfaceHigh,
  border: colors.surfaceContainer,
  text: colors.onSurface,
  muted: colors.secondary,
  primary: colors.primary,
  primaryFixed: colors.primaryFixed,
  accent: colors.tertiary,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    gap: space.lg,
    paddingHorizontal: space.margin,
    paddingTop: space.md,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: -space.margin,
    marginTop: -space.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    backgroundColor: "rgba(248,249,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  brand: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primaryFixed,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xxl,
    padding: space.base,
    gap: space.md,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    letterSpacing: 0.6,
  },
  track: {
    width: "100%",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: "SpaceGrotesk-Bold",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingVertical: 9,
  },
  segmentItemActive: {
    backgroundColor: colors.surfaceLowest,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.onSurface,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  pillButtonText: {
    fontFamily: "Hanken-SemiBold",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "rgba(248,249,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
  },
  tabLabelActive: {
    fontFamily: "Hanken-SemiBold",
  },
});
