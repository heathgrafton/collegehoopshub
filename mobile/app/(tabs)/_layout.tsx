import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme/colors";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 17, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scores",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏀" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "Teams",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏫" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: "Portal",
          tabBarIcon: ({ focused }) => <TabIcon symbol="🔁" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ focused }) => <TabIcon symbol="📰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bracketology"
        options={{
          title: "Bracket",
          tabBarIcon: ({ focused }) => <TabIcon symbol="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favs",
          tabBarIcon: ({ focused }) => <TabIcon symbol="⭐" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
