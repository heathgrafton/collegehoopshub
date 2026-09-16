import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { api, type TeamSummary } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { useFavorites } from "../../src/favorites/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { EmptyView, ErrorView, LoadingView } from "../../src/components/StateViews";

export default function TeamsScreen() {
  const { state: confState } = useApi(() => api.getConferences(), []);
  const [conference, setConference] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { state } = useApi(() => api.getTeams({ conference: conference ?? undefined, search: search || undefined }), [conference, search]);
  const { favoriteTeamIds } = useFavorites();

  const conferences = confState.status === "success" ? confState.data.conferences : [];

  const { favorites, rest } = useMemo(() => {
    if (state.status !== "success") return { favorites: [] as TeamSummary[], rest: [] as TeamSummary[] };
    return {
      favorites: state.data.teams.filter((t) => favoriteTeamIds.includes(t.id)),
      rest: state.data.teams.filter((t) => !favoriteTeamIds.includes(t.id)),
    };
  }, [state, favoriteTeamIds]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search teams..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
        <FilterChip label="All" active={conference === null} onPress={() => setConference(null)} />
        {conferences.map((c) => (
          <FilterChip key={c.id} label={c.shortName} active={conference === c.name} onPress={() => setConference(c.name)} />
        ))}
      </ScrollView>

      {state.status === "loading" && <LoadingView />}
      {state.status === "error" && <ErrorView message={state.message} />}
      {state.status === "success" && (
        <FlatList
          data={[...favorites, ...rest]}
          keyExtractor={(t) => t.id}
          renderItem={({ item, index }) => (
            <>
              {index === 0 && favorites.length > 0 && <Text style={styles.sectionTitle}>Your Favorites</Text>}
              {index === favorites.length && favorites.length > 0 && <Text style={styles.sectionTitle}>All Teams</Text>}
              <TeamRow team={item} />
            </>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyView message="No teams match your search." />}
        />
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TeamRow({ team }: { team: TeamSummary }) {
  const { isFavoriteTeam, toggleFavoriteTeam } = useFavorites();
  const favorite = isFavoriteTeam(team.id);

  return (
    <Link href={`/team/${team.id}`} asChild>
      <Pressable style={styles.teamCard}>
        <View style={[styles.colorDot, { backgroundColor: team.primaryColor }]} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSub}>{team.conference.shortName}</Text>
        </View>
        {team.record && (
          <Text style={styles.record}>
            {team.record.wins}-{team.record.losses}
          </Text>
        )}
        <Pressable hitSlop={10} onPress={() => toggleFavoriteTeam(team.id)} style={styles.star}>
          <Text style={[styles.starText, favorite && styles.starTextActive]}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </Pressable>
    </Link>
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
  filterRow: { maxHeight: 44, marginBottom: 8 },
  filterRowContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 8,
    height: 34,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  listContent: { paddingBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  teamInfo: { flex: 1 },
  teamName: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  teamSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  record: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  star: { paddingLeft: 4 },
  starText: { color: colors.textMuted, fontSize: 18 },
  starTextActive: { color: colors.accent },
});
