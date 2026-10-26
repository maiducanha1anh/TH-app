import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import typography from '../../theme/typography.js';
import spacing from '../../theme/spacing.js';

/**
 * StatusToggle - Nút chuyển đổi trạng thái bài tập (todo <-> done)
 * @param {object} props
 * @param {'todo' | 'done'} props.status - Trạng thái bài tập
 * @param {() => void} props.onToggle - Hàm kích hoạt đổi trạng thái
 */
export default function StatusToggle({ status = 'todo', onToggle }) {
  const isDone = status === 'done';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.button, isDone ? styles.buttonDone : styles.buttonTodo]}
      onPress={onToggle}
      accessibilityLabel={isDone ? 'Đánh dấu bài tập chưa hoàn thành' : 'Đánh dấu bài tập đã hoàn thành'}
      accessibilityRole="button">
      <Text style={[styles.text, isDone ? styles.textDone : styles.textTodo]}>
        {isDone ? '✓ Đã xong' : '⏳ Chưa xong'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTodo: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  buttonDone: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  text: {
    ...typography.captionBold,
  },
  textTodo: {
    color: colors.warning,
  },
  textDone: {
    color: colors.success,
  },
});
