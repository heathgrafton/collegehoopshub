import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/colors";

const PLANNED_METRICS = [
  "NET ranking & quadrant records (Q1–Q4)",
  "KenPom-style adjusted efficiency margin",
  "Strength of schedule (overall & non-conference)",
  "Resume quality wins / bad losses",
  "Conference standings & auto-bid tracking",
  "Bracket seed projections updated weekly",
];

export default function BracketologyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bracketology</Text>
      <Text style={styles.paragraph}>
        This is where you'll explore every metric that matters for filling out your NCAA Tournament bracket — and
        build a weekly mock bracket as the picture sharpens throughout the season.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.paragraph}>Planned for this page:</Text>
        {PLANNED_METRICS.map((m) => (
          <Text key={m} style={styles.bullet}>
            • {m}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Mock Bracket</Text>
        <Text style={styles.paragraph}>
          Starting once meaningful tournament-resume data exists (typically mid-season), a new mock bracket will
          open each week. Fill in your 68 teams, compare against the field's projections, and track how your bracket
          shifts week to week leading up to Selection Sunday.
        </Text>
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
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  bullet: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
