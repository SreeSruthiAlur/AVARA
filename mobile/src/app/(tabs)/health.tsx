import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Button, Badge, EmptyState } from '../../components/common';
import { Colors } from '../../theme/colors';
import { healthService } from '../../api/services';
import { HealthSummary, WellnessEntry } from '../../types';

export default function HealthScreen() {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealthData = async () => {
    try {
      const [sumData, entList] = await Promise.all([
        healthService.getSummary(),
        healthService.getEntries({ limit: '30' }),
      ]);
      setSummary(sumData);
      setEntries(entList);
    } catch (e: any) {
      console.warn('Health fetch error', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHealthData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  };

  const handleDeleteEntry = (id: number) => {
    Alert.alert('Delete Entry', 'Remove this wellness record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await healthService.deleteEntry(id);
            await loadHealthData();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const getMoodEmoji = (score: number) => {
    switch (score) {
      case 5:
        return '🤩';
      case 4:
        return '😊';
      case 3:
        return '😐';
      case 2:
        return '😔';
      case 1:
        return '😫';
      default:
        return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="AVARA Wellness"
        subtitle="Daily mood, energy, and mindfulness check-ins"
        rightAction={
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/health/add-entry')}
          >
            <Ionicons name="add" size={20} color={Colors.accentLight} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentLight} />}
      >
        {/* Summary Metric Cards */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Daily Streak</Text>
            <Text style={[styles.metricValue, { color: Colors.secondary }]}>
              🔥 {summary?.wellness_streak_days || 0}
            </Text>
            <Text style={styles.metricSub}>Days logged</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Average Mood</Text>
            <Text style={[styles.metricValue, { color: Colors.accent }]}>
              {summary?.average_mood_score ? `${summary.average_mood_score}/5` : '-'}
            </Text>
            <Text style={styles.metricSub}>Scale 1 to 5</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Average Sleep</Text>
            <Text style={[styles.metricValue, { color: Colors.info }]}>
              {summary?.average_sleep_hours ? `${summary.average_sleep_hours}h` : '-'}
            </Text>
            <Text style={styles.metricSub}>Hours / night</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Activity</Text>
            <Text style={[styles.metricValue, { color: Colors.primaryLight }]}>
              {summary?.total_activity_minutes || 0}m
            </Text>
            <Text style={styles.metricSub}>Active minutes</Text>
          </Card>
        </View>

        {/* Action Prompt */}
        <TouchableOpacity
          style={styles.checkinPromptCard}
          onPress={() => router.push('/health/add-entry')}
        >
          <View style={styles.promptIconBox}>
            <Ionicons name="heart" size={24} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promptTitle}>Record Today's Wellness</Text>
            <Text style={styles.promptSub}>How are you feeling physically and mentally today?</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Wellness History Entries */}
        <Text style={styles.sectionHeader}>Check-in History</Text>
        {entries.length === 0 ? (
          <EmptyState
            title="No Wellness Entries"
            message="Your daily mood, energy, and sleep records will appear here."
            actionText="Record First Check-in"
            onAction={() => router.push('/health/add-entry')}
          />
        ) : (
          entries.map((item) => (
            <Card key={item.id} style={styles.entryCard}>
              <View style={styles.entryTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.entryEmoji}>{getMoodEmoji(item.mood_score)}</Text>
                  <View>
                    <Text style={styles.entryMoodTitle}>{item.mood}</Text>
                    <Text style={styles.entryDate}>{item.date}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteEntry(item.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.entryStatsRow}>
                <Badge label={`Energy: ${item.energy_level}/5`} bgColor={Colors.elevated} size="sm" />
                {item.sleep_hours ? (
                  <Badge label={`Sleep: ${item.sleep_hours} hrs`} bgColor={Colors.elevated} size="sm" />
                ) : null}
                {item.activity_minutes ? (
                  <Badge label={`Activity: ${item.activity_minutes} min`} bgColor={Colors.elevated} size="sm" />
                ) : null}
              </View>

              {item.wellness_goals ? (
                <View style={styles.goalsBox}>
                  <Text style={styles.goalsLabel}>🎯 Goal:</Text>
                  <Text style={styles.goalsText}>{item.wellness_goals}</Text>
                </View>
              ) : null}

              {item.notes ? (
                <Text style={styles.entryNotes}>"{item.notes}"</Text>
              ) : null}
            </Card>
          ))
        )}
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
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    marginBottom: 0,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  checkinPromptCard: {
    backgroundColor: '#122521',
    borderWidth: 1,
    borderColor: '#1D453C',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  promptIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  promptSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  entryCard: {
    padding: 16,
    marginBottom: 12,
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryEmoji: {
    fontSize: 28,
  },
  entryMoodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  entryStatsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  goalsBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  goalsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  goalsText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  entryNotes: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
});
