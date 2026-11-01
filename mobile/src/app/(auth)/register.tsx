import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components/common';
import { Colors } from '../../theme/colors';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'te' | 'en' | 'tanglish'>('te');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthPlace, setBirthPlace] = useState('Hyderabad, India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password) {
      setError('Please fill in email, username, and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        full_name: fullName.trim() || undefined,
        preferred_language: preferredLanguage,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Begin your personal journey with AVARA</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <Input
          label="Email Address *"
          value={email}
          onChangeText={setEmail}
          placeholder="your_email@example.com"
          keyboardType="email-address"
        />

        <Input
          label="Username *"
          value={username}
          onChangeText={setUsername}
          placeholder="vinya_nlp"
        />

        <Input
          label="Password (min 6 chars) *"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Vinya"
        />

        {/* Preferred Language Selector */}
        <Text style={styles.fieldLabel}>Preferred Language</Text>
        <View style={styles.langRow}>
          {[
            { id: 'te', label: 'తెలుగు (Telugu)' },
            { id: 'tanglish', label: 'Tanglish' },
            { id: 'en', label: 'English' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.langChip,
                preferredLanguage === item.id && styles.langChipActive,
              ]}
              onPress={() => setPreferredLanguage(item.id as any)}
            >
              <Text
                style={[
                  styles.langChipText,
                  preferredLanguage === item.id && styles.langChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Birth Details (Stored for Astrological integration)</Text>
        <Input
          label="Birth Date (YYYY-MM-DD)"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="2000-01-01"
        />
        <Input
          label="Birth Time (HH:MM)"
          value={birthTime}
          onChangeText={setBirthTime}
          placeholder="12:00"
        />
        <Input
          label="Birth Place"
          value={birthPlace}
          onChangeText={setBirthPlace}
          placeholder="City, State"
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={{ marginTop: 14 }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.switchLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  card: {
    padding: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.danger,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  langChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  langChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  langChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 10,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
