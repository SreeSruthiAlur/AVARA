import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Badge, Button } from '../../components/common';
import { Colors } from '../../theme/colors';
import { integrationsService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export default function Teammate1AstrologyScreen() {
  const { user } = useAuth();
  const [adapterResponse, setAdapterResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAdapter = async () => {
    setLoading(true);
    try {
      const res = await integrationsService.getAstrologyChart({
        user_id: user?.id || 1,
        birth_date: user?.birth_date || '2000-01-01',
        birth_time: user?.birth_time || '12:00',
        birth_place: user?.birth_place || 'Hyderabad, India',
        preferred_language: user?.preferred_language || 'te',
      });
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
        title="Astrology Module Interface"
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
          <Text style={styles.bannerTitle}>🪐 Astrology Intelligence Integration</Text>
          <Text style={styles.bannerText}>
            Per project architecture, Teammate 1 is responsible for planetary calculations, birth-chart algorithms,
            scriptural evidence retrieval, and astrological interpretations.
          </Text>
        </Card>

        {/* Provided Infrastructure from Teammate 2 */}
        <Card>
          <Text style={styles.sectionHeader}>Shared Services Provided by Teammate 2</Text>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.bulletText}>User Authentication & JWT Middleware</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.bulletText}>Birth Date, Time & Place Schema Storage</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.bulletText}>Telugu, English, and Tanglish Intent Routing</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.bulletText}>Safety Interception Layer (prevents clinical/suicide queries from reaching astrology)</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.bulletText}>Shared LLM Provider & Retry Infrastructure</Text>
          </View>
        </Card>

        {/* Live Adapter Response */}
        <Card>
          <View style={styles.adapterHeaderRow}>
            <Text style={styles.sectionHeader}>Adapter Test Response</Text>
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

        {/* How Teammate 1 connects their module */}
        <Card style={styles.guideCard}>
          <Text style={styles.guideTitle}>How Teammate 1 Connects Their Code</Text>
          <Text style={styles.guideStep}>
            1. Open <Text style={styles.codeInline}>backend/app/services/teammate1_adapters.py</Text>.
          </Text>
          <Text style={styles.guideStep}>
            2. Subclass <Text style={styles.codeInline}>BaseAstrologyAdapter</Text> and implement your planetary calculation algorithms.
          </Text>
          <Text style={styles.guideStep}>
            3. Set <Text style={styles.codeInline}>astrology_adapter = YourAstrologyAdapter()</Text>.
          </Text>
          <Text style={styles.guideStep}>
            4. The shared Chatbot, API routes, and mobile UI will automatically route astrology queries to your module!
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
    backgroundColor: '#1E162B',
    borderColor: '#422D63',
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
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  bulletText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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
    color: Colors.accentLight,
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
