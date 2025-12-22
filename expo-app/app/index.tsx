import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../src/context/AuthContext";

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading]);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const result = await signOut();
          if (!result.success && result.error) {
            Alert.alert("Error", result.error.message);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Get user's display name or email
  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const email = user.email || "No email";
  const photoURL = user.photoURL;

  // Determine sign-in method
  const getSignInMethod = () => {
    const providers = user.providerData.map((p) => p.providerId);
    if (providers.includes("google.com")) return "Google";
    if (providers.includes("apple.com")) return "Apple";
    if (providers.includes("password")) return "Email";
    return "Unknown";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
        </Pressable>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          {photoURL ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.onlineIndicator} />
        </View>

        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        <View style={styles.providerBadge}>
          <Ionicons
            name={
              getSignInMethod() === "Google"
                ? "logo-google"
                : getSignInMethod() === "Apple"
                  ? "logo-apple"
                  : "mail-outline"
            }
            size={14}
            color="#94A3B8"
          />
          <Text style={styles.providerText}>
            Signed in with {getSignInMethod()}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Account Verified</Text>
            <Text style={styles.infoDescription}>
              {user.emailVerified
                ? "Your email is verified"
                : "Please verify your email"}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="key" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>User ID</Text>
            <Text style={styles.infoDescription} numberOfLines={1}>
              {user.uid}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="time" size={24} color="#F59E0B" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Last Sign In</Text>
            <Text style={styles.infoDescription}>
              {user.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <Pressable style={styles.signOutButtonLarge} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  signOutButton: {
    padding: 8,
  },
  userCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#1E293B",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 16,
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  providerText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  infoSection: {
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 12,
    color: "#94A3B8",
  },
  signOutButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: "auto",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
