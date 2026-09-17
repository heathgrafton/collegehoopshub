import { useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { api, type MapSchool } from "../api/client";
import { useApi } from "../api/useApi";
import { colors } from "../theme/colors";
import { ErrorView, LoadingView } from "./StateViews";
import { TeamLogo } from "./TeamLogo";
import { MAP_VIEWBOX, US_OUTLINE_PATH } from "./UsMapOutline";

const NATIVE_WIDTH = 975;
const NATIVE_HEIGHT = 610;

export function TransferMap() {
  const { state } = useApi(() => api.getPlayerMovesMap(), []);
  const [selected, setSelected] = useState<MapSchool | null>(null);

  const screenWidth = Dimensions.get("window").width - 32;
  const renderHeight = (screenWidth / NATIVE_WIDTH) * NATIVE_HEIGHT;
  const scale = screenWidth / NATIVE_WIDTH;

  const { schools, lines } = useMemo(
    () => (state.status === "success" ? state.data : { schools: [] as MapSchool[], lines: [] }),
    [state]
  );

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>{schools.length} schools with portal activity — tap a dot for details</Text>
      <View style={[styles.mapCard, { width: screenWidth, height: renderHeight }]}>
        <Svg width={screenWidth} height={renderHeight} viewBox={MAP_VIEWBOX}>
          <Path d={US_OUTLINE_PATH} fill={colors.surfaceAlt} stroke={colors.border} strokeWidth={0.5} />
          {lines.map((l) => (
            <Line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={colors.accent} strokeWidth={0.6} strokeOpacity={0.3} />
          ))}
          {schools.map((s) => (
            <Circle
              key={s.id}
              cx={s.x}
              cy={s.y}
              r={Math.min(2 + (s.arrivals.length + s.departures.length) * 0.15, 6)}
              fill={s.primaryColor}
              stroke={colors.background}
              strokeWidth={0.5}
            />
          ))}
        </Svg>
        {/* Plain SVG shapes don't take touch input reliably on web, so taps are
            handled by real Pressable views positioned on top of each dot. */}
        {schools.map((s) => {
          const r = Math.min(2 + (s.arrivals.length + s.departures.length) * 0.15, 6) * scale;
          const hit = Math.max(r * 2, 18);
          return (
            <Pressable
              key={s.id}
              onPress={() => setSelected(s)}
              style={{
                position: "absolute",
                left: s.x * scale - hit / 2,
                top: s.y * scale - hit / 2,
                width: hit,
                height: hit,
              }}
            />
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>School (bigger = more portal activity)</Text>
        </View>
      </View>

      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selected && <SchoolDetail school={selected} onClose={() => setSelected(null)} />}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SchoolDetail({ school, onClose }: { school: MapSchool; onClose: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sheetHeader}>
        <TeamLogo uri={school.logoUrl} color={school.primaryColor} size={32} />
        <Text style={styles.sheetTitle}>{school.name}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent}>
        <Text style={styles.sectionTitle}>Arrivals ({school.arrivals.length})</Text>
        {school.arrivals.length === 0 && <Text style={styles.emptyText}>No portal arrivals matched.</Text>}
        {school.arrivals.map((a) => (
          <View key={a.id} style={styles.row}>
            <Text style={styles.rowName}>{a.playerName}</Text>
            <Text style={styles.rowDetail}>
              {a.position ? `${a.position} · ` : ""}from {a.originName ?? "Unknown"}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Departures ({school.departures.length})</Text>
        {school.departures.length === 0 && <Text style={styles.emptyText}>No portal departures matched.</Text>}
        {school.departures.map((d) => (
          <View key={d.id} style={styles.row}>
            <Text style={styles.rowName}>{d.playerName}</Text>
            <Text style={styles.rowDetail}>
              {d.position ? `${d.position} · ` : ""}to {d.destinationName ?? "Undecided"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, gap: 12 },
  caption: { color: colors.textMuted, fontSize: 12, textAlign: "center" },
  mapCard: { backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  legendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: 11 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "70%" },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "700", flex: 1 },
  closeText: { color: colors.textMuted, fontSize: 20 },
  sheetContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },
  row: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6 },
  rowName: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
  rowDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
