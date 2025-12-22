import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="login"
          options={{
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
