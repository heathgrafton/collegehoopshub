import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../api/client";
import { useApi } from "../api/useApi";
import { colors } from "../theme/colors";
import { ErrorView, LoadingView } from "./StateViews";

type Tab = "teams" | "players" | "conferences";

type OnboardingSelections = { teamIds: string[]; playerIds: string[]; conferenceNames: string[] };

export function OnboardingScreen({ onComplete }: { onComplete: (selections: OnboardingSelections) => void }) {
  const [tab, setTab] = useState<Tab>("teams");
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [conferenceNames, setConferenceNames] = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const totalCount = teamIds.length + playerIds.length + conferenceNames.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Welcome to</Text>
        <Text style={styles.title}>CollegeHoopsHub</Text>
        <Text style={styles.subtitle}>Pick teams, players, and conferences to follow — we'll pin them to the top of the app.</Text>
      </View>

      <View style={styles.tabRow}>
        {(["teams", "players", "conferences"] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tabChip, tab === t && styles.tabChipActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabChipText, tab === t && styles.tabChipTextActive]}>
              {t === "teams" ? `Teams${teamIds.length ? ` (${teamIds.length})` : ""}` : t === "players" ? `Players${playerIds.length ? ` (${playerIds.length})` : ""}` : `Conferences${conferenceNames.length ? ` (${conferenceNames.length})` : ""}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "teams" && <TeamsTab selected={teamIds} onToggle={(id) => toggle(teamIds, setTeamIds, id)} />}
      {tab === "players" && <PlayersTab selected={playerIds} onToggle={(id) => toggle(playerIds, setPlayerIds, id)} />}
      {tab === "conferences" && <ConferencesTab selected={conferenceNames} onToggle={(name) => toggle(conferenceNames, setConferenceNames, name)} />}

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={() => onComplete({ teamIds, playerIds, conferenceNames })}>
          <Text style={styles.buttonText}>{totalCount > 0 ? `Continue with ${totalCount} favorite${totalCount === 1 ? "" : "s"}` : "Skip for now"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TeamsTab({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const { state } = useApi(() => api.getTeams(), []);
  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;
  return (
    <FlatList
      style={{ flex: 1 }}
      data={state.data.teams}
      keyExtractor={(t) => t.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const active = selected.includes(item.id);
        return (
          <Pressable style={[styles.row, active && styles.rowActive]} onPress={() => onToggle(item.id)}>
            <View style={[styles.colorDot, { backgroundColor: item.primaryColor }]} />
            <Text style={[styles.rowText, active && styles.rowTextActive]} numberOfLines={1}>
              {item.name}
            </Text>
            {active && <Text style={styles.check}>✓</Text>}
          </Pressable>
        );
      }}
    />
  );
}

function PlayersTab({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const { state } = useApi(() => api.getPlayers({ search: search || undefined }), [search]);
  return (
    <View style={{ flex: 1 }}>
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
          style={{ flex: 1 }}
          data={state.data.players}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = selected.includes(item.id);
            return (
              <Pressable style={[styles.row, active && styles.rowActive]} onPress={() => onToggle(item.id)}>
                <View style={[styles.colorDot, { backgroundColor: item.team.primaryColor }]} />
                <Text style={[styles.rowText, active && styles.rowTextActive]} numberOfLines={1}>
                  {item.firstName} {item.lastName} · {item.team.shortName}
                </Text>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

function ConferencesTab({ selected, onToggle }: { selected: string[]; onToggle: (name: string) => void }) {
  const { state } = useApi(() => api.getConferences(), []);
  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;
  return (
    <FlatList
      style={{ flex: 1 }}
      data={state.data.conferences}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const active = selected.includes(item.name);
        return (
          <Pressable style={[styles.row, active && styles.rowActive]} onPress={() => onToggle(item.name)}>
            <Text style={[styles.rowText, active && styles.rowTextActive]} numberOfLines={1}>
              {item.name}
            </Text>
            {active && <Text style={styles.check}>✓</Text>}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 64, gap: 6 },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  tabChip: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center" },
  tabChipActive: { backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent },
  tabChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  tabChipTextActive: { color: colors.accent },
  search: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  rowText: { color: colors.textSecondary, fontSize: 14, fontWeight: "500", flex: 1 },
  rowTextActive: { color: colors.textPrimary, fontWeight: "700" },
  check: { color: colors.accent, fontSize: 16, fontWeight: "800" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
