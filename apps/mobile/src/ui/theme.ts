import type { TextStyle } from "react-native";
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";

// Kinetic Precision palette (Stitch "Stride Running App UI" reference).
export const colors = {
  background: "#F8F9FF",
  surface: "#F8F9FF",
  surfaceLowest: "#FFFFFF",
  surfaceLow: "#EFF4FF",
  surfaceContainer: "#E5EEFF",
  surfaceHigh: "#DCE9FF",
  surfaceHighest: "#D3E4FE",
  onSurface: "#0B1C30",
  onSurfaceVariant: "#5C4037",
  outline: "#916F65",
  outlineVariant: "#E6BEB2",

  primary: "#AA3000",
  onPrimary: "#FFFFFF",
  primaryContainer: "#D43F00",
  primaryFixed: "#FFDBD0",
  primaryFixedDim: "#FFB59E",
  onPrimaryFixed: "#3A0B00",

  secondary: "#565E74",
  secondaryContainer: "#DAE2FD",
  onSecondaryContainer: "#5C647A",

  tertiary: "#006194",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#007BB9",
  tertiaryFixed: "#CCE5FF",

  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",

  inverseSurface: "#213145",
  inverseOnSurface: "#EAF1FF",

  // Accent surfaces used by the reference designs.
  strava: "#FC4C02",
  stravaSurface: "#FFF2ED",
  warning: "#F59E0B",
  warningText: "#B45309",
  warningSurface: "#FEF3C7",
  white: "#FFFFFF",
} as const;

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  margin: 16,
} as const;

export const radius = {
  lg: 8,
  xl: 12,
  xxl: 16,
  pill: 999,
} as const;

export const fonts = {
  headlineSemiBold: "SpaceGrotesk-SemiBold",
  headlineBold: "SpaceGrotesk-Bold",
  bodyRegular: "Hanken-Regular",
  bodyMedium: "Hanken-Medium",
  bodySemiBold: "Hanken-SemiBold",
  bodyBold: "Hanken-Bold",
  monoMedium: "JetBrainsMono-Medium",
  monoSemiBold: "JetBrainsMono-SemiBold",
  monoBold: "JetBrainsMono-Bold",
} as const;

// Map passed to expo-font's useFonts in App.tsx.
export const fontAssets = {
  [fonts.headlineSemiBold]: SpaceGrotesk_600SemiBold,
  [fonts.headlineBold]: SpaceGrotesk_700Bold,
  [fonts.bodyRegular]: HankenGrotesk_400Regular,
  [fonts.bodyMedium]: HankenGrotesk_500Medium,
  [fonts.bodySemiBold]: HankenGrotesk_600SemiBold,
  [fonts.bodyBold]: HankenGrotesk_700Bold,
  [fonts.monoMedium]: JetBrainsMono_500Medium,
  [fonts.monoSemiBold]: JetBrainsMono_600SemiBold,
  [fonts.monoBold]: JetBrainsMono_700Bold,
};

// Typography presets mirroring the Stitch design tokens.
export const type = {
  displayHero: {
    fontFamily: fonts.headlineBold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.1,
  },
  headlineLg: {
    fontFamily: fonts.headlineBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  headlineMd: {
    fontFamily: fonts.headlineBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  headlineSm: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.16,
  },
  bodyMd: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  labelCaps: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  telemetry: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  metricHuge: {
    fontFamily: fonts.monoBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.6,
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.22,
  },
} satisfies Record<string, TextStyle>;
