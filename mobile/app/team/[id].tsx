import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, type RosterPlayer } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { ErrorView, LoadingView } from "../../src/components/StateViews";
import { TeamLogo } from "../../src/components/TeamLogo";
import { PlayerPhoto } from "../../src/components/PlayerPhoto";

function fmt(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? "–" : value.toFixed(digits);
}

function pct(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : `${(value * 100).toFixed(1)}%`;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PlayerRow({ player }: { player: RosterPlayer }) {
  return (
    <Link href={`/player/${player.id}`} asChild>
      <Pressable style={styles.playerRow}>
        <PlayerPhoto uri={player.photoUrl} initials={`${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`} size={32} />
        <Text style={styles.jersey}>#{player.jerseyNumber}</Text>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.playerSub}>
            {player.position} · {player.classYear}
          </Text>
        </View>
        {player.pointsPerGame !== null && <Text style={styles.playerPpg}>{player.pointsPerGame.toFixed(1)} PPG</Text>}
      </Pressable>
    </Link>
  );
}

function TopPerformerCard({ player }: { player: RosterPlayer }) {
  return (
    <Link href={`/player/${player.id}`} asChild>
      <Pressable style={styles.performerCard}>
        <PlayerPhoto uri={player.photoUrl} initials={`${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`} size={48} />
        <Text style={styles.performerName} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.performerSub}>{player.position}</Text>
        <View style={styles.performerStats}>
          <Text style={styles.performerStat}>{fmt(player.pointsPerGame)} PPG</Text>
          <Text style={styles.performerStat}>{fmt(player.reboundsPerGame)} RPG</Text>
          <Text style={styles.performerStat}>{fmt(player.assistsPerGame)} APG</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApi(() => api.getTeam(id), [id]);
  const { isFavoriteTeam, toggleFavoriteTeam } = useFavorites();

  const topPerformers = useMemo(() => {
    if (state.status !== "success") return [];
    return [...state.data.team.roster]
      .filter((p) => p.pointsPerGame !== null)
      .sort((a, b) => (b.pointsPerGame ?? 0) - (a.pointsPerGame ?? 0))
      .slice(0, 3);
  }, [state]);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const { team } = state.data;
  const favorite = isFavoriteTeam(team.id);
  const s = team.seasonStats;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: team.shortName }} />

      <View style={styles.header}>
        <TeamLogo uri={team.logoUrl} color={team.primaryColor} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSub}>
            {team.city}, {team.state} · {team.conference.name}
          </Text>
        </View>
        <Pressable hitSlop={10} onPress={() => toggleFavoriteTeam(team.id)}>
          <Text style={[styles.starText, favorite && styles.starTextActive]}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </View>

      {team.record && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Stats</Text>
          <View style={styles.statsRow}>
            <StatBox label="Record" value={`${team.record.wins}-${team.record.losses}`} />
            <StatBox label="Conf." value={`${team.record.conferenceWins}-${team.record.conferenceLosses}`} />
            <StatBox label="PPG" value={fmt(s?.pointsPerGame)} />
            <StatBox label="Opp PPG" value={fmt(s?.opponentPointsPerGame)} />
          </View>
          {s && (
            <View style={styles.statsRow}>
              <StatBox label="RPG" value={fmt(s.reboundsPerGame)} />
              <StatBox label="APG" value={fmt(s.assistsPerGame)} />
              <StatBox label="Pace" value={fmt(s.pace)} />
              <StatBox label="eFG%" value={pct(s.effectiveFieldGoalPct)} />
            </View>
          )}
          {s && (s.netRating !== null || s.turnoversPerGame !== null) && (
            <View style={styles.statsRow}>
              <StatBox label="Net Rtg" value={fmt(s.netRating)} />
              <StatBox label="TOV" value={fmt(s.turnoversPerGame)} />
            </View>
          )}
        </View>
      )}

      {topPerformers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.performersRow}>
            {topPerformers.map((p) => (
              <TopPerformerCard key={p.id} player={p} />
            ))}
          </View>
        </View>
      )}

      {team.upcomingGames.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {team.upcomingGames.map((g) => (
            <Link key={g.id} href={`/game/${g.id}`} asChild>
              <Pressable style={styles.gameLine}>
                <Text style={styles.gameLineText}>
                  {g.awayTeam.shortName} @ {g.homeTeam.shortName}
                </Text>
                <Text style={styles.gameLineSub}>{new Date(g.startTime).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {team.recentGames.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          {team.recentGames.map((g) => (
            <Link key={g.id} href={`/game/${g.id}`} asChild>
              <Pressable style={styles.gameLine}>
                <Text style={styles.gameLineText}>
                  {g.awayTeam.shortName} {g.awayTeam.score} @ {g.homeTeam.shortName} {g.homeTeam.score}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roster</Text>
        {team.roster.map((p) => (
          <PlayerRow key={p.id} player={p} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  teamName: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  teamSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  starText: { color: colors.textMuted, fontSize: 26 },
  starTextActive: { color: colors.accent },
  statsRow: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  section: { gap: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  performersRow: { flexDirection: "row", gap: 10 },
  performerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  performerName: { color: colors.textPrimary, fontSize: 13, fontWeight: "700", marginTop: 4 },
  performerSub: { color: colors.textMuted, fontSize: 11 },
  performerStats: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap", justifyContent: "center" },
  performerStat: { color: colors.textSecondary, fontSize: 10, fontWeight: "600" },
  gameLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  gameLineText: { color: colors.textPrimary, fontSize: 13, fontWeight: "500" },
  gameLineSub: { color: colors.textMuted, fontSize: 12 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 12,
  },
  jersey: { color: colors.textMuted, fontSize: 13, fontWeight: "700", width: 32 },
  playerInfo: { flex: 1 },
  playerName: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
  playerSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  playerPpg: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
});
