import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ActivitySummary, OverlayId } from "../types/stride";
import { appPalette } from "../ui/stride-ui";

const overlayCopy: Record<Exclude<OverlayId, null>, { title: string; body: string }> = {
  "activity-details": {
    title: "Activity details",
    body: "This screen will render route, splits, notes, and gear assignment once the mobile API contract is wired.",
  },
  "add-activity": {
    title: "Log activity",
    body: "Manual run entry is the fastest way to validate the half-marathon product before provider sync is complete.",
  },
  "add-gear": {
    title: "Add gear",
    body: "Add race shoes, daily trainers, and expected lifecycle to support half-marathon training tests.",
  },
  "create-goal": {
    title: "Create goal",
    body: "Start with Half Marathon, Weekly Distance, and Monthly Distance goals in Stride 1.0.",
  },
  sync: {
    title: "Sync status",
    body: "Keep sync state backend-owned. The mobile app should show freshness, retries, and reconnect state only.",
  },
};

export function OverlayScreen({ overlay, activity, onClose }: { overlay: Exclude<OverlayId, null>; activity?: ActivitySummary | null; onClose: () => void }) {
  const copy = overlayCopy[overlay];

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <Text style={styles.eyebrow}>STRIDE</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
        {activity ? <Text style={styles.activityMeta}>{activity.title} · {activity.distanceKm} km · {activity.paceLabel}</Text> : null}
        <Pressable onPress={onClose} style={styles.button}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 29, 26, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: appPalette.surface,
    borderWidth: 1,
    borderColor: appPalette.border,
    padding: 22,
    gap: 12,
  },
  eyebrow: {
    color: appPalette.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: appPalette.text,
    fontSize: 24,
    fontWeight: "700",
  },
  body: {
    color: appPalette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  activityMeta: {
    color: appPalette.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    marginTop: 8,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: appPalette.primary,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#FFFDF7",
    fontSize: 15,
    fontWeight: "700",
  },
});
