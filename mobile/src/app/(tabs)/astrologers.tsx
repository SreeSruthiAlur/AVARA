import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Button, Badge, Input, EmptyState } from '../../components/common';
import { Colors } from '../../theme/colors';
import { astrologerService } from '../../api/services';
import { Astrologer, Booking } from '../../types';

export default function AstrologersScreen() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'directory' | 'bookings'>('directory');

  // Booking Modal State
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationTopic, setConsultationTopic] = useState('Career & Life Guidance');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const loadData = async () => {
    try {
      const [astros, bList] = await Promise.all([
        astrologerService.listAstrologers(),
        astrologerService.getMyBookings().catch(() => []),
      ]);
      setAstrologers(astros);
      setMyBookings(bList);
    } catch (e: any) {
      console.warn('Astrologer load error', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenBooking = (astro: Astrologer) => {
    setSelectedAstrologer(astro);
    setSelectedSlot(astro.available_slots[0] || '10:00 AM');
    setBookingNotes('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedAstrologer || !selectedSlot) return;
    setBookingLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await astrologerService.bookConsultation({
        astrologer_id: selectedAstrologer.id,
        booking_date: todayStr,
        time_slot: selectedSlot,
        consultation_topic: consultationTopic,
        notes: bookingNotes || undefined,
      });
      setSelectedAstrologer(null);
      Alert.alert(
        'Consultation Requested',
        `Your consultation request with ${selectedAstrologer.name} for ${selectedSlot} has been recorded (Demonstration Mode).`
      );
      await loadData();
      setTab('bookings');
    } catch (e: any) {
      Alert.alert('Booking Error', e.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = (id: number) => {
    Alert.alert('Cancel Booking', 'Cancel this consultation booking request?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await astrologerService.cancelBooking(id);
            await loadData();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Astrologer Consultations"
        subtitle="Verified Vedic and KP Astrology guidance"
        rightAction={
          <Badge label="Demonstration" bgColor={Colors.tagTanglish} color="#FFF" size="sm" />
        }
      />

      {/* Segmented Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'directory' && styles.segmentBtnActive]}
          onPress={() => setTab('directory')}
        >
          <Text style={[styles.segmentText, tab === 'directory' && styles.segmentTextActive]}>
            Directory ({astrologers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'bookings' && styles.segmentBtnActive]}
          onPress={() => setTab('bookings')}
        >
          <Text style={[styles.segmentText, tab === 'bookings' && styles.segmentTextActive]}>
            My Consultations ({myBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {tab === 'directory' ? (
          <>
            <View style={styles.demoNotice}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.demoNoticeText}>
                Profiles are explicitly marked demonstration models. Simulated bookings reflect operational database records.
              </Text>
            </View>

            {astrologers.map((astro) => (
              <Card key={astro.id} style={styles.astroCard}>
                <View style={styles.astroHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.astroName}>{astro.name}</Text>
                    <Text style={styles.astroTitle}>{astro.title}</Text>
                  </View>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingText}>⭐ {astro.rating}</Text>
                  </View>
                </View>

                <Text style={styles.astroBio}>{astro.bio}</Text>

                <View style={styles.tagWrap}>
                  {astro.areas_of_expertise.map((exp, i) => (
                    <Badge key={i} label={exp} bgColor={Colors.elevated} size="sm" />
                  ))}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoText}>🗣️ {astro.languages.join(', ')}</Text>
                  <Text style={styles.infoText}>⏳ {astro.experience_years} yrs exp</Text>
                  <Text style={styles.feeText}>₹{astro.consultation_fee.toFixed(0)}</Text>
                </View>

                <Button
                  title="Book Consultation"
                  onPress={() => handleOpenBooking(astro)}
                  variant="outline"
                  style={{ marginTop: 12 }}
                />
              </Card>
            ))}
          </>
        ) : (
          <>
            {myBookings.length === 0 ? (
              <EmptyState
                title="No Bookings Yet"
                message="You have not requested any astrologer consultations yet."
                actionText="Browse Astrologer Directory"
                onAction={() => setTab('directory')}
              />
            ) : (
              myBookings.map((b) => (
                <Card key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeaderRow}>
                    <Text style={styles.bookingAstroName}>{b.astrologer_name || 'Astrologer Consultation'}</Text>
                    <Badge
                      label={b.status.toUpperCase()}
                      bgColor={
                        b.status === 'confirmed'
                          ? Colors.tagTelugu
                          : b.status === 'cancelled'
                          ? Colors.dangerBg
                          : Colors.warningBg
                      }
                      color={
                        b.status === 'confirmed'
                          ? '#FFF'
                          : b.status === 'cancelled'
                          ? Colors.danger
                          : Colors.warning
                      }
                      size="sm"
                    />
                  </View>

                  <Text style={styles.bookingTopic}>Topic: {b.consultation_topic}</Text>
                  <Text style={styles.bookingSlot}>
                    📅 {b.booking_date} at {b.time_slot}
                  </Text>
                  {b.notes ? <Text style={styles.bookingNotes}>Note: {b.notes}</Text> : null}

                  {b.status !== 'cancelled' ? (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelBooking(b.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  ) : null}
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Booking Form Modal */}
      <Modal visible={!!selectedAstrologer} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Consultation</Text>
              <TouchableOpacity onPress={() => setSelectedAstrologer(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalAstroName}>{selectedAstrologer?.name}</Text>
            <Text style={styles.modalAstroSub}>{selectedAstrologer?.title}</Text>

            <Text style={styles.fieldLabel}>Available Time Slots</Text>
            <View style={styles.slotsRow}>
              {selectedAstrologer?.available_slots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotChipText, selectedSlot === slot && styles.slotChipTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Consultation Topic *"
              value={consultationTopic}
              onChangeText={setConsultationTopic}
              placeholder="e.g. Career, Health or Muhurtha discussion"
            />

            <Input
              label="Personal Notes (Optional)"
              value={bookingNotes}
              onChangeText={setBookingNotes}
              placeholder="Questions you wish to discuss..."
              multiline
              numberOfLines={2}
            />

            <Button
              title="Confirm Booking Request"
              onPress={handleSubmitBooking}
              loading={bookingLoading}
              style={{ marginTop: 10 }}
            />
          </Card>
        </View>
      </Modal>
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    padding: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.elevated,
  },
  segmentText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.text,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B29',
    borderColor: '#372E4C',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  demoNoticeText: {
    fontSize: 12,
    color: Colors.secondaryLight,
    flex: 1,
  },
  astroCard: {
    padding: 16,
    marginBottom: 14,
  },
  astroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  astroName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  astroTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBox: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  astroBio: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
  },
  bookingCard: {
    padding: 16,
    marginBottom: 12,
  },
  bookingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingAstroName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  bookingTopic: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bookingSlot: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  bookingNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.dangerBg,
  },
  cancelBtnText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 22,
    marginBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalAstroName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  modalAstroSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  slotChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  slotChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  slotChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
