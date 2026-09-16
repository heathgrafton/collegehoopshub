import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { useApi } from "../api/useApi";
import { colors } from "../theme/colors";
import { ErrorView, LoadingView } from "./StateViews";

export function OnboardingScreen({ onComplete }: { onComplete: (teamIds: string[]) => void }) {
  const { state } = useApi(() => api.getTeams(), []);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Welcome to</Text>
        <Text style={styles.title}>CollegeHoopsHub</Text>
        <Text style={styles.subtitle}>
          Pick the teams you follow — we'll pin their games and news to the top of the app.
        </Text>
      </View>

      {state.status === "loading" && <LoadingView />}
      {state.status === "error" && <ErrorView message={state.message} />}
      {state.status === "success" && (
        <FlatList
          data={state.data.teams}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = selected.includes(item.id);
            return (
              <Pressable style={[styles.row, active && styles.rowActive]} onPress={() => toggle(item.id)}>
                <View style={[styles.colorDot, { backgroundColor: item.primaryColor }]} />
                <Text style={[styles.rowText, active && styles.rowTextActive]} numberOfLines={1}>
                  {item.name}
                </Text>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={() => onComplete(selected)}>
          <Text style={styles.buttonText}>
            {selected.length > 0
              ? `Continue with ${selected.length} team${selected.length === 1 ? "" : "s"}`
              : "Skip for now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 72, gap: 6 },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  rowText: { color: colors.textSecondary, fontSize: 15, fontWeight: "500", flex: 1 },
  rowTextActive: { color: colors.textPrimary, fontWeight: "700" },
  check: { color: colors.accent, fontSize: 16, fontWeight: "800" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
