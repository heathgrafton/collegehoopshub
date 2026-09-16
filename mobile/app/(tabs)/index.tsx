import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { api, type GameSummary } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { GameRow } from "../../src/components/GameRow";
import { EmptyView, ErrorView, LoadingView } from "../../src/components/StateViews";

const SECTION_TITLES: Record<GameSummary["status"], string> = {
  live: "Live",
  scheduled: "Upcoming",
  final: "Final",
};

export default function ScoresScreen() {
  const { state, reload } = useApi(() => api.getScoreboard(), [], 15000);
  const { favoriteTeamIds } = useFavorites();

  const sections = useMemo(() => {
    if (state.status !== "success") return [];
    const groups: Record<GameSummary["status"], GameSummary[]> = { live: [], scheduled: [], final: [] };
    for (const game of state.data.games) groups[game.status].push(game);

    const result: { title: string; data: GameSummary[] }[] = [];

    if (favoriteTeamIds.length > 0) {
      const favoriteGames = state.data.games.filter(
        (g) => favoriteTeamIds.includes(g.homeTeam.id) || favoriteTeamIds.includes(g.awayTeam.id)
      );
      if (favoriteGames.length > 0) result.push({ title: "Your Teams", data: favoriteGames });
    }

    for (const key of ["live", "scheduled", "final"] as const) {
      if (groups[key].length > 0) result.push({ title: SECTION_TITLES[key], data: groups[key] });
    }

    return result;
  }, [state, favoriteTeamIds]);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  const flat = sections.flatMap((s) => [{ type: "header" as const, title: s.title }, ...s.data.map((g) => ({ type: "game" as const, game: g }))]);

  return (
    <View style={styles.container}>
      <FlatList
        data={flat}
        keyExtractor={(item, idx) => (item.type === "header" ? `h-${item.title}` : item.game.id) + idx}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text style={styles.sectionTitle}>{item.title}</Text>
          ) : (
            <GameRow game={item.game} />
          )
        }
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.accent} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyView message="No games today." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  listContent: { paddingBottom: 24 },
});
