import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api, type PlayerMove } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { colors } from "../../src/theme/colors";
import { EmptyView, ErrorView, LoadingView } from "../../src/components/StateViews";

type Filter = "all" | "transfer" | "commitment";

function MoveCard({ move }: { move: PlayerMove }) {
  const isTransfer = move.type === "transfer";
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.badge, isTransfer ? styles.badgeTransfer : styles.badgeCommit]}>
          {isTransfer ? "TRANSFER" : "COMMIT"}
        </Text>
        {move.stars ? <Text style={styles.stars}>{"★".repeat(move.stars)}</Text> : null}
      </View>
      <Text style={styles.name}>{move.playerName}</Text>
      <Text style={styles.detail}>
        {move.position ? `${move.position} · ` : ""}
        {isTransfer
          ? `${move.origin?.name ?? "Unknown"} → ${move.destination?.name ?? "Undecided"}`
          : `Committed to ${move.destination?.name ?? "Undecided"}`}
      </Text>
    </View>
  );
}

export default function TransfersScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const { state } = useApi(() => api.getPlayerMoves(filter === "all" ? undefined : { type: filter }), [filter]);

  const data = useMemo(() => (state.status === "success" ? state.data.moves : []), [state]);

  return (
    <View style={styles.container}>
      <Text style={styles.note}>Season activity from CollegeBasketballData.com — not a live, timestamped feed.</Text>
      <View style={styles.filterRow}>
        {(["all", "transfer", "commitment"] as Filter[]).map((f) => (
          <Pressable key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f === "all" ? "All" : f === "transfer" ? "Transfers" : "Commitments"}
            </Text>
          </Pressable>
        ))}
      </View>

      {state.status === "loading" && <LoadingView />}
      {state.status === "error" && <ErrorView message={state.message} />}
      {state.status === "success" && (
        <FlatList
          data={data}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MoveCard move={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyView message="No moves to show." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  note: { color: colors.textMuted, fontSize: 11, textAlign: "center", paddingTop: 10, paddingHorizontal: 16 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  listContent: { padding: 16, paddingTop: 0, gap: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  badgeTransfer: { color: colors.accent },
  badgeCommit: { color: colors.textSecondary },
  stars: { color: colors.accent, fontSize: 11 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  detail: { color: colors.textSecondary, fontSize: 13 },
});
