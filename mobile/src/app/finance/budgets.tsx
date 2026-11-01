import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Input, Button } from '../../components/common';
import { Colors } from '../../theme/colors';
import { financeService } from '../../api/services';

const DEFAULT_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Healthcare',
  'Bills',
];

export default function BudgetsScreen() {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [month, setMonth] = useState(currentMonthStr);
  const [totalBudget, setTotalBudget] = useState('15000');
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({
    Food: '5000',
    Transportation: '2500',
    Shopping: '3000',
    Entertainment: '1500',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to load existing budget for this month
    financeService
      .getBudget(month)
      .then((b) => {
        if (b) {
          setTotalBudget(String(b.total_budget));
          const limitsStr: Record<string, string> = {};
          for (const [k, v] of Object.entries(b.category_limits || {})) {
            limitsStr[k] = String(v);
          }
          setCategoryLimits(limitsStr);
        }
      })
      .catch(() => {
        // No budget set yet
      });
  }, [month]);

  const handleSaveBudget = async () => {
    const totalNum = parseFloat(totalBudget);
    if (isNaN(totalNum) || totalNum <= 0) {
      Alert.alert('Invalid Total', 'Please enter a valid monthly total budget.');
      return;
    }

    const limitsNum: Record<string, number> = {};
    for (const [cat, val] of Object.entries(categoryLimits)) {
      const n = parseFloat(val);
      if (!isNaN(n) && n > 0) {
        limitsNum[cat] = n;
      }
    }

    setLoading(true);
    try {
      await financeService.setBudget({
        month,
        total_budget: totalNum,
        category_limits: limitsNum,
      });
      Alert.alert('Budget Saved', `Monthly budget for ${month} has been updated.`);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryLimit = (cat: string, val: string) => {
    setCategoryLimits((prev) => ({ ...prev, [cat]: val }));
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Budget Manager"
        subtitle="Set spending limits to prevent budget overruns"
        rightAction={
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Input
            label="Month (YYYY-MM) *"
            value={month}
            onChangeText={setMonth}
            placeholder="2026-11"
          />

          <Input
            label="Total Monthly Spending Limit (₹) *"
            value={totalBudget}
            onChangeText={setTotalBudget}
            placeholder="15000"
            keyboardType="numeric"
          />

          <Text style={styles.sectionHeader}>Category Spending Limits (Optional)</Text>
          <Text style={styles.subtext}>
            Set caps for specific categories to receive real-time threshold warnings:
          </Text>

          {DEFAULT_CATEGORIES.map((cat) => (
            <Input
              key={cat}
              label={`${cat} Limit (₹)`}
              value={categoryLimits[cat] || ''}
              onChangeText={(val) => updateCategoryLimit(cat, val)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          ))}

          <Button
            title="Save Monthly Budget"
            onPress={handleSaveBudget}
            loading={loading}
            style={{ marginTop: 14 }}
          />
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
  closeBtn: {
    padding: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },
});
