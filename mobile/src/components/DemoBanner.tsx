import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

export function DemoBanner() {
  return <Text style={styles.text}>Demo data — live provider not yet connected</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 6,
  },
});
