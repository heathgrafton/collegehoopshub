import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { api, type PlayerListItem } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { EmptyView, ErrorView, LoadingView } from "../../src/components/StateViews";
import { PlayerPhoto } from "../../src/components/PlayerPhoto";

function PlayerRow({ player }: { player: PlayerListItem }) {
  const { isFavoritePlayer, toggleFavoritePlayer } = useFavorites();
  const favorite = isFavoritePlayer(player.id);

  return (
    <Link href={`/player/${player.id}`} asChild>
      <Pressable style={styles.row}>
        <PlayerPhoto uri={player.photoUrl} initials={`${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {player.team.shortName} · {player.position}
          </Text>
        </View>
        {player.pointsPerGame !== null && <Text style={styles.ppg}>{player.pointsPerGame.toFixed(1)} PPG</Text>}
        <Pressable hitSlop={10} onPress={() => toggleFavoritePlayer(player.id)} style={styles.star}>
          <Text style={[styles.starText, favorite && styles.starTextActive]}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </Pressable>
    </Link>
  );
}

export default function PlayersScreen() {
  const [search, setSearch] = useState("");
  const { state } = useApi(() => api.getPlayers({ search: search || undefined }), [search]);
  const { favoritePlayerIds } = useFavorites();

  const { favorites, rest } = useMemo(() => {
    if (state.status !== "success") return { favorites: [] as PlayerListItem[], rest: [] as PlayerListItem[] };
    const sorted = [...state.data.players].sort((a, b) => (b.pointsPerGame ?? 0) - (a.pointsPerGame ?? 0));
    return {
      favorites: sorted.filter((p) => favoritePlayerIds.includes(p.id)),
      rest: sorted.filter((p) => !favoritePlayerIds.includes(p.id)),
    };
  }, [state, favoritePlayerIds]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search players..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {state.status === "loading" && <LoadingView />}
      {state.status === "error" && <ErrorView message={state.message} />}
      {state.status === "success" && (
        <FlatList
          data={[...favorites, ...rest]}
          keyExtractor={(p) => p.id}
          renderItem={({ item, index }) => (
            <>
              {index === 0 && favorites.length > 0 && <Text style={styles.sectionTitle}>Your Favorites</Text>}
              {index === favorites.length && favorites.length > 0 && <Text style={styles.sectionTitle}>All Players</Text>}
              <PlayerRow player={item} />
            </>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyView message="No players match your search." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  listContent: { paddingBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  info: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  ppg: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  star: { paddingLeft: 4 },
  starText: { color: colors.textMuted, fontSize: 18 },
  starTextActive: { color: colors.accent },
});
