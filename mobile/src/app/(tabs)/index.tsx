import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Card, ScreenHeader, Button, Badge, ProgressBar } from '../../components/common';
import { Colors } from '../../theme/colors';
import { financeService, healthService } from '../../api/services';
import { FinanceDashboard, HealthSummary } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDashboardScreen() {
  const { user } = useAuth();
  const [finance, setFinance] = useState<FinanceDashboard | null>(null);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [fData, hData] = await Promise.all([
        financeService.getDashboard().catch(() => null),
        healthService.getSummary().catch(() => null),
      ]);
      if (fData) setFinance(fData);
      if (hData) setHealth(hData);
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const name = user?.full_name || user?.username || 'Seeker';
    if (user?.preferred_language === 'te') {
      return `నమస్కారం, ${name}!`;
    }
    if (user?.preferred_language === 'tanglish') {
      return `Namaskaram, ${name}!`;
    }
    return `Welcome back, ${name}!`;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="AVARA"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        rightAction={
          <Badge
            label={user?.preferred_language === 'te' ? 'తెలుగు' : user?.preferred_language === 'tanglish' ? 'Tanglish' : 'English'}
            bgColor={Colors.primaryDark}
            color="#FFF"
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* Welcome Greeting Banner */}
        <View style={styles.heroBox}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.heroSubtext}>
            Your AI companion for mindful finances, holistic wellness, and self-discovery.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickTile} onPress={() => router.push('/(tabs)/chat')}>
            <View style={[styles.tileIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <Ionicons name="chatbubbles" size={22} color={Colors.primaryLight} />
            </View>
            <Text style={styles.tileText}>AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => router.push('/finance/add-expense')}>
            <View style={[styles.tileIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="add-circle" size={22} color={Colors.secondary} />
            </View>
            <Text style={styles.tileText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => router.push('/health/add-entry')}>
            <View style={[styles.tileIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="heart" size={22} color={Colors.accent} />
            </View>
            <Text style={styles.tileText}>Wellness Note</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => router.push('/(tabs)/astrologers')}>
            <View style={[styles.tileIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="calendar" size={22} color={Colors.info} />
            </View>
            <Text style={styles.tileText}>Book Consult</Text>
          </TouchableOpacity>
        </View>

        {/* Finance Snapshot Card */}
        <Card style={styles.snapshotCard} onPress={() => router.push('/(tabs)/finance')}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet" size={20} color={Colors.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.cardHeaderTitle}>Monthly Spending</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricBig}>₹{finance ? finance.total_spending_month.toFixed(2) : '0.00'}</Text>
            <Text style={styles.metricSub}>
              {finance?.total_budget_month ? `of ₹${finance.total_budget_month.toFixed(0)} budget` : 'No budget set'}
            </Text>
          </View>

          {finance?.total_budget_month ? (
            <View style={{ marginTop: 10 }}>
              <ProgressBar
                progress={(finance.budget_utilization_pct || 0) / 100}
                color={(finance.budget_utilization_pct || 0) > 90 ? Colors.danger : Colors.primaryLight}
              />
              <Text style={styles.progressSubtext}>
                {finance.budget_utilization_pct}% utilized • ₹{finance.remaining_budget_month?.toFixed(2)} remaining
              </Text>
            </View>
          ) : null}

          {finance?.threshold_alert ? (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>{finance.threshold_alert}</Text>
            </View>
          ) : null}
        </Card>

        {/* Health & Wellness Snapshot Card */}
        <Card style={styles.snapshotCard} onPress={() => router.push('/(tabs)/health')}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="heart-half" size={20} color={Colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.cardHeaderTitle}>Wellness Check-ins</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>

          <View style={styles.wellnessGrid}>
            <View style={styles.wellnessCol}>
              <Text style={styles.wellnessVal}>{health?.total_entries || 0}</Text>
              <Text style={styles.wellnessLabel}>Total Entries</Text>
            </View>
            <View style={styles.wellnessCol}>
              <Text style={styles.wellnessVal}>{health?.average_mood_score ? `${health.average_mood_score}/5` : '-'}</Text>
              <Text style={styles.wellnessLabel}>Avg Mood</Text>
            </View>
            <View style={styles.wellnessCol}>
              <Text style={styles.wellnessVal}>{health?.average_sleep_hours ? `${health.average_sleep_hours}h` : '-'}</Text>
              <Text style={styles.wellnessLabel}>Avg Sleep</Text>
            </View>
            <View style={styles.wellnessCol}>
              <Text style={styles.wellnessVal}>🔥 {health?.wellness_streak_days || 0}d</Text>
              <Text style={styles.wellnessLabel}>Streak</Text>
            </View>
          </View>
        </Card>

        {/* Teammate 1 Integration Modules Banner */}
        <Card style={styles.teammateBanner}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="git-network-outline" size={20} color={Colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.teammateTitle}>Teammate 1 Integration Hub</Text>
            </View>
            <Badge label="Contracts Ready" bgColor={Colors.tagTelugu} color="#FFF" size="sm" />
          </View>
          <Text style={styles.teammateDesc}>
            Integration contracts, shared auth, language routing, and adapters for Astrology, Habits, and Insights.
          </Text>
          <View style={styles.teammateRow}>
            <TouchableOpacity style={styles.contractBtn} onPress={() => router.push('/teammate1/astrology')}>
              <Text style={styles.contractBtnText}>🪐 Astrology</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contractBtn} onPress={() => router.push('/teammate1/habits')}>
              <Text style={styles.contractBtnText}>⚡ Habits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contractBtn} onPress={() => router.push('/teammate1/insights')}>
              <Text style={styles.contractBtnText}>✨ Insights</Text>
            </TouchableOpacity>
          </View>
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
  heroBox: {
    marginBottom: 18,
    paddingVertical: 10,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  heroSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickTile: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  snapshotCard: {
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  metricBig: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  metricSub: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  alertBanner: {
    marginTop: 12,
    padding: 10,
    backgroundColor: Colors.warningBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  alertText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  wellnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessCol: {
    alignItems: 'center',
    flex: 1,
  },
  wellnessVal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  wellnessLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
  },
  teammateBanner: {
    backgroundColor: '#151329',
    borderColor: '#372B5E',
  },
  teammateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  teammateDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  teammateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contractBtn: {
    backgroundColor: '#241D45',
    borderWidth: 1,
    borderColor: '#4A3B7E',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  contractBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
