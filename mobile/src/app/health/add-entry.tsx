import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Input, Button } from '../../components/common';
import { Colors } from '../../theme/colors';
import { healthService } from '../../api/services';

const MOODS = [
  { score: 5, label: 'Great', emoji: '🤩' },
  { score: 4, label: 'Good', emoji: '😊' },
  { score: 3, label: 'Neutral', emoji: '😐' },
  { score: 2, label: 'Low', emoji: '😔' },
  { score: 1, label: 'Stressed', emoji: '😫' },
];

export default function AddWellnessEntryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMood, setSelectedMood] = useState(MOODS[1]); // Good
  const [energyLevel, setEnergyLevel] = useState(4);
  const [sleepHours, setSleepHours] = useState('7.5');
  const [activityMinutes, setActivityMinutes] = useState('30');
  const [goals, setGoals] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const sleep = sleepHours.trim() ? parseFloat(sleepHours) : undefined;
    const activity = activityMinutes.trim() ? parseInt(activityMinutes, 10) : undefined;

    setLoading(true);
    try {
      await healthService.createEntry({
        date,
        mood: selectedMood.label,
        mood_score: selectedMood.score,
        energy_level: energyLevel,
        sleep_hours: sleep,
        activity_minutes: activity,
        wellness_goals: goals.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save wellness entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Daily Wellness Check-in"
        subtitle="Record your physical and mental state"
        rightAction={
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Input
            label="Date (YYYY-MM-DD) *"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          {/* Mood Selection */}
          <Text style={styles.fieldLabel}>How is your mood today? *</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.score}
                style={[
                  styles.moodTile,
                  selectedMood.score === m.score && styles.moodTileActive,
                ]}
                onPress={() => setSelectedMood(m)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood.score === m.score && styles.moodLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Energy Level 1-5 */}
          <Text style={styles.fieldLabel}>Energy Level (1 = Exhausted, 5 = High Vitality): {energyLevel}/5</Text>
          <View style={styles.energyRow}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.energyTile, energyLevel === lvl && styles.energyTileActive]}
                onPress={() => setEnergyLevel(lvl)}
              >
                <Text
                  style={[
                    styles.energyText,
                    energyLevel === lvl && styles.energyTextActive,
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Sleep Duration (Hours)"
            value={sleepHours}
            onChangeText={setSleepHours}
            placeholder="e.g. 7.5"
            keyboardType="numeric"
          />

          <Input
            label="Physical Activity / Exercise (Minutes)"
            value={activityMinutes}
            onChangeText={setActivityMinutes}
            placeholder="e.g. 45"
            keyboardType="numeric"
          />

          <Input
            label="Personal Wellness Goal for Today"
            value={goals}
            onChangeText={setGoals}
            placeholder="e.g. 10 min meditation, drink 2.5L water"
          />

          <Input
            label="Mindfulness Notes & Reflections"
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling today?"
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Check-in"
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
    marginTop: 6,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodTile: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
  },
  moodTileActive: {
    backgroundColor: '#1E2B27',
    borderColor: Colors.accent,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  moodLabelActive: {
    color: Colors.accent,
    fontWeight: '700',
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  energyTile: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  energyTileActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  energyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  energyTextActive: {
    color: '#FFF',
  },
});
