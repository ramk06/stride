import { PropsWithChildren } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TabId } from "../types/stride";

const palette = {
  background: "#F8F9FF",
  surface: "#FFFFFF",
  surfaceMuted: "#EFF4FF",
  surfaceHigh: "#DCE9FF",
  border: "#E5EEFF",
  text: "#0B1C30",
  muted: "#565E74",
  primary: "#AA3000",
  primaryFixed: "#FFDBD0",
  accent: "#006194",
};

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

export function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.brand}>STRIDE</Text>
      <View style={styles.pageHeaderRight}>
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>RT</Text></View>
      </View>
    </View>
  );
}

export function HeroCard({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.eyebrow}>STRIDE</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      <View style={styles.heroBody}>{children}</View>
    </View>
  );
}

export function SectionCard({ title, actionLabel, onPress, children }: PropsWithChildren<{ title: string; actionLabel?: string; onPress?: () => void }>) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel && onPress ? (
          <Pressable onPress={onPress}>
            <Text style={styles.sectionAction}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function ListItem({ title, subtitle, value, onPress }: { title: string; subtitle: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.listItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSubtitle}>{subtitle}</Text>
      </View>
      {value ? <Text style={styles.listValue}>{value}</Text> : null}
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (tab: TabId) => void }) {
  const tabs: Array<{ id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: "dashboard", label: "Home", icon: "home-outline" },
    { id: "activities", label: "Activities", icon: "heart-outline" },
    { id: "gear", label: "Gear", icon: "footsteps-outline" },
    { id: "goals", label: "Goals", icon: "flag-outline" },
    { id: "profile", label: "Profile", icon: "person-outline" },
  ];

  return (
    <SafeAreaView style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Pressable key={tab.id} onPress={() => onChange(tab.id)} style={[styles.tabItem, active ? styles.tabItemActive : null]}>
            <Ionicons name={tab.icon} size={25} style={[styles.tabIcon, active ? styles.tabIconActive : null]} />
            <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

export const appPalette = palette;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screenContent: {
    gap: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 112,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: -16,
    marginTop: -12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(248,249,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  brand: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  pageHeaderRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  pageTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "600",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: palette.primaryFixed,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 16,
    backgroundColor: palette.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  eyebrow: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: palette.muted,
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },
  heroBody: {
    marginTop: 16,
    gap: 10,
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionAction: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 14,
  },
  statValue: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  listTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },
  listSubtitle: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 3,
  },
  listValue: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    borderRadius: 999,
    minHeight: 54,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFDF7",
    fontSize: 15,
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "rgba(248,249,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 4,
  },
  tabItemActive: {
    backgroundColor: palette.surfaceMuted,
  },
  tabIcon: {
    color: palette.muted,
    height: 30,
    lineHeight: 30,
  },
  tabIconActive: {
    color: palette.primary,
  },
  tabLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: palette.primary,
  },
});
