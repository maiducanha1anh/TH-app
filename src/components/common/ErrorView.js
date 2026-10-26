import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * ErrorView - Khung trạng thái lỗi
 * @param {object} props
 * @param {string} [props.message='Đã xảy ra lỗi khi tải dữ liệu.']
 * @param {() => void} [props.onRetry]
 */
export default function ErrorView({ message = 'Đã xảy ra lỗi khi tải dữ liệu.', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Không thể tải dữ liệu</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <AppButton
          title="Thử lại"
          variant="primary"
          onPress={onRetry}
          style={styles.retryButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 220,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 140,
  },
});
