import firebase from "@react-native-firebase/app";

class FirebaseInitService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.log("Firebase already initialized");
      return true;
    }

    try {
      const apps = firebase.apps;

      if (apps.length === 0) {
        console.log(
          "No Firebase apps found - check google-services.json/GoogleService-Info.plist"
        );
        return false;
      }

      // Firebase auto-initializes from config files
      const defaultApp = firebase.app();
      console.log("✅ Firebase initialized:", defaultApp.options.projectId);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getApp() {
    return firebase.app();
  }
}

export const firebaseInitService = new FirebaseInitService();

