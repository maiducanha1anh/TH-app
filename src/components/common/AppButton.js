import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * AppButton - Nút bấm chuẩn ứng dụng
 * @param {object} props
 * @param {string} props.title - Tiêu đề nút (Bắt buộc)
 * @param {() => void} props.onPress - Hàm xử lý khi bấm
 * @param {'primary' | 'outline' | 'danger'} [props.variant='primary']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.accessibilityLabel]
 * @param {object} [props.style]
 */
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
}) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : isDanger ? styles.buttonDanger : styles.buttonPrimary,
        isDisabled && styles.buttonDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={isOutline ? colors.primary : colors.textInverse} />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline ? styles.textOutline : isDanger ? styles.textDanger : styles.textPrimary,
            isDisabled && styles.textDisabled,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.bodyBold,
  },
  textPrimary: {
    color: colors.textInverse,
  },
  textOutline: {
    color: colors.primary,
  },
  textDanger: {
    color: colors.textInverse,
  },
  textDisabled: {
    color: colors.textMuted,
  },
});
