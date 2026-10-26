import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * CourseCard - Thẻ hiển thị môn học
 * @param {object} props
 * @param {object} props.course - Dữ liệu môn học
 * @param {() => void} props.onPress - Sự kiện khi nhấn vào thẻ
 */
function CourseCard({ course, onPress }) {
  if (!course) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Môn học ${course.name}, mã ${course.code}`}
      accessibilityRole="button">
      <View style={styles.badgeContainer}>
        <Text style={styles.codeBadge}>{course.code}</Text>
        <Text style={styles.creditsText}>{course.credits} tín chỉ</Text>
      </View>
      <Text style={styles.name}>{course.name}</Text>
      <Text style={styles.lecturer}>👨‍🏫 Giảng viên: {course.lecturer || 'Chưa cập nhật'}</Text>
      <View style={styles.footer}>
        <Text style={styles.semester}>Học kỳ: {course.semester || 'HK1'}</Text>
        <Text style={styles.detailLink}>Chi tiết ›</Text>
      </View>
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
    minHeight: 44,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  codeBadge: {
    ...typography.badge,
    backgroundColor: colors.infoLight,
    color: colors.info,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditsText: {
    ...typography.captionBold,
    color: colors.success,
  },
  name: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lecturer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.background,
    paddingTop: spacing.xs,
  },
  semester: {
    ...typography.caption,
    color: colors.textMuted,
  },
  detailLink: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default React.memo(CourseCard);
