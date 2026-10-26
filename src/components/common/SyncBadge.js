import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import typography from '../../theme/typography.js';
import spacing from '../../theme/spacing.js';

/**
 * SyncBadge - Huy hiệu Chưa đồng bộ cho outbox
 * @param {object} props
 * @param {boolean} [props.pending=false]
 */
export default function SyncBadge({ pending = false }) {
  if (!pending) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>⏳ Chưa đồng bộ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.syncPendingLight,
    borderWidth: 1,
    borderColor: colors.syncPending,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.badge,
    color: colors.syncPending,
  },
});
