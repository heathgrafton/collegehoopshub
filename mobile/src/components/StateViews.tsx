import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
