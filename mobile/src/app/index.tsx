import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

export default function EntryRedirectScreen() {
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (token && user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, token, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
