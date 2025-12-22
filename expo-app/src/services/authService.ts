import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import { firebaseInitService } from "./firebaseInitService";

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult {
  success: boolean;
  user?: FirebaseAuthTypes.User | null;
  error?: AuthError;
}

// Get this from your app.config.ts or environment
const GOOGLE_WEB_CLIENT_ID =
  "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";

class AuthService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      // Ensure Firebase is initialized first
      const firebaseReady = await firebaseInitService.initialize();
      if (!firebaseReady) {
        console.error("Firebase not initialized, cannot initialize auth");
        return false;
      }

      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });

      this.initialized = true;
      console.log("✅ Auth service initialized");
      return true;
    } catch (error) {
      console.error("❌ Auth service initialization error:", error);
      return false;
    }
  }

  // Get current user
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Subscribe to auth state changes
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return {
          success: false,
          error: { code: "google/cancelled", message: "Sign in was cancelled" },
        };
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        return {
          success: false,
          error: { code: "google/no-token", message: "No ID token received" },
        };
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      return { success: true, user: userCredential.user };
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            return {
              success: false,
              error: {
                code: "google/in-progress",
                message: "Sign in already in progress",
              },
            };
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return {
              success: false,
              error: {
                code: "google/play-services",
                message: "Google Play Services not available",
              },
            };
          case statusCodes.SIGN_IN_CANCELLED:
            return {
              success: false,
              error: { code: "google/cancelled", message: "Sign in cancelled" },
            };
        }
      }
      return this.handleAuthError(error);
    }
  }

  // Apple Sign In (iOS only)
  async signInWithApple(): Promise<AuthResult> {
    if (Platform.OS !== "ios") {
      return {
        success: false,
        error: {
          code: "apple/not-ios",
          message: "Apple Sign-In is only available on iOS",
        },
      };
    }

    try {
      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          error: {
            code: "apple/not-available",
            message: "Apple Sign-In is not available on this device",
          },
        };
      }

      // Generate a secure nonce
      const nonce = await this.generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple credentials
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken } = appleCredential;

      if (!identityToken) {
        return {
          success: false,
          error: {
            code: "apple/no-token",
            message: "No identity token received from Apple",
          },
        };
      }

      // Create Firebase credential with the Apple token
      const firebaseCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      // Sign in with Firebase
      const userCredential =
        await auth().signInWithCredential(firebaseCredential);

      // Update display name if provided (Apple only sends this on first sign in)
      if (appleCredential.fullName?.givenName && !userCredential.user.displayName) {
        const displayName = [
          appleCredential.fullName.givenName,
          appleCredential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(" ");

        if (displayName) {
          await userCredential.user.updateProfile({ displayName });
        }
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        const appleError = error as { code: string };
        if (appleError.code === "ERR_REQUEST_CANCELED") {
          return {
            success: false,
            error: { code: "apple/cancelled", message: "Sign in cancelled" },
          };
        }
      }
      return this.handleAuthError(error);
    }
  }

  // Sign Out
  async signOut(): Promise<AuthResult> {
    try {
      // Sign out from Google if signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore Google sign out errors
      }

      // Sign out from Firebase
      await auth().signOut();

      return { success: true };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Helper to generate a random nonce for Apple Sign-In
  private async generateNonce(length = 32): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(length);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < length; i++) {
      nonce += chars.charAt(randomBytes[i] % chars.length);
    }
    return nonce;
  }

  // Handle Firebase auth errors
  private handleAuthError(error: unknown): AuthResult {
    console.error("Auth error:", error);

    if (error instanceof Error) {
      const firebaseError = error as { code?: string; message?: string };
      const code = firebaseError.code || "auth/unknown";
      const message = this.getReadableErrorMessage(code, firebaseError.message);

      return {
        success: false,
        error: { code, message },
      };
    }

    return {
      success: false,
      error: { code: "auth/unknown", message: "An unknown error occurred" },
    };
  }

  // Convert Firebase error codes to user-friendly messages
  private getReadableErrorMessage(code: string, fallback?: string): string {
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/invalid-email": "Please enter a valid email address",
      "auth/operation-not-allowed": "This sign-in method is not enabled",
      "auth/weak-password": "Password should be at least 6 characters",
      "auth/user-disabled": "This account has been disabled",
      "auth/user-not-found": "No account found with this email",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-credential": "Invalid email or password",
      "auth/too-many-requests": "Too many attempts. Please try again later",
      "auth/network-request-failed": "Network error. Check your connection",
    };

    return errorMessages[code] || fallback || "An error occurred";
  }
}

export const authService = new AuthService();

