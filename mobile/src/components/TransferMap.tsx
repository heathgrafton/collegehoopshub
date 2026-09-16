import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { api } from "../api/client";
import { useApi } from "../api/useApi";
import { colors } from "../theme/colors";
import { ErrorView, LoadingView } from "./StateViews";
import { MAP_VIEWBOX, US_OUTLINE_PATH } from "./UsMapOutline";

const NATIVE_WIDTH = 975;
const NATIVE_HEIGHT = 610;

export function TransferMap() {
  const { state } = useApi(() => api.getPlayerMovesMap(), []);

  const screenWidth = Dimensions.get("window").width - 32;
  const renderHeight = (screenWidth / NATIVE_WIDTH) * NATIVE_HEIGHT;

  const moves = useMemo(() => (state.status === "success" ? state.data.moves : []), [state]);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>{moves.length} transfers with both schools located</Text>
      <View style={[styles.mapCard, { width: screenWidth, height: renderHeight }]}>
        <Svg width={screenWidth} height={renderHeight} viewBox={MAP_VIEWBOX}>
          <Path d={US_OUTLINE_PATH} fill={colors.surfaceAlt} stroke={colors.border} strokeWidth={0.5} />
          {moves.map((m) => (
            <Line
              key={m.id}
              x1={m.origin.x}
              y1={m.origin.y}
              x2={m.destination.x}
              y2={m.destination.y}
              stroke={colors.accent}
              strokeWidth={0.6}
              strokeOpacity={0.35}
            />
          ))}
          {moves.map((m) => (
            <Circle key={`o-${m.id}`} cx={m.origin.x} cy={m.origin.y} r={2} fill={colors.textMuted} />
          ))}
          {moves.map((m) => (
            <Circle
              key={`d-${m.id}`}
              cx={m.destination.x}
              cy={m.destination.y}
              r={3}
              fill={m.destination.primaryColor}
              stroke={colors.background}
              strokeWidth={0.5}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
          <Text style={styles.legendText}>Origin school</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Destination school</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, gap: 12 },
  caption: { color: colors.textMuted, fontSize: 12 },
  mapCard: { backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  legendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: 11 },
});
