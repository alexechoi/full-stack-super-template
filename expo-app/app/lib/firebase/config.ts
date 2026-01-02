import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// Firebase is automatically initialized via native config files:
// - iOS: GoogleService-Info.plist
// - Android: google-services.json
// No manual initialization needed with React Native Firebase

// Export Firebase instances
export const firebaseApp = firebase;
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;

// Export commonly used references
export const db = firestore();

