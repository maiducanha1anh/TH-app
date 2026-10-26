import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * LoadingView - Khung trạng thái đang tải
 * @param {object} props
 * @param {string} [props.message='Đang tải…']
 */
export default function LoadingView({ message = 'Đang tải…' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
