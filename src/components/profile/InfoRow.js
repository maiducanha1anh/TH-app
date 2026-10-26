import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * InfoRow - Một dòng hiển thị thông tin Nhãn - Giá trị
 * @param {object} props
 * @param {string} props.label - Nhãn (ví dụ: "Lớp quản lý:")
 * @param {string | number} props.value - Giá trị (ví dụ: "CNTT-K16A")
 */
export default function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.background,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
  },
  value: {
    ...typography.bodyBold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
});
