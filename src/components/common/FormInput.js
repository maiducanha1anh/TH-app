import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * FormInput - Ô nhập liệu chuẩn có nhãn và thông báo lỗi
 * @param {object} props
 * @param {string} props.label - Nhãn trường nhập
 * @param {string} props.value - Giá trị
 * @param {(text: string) => void} props.onChangeText - Hàm cập nhật giá trị
 * @param {string} [props.error] - Lỗi hiển thị màu đỏ bên dưới
 * @param {string} [props.placeholder]
 * @param {import('react-native').KeyboardTypeOptions} [props.keyboardType='default']
 * @param {boolean} [props.multiline=false]
 * @param {number} [props.numberOfLines=1]
 * @param {boolean} [props.editable=true]
 */
export default function FormInput({
  label,
  value,
  onChangeText,
  error = '',
  placeholder = '',
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        accessibilityLabel={label || placeholder}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    ...typography.body,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
