"use client";

/**
 * Push Notifications Hook for Web
 *
 * Manages push notification lifecycle including:
 * - Permission requests
 * - Token registration on login
 * - Token cleanup on logout
 * - Foreground message handling
 */

import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import {
  deleteFCMToken,
  getFCMToken,
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

interface UsePushNotificationsOptions {
  /**
   * VAPID key from Firebase Console (Project Settings > Cloud Messaging > Web Push certificates)
   */
  vapidKey: string;

  /**
   * Called when a notification is received in the foreground
   */
  onNotificationReceived?: (notification: NotificationData) => void;

  /**
   * Whether to show browser notifications for foreground messages
   * @default true
   */
  showForegroundNotification?: boolean;

  /**
   * Whether to automatically request permission on mount
   * @default false
   */
  autoRequestPermission?: boolean;
}

interface UsePushNotificationsReturn {
  /**
   * Whether push notifications are supported in this browser
   */
  isSupported: boolean;

  /**
   * Current notification permission status
   */
  permission: NotificationPermission | null;

  /**
   * Request notification permission from the user
   */
  requestPermission: () => Promise<boolean>;

  /**
   * Current FCM token (null if not registered)
   */
  token: string | null;
}

/**
 * Hook to manage web push notifications.
 * Automatically registers/unregisters tokens based on auth state.
 */
export function usePushNotifications(
  options: UsePushNotificationsOptions,
): UsePushNotificationsReturn {
  const { user } = useAuth();
  const {
    vapidKey,
    onNotificationReceived,
    showForegroundNotification = true,
    autoRequestPermission = false,
  } = options;

  // Track the current token
  const currentTokenRef = useRef<string | null>(null);
  const previousUserRef = useRef<string | null>(null);

  // Check if supported
  const isSupported = isPushNotificationSupported();

  // Get current permission
  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : null;

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    return requestNotificationPermission();
  }, [isSupported]);

  // Handle token registration
  const registerToken = useCallback(
    async (uid: string) => {
      if (!isSupported) return;

      try {
        // Check/request permission
        if (Notification.permission !== "granted") {
          if (autoRequestPermission) {
            const granted = await requestNotificationPermission();
            if (!granted) {
              console.log("Notification permission not granted");
              return;
            }
          } else {
            console.log(
              "Notification permission not granted, skipping registration",
            );
            return;
          }
        }

        // Get FCM token
        const token = await getFCMToken(vapidKey);
        if (!token) {
          console.log("Could not get FCM token");
          return;
        }

        // Store token reference
        currentTokenRef.current = token;

        // Register with Firestore
        await registerDeviceToken(uid, token);
        console.log("Web push notifications initialized");
      } catch (error) {
        console.error("Error initializing web push notifications:", error);
      }
    },
    [isSupported, vapidKey, autoRequestPermission],
  );

  // Handle token cleanup
  const unregisterToken = useCallback(async (uid: string) => {
    try {
      const token = currentTokenRef.current;
      if (token) {
        await unregisterDeviceToken(uid, token);
        currentTokenRef.current = null;
      }
      await deleteFCMToken();
      console.log("Web push notifications cleaned up");
    } catch (error) {
      console.error("Error cleaning up web push notifications:", error);
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const currentUid = user?.uid ?? null;
    const previousUid = previousUserRef.current;

    // User logged in
    if (currentUid && !previousUid) {
      registerToken(currentUid);
    }

    // User logged out
    if (!currentUid && previousUid) {
      unregisterToken(previousUid);
    }

    previousUserRef.current = currentUid;
  }, [user?.uid, registerToken, unregisterToken]);

  // Handle foreground messages
  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onForegroundMessage((notification) => {
      console.log("Foreground notification received:", notification.title);

      // Show browser notification
      if (showForegroundNotification && notification.title) {
        showNotification(notification.title, {
          body: notification.body,
          data: notification.data,
        });
      }

      // Call custom handler
      onNotificationReceived?.(notification);
    });

    return () => {
      unsubscribe?.();
    };
  }, [isSupported, showForegroundNotification, onNotificationReceived]);

  return {
    isSupported,
    permission,
    requestPermission,
    token: currentTokenRef.current,
  };
}
