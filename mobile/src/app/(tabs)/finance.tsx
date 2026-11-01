import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Button, ProgressBar, Badge, EmptyState } from '../../components/common';
import { Colors } from '../../theme/colors';
import { financeService } from '../../api/services';
import { FinanceDashboard, Expense } from '../../types';

export default function FinanceScreen() {
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // AI Finance Assistant Query State
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const loadFinanceData = async () => {
    try {
      const [dash, expList] = await Promise.all([
        financeService.getDashboard(),
        financeService.getExpenses({ limit: '50' }),
      ]);
      setDashboard(dash);
      setExpenses(expList);
    } catch (err: any) {
      console.warn('Finance data load failed', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFinanceData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFinanceData();
    setRefreshing(false);
  };

  const handleDeleteExpense = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await financeService.deleteExpense(id);
            await loadFinanceData();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleAskAssistant = async () => {
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    try {
      const res = await financeService.queryAssistant(assistantQuery.trim());
      setAssistantAnswer(res.deterministic_answer);
    } catch (err: any) {
      setAssistantAnswer(err.message || 'Error processing query');
    } finally {
      setAssistantLoading(false);
    }
  };

  const categories = ['All', 'Food', 'Transportation', 'Shopping', 'Education', 'Entertainment', 'Healthcare', 'Bills', 'Other'];

  const filteredExpenses = expenses.filter((e) => {
    const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="AVARA Finance"
        subtitle="Mindful expense and budget management"
        rightAction={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/finance/budgets')}
            >
              <Ionicons name="pie-chart-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/finance/add-expense')}
            >
              <Ionicons name="add" size={20} color={Colors.primaryLight} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* Monthly Budget Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryMonth}>{dashboard?.current_month || 'Current Month'}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.totalSpentText}>₹{dashboard?.total_spending_month.toFixed(2) || '0.00'}</Text>
            <Text style={styles.spentLabel}>Total Spent</Text>
          </View>

          {dashboard?.total_budget_month ? (
            <View style={{ marginTop: 14 }}>
              <View style={styles.budgetStatRow}>
                <Text style={styles.budgetStatText}>
                  Budget: ₹{dashboard.total_budget_month.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.budgetStatText,
                    {
                      color:
                        (dashboard.remaining_budget_month || 0) < 0
                          ? Colors.danger
                          : Colors.accent,
                    },
                  ]}
                >
                  Remaining: ₹{dashboard.remaining_budget_month?.toFixed(2)}
                </Text>
              </View>

              <ProgressBar
                progress={(dashboard.budget_utilization_pct || 0) / 100}
                color={
                  (dashboard.budget_utilization_pct || 0) > 100
                    ? Colors.danger
                    : (dashboard.budget_utilization_pct || 0) > 80
                    ? Colors.warning
                    : Colors.primaryLight
                }
                height={10}
              />
              <Text style={styles.utilizationText}>
                {dashboard.budget_utilization_pct}% of monthly limit used
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.setBudgetPrompt}
              onPress={() => router.push('/finance/budgets')}
            >
              <Text style={styles.setBudgetText}>+ Set monthly budget to enable utilization alerts</Text>
            </TouchableOpacity>
          )}

          {dashboard?.threshold_alert ? (
            <View style={styles.alertBox}>
              <Ionicons name="warning" size={16} color={Colors.warning} style={{ marginRight: 6 }} />
              <Text style={styles.alertText}>{dashboard.threshold_alert}</Text>
            </View>
          ) : null}
        </Card>

        {/* AI Finance Assistant Card (Deterministic calculations) */}
        <Card style={styles.assistantCard}>
          <View style={styles.assistantHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.assistantTitle}>AI Finance Assistant</Text>
            <Badge label="Deterministic" bgColor={Colors.tagTelugu} color="#FFF" size="sm" />
          </View>
          <Text style={styles.assistantSub}>
            Ask verified questions about your real recorded expenses (Telugu / Tanglish / English):
          </Text>

          <View style={styles.assistantInputRow}>
            <TextInput
              style={styles.assistantInput}
              placeholder="e.g. How much did I spend this month? or Highest category?"
              placeholderTextColor={Colors.textMuted}
              value={assistantQuery}
              onChangeText={setAssistantQuery}
            />
            <TouchableOpacity
              style={styles.assistantSendBtn}
              onPress={handleAskAssistant}
              disabled={assistantLoading}
            >
              <Ionicons name="search" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {assistantAnswer ? (
            <View style={styles.assistantAnswerBox}>
              <Text style={styles.assistantAnswerText}>{assistantAnswer}</Text>
            </View>
          ) : null}
        </Card>

        {/* Category Breakdown Progress */}
        {dashboard?.category_breakdown && dashboard.category_breakdown.length > 0 ? (
          <Card>
            <Text style={styles.sectionHeader}>Category Breakdown</Text>
            {dashboard.category_breakdown.map((cat, idx) => (
              <View key={idx} style={styles.catRow}>
                <View style={styles.catInfoRow}>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={styles.catAmount}>₹{cat.amount.toFixed(2)} ({cat.percentage}%)</Text>
                </View>
                <ProgressBar
                  progress={cat.percentage / 100}
                  color={cat.is_over_budget ? Colors.danger : Colors.primaryLight}
                  height={6}
                />
                {cat.budget_limit ? (
                  <Text style={styles.catLimitSub}>
                    Limit: ₹{cat.budget_limit.toFixed(0)} {cat.is_over_budget ? '⚠️ Over Budget' : ''}
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        {/* Transactions Section */}
        <View style={styles.txHeaderRow}>
          <Text style={styles.sectionHeader}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/finance/add-expense')}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Category Filter Pills */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by description or category..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.filterChip, selectedCategory === c && styles.filterChipActive]}
              onPress={() => setSelectedCategory(c)}
            >
              <Text style={[styles.filterChipText, selectedCategory === c && styles.filterChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredExpenses.length === 0 ? (
          <EmptyState
            title="No Transactions Found"
            message={
              searchQuery
                ? 'No transactions matched your search.'
                : 'You have not added any expenses in this category yet.'
            }
            actionText="Add First Expense"
            onAction={() => router.push('/finance/add-expense')}
          />
        ) : (
          filteredExpenses.map((exp) => (
            <Card key={exp.id} style={styles.txCard}>
              <View style={styles.txMainRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txCategory}>{exp.category}</Text>
                  <Text style={styles.txDesc}>{exp.description || 'No description'}</Text>
                  <View style={styles.txMetaRow}>
                    <Text style={styles.txDate}>{exp.date}</Text>
                    <Badge label={exp.payment_method} size="sm" />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.txAmount}>-₹{exp.amount.toFixed(2)}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(exp.id)}
                    style={styles.txDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
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
  summaryCard: {
    padding: 20,
    backgroundColor: '#131926',
  },
  summaryMonth: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountRow: {
    marginVertical: 10,
  },
  totalSpentText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
  },
  spentLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  budgetStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  utilizationText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  setBudgetPrompt: {
    marginTop: 10,
    paddingVertical: 8,
  },
  setBudgetText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  alertText: {
    fontSize: 12,
    color: Colors.warning,
    flex: 1,
    fontWeight: '500',
  },
  assistantCard: {
    backgroundColor: '#191729',
    borderColor: '#372E54',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  assistantTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  assistantSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  assistantInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  assistantInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  assistantSendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantAnswerBox: {
    backgroundColor: '#231E3D',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  assistantAnswerText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  catRow: {
    marginBottom: 12,
  },
  catInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  catAmount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  catLimitSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  addLink: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 10,
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  txCard: {
    padding: 14,
    marginBottom: 10,
  },
  txMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txCategory: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  txDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  txDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  txAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.danger,
    marginBottom: 8,
  },
  txDeleteBtn: {
    padding: 4,
  },
});
