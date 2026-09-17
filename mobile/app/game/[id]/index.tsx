import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, type GameTeamDetail } from "../../../src/api/client";
import { useApi } from "../../../src/api/useApi";
import { colors } from "../../../src/theme/colors";
import { ErrorView, LoadingView } from "../../../src/components/StateViews";
import { TeamLogo } from "../../../src/components/TeamLogo";
import { PlayerPhoto } from "../../../src/components/PlayerPhoto";

function fmt(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? "–" : value.toFixed(digits);
}

function pct(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : `${(value * 100).toFixed(1)}%`;
}

function StatCompareRow({ label, home, away, format = fmt }: { label: string; home: number | null; away: number | null; format?: (v: number | null) => string }) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareValue}>{format(away)}</Text>
      <Text style={styles.compareLabel}>{label}</Text>
      <Text style={styles.compareValue}>{format(home)}</Text>
    </View>
  );
}

function TeamPerformers({ team }: { team: GameTeamDetail }) {
  if (team.topPerformers.length === 0) return null;
  return (
    <View style={styles.performerColumn}>
      {team.topPerformers.map((p) => (
        <Link key={p.id} href={`/player/${p.id}`} asChild>
          <Pressable style={styles.performerRow}>
            <PlayerPhoto uri={p.photoUrl} initials={`${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`} size={28} />
            <View style={{ flex: 1 }}>
              <Text style={styles.performerName} numberOfLines={1}>
                {p.firstName} {p.lastName}
              </Text>
              <Text style={styles.performerSub}>{fmt(p.pointsPerGame)} PPG</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApi(() => api.getGame(id), [id], 15000);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const { game } = state.data;
  const home = game.homeTeam;
  const away = game.awayTeam;
  const hasStats = home.seasonStats !== null || away.seasonStats !== null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `${away.shortName} @ ${home.shortName}` }} />

      <View style={styles.scoreCard}>
        {[away, home].map((team) => (
          <Link key={team.id} href={`/team/${team.id}`} asChild>
            <Pressable style={styles.teamBlock}>
              <TeamLogo uri={team.logoUrl} color={team.primaryColor} size={28} />
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{team.name}</Text>
                {team.record && (
                  <Text style={styles.teamRecord}>
                    {team.record.wins}-{team.record.losses}
                  </Text>
                )}
              </View>
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

      {hasStats && (
        <View style={styles.section}>
          <View style={styles.compareHeader}>
            <Text style={[styles.compareHeaderText, { textAlign: "left" }]} numberOfLines={1}>
              {away.shortName}
            </Text>
            <Text style={[styles.sectionTitle, styles.compareHeaderTitle]}>Team Stats</Text>
            <Text style={[styles.compareHeaderText, { textAlign: "right" }]} numberOfLines={1}>
              {home.shortName}
            </Text>
          </View>
          <View style={styles.compareCard}>
            <StatCompareRow label="PPG" home={home.seasonStats?.pointsPerGame ?? null} away={away.seasonStats?.pointsPerGame ?? null} />
            <StatCompareRow label="Opp PPG" home={home.seasonStats?.opponentPointsPerGame ?? null} away={away.seasonStats?.opponentPointsPerGame ?? null} />
            <StatCompareRow label="RPG" home={home.seasonStats?.reboundsPerGame ?? null} away={away.seasonStats?.reboundsPerGame ?? null} />
            <StatCompareRow label="APG" home={home.seasonStats?.assistsPerGame ?? null} away={away.seasonStats?.assistsPerGame ?? null} />
            <StatCompareRow label="Pace" home={home.seasonStats?.pace ?? null} away={away.seasonStats?.pace ?? null} />
            <StatCompareRow label="eFG%" home={home.seasonStats?.effectiveFieldGoalPct ?? null} away={away.seasonStats?.effectiveFieldGoalPct ?? null} format={pct} />
            <StatCompareRow label="Net Rtg" home={home.seasonStats?.netRating ?? null} away={away.seasonStats?.netRating ?? null} />
            <StatCompareRow label="TOV" home={home.seasonStats?.turnoversPerGame ?? null} away={away.seasonStats?.turnoversPerGame ?? null} />
          </View>
        </View>
      )}

      {(home.topPerformers.length > 0 || away.topPerformers.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.performersRow}>
            <TeamPerformers team={away} />
            <TeamPerformers team={home} />
          </View>
        </View>
      )}

      <Link href={`/game/${game.id}/chat`} asChild>
        <Pressable style={styles.chatButton}>
          <Text style={styles.chatButtonText}>💬 Open Game Chat</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  teamBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  teamName: { color: colors.textPrimary, fontSize: 17, fontWeight: "600" },
  teamRecord: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  teamScore: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  statusText: { color: colors.accent, fontSize: 13, fontWeight: "600", marginTop: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12 },
  section: { gap: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  compareHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  compareHeaderText: { color: colors.textSecondary, fontSize: 13, fontWeight: "700", flex: 1 },
  compareHeaderTitle: { textAlign: "center", marginBottom: 0, flexShrink: 0 },
  compareCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, gap: 10 },
  compareRow: { flexDirection: "row", alignItems: "center" },
  compareValue: { color: colors.textPrimary, fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
  compareLabel: { color: colors.textMuted, fontSize: 11, flex: 1, textAlign: "center" },
  performersRow: { flexDirection: "row", gap: 10 },
  performerColumn: { flex: 1, gap: 6 },
  performerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 8,
  },
  performerName: { color: colors.textPrimary, fontSize: 12, fontWeight: "600" },
  performerSub: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
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
