import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/app/components/AuthProvider";
import { signOut } from "@/app/lib/firebase/auth";

export default function HomeScreen() {
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          You&apos;re signed in as {user?.email || "Unknown"}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard</Text>
          <Text style={styles.cardText}>
            This is your authenticated home screen. You can customize this to
            show your app&apos;s main content.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fafafa",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a1a1aa",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fafafa",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: "#a1a1aa",
    lineHeight: 22,
  },
  signOutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutButtonPressed: {
    backgroundColor: "#27272a",
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fafafa",
  },
});
