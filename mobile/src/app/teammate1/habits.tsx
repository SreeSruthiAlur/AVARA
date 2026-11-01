import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Badge, Button } from '../../components/common';
import { Colors } from '../../theme/colors';
import { integrationsService } from '../../api/services';

export default function Teammate1HabitsScreen() {
  const [adapterResponse, setAdapterResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAdapter = async () => {
    setLoading(true);
    try {
      const res = await integrationsService.getHabitsSummary();
      setAdapterResponse(res);
    } catch (e: any) {
      setAdapterResponse({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAdapter();
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Habits Module Interface"
        subtitle="Assigned to Teammate 1 • Integration Contract Ready"
        rightAction={
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.bannerCard}>
          <View style={styles.badgeRow}>
            <Badge label="Teammate 1 Scope" bgColor={Colors.tagTanglish} color="#FFF" />
            <Badge label="Contract Verified" bgColor={Colors.tagTelugu} color="#FFF" />
          </View>
          <Text style={styles.bannerTitle}>⚡ Habits & Routine Tracking Integration</Text>
          <Text style={styles.bannerText}>
            Per project architecture, Teammate 1 is responsible for habit creation, completion tracking,
            streak algorithms, and consistency statistics.
          </Text>
        </Card>

        {/* Live Adapter Response */}
        <Card>
          <View style={styles.adapterHeaderRow}>
            <Text style={styles.sectionHeader}>Habits Adapter Response</Text>
            <Button
              title="Test Adapter"
              onPress={testAdapter}
              variant="outline"
              loading={loading}
              style={{ paddingVertical: 6, paddingHorizontal: 10 }}
            />
          </View>

          {adapterResponse ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{JSON.stringify(adapterResponse, null, 2)}</Text>
            </View>
          ) : null}
        </Card>

        {/* How to integrate */}
        <Card style={styles.guideCard}>
          <Text style={styles.guideTitle}>How Teammate 1 Connects Their Code</Text>
          <Text style={styles.guideStep}>
            1. Implement Habit database models and business logic.
          </Text>
          <Text style={styles.guideStep}>
            2. Subclass <Text style={styles.codeInline}>BaseHabitsAdapter</Text> in <Text style={styles.codeInline}>backend/app/services/teammate1_adapters.py</Text>.
          </Text>
          <Text style={styles.guideStep}>
            3. Set <Text style={styles.codeInline}>habits_adapter = YourHabitsAdapter()</Text>.
          </Text>
          <Text style={styles.guideStep}>
            4. The intent classifier and chat service will forward habit requests directly to your logic.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#201A15',
    borderColor: '#4A3728',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  adapterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  codeText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.secondaryLight,
  },
  guideCard: {
    backgroundColor: '#111927',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  guideStep: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  codeInline: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
});
