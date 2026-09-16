import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function PlayerPhoto({ uri, initials, size = 36 }: { uri: string | null; initials: string; size?: number }) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (!uri) {
    return (
      <View style={[styles.fallback, dim]}>
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={dim} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  initials: { color: colors.textSecondary, fontWeight: "700" },
});
