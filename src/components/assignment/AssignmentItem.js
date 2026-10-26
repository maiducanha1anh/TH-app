import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StatusToggle from './StatusToggle.js';
import SyncBadge from '../common/SyncBadge.js';
import { formatDate, isOverdue } from '../../utils/date.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * AssignmentItem - Mục hiển thị một bài tập trong danh sách
 * @param {object} props
 * @param {object} props.assignment - Dữ liệu bài tập
 * @param {boolean} [props.pending=false] - Trạng thái chưa đồng bộ
 * @param {() => void} props.onPress - Xem chi tiết
 * @param {() => void} props.onToggleStatus - Đổi trạng thái todo <-> done
 */
function AssignmentItem({ assignment, pending = false, onPress, onToggleStatus }) {
  if (!assignment) return null;

  const isDone = assignment.status === 'done';
  const overdue = !isDone && isOverdue(assignment.dueDate);
  const courseName = assignment.course?.name || `Môn học #${assignment.courseId}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.cardBody}
        onPress={onPress}
        accessibilityLabel={`Bài tập: ${assignment.title}. Môn ${courseName}. Hạn nộp ${formatDate(assignment.dueDate)}`}
        accessibilityRole="button">
        <View style={styles.headerRow}>
          <Text style={styles.courseTag} numberOfLines={1}>
            {courseName}
          </Text>
          <SyncBadge pending={pending || Boolean(assignment.pending)} />
        </View>

        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
          {assignment.title}
        </Text>

        <Text style={[styles.dueDate, overdue && styles.dueDateOverdue]}>
          ⏰ Hạn nộp: {formatDate(assignment.dueDate, true)} {overdue ? '(Quá hạn)' : ''}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <StatusToggle status={assignment.status} onToggle={onToggleStatus} />
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={onPress}
          accessibilityLabel="Xem chi tiết bài tập"
          accessibilityRole="button">
          <Text style={styles.detailLink}>Chi tiết ›</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  cardBody: {
    minHeight: 44,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseTag: {
    ...typography.badge,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '70%',
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  dueDate: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dueDateOverdue: {
    color: colors.danger,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.background,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  detailBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xs,
  },
  detailLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default React.memo(AssignmentItem);
