import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { AppProviders } from "./src/providers/app-providers";
import { StrideMobileApp } from "./src/stride-mobile-app";

export default function App() {
  return (
    <AppProviders>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FF" }}>
        <StatusBar style="dark" />
        <StrideMobileApp />
      </SafeAreaView>
    </AppProviders>
  );
}
