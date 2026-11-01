import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors } from '../theme/colors';

// ---------------- HEADER ----------------
export const ScreenHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}> = ({ title, subtitle, rightAction }) => (
  <View style={styles.headerContainer}>
    <View style={{ flex: 1 }}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightAction ? <View>{rightAction}</View> : null}
  </View>
);

// ---------------- CARD ----------------
export const Card: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ---------------- BUTTON ----------------
export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  let btnStyle = styles.btnPrimary;
  let textStyle = styles.btnTextPrimary;

  if (variant === 'secondary') {
    btnStyle = styles.btnSecondary;
    textStyle = styles.btnTextSecondary;
  } else if (variant === 'danger') {
    btnStyle = styles.btnDanger;
    textStyle = styles.btnTextDanger;
  } else if (variant === 'outline') {
    btnStyle = styles.btnOutline;
    textStyle = styles.btnTextOutline;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.btnBase, btnStyle, (disabled || loading) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primaryLight : '#FFF'} />
      ) : (
        <Text style={[styles.btnTextBase, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ---------------- INPUT ----------------
export const Input: React.FC<{
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  style?: TextStyle;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  style
}) => (
  <View style={styles.inputGroup}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[
        styles.input,
        multiline && { height: numberOfLines * 28 + 20, textAlignVertical: 'top' },
        error && styles.inputError,
        style
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ---------------- BADGE & CHIP ----------------
export const Badge: React.FC<{
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}> = ({ label, color = Colors.text, bgColor = Colors.elevated, size = 'md' }) => (
  <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.badgeSm]}>
    <Text style={[styles.badgeText, { color }, size === 'sm' && { fontSize: 11 }]}>{label}</Text>
  </View>
);

// ---------------- STAT CARD ----------------
export const StatCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  highlightColor?: string;
  style?: ViewStyle;
}> = ({ label, value, subtext, highlightColor = Colors.primary, style }) => (
  <View style={[styles.statCard, style]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: highlightColor }]}>{value}</Text>
    {subtext ? <Text style={styles.statSubtext}>{subtext}</Text> : null}
  </View>
);

// ---------------- PROGRESS BAR ----------------
export const ProgressBar: React.FC<{
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}> = ({ progress, color = Colors.primary, height = 8 }) => {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressBar, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
};

// ---------------- EMPTY STATE ----------------
export const EmptyState: React.FC<{
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, message, actionText, onAction }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📦</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {actionText && onAction ? (
      <Button title={actionText} onPress={onAction} variant="outline" style={{ marginTop: 14 }} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  btnBase: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.secondary,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnTextBase: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#FFF',
  },
  btnTextSecondary: {
    color: '#000',
  },
  btnTextDanger: {
    color: '#FFF',
  },
  btnTextOutline: {
    color: Colors.primaryLight,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  progressTrack: {
    backgroundColor: Colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    borderRadius: 4,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
