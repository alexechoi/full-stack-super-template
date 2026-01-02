"use client";

/**
 * Push Notification Provider
 *
 * Initializes web push notifications and provides context for notification state.
 * Wrap your app with this component after AuthProvider.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  deleteFCMToken,
  getFCMToken,
  getNotificationPermission,
  isPushNotificationSupported,
  type NotificationData,
  onForegroundMessage,
  requestNotificationPermission,
  showNotification,
} from "@/app/lib/firebase/messaging";
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from "@/app/lib/firebase/notifications";

import { useAuth } from "./AuthProvider";

interface PushNotificationContextType {
  /**
   * Whether push notifications are supported
   */
  isSupported: boolean;

  /**
   * Current permission status
   */
  permission: NotificationPermission | null;

  /**
   * Whether notifications are enabled (permission granted + token registered)
   */
  isEnabled: boolean;

  /**
   * Request permission and enable notifications
   */
  enableNotifications: () => Promise<boolean>;

  /**
   * Disable notifications (unregister token)
   */
  disableNotifications: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  isSupported: false,
  permission: null,
  isEnabled: false,
  enableNotifications: async () => false,
  disableNotifications: async () => {},
});

export function usePushNotifications() {
  return useContext(PushNotificationContext);
}

interface PushNotificationProviderProps {
  children: React.ReactNode;
  /**
   * VAPID key from Firebase Console
   * Get it from: Project Settings > Cloud Messaging > Web Push certificates
   */
  vapidKey?: string;
  /**
   * Callback when a notification is received in the foreground
   */
  onNotificationReceived?: (notification: NotificationData) => void;
}

export function PushNotificationProvider({
  children,
  vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
  onNotificationReceived,
}: PushNotificationProviderProps) {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  // Check browser support on mount
  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  // Enable notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !vapidKey || !user?.uid) {
      console.warn("Cannot enable notifications:", {
        isSupported,
        hasVapidKey: !!vapidKey,
        hasUser: !!user?.uid,
      });
      return false;
    }

    try {
      // Request permission
      const granted = await requestNotificationPermission();
      setPermission(Notification.permission);

      if (!granted) {
        return false;
      }

      // Get FCM token
      const fcmToken = await getFCMToken(vapidKey);
      if (!fcmToken) {
        console.error("Failed to get FCM token");
        return false;
      }

      // Register token in Firestore
      await registerDeviceToken(user.uid, fcmToken);
      setToken(fcmToken);

      console.log("Push notifications enabled");
      return true;
    } catch (error) {
      console.error("Error enabling notifications:", error);
      return false;
    }
  }, [isSupported, vapidKey, user?.uid]);

  // Disable notifications
  const disableNotifications = useCallback(async (): Promise<void> => {
    if (!user?.uid || !token) return;

    try {
      await unregisterDeviceToken(user.uid, token);
      await deleteFCMToken();
      setToken(null);
      console.log("Push notifications disabled");
    } catch (error) {
      console.error("Error disabling notifications:", error);
    }
  }, [user?.uid, token]);

  // Handle auth state changes
  useEffect(() => {
    const currentUserId = user?.uid ?? null;

    // User logged out - cleanup
    if (!currentUserId && previousUserId && token) {
      unregisterDeviceToken(previousUserId, token).catch(console.error);
      deleteFCMToken().catch(console.error);
      setToken(null);
    }

    // Auto-register if user logs in and permission already granted
    if (
      currentUserId &&
      !previousUserId &&
      permission === "granted" &&
      vapidKey &&
      !token
    ) {
      enableNotifications().catch(console.error);
    }

    setPreviousUserId(currentUserId);
  }, [
    user?.uid,
    previousUserId,
    permission,
    vapidKey,
    token,
    enableNotifications,
  ]);

  // Handle foreground messages
  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onForegroundMessage((notification) => {
      console.log("Foreground notification:", notification);

      // Show browser notification
      if (notification.title) {
        showNotification(notification.title, {
          body: notification.body,
        });
      }

      // Call custom handler
      onNotificationReceived?.(notification);
    });

    return () => {
      unsubscribe?.();
    };
  }, [isSupported, onNotificationReceived]);

  const value: PushNotificationContextType = {
    isSupported,
    permission,
    isEnabled: !!token,
    enableNotifications,
    disableNotifications,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
