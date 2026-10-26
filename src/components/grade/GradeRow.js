import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * GradeRow - Hàng hiển thị điểm số của một môn học
 * @param {object} props
 * @param {object} props.grade - Dữ liệu điểm
 * @param {() => void} props.onPress - Xem chi tiết điểm
 */
function GradeRow({ grade, onPress }) {
  if (!grade) return null;
  const courseName = grade.course?.name || `Môn học #${grade.courseId}`;
  const credits = grade.course?.credits || grade.credits || 0;
  const isFailed = grade.letter === 'F';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Kết quả môn ${courseName}, điểm tổng kết ${grade.total}, điểm chữ ${grade.letter}`}
      accessibilityRole="button">
      <View style={styles.mainInfo}>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.creditsText}>{credits} tín chỉ • Học kỳ: {grade.semester}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.totalScore, isFailed && styles.failedText]}>
          {grade.total}
        </Text>
        <View style={[styles.letterBadge, isFailed && styles.letterBadgeFailed]}>
          <Text style={[styles.letterText, isFailed && styles.failedText]}>
            {grade.letter}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  mainInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courseName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  creditsText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalScore: {
    ...typography.bodyBold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  letterBadge: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  letterBadgeFailed: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  letterText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  failedText: {
    color: colors.danger,
  },
});

export default React.memo(GradeRow);
