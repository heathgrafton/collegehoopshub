import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { ErrorView, LoadingView } from "../../src/components/StateViews";

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatHeight(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApi(() => api.getPlayer(id), [id]);
  const { isFavoritePlayer, toggleFavoritePlayer } = useFavorites();

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const { player } = state.data;
  const s = player.seasonStats;
  const favorite = isFavoritePlayer(player.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `${player.firstName} ${player.lastName}` }} />

      <View style={styles.header}>
        <View style={[styles.colorDot, { backgroundColor: player.team.primaryColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {player.firstName} {player.lastName}
          </Text>
          <Link href={`/team/${player.team.id}`}>
            <Text style={styles.teamLink}>{player.team.name}</Text>
          </Link>
          <Text style={styles.sub}>
            #{player.jerseyNumber} · {player.position} · {player.classYear} · {formatHeight(player.heightInches)}
          </Text>
          <Text style={styles.sub}>{player.hometown}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => toggleFavoritePlayer(player.id)}>
          <Text style={[styles.starText, favorite && styles.starTextActive]}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </View>

      {s && (
        <>
          <View style={styles.statsRow}>
            <StatBox label="PPG" value={s.pointsPerGame.toFixed(1)} />
            <StatBox label="RPG" value={s.reboundsPerGame.toFixed(1)} />
            <StatBox label="APG" value={s.assistsPerGame.toFixed(1)} />
            <StatBox label="MPG" value={s.minutesPerGame.toFixed(1)} />
          </View>
          <View style={styles.statsRow}>
            <StatBox label="SPG" value={s.stealsPerGame.toFixed(1)} />
            <StatBox label="BPG" value={s.blocksPerGame.toFixed(1)} />
            <StatBox label="FG%" value={`${(s.fieldGoalPct * 100).toFixed(1)}`} />
            <StatBox label="3P%" value={`${(s.threePointPct * 100).toFixed(1)}`} />
          </View>
          <View style={styles.statsRow}>
            <StatBox label="FT%" value={`${(s.freeThrowPct * 100).toFixed(1)}`} />
            <StatBox label="GP" value={String(s.gamesPlayed)} />
          </View>
        </>
      )}

      <Pressable
        style={styles.chatButton}
        onPress={() =>
          Alert.alert("Coming soon", "Per-player discussion rooms are on the roadmap, alongside accounts and persisted chat.")
        }
      >
        <Text style={styles.chatButtonText}>💬 Player Discussion (coming soon)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  colorDot: { width: 20, height: 20, borderRadius: 10, marginTop: 4 },
  name: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  teamLink: { color: colors.accent, fontSize: 13, marginTop: 2, fontWeight: "600" },
  sub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  starText: { color: colors.textMuted, fontSize: 26 },
  starTextActive: { color: colors.accent },
  statsRow: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  chatButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
});
