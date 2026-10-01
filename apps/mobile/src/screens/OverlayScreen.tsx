import { useState } from "react";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError, apiRequest, queryClient, register, requestPasswordReset, signIn } from "../lib/query-client";
import type { ActivitySummary, OverlayId } from "../types/stride";
import { AppText } from "../ui/stride-ui";
import { appPalette } from "../ui/stride-ui";
import { colors, radius, space } from "../ui/theme";

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

export function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ssoNote, setSsoNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError(null);
    setNotice(null);
    setSsoNote(null);
  }

  async function submit() {
    setError(null);
    setNotice(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (isSignup && password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (isSignup) {
        await register(trimmed, password);
        setPassword("");
        setMode("signin");
        setNotice("Account created. Check your email for a verification link, then sign in.");
      } else {
        await signIn(trimmed, password);
      }
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function forgotPassword() {
    setError(null);
    setNotice(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email first, then tap Forgot password.");
      return;
    }
    try {
      await requestPasswordReset(trimmed);
      setNotice("If that email has an account, a reset link is on its way.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to request a reset right now.");
    }
  }

  return (
    <View style={styles.loginScreen}>
      <View style={styles.loginGlow} />
      <View style={styles.hero}>
        <View style={styles.appIcon}>
          <Ionicons name="golf-outline" size={38} color={colors.primary} />
        </View>
        <AppText variant="displayHero" style={styles.loginBrand}>
          STRIDE
        </AppText>
        <AppText variant="bodyMd" color={colors.secondary}>
          Precision running telemetry & training
        </AppText>
        <View style={styles.telemetryBadge}>
          <View style={styles.pulse} />
          <AppText variant="labelCaps" color={colors.secondary}>
            Telemetry node ready
          </AppText>
        </View>
      </View>

      <View style={styles.loginCard}>
        <View style={styles.authToggle}>
          <Pressable onPress={() => switchMode("signin")} style={[styles.authToggleItem, !isSignup && styles.authToggleItemActive]}>
            <AppText variant="labelCaps" color={!isSignup ? colors.primary : colors.secondary}>
              Sign in
            </AppText>
          </Pressable>
          <Pressable onPress={() => switchMode("signup")} style={[styles.authToggleItem, isSignup && styles.authToggleItemActive]}>
            <AppText variant="labelCaps" color={isSignup ? colors.primary : colors.secondary}>
              Create account
            </AppText>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="labelCaps" color={colors.secondary}>
            Runner email / ID
          </AppText>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={19} color={colors.secondary} />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.secondary}
              style={styles.wrapInput}
              value={email}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="labelCaps" color={colors.secondary}>
            Password
          </AppText>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.secondary} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder={isSignup ? "At least 12 characters" : "Your password"}
              placeholderTextColor={colors.secondary}
              secureTextEntry
              style={styles.wrapInput}
              value={password}
            />
          </View>
          {!isSignup ? (
            <Pressable onPress={forgotPassword} style={styles.forgotLink} hitSlop={8}>
              <AppText variant="bodySm" color={colors.primary} style={styles.semibold}>
                Forgot password?
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {error ? <AppText variant="bodySm" color={colors.error}>{error}</AppText> : null}
        {notice ? <AppText variant="bodySm" color={colors.tertiary}>{notice}</AppText> : null}

        <Pressable disabled={submitting} onPress={submit} style={styles.loginButton}>
          <AppText variant="headlineSm" color={colors.onPrimary}>
            {submitting ? (isSignup ? "Creating..." : "Signing in...") : isSignup ? "Create account" : "Log in to Stride"}
          </AppText>
          <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <AppText variant="labelCaps" color={colors.secondary}>
            Or continue with
          </AppText>
          <View style={styles.dividerLine} />
        </View>

        <Pressable onPress={() => setSsoNote("Strava sign-in is coming soon.")} style={[styles.ssoButton, styles.stravaButton]}>
          <FontAwesome5 name="strava" size={17} color={colors.white} />
          <AppText variant="bodyMd" color={colors.white} style={styles.semibold}>
            Continue with Strava
          </AppText>
        </Pressable>
        <View style={styles.ssoRow}>
          <Pressable onPress={() => setSsoNote("Google sign-in is coming soon.")} style={[styles.ssoButton, styles.ssoHalf]}>
            <Ionicons name="logo-google" size={18} color={colors.onSurface} />
            <AppText variant="bodyMd" color={colors.onSurface} style={styles.semibold}>
              Google
            </AppText>
          </Pressable>
          <Pressable onPress={() => setSsoNote("Apple sign-in is coming soon.")} style={[styles.ssoButton, styles.ssoHalf]}>
            <Ionicons name="logo-apple" size={18} color={colors.onSurface} />
            <AppText variant="bodyMd" color={colors.onSurface} style={styles.semibold}>
              Apple
            </AppText>
          </Pressable>
        </View>
        {ssoNote ? (
          <AppText variant="caption" color={colors.secondary} style={{ textAlign: "center" }}>
            {ssoNote}
          </AppText>
        ) : null}
      </View>

      <Pressable onPress={() => switchMode(isSignup ? "signin" : "signup")} hitSlop={8}>
        <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center" }}>
          {isSignup ? "Already have an account? " : "New to Stride? "}
          <AppText variant="bodyMd" color={colors.primary} style={styles.semibold}>
            {isSignup ? "Sign in" : "Create account"}
          </AppText>
        </AppText>
      </Pressable>

      <View style={styles.footerTrust}>
        <Ionicons name="shield-checkmark-outline" size={15} color={colors.secondary} />
        <AppText variant="caption" color={colors.secondary} style={styles.footerTrustText}>
          End-to-end encrypted telemetry · Stride v0.1
        </AppText>
      </View>
    </View>
  );
}

function createId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === "x" ? value : (value & 3) | 8).toString(16);
  });
}

function ManualActivityForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("Morning run");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const distanceKm = Number(distance);
    const durationMinutes = Number(duration);
    if (!title.trim() || !Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setError("Enter a title, distance, and duration.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/activities", {
        method: "POST",
        body: JSON.stringify({
          id: createId(),
          title: title.trim(),
          sport: "run",
          startedAt: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          distanceMeters: Math.round(distanceKm * 1000),
          movingSeconds: Math.round(durationMinutes * 60),
          elapsedSeconds: Math.round(durationMinutes * 60),
        }),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activities"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["gear"] }),
        queryClient.invalidateQueries({ queryKey: ["goals"] }),
      ]);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to save this run. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.sheet}>
      <Text style={styles.eyebrow}>STRIDE</Text>
      <Text style={styles.title}>Log activity</Text>
      <Text style={styles.body}>Record a run directly in your Stride training log.</Text>
      <TextInput onChangeText={setTitle} placeholder="Title" placeholderTextColor={appPalette.muted} style={styles.formInput} value={title} />
      <TextInput keyboardType="decimal-pad" onChangeText={setDistance} placeholder="Distance in km" placeholderTextColor={appPalette.muted} style={styles.formInput} value={distance} />
      <TextInput keyboardType="decimal-pad" onChangeText={setDuration} placeholder="Duration in minutes" placeholderTextColor={appPalette.muted} style={styles.formInput} value={duration} />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Pressable disabled={submitting} onPress={submit} style={styles.button}><Text style={styles.buttonText}>{submitting ? "Saving..." : "Save run"}</Text></Pressable>
      <Pressable onPress={onClose} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
    </View>
  );
}

function GearForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [openingMileage, setOpeningMileage] = useState("0");
  const [expectedLife, setExpectedLife] = useState("700");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim() || !brand.trim() || Number(openingMileage) < 0 || Number(expectedLife) <= 0) {
      setError("Enter a name, brand, and valid mileage values.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/gear", { method: "POST", body: JSON.stringify({ id: createId(), name: name.trim(), brand: brand.trim(), type: "shoe", openingMileageMeters: Math.round(Number(openingMileage) * 1000), expectedLifeMeters: Math.round(Number(expectedLife) * 1000) }) });
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["gear"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to save gear. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.sheet}>
      <Text style={styles.eyebrow}>STRIDE</Text><Text style={styles.title}>Add gear</Text><Text style={styles.body}>Track mileage from the opening odometer reading onward.</Text>
      <TextInput onChangeText={setName} placeholder="Name, e.g. Daily trainer" placeholderTextColor={appPalette.muted} style={styles.formInput} value={name} />
      <TextInput onChangeText={setBrand} placeholder="Brand" placeholderTextColor={appPalette.muted} style={styles.formInput} value={brand} />
      <TextInput keyboardType="decimal-pad" onChangeText={setOpeningMileage} placeholder="Opening mileage in km" placeholderTextColor={appPalette.muted} style={styles.formInput} value={openingMileage} />
      <TextInput keyboardType="decimal-pad" onChangeText={setExpectedLife} placeholder="Expected life in km" placeholderTextColor={appPalette.muted} style={styles.formInput} value={expectedLife} />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Pressable disabled={submitting} onPress={submit} style={styles.button}><Text style={styles.buttonText}>{submitting ? "Saving..." : "Save gear"}</Text></Pressable><Pressable onPress={onClose} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
    </View>
  );
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

  async function submit() {
    const targetKm = Number(target);
    if (!title.trim() || !Number.isFinite(targetKm) || targetKm <= 0) {
      setError("Enter a title and a positive distance target.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/goals", { method: "POST", body: JSON.stringify({ id: createId(), title: title.trim(), type: "distance", target: Math.round(targetKm * 1000), period: "week", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, startsOn: start, endsOn: end }) });
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["goals"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to save goal. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.sheet}>
      <Text style={styles.eyebrow}>STRIDE</Text><Text style={styles.title}>Create goal</Text><Text style={styles.body}>Start with a weekly distance target calculated from your runs.</Text>
      <TextInput onChangeText={setTitle} placeholder="Goal title" placeholderTextColor={appPalette.muted} style={styles.formInput} value={title} />
      <TextInput keyboardType="decimal-pad" onChangeText={setTarget} placeholder="Target distance in km" placeholderTextColor={appPalette.muted} style={styles.formInput} value={target} />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Pressable disabled={submitting} onPress={submit} style={styles.button}><Text style={styles.buttonText}>{submitting ? "Saving..." : "Save goal"}</Text></Pressable><Pressable onPress={onClose} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
    </View>
  );
}

export function OverlayScreen({ overlay, activity, onClose }: { overlay: Exclude<OverlayId, null>; activity?: ActivitySummary | null; onClose: () => void }) {
  const copy = overlayCopy[overlay];

  if (overlay === "add-activity") {
    return <View style={styles.backdrop}><ManualActivityForm onClose={onClose} /></View>;
  }
  if (overlay === "add-gear") {
    return <View style={styles.backdrop}><GearForm onClose={onClose} /></View>;
  }
  if (overlay === "create-goal") {
    return <View style={styles.backdrop}><GoalForm onClose={onClose} /></View>;
  }

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
  formInput: {
    backgroundColor: appPalette.surfaceMuted,
    borderColor: appPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: appPalette.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  formError: {
    color: appPalette.primary,
    fontSize: 14,
  },
  loginScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: space.lg,
    backgroundColor: appPalette.background,
  },
  loginGlow: {
    position: "absolute",
    top: 48,
    alignSelf: "center",
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: colors.primaryFixed,
    opacity: 0.35,
  },
  hero: {
    alignItems: "center",
    gap: 6,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  loginBrand: {
    textTransform: "uppercase",
  },
  telemetryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  loginCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xxl,
    padding: space.base,
    gap: space.base,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
  },
  wrapInput: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: "Hanken-Regular",
    fontSize: 15,
    color: colors.onSurface,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  footerTrust: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerTrustText: {
    textTransform: "uppercase",
  },
  authToggle: {
    flexDirection: "row",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    padding: 4,
  },
  authToggleItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingVertical: 9,
  },
  authToggleItemActive: {
    backgroundColor: colors.surfaceLowest,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  semibold: {
    fontFamily: "Hanken-SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceHighest,
  },
  ssoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceLow,
  },
  stravaButton: {
    backgroundColor: colors.strava,
  },
  ssoRow: {
    flexDirection: "row",
    gap: 10,
  },
  ssoHalf: {
    flex: 1,
  },
  loginTitle: {
    color: appPalette.text,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 2,
  },
  input: {
    backgroundColor: appPalette.surface,
    borderColor: appPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: appPalette.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  error: {
    color: appPalette.primary,
    fontSize: 14,
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
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: appPalette.muted,
    fontSize: 15,
    fontWeight: "700",
  },
});
