import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import firestore from "@react-native-firebase/firestore";

export interface UserDocument {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ipSignup: string;
  ipLastLogin: string;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
  acceptedMarketingAt: FirebaseFirestoreTypes.FieldValue | null;
  acceptedPrivacyPolicyAt: FirebaseFirestoreTypes.FieldValue;
  acceptedTermsAt: FirebaseFirestoreTypes.FieldValue;
}

/**
 * Get the client's public IP address
 */
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}

/**
 * Create a new user document in Firestore
 */
export async function createUserDocument(
  uid: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    acceptedMarketing: boolean;
  },
): Promise<void> {
  const ip = await getClientIP();

  const userDoc: UserDocument = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    ipSignup: ip,
    ipLastLogin: ip,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    acceptedMarketingAt: data.acceptedMarketing
      ? firestore.FieldValue.serverTimestamp()
      : null,
    acceptedPrivacyPolicyAt: firestore.FieldValue.serverTimestamp(),
    acceptedTermsAt: firestore.FieldValue.serverTimestamp(),
  };

  await firestore().collection("users").doc(uid).set(userDoc);
}

/**
 * Update the last login IP for a user
 */
export async function updateLastLoginIP(uid: string): Promise<void> {
  const ip = await getClientIP();

  await firestore().collection("users").doc(uid).update({
    ipLastLogin: ip,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get a user document from Firestore
 */
export async function getUserDocument(
  uid: string,
): Promise<UserDocument | null> {
  const docSnap = await firestore().collection("users").doc(uid).get();
  return docSnap.exists() ? (docSnap.data() as UserDocument) : null;
}
