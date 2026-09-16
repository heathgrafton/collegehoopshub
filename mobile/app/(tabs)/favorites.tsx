import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/colors";

export default function FavoritesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.paragraph}>
        Once accounts are wired up, you'll be able to follow your favorite teams, players, and conferences here —
        with a personalized scores feed and news filtered to what you care about.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.bullet}>• Star teams and players from their detail pages</Text>
        <Text style={styles.bullet}>• Follow whole conferences</Text>
        <Text style={styles.bullet}>• A "My Scores" feed filtered to your favorites</Text>
        <Text style={styles.bullet}>• Synced across devices once accounts ship</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  paragraph: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  bullet: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
