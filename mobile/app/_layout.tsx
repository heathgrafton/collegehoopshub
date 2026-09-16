import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../src/theme/colors";
import { FavoritesProvider, useFavorites } from "../src/favorites/FavoritesContext";
import { OnboardingScreen } from "../src/components/OnboardingScreen";

function Gate() {
  const { isReady, hasOnboarded, completeOnboarding } = useFavorites();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <StatusBar style="light" />
      <Gate />
    </FavoritesProvider>
  );
}
