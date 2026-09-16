import { Image, StyleSheet, View } from "react-native";

export function TeamLogo({ uri, color, size = 28 }: { uri: string | null; color: string; size?: number }) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (!uri) {
    return <View style={[styles.dot, dim, { backgroundColor: color }]} />;
  }
  return <Image source={{ uri }} style={dim} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  dot: {},
});
