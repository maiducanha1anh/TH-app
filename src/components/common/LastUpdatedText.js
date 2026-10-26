import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatDate } from '../../utils/date.js';
import colors from '../../theme/colors.js';
import typography from '../../theme/typography.js';

/**
 * LastUpdatedText - Dòng chữ thời điểm cập nhật cuối
 * @param {object} props
 * @param {string | number | Date} [props.timestamp]
 */
export default function LastUpdatedText({ timestamp }) {
  if (!timestamp) return null;

  return (
    <Text style={styles.text}>
      Cập nhật lần cuối: {formatDate(timestamp, true)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
