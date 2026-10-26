import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * SessionCard - Thẻ hiển thị một buổi học trong thời khóa biểu
 * @param {object} props
 * @param {object} props.session - Dữ liệu buổi học
 * @param {() => void} props.onPress - Sự kiện khi nhấn
 */
function SessionCard({ session, onPress }) {
  if (!session) return null;
  const courseName = session.course?.name || `Môn học #${session.courseId}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Buổi học ${courseName}, từ ${session.startTime} đến ${session.endTime}`}
      accessibilityRole="button">
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>{session.startTime}</Text>
        <Text style={styles.timeSeparator}>-</Text>
        <Text style={styles.timeText}>{session.endTime}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.room}>📍 Phòng học: {session.room}</Text>
        {session.note ? <Text style={styles.note}>📌 {session.note}</Text> : null}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  timeBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    minWidth: 70,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timeText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  timeSeparator: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  content: {
    flex: 1,
  },
  courseName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  room: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  note: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
});

export default React.memo(SessionCard);
