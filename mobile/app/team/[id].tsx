import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, type RosterPlayer } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
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

function PlayerRow({ player }: { player: RosterPlayer }) {
  return (
    <Link href={`/player/${player.id}`} asChild>
      <Pressable style={styles.playerRow}>
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

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApi(() => api.getTeam(id), [id]);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const { team } = state.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: team.shortName }} />

      <View style={styles.header}>
        <View style={[styles.colorDot, { backgroundColor: team.primaryColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSub}>
            {team.city}, {team.state} · {team.conference.name}
          </Text>
        </View>
      </View>

      {team.record && (
        <View style={styles.statsRow}>
          <StatBox label="Record" value={`${team.record.wins}-${team.record.losses}`} />
          <StatBox label="Conf." value={`${team.record.conferenceWins}-${team.record.conferenceLosses}`} />
          {team.seasonStats && (
            <>
              <StatBox label="PPG" value={team.seasonStats.pointsPerGame.toFixed(1)} />
              <StatBox label="Opp PPG" value={team.seasonStats.opponentPointsPerGame.toFixed(1)} />
            </>
          )}
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
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  teamName: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  teamSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  section: { gap: 4 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 6 },
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
