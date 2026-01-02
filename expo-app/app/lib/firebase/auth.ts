import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import auth from "@react-native-firebase/auth";

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> {
  return auth().createUserWithEmailAndPassword(email, password);
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> {
  return auth().signInWithEmailAndPassword(email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  return auth().signOut();
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(callback);
}
