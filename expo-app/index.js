import "expo-router/entry";

// Note: Background message handler for push notifications should be registered here
// BEFORE the app is registered. This file runs before the app component mounts.
//
// If you add @react-native-firebase/messaging for push notifications, uncomment below:
//
// import AsyncStorage from "@react-native-async-storage/async-storage";
//
// const PENDING_NOTIFICATION_KEY = "@app/pending_notification";
//
// try {
//   const messaging = require("@react-native-firebase/messaging").default;
//
//   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     console.log("Message handled in background:", remoteMessage);
//
//     // Store for processing when app opens
//     try {
//       const pendingNotification = {
//         title: remoteMessage.notification?.title,
//         body: remoteMessage.notification?.body,
//         data: remoteMessage.data,
//         messageId: remoteMessage.messageId,
//         timestamp: Date.now(),
//       };
//       await AsyncStorage.setItem(
//         PENDING_NOTIFICATION_KEY,
//         JSON.stringify(pendingNotification)
//       );
//     } catch (error) {
//       console.warn("Failed to store pending notification:", error);
//     }
//   });
// } catch (error) {
//   console.warn("Firebase messaging not available:", error);
// }

