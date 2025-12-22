import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    sendPasswordResetEmail,
    isLoading,
    user,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);

  useEffect(() => {
    // Check if Apple Sign-In is available (iOS only)
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleSignInAvailable);
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLocalLoading(true);
    try {
      const result = isSignUp
        ? await signUpWithEmail(email.trim(), password)
        : await signInWithEmail(email.trim(), password);

      if (!result.success && result.error) {
        Alert.alert("Error", result.error.message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success && result.error) {
        Alert.alert("Error", result.error.message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLocalLoading(true);
    try {
      const result = await signInWithApple();
      if (!result.success && result.error) {
        Alert.alert("Error", result.error.message);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Enter Email",
        "Please enter your email address to reset your password"
      );
      return;
    }

    const result = await sendPasswordResetEmail(email.trim());
    if (result.success) {
      Alert.alert("Success", "Password reset email sent. Check your inbox.");
    } else if (result.error) {
      Alert.alert("Error", result.error.message);
    }
  };

  const loading = isLoading || localLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flame" size={48} color="#FF6B35" />
          </View>
          <Text style={styles.title}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Sign up to get started"
              : "Sign in to continue"}
          </Text>
        </View>

        {/* Email Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#6B7280"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#6B7280"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          )}

          {!isSignUp && (
            <Pressable onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <Pressable
            style={[styles.socialButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={styles.socialButtonText}>Google</Text>
          </Pressable>

          {Platform.OS === "ios" && appleSignInAvailable && (
            <Pressable
              style={[
                styles.socialButton,
                styles.appleButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Ionicons name="logo-apple" size={24} color="#fff" />
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Apple
              </Text>
            </Pressable>
          )}
        </View>

        {/* Toggle Sign Up / Sign In */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
          </Text>
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleLink}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#F8FAFC",
  },
  eyeIcon: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },
  dividerText: {
    color: "#64748B",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  socialButtonText: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    backgroundColor: "#000",
    borderColor: "#333",
  },
  appleButtonText: {
    color: "#fff",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  toggleLink: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
});

