import { ConfigContext, ExpoConfig } from "expo/config";

const APP_ENV = (process.env["APP_ENV"] || "development") as
  | "development"
  | "production";

// Update these to match your app's bundle identifiers
const BUNDLE_IDENTIFIER =
  APP_ENV === "production"
    ? "com.yourcompany.expoapp"
    : "com.yourcompany.expoappdev";

// Get this from Firebase Console -> Project Settings -> General -> Your apps -> Web app
// Or from google-services.json -> client -> oauth_client -> client_id (web type)
const GOOGLE_WEB_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "expo-app",
  slug: "expo-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "expoapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_IDENTIFIER,
    // Required for push notifications
    entitlements: {
      "aps-environment": APP_ENV === "production" ? "production" : "development",
    },
    // Points to Firebase config file
    googleServicesFile: `./firebase/${APP_ENV}/GoogleService-Info.plist`,
    infoPlist: {
      // Enable remote notifications in background
      UIBackgroundModes: ["remote-notification"],
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    package: BUNDLE_IDENTIFIER,
    // Points to Firebase config file
    googleServicesFile: `./firebase/${APP_ENV}/google-services.json`,
    permissions: ["POST_NOTIFICATIONS"],
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  notification: {
    icon: "./assets/images/icon.png",
    color: "#FFFFFF",
  },

  plugins: [
    "expo-router",
    // Firebase plugins - MUST be before other plugins that depend on Firebase
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    // Google Sign-In
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: `com.googleusercontent.apps.${GOOGLE_WEB_CLIENT_ID.split(".")[0]}`,
      },
    ],
    // Apple Authentication
    "expo-apple-authentication",
    // Build properties for iOS static frameworks (required for Firebase)
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});

