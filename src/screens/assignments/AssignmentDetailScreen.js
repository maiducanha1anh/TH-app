import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import AppButton from '../../components/common/AppButton.js';
import StatusToggle from '../../components/assignment/StatusToggle.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { useAppData } from '../../context/AppDataContext.js';
import { formatDate, isOverdue } from '../../utils/date.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { assignments, toggleAssignmentStatus, getAssignmentDetail, lastUpdated } = useAppData();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tìm trong Context trước (để trạng thái todo/done luôn đồng bộ ngay lập tức)
  const contextItem = assignments.find(a => Number(a.id) === Number(id));

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy thông tin bài tập.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAssignmentDetail(id);
      setAssignment(data);
    } catch (err) {
      // Nếu context có sẵn thì dùng dữ liệu context làm fallback
      if (contextItem) {
        setAssignment(contextItem);
      } else {
        setError(err?.message || 'Không thể tải chi tiết bài tập.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, contextItem]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Cập nhật khi Context thay đổi trạng thái
  const currentAssignment = contextItem || assignment;

  // Cập nhật tiêu đề Header theo tên bài tập (quy tắc 2 mục 3)
  useLayoutEffect(() => {
    if (currentAssignment?.title) {
      navigation.setOptions({
        title: currentAssignment.title,
      });
    }
  }, [navigation, currentAssignment]);

  if (loading && !currentAssignment) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải chi tiết bài tập…" />
      </ScreenContainer>
    );
  }

  if (error && !currentAssignment) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={fetchDetail} />
      </ScreenContainer>
    );
  }

  const isDone = currentAssignment.status === 'done';
  const overdue = !isDone && isOverdue(currentAssignment.dueDate);
  const courseName = currentAssignment.course?.name || `Môn học #${currentAssignment.courseId}`;

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                isDone ? styles.statusSuccess : styles.statusWarning,
              ]}>
              {isDone ? '✓ ĐÃ HOÀN THÀNH' : overdue ? '⚠️ QUÁ HẠN NỘP' : '⏳ CHƯA HOÀN THÀNH'}
            </Text>
          </View>

          <Text style={styles.title}>{currentAssignment.title}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>📚 Môn học:</Text>
            <Text style={styles.value}>{courseName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>⏰ Hạn nộp:</Text>
            <Text style={[styles.dueValue, overdue && styles.overdueValue]}>
              {formatDate(currentAssignment.dueDate, true)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Trạng thái:</Text>
            <StatusToggle
              status={currentAssignment.status}
              onToggle={() => toggleAssignmentStatus(currentAssignment.id)}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>📝 Yêu cầu chi tiết:</Text>
          <Text style={styles.descText}>
            {currentAssignment.description || 'Không có mô tả chi tiết cho bài tập này.'}
          </Text>

          {lastUpdated ? (
            <View style={{ marginTop: spacing.md }}>
              <LastUpdatedText timestamp={lastUpdated} />
            </View>
          ) : null}
        </View>

        <AppButton
          title="⬅ Quay lại danh sách bài tập"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
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
  statusBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.captionBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  statusWarning: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
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
  dueValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  overdueValue: {
    color: colors.danger,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  descText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  backBtn: {
    marginTop: spacing.md,
  },
});
