import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, Button, Input, Badge } from '../../components/common';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/services';

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'te' | 'en' | 'tanglish'>(
    user?.preferred_language || 'te'
  );
  const [responsePreference, setResponsePreference] = useState(user?.response_preference || 'balanced');
  const [shareWellness, setShareWellness] = useState<boolean>(user?.share_wellness_data ?? false);
  const [emailNotifs, setEmailNotifs] = useState<boolean>(user?.email_notifications ?? true);

  // Password Modal/Section
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        full_name: fullName.trim() || undefined,
        preferred_language: preferredLanguage,
        response_preference: responsePreference,
        share_wellness_data: shareWellness,
        email_notifications: emailNotifs,
      });
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile settings updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both current and new password.');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Password updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your AVARA profile, finance records, and wellness history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              await logout();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile & Settings"
        subtitle="Manage your personal preferences and security"
        rightAction={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editHeaderBtn}>
            <Text style={styles.editHeaderBtnText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || user?.username}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            <Badge label={`@${user?.username}`} bgColor={Colors.elevated} size="sm" />
            <Badge
              label={
                user?.preferred_language === 'te'
                  ? 'తెలుగు'
                  : user?.preferred_language === 'tanglish'
                  ? 'Tanglish'
                  : 'English'
              }
              bgColor={Colors.primaryDark}
              color="#FFF"
              size="sm"
            />
          </View>
        </Card>

        {/* Profile Settings Card */}
        <Card>
          <Text style={styles.sectionTitle}>Language & Preferences</Text>

          <Text style={styles.fieldLabel}>Preferred Conversational Language</Text>
          <View style={styles.chipRow}>
            {[
              { id: 'te', label: 'తెలుగు (Telugu)' },
              { id: 'tanglish', label: 'Tanglish' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.chip,
                  preferredLanguage === lang.id && styles.chipActive,
                  !isEditing && { opacity: 0.8 },
                ]}
                disabled={!isEditing}
                onPress={() => setPreferredLanguage(lang.id as any)}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferredLanguage === lang.id && styles.chipTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Response Detail Preference</Text>
          <View style={styles.chipRow}>
            {['balanced', 'concise', 'detailed'].map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.chip,
                  responsePreference === pref && styles.chipActive,
                  !isEditing && { opacity: 0.8 },
                ]}
                disabled={!isEditing}
                onPress={() => setResponsePreference(pref)}
              >
                <Text
                  style={[
                    styles.chipText,
                    responsePreference === pref && styles.chipTextActive,
                  ]}
                >
                  {pref[0].toUpperCase() + pref.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isEditing ? (
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />
          ) : null}

          {isEditing ? (
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={saving}
              style={{ marginTop: 10 }}
            />
          ) : null}
        </Card>

        {/* Birth Details Stored for Teammate 1 Integration */}
        <Card>
          <Text style={styles.sectionTitle}>Birth Information (Teammate 1 Integration)</Text>
          <Text style={styles.helperText}>
            Used by Teammate 1's Astrology calculation engine to generate planetary charts.
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birth Date:</Text>
            <Text style={styles.infoVal}>{user?.birth_date || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birth Time:</Text>
            <Text style={styles.infoVal}>{user?.birth_time || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birth Place:</Text>
            <Text style={styles.infoVal}>{user?.birth_place || 'Not set'}</Text>
          </View>
        </Card>

        {/* Privacy & Notifications */}
        <Card>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Share Anonymous Wellness Stats</Text>
              <Text style={styles.toggleSub}>Allows aggregate personal reflections</Text>
            </View>
            <Switch
              value={shareWellness}
              onValueChange={setShareWellness}
              trackColor={{ false: Colors.inputBg, true: Colors.primary }}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>In-App Notifications</Text>
              <Text style={styles.toggleSub}>Budget threshold and check-in reminders</Text>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              trackColor={{ false: Colors.inputBg, true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Password Management */}
        <Card>
          <TouchableOpacity
            style={styles.expandHeader}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="key-outline" size={18} color={Colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showPasswordSection ? (
            <View style={{ marginTop: 12 }}>
              <Input
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Input
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Button
                title="Update Password"
                onPress={handleChangePassword}
                loading={passwordLoading}
                style={{ marginTop: 8 }}
              />
            </View>
          ) : null}
        </Card>

        {/* Account Actions */}
        <View style={styles.actionsBox}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            style={{ marginBottom: 12 }}
          />
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteLink}>
            <Text style={styles.deleteLinkText}>Delete Account & All Data</Text>
          </TouchableOpacity>
        </View>
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
  editHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  editHeaderBtnText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  userCard: {
    alignItems: 'center',
    padding: 22,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsBox: {
    marginTop: 10,
    alignItems: 'center',
  },
  deleteLink: {
    padding: 8,
  },
  deleteLinkText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
