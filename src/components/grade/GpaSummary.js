import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * GpaSummary - Khung hiển thị tổng quan GPA hệ 4 và tín chỉ tích lũy
 * @param {object} props
 * @param {number} props.gpa - Điểm GPA hệ 4
 * @param {number} props.totalCredits - Tổng tín chỉ tích lũy
 */
export default function GpaSummary({ gpa = 0.0, totalCredits = 0 }) {
  const formattedGpa = typeof gpa === 'number' ? gpa.toFixed(2) : String(gpa);

  return (
    <View style={styles.card}>
      <View style={styles.box}>
        <Text style={styles.number}>{totalCredits}</Text>
        <Text style={styles.label}>Tín chỉ tích lũy</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.box}>
        <Text style={[styles.number, styles.highlight]}>{formattedGpa}</Text>
        <Text style={styles.label}>Điểm GPA (Hệ 4)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    ...typography.h2,
    color: colors.text,
  },
  highlight: {
    color: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
