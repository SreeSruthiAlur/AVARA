import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { Colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="finance/add-expense"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="finance/budgets"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="health/add-entry"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="teammate1/astrology"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="teammate1/habits"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="teammate1/insights"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
