import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import { colors } from "../../../src/theme/colors";

type LocalMessage = { id: string; body: string; sentAt: number };

export default function GameChatScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [{ id: String(Date.now()), body, sentAt: Date.now() }, ...prev]);
    setDraft("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <Stack.Screen options={{ title: "Game Chat" }} />
      <Text style={styles.banner}>
        Preview only — messages here stay on your device. Shared, persisted chat (with accounts) is on the roadmap.
      </Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        inverted
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{item.body}</Text>
            <Text style={styles.bubbleTime}>{new Date(item.sentAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Be the first to say something about this game.</Text>}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Talk about the game..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={send}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  list: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40 },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  bubbleText: { color: colors.textPrimary, fontSize: 14 },
  bubbleTime: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  sendButtonText: { color: "#fff", fontWeight: "700" },
});
