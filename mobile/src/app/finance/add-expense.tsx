import React, { useState } from 'react';
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
  'Other',
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking'];

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount greater than 0.');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      Alert.alert('Category Required', 'Please choose or type a category.');
      return;
    }

    setLoading(true);
    try {
      await financeService.createExpense({
        amount: num,
        category: finalCategory,
        date: date,
        description: description.trim() || undefined,
        payment_method: paymentMethod,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Add Expense"
        subtitle="Log an expense into your operational records"
        rightAction={
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Input
            label="Amount (₹) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Category *</Text>
          <View style={styles.chipGrid}>
            {[...DEFAULT_CATEGORIES, 'Custom'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === 'Custom' ? (
            <Input
              label="Custom Category Name"
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="e.g. Subscriptions"
            />
          ) : null}

          <Input
            label="Date (YYYY-MM-DD) *"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Description / Merchant"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Swiggy dinner or Metro ticket"
          />

          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.chipRow}>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm}
                style={[styles.chip, paymentMethod === pm && styles.chipActive]}
                onPress={() => setPaymentMethod(pm)}
              >
                <Text style={[styles.chipText, paymentMethod === pm && styles.chipTextActive]}>
                  {pm}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Record Expense"
            onPress={handleSave}
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  chipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
