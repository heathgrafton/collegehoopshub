import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../../../src/api/client";
import { useApi } from "../../../src/api/useApi";
import { colors } from "../../../src/theme/colors";
import { ErrorView, LoadingView } from "../../../src/components/StateViews";

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApi(() => api.getGame(id), [id], 15000);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const { game } = state.data;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${game.awayTeam.shortName} @ ${game.homeTeam.shortName}` }} />

      <View style={styles.scoreCard}>
        {[game.awayTeam, game.homeTeam].map((team) => (
          <Link key={team.id} href={`/team/${team.id}`} asChild>
            <Pressable style={styles.teamBlock}>
              <View style={[styles.colorDot, { backgroundColor: team.primaryColor }]} />
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamScore}>{team.score}</Text>
            </Pressable>
          </Link>
        ))}
        <Text style={styles.statusText}>
          {game.status === "live"
            ? `Live · Period ${game.period} · ${game.clock}`
            : game.status === "final"
            ? "Final"
            : new Date(game.startTime).toLocaleString()}
        </Text>
        <Text style={styles.metaText}>
          {game.venue}
          {game.broadcast ? ` · ${game.broadcast}` : ""}
        </Text>
      </View>

      <Link href={`/game/${game.id}/chat`} asChild>
        <Pressable style={styles.chatButton}>
          <Text style={styles.chatButtonText}>💬 Open Game Chat</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 16 },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  teamBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  teamName: { flex: 1, color: colors.textPrimary, fontSize: 17, fontWeight: "600" },
  teamScore: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  statusText: { color: colors.accent, fontSize: 13, fontWeight: "600", marginTop: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12 },
  chatButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatButtonText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
});
