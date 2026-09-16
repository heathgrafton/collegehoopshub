import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { api, type NewsArticle } from "../../src/api/client";
import { useApi } from "../../src/api/useApi";
import { colors } from "../../src/theme/colors";
import { ErrorView, LoadingView } from "../../src/components/StateViews";
import { DemoBanner } from "../../src/components/DemoBanner";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={styles.card} onPress={() => setExpanded((e) => !e)}>
      <View style={styles.cardHeader}>
        <Text style={styles.source}>{article.source}</Text>
        <Text style={styles.time}>{timeAgo(article.publishedAt)}</Text>
      </View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.summary}>{expanded ? article.body : article.summary}</Text>
      {article.team && <Text style={styles.teamTag}>{article.team.shortName}</Text>}
    </Pressable>
  );
}

export default function NewsScreen() {
  const { state } = useApi(() => api.getNews(), [], 60000);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} />;

  return (
    <FlatList
      style={styles.container}
      data={state.data.articles}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => <ArticleCard article={item} />}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={<DemoBanner />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  source: { color: colors.accent, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  time: { color: colors.textMuted, fontSize: 11 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  summary: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  teamTag: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
