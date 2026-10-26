import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import FormInput from '../../components/common/FormInput.js';
import AppButton from '../../components/common/AppButton.js';
import { validateAssignmentForm } from '../../utils/validators.js';
import { useAppData } from '../../context/AppDataContext.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function AssignmentFormScreen({ navigation }) {
  const { courses, addAssignment } = useAppData();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || 1);
  const [dueDate, setDueDate] = useState(() => {
    // Mặc định là 7 ngày sau thời điểm hiện tại
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString();
  });
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const formData = {
      title: title.trim(),
      courseId: Number(courseId),
      dueDate,
      description: description.trim(),
      status: 'todo',
    };

    const validation = validateAssignmentForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await addAssignment(formData);
      Alert.alert('Thành công', 'Đã thêm bài tập mới!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), // Quy tắc 3 mục 3: tự quay về sau khi lưu thành công
        },
      ]);
    } catch (err) {
      // Lỗi đã được context thông báo
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.header}>Thêm bài tập mới</Text>
          <Text style={styles.subHeader}>
            Nhập đầy đủ thông tin để theo dõi tiến độ bài tập trên ứng dụng
          </Text>

          {/* Chọn môn học */}
          <Text style={styles.label}>📚 Môn học: *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseChips}>
            {courses.map(course => {
              const isSelected = Number(courseId) === Number(course.id);
              return (
                <TouchableOpacity
                  key={`course-choice-${course.id}`}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setCourseId(course.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Chọn môn ${course.name}`}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {course.code} - {course.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.courseId ? <Text style={styles.errorText}>{errors.courseId}</Text> : null}

          {/* Ô nhập tiêu đề */}
          <FormInput
            label="Tiêu đề bài tập: *"
            value={title}
            onChangeText={text => {
              setTitle(text);
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="Ví dụ: Bài tập thực hành 4"
            error={errors.title}
          />

          {/* Hạn nộp (ISO 8601) */}
          <FormInput
            label="Hạn nộp (ISO 8601): *"
            value={dueDate}
            onChangeText={text => {
              setDueDate(text);
              if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
            }}
            placeholder="2026-11-15T23:59:00Z"
            error={errors.dueDate}
          />

          {/* Mô tả chi tiết */}
          <FormInput
            label="Mô tả / Yêu cầu chi tiết:"
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập yêu cầu bài tập, đề bài hoặc ghi chú..."
            multiline
            numberOfLines={4}
          />

          {/* Nút lưu */}
          <AppButton
            title="💾 Lưu bài tập"
            variant="primary"
            loading={submitting}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />

          <AppButton
            title="Hủy bỏ"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  subHeader: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  courseChips: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  cancelBtn: {
    marginTop: spacing.sm,
  },
});
