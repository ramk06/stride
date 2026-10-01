import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, View } from "react-native";
import { AppProviders } from "./src/providers/app-providers";
import { StrideMobileApp } from "./src/stride-mobile-app";
import { colors, fontAssets } from "./src/ui/theme";

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  return (
    <AppProviders>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        {fontsLoaded ? <StrideMobileApp /> : <View style={{ flex: 1, backgroundColor: colors.background }} />}
      </SafeAreaView>
    </AppProviders>
  );
}
