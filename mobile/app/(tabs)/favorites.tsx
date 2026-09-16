import { useMemo } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { ErrorView, LoadingView } from "../../src/components/StateViews";

export default function FavoritesScreen() {
  const { favoriteTeamIds, favoritePlayerIds, toggleFavoriteTeam, toggleFavoritePlayer } = useFavorites();
  const { state: teamsState } = useApi(() => api.getTeams(), []);
  const { state: playersState } = useApi(() => api.getPlayers(), []);

  const favoriteTeams = useMemo(
    () => (teamsState.status === "success" ? teamsState.data.teams.filter((t) => favoriteTeamIds.includes(t.id)) : []),
    [teamsState, favoriteTeamIds]
  );
  const favoritePlayers = useMemo(
    () => (playersState.status === "success" ? playersState.data.players.filter((p) => favoritePlayerIds.includes(p.id)) : []),
    [playersState, favoritePlayerIds]
  );

  const loading = teamsState.status === "loading" || playersState.status === "loading";
  if (loading) return <LoadingView />;
  if (teamsState.status === "error") return <ErrorView message={teamsState.message} />;
  if (playersState.status === "error") return <ErrorView message={playersState.message} />;

  const isEmpty = favoriteTeams.length === 0 && favoritePlayers.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Favorites</Text>

      {isEmpty && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No favorites yet</Text>
          <Text style={styles.cardBody}>
            Tap the ☆ on any team or player to follow them. Favorited teams show up first on Scores and Teams.
          </Text>
        </View>
      )}

      {favoriteTeams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          {favoriteTeams.map((t) => (
            <Link key={t.id} href={`/team/${t.id}`} asChild>
              <Pressable style={styles.row}>
                <View style={[styles.colorDot, { backgroundColor: t.primaryColor }]} />
                <Text style={styles.rowText}>{t.name}</Text>
                <Pressable hitSlop={10} onPress={() => toggleFavoriteTeam(t.id)}>
                  <Text style={styles.star}>★</Text>
                </Pressable>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {favoritePlayers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          {favoritePlayers.map((p) => (
            <Link key={p.id} href={`/player/${p.id}`} asChild>
              <Pressable style={styles.row}>
                <View style={[styles.colorDot, { backgroundColor: p.team.primaryColor }]} />
                <Text style={styles.rowText}>
                  {p.firstName} {p.lastName}
                </Text>
                <Pressable hitSlop={10} onPress={() => toggleFavoritePlayer(p.id)}>
                  <Text style={styles.star}>★</Text>
                </Pressable>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  cardBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  section: { gap: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  rowText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600", flex: 1 },
  star: { color: colors.accent, fontSize: 18 },
});
