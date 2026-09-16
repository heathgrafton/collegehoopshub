import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "../theme/colors";
import type { GameSummary } from "../api/client";
import { TeamLogo } from "./TeamLogo";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function TeamLine({
  team,
  score,
  status,
  isLeading,
}: {
  team: GameSummary["homeTeam"];
  score: number;
  status: GameSummary["status"];
  isLeading: boolean;
}) {
  return (
    <View style={styles.teamRow}>
      <TeamLogo uri={team.logoUrl} color={team.primaryColor} size={20} />
      <Text
        style={[
          styles.teamName,
          status !== "scheduled" && isLeading ? styles.teamNameLeading : undefined,
        ]}
        numberOfLines={1}
      >
        {team.shortName}
      </Text>
      {status !== "scheduled" && <Text style={styles.score}>{score}</Text>}
    </View>
  );
}

export function GameRow({ game }: { game: GameSummary }) {
  const homeLeading = game.homeTeam.score > game.awayTeam.score;
  const awayLeading = game.awayTeam.score > game.homeTeam.score;

  return (
    <Link href={`/game/${game.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.statusColumn}>
          {game.status === "live" ? (
            <>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
              <Text style={styles.statusSub}>P{game.period} · {game.clock}</Text>
            </>
          ) : game.status === "final" ? (
            <Text style={styles.finalText}>FINAL</Text>
          ) : (
            <Text style={styles.statusSub}>{formatTime(game.startTime)}</Text>
          )}
        </View>
        <View style={styles.teams}>
          <TeamLine team={game.awayTeam} score={game.awayTeam.score} status={game.status} isLeading={awayLeading} />
          <TeamLine team={game.homeTeam} score={game.homeTeam.score} status={game.status} isLeading={homeLeading} />
        </View>
        <View style={styles.meta}>
          {game.broadcast ? <Text style={styles.metaText}>{game.broadcast}</Text> : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  statusColumn: {
    width: 56,
    alignItems: "flex-start",
    gap: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  liveText: {
    color: colors.live,
    fontWeight: "700",
    fontSize: 12,
  },
  finalText: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
  statusSub: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  teams: {
    flex: 1,
    gap: 6,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamName: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  teamNameLeading: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  score: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "right",
  },
  meta: {
    width: 44,
    alignItems: "flex-end",
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
