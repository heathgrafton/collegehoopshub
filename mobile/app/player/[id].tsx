import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { ErrorView, LoadingView } from "../../src/components/StateViews";
import { PlayerPhoto } from "../../src/components/PlayerPhoto";

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function fmt(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? "–" : value.toFixed(digits);
}

function pct(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : `${(value * 100).toFixed(1)}%`;
}

function makeAttempt(made: number | null, attempted: number | null): string {
  if (made === null || attempted === null) return "–";
  return `${made.toFixed(1)}-${attempted.toFixed(1)}`;
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
        <PlayerPhoto uri={player.photoUrl} initials={`${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`} size={64} />
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Per Game</Text>
            <View style={styles.statsRow}>
              <StatBox label="PPG" value={fmt(s.pointsPerGame)} />
              <StatBox label="RPG" value={fmt(s.reboundsPerGame)} />
              <StatBox label="APG" value={fmt(s.assistsPerGame)} />
              <StatBox label="MPG" value={fmt(s.minutesPerGame)} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="SPG" value={fmt(s.stealsPerGame)} />
              <StatBox label="BPG" value={fmt(s.blocksPerGame)} />
              <StatBox label="TOV" value={fmt(s.turnoversPerGame)} />
              <StatBox label="PF" value={fmt(s.foulsPerGame)} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="OREB" value={fmt(s.offensiveReboundsPerGame)} />
              <StatBox label="DREB" value={fmt(s.defensiveReboundsPerGame)} />
              <StatBox label="GP" value={String(s.gamesPlayed)} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shooting</Text>
            <View style={styles.statsRow}>
              <StatBox label="FG%" value={pct(s.fieldGoalPct)} />
              <StatBox label="FGM-A" value={makeAttempt(s.fieldGoalsMade, s.fieldGoalsAttempted)} />
              <StatBox label="3P%" value={pct(s.threePointPct)} />
              <StatBox label="3PM-A" value={makeAttempt(s.threePointMade, s.threePointAttempted)} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="FT%" value={pct(s.freeThrowPct)} />
              <StatBox label="FTM-A" value={makeAttempt(s.freeThrowsMade, s.freeThrowsAttempted)} />
              <StatBox label="eFG%" value={pct(s.effectiveFieldGoalPct)} />
              <StatBox label="TS%" value={pct(s.trueShootingPct)} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced</Text>
            <View style={styles.statsRow}>
              <StatBox label="USG%" value={fmt(s.usage)} />
              <StatBox label="ORtg" value={fmt(s.offensiveRating)} />
              <StatBox label="DRtg" value={fmt(s.defensiveRating)} />
              <StatBox label="Net" value={fmt(s.netRating)} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="Win Shares" value={fmt(s.winShares)} />
            </View>
          </View>
        </>
      )}

      {!s && (
        <View style={styles.noStats}>
          <Text style={styles.noStatsText}>No season stats synced yet for this player.</Text>
        </View>
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
  name: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  teamLink: { color: colors.accent, fontSize: 13, marginTop: 2, fontWeight: "600" },
  sub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  starText: { color: colors.textMuted, fontSize: 26 },
  starTextActive: { color: colors.accent },
  section: { gap: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  noStats: { backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
  noStatsText: { color: colors.textSecondary, fontSize: 13, textAlign: "center" },
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
