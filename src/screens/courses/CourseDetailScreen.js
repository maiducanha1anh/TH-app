import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import AppButton from '../../components/common/AppButton.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { useAppData } from '../../context/AppDataContext.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function CourseDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCourseDetail, sessions, assignments, lastUpdated } = useAppData();

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy mã môn học.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCourseDetail(id);
      setCourse(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải thông tin chi tiết môn học.');
    } finally {
      setLoading(false);
    }
  }, [id, getCourseDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Cập nhật tiêu đề Header theo tên môn học (theo quy tắc 2 mục 3)
  useLayoutEffect(() => {
    if (course?.name) {
      navigation.setOptions({
        title: course.name,
      });
    }
  }, [navigation, course]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải chi tiết môn học…" />
      </ScreenContainer>
    );
  }

  if (error || !course) {
    return (
      <ScreenContainer>
        <ErrorView message={error || 'Không tìm thấy môn học.'} onRetry={fetchDetail} />
      </ScreenContainer>
    );
  }

  // Lọc lịch học và bài tập của riêng môn này
  const courseSessions = sessions.filter(s => Number(s.courseId) === Number(id));
  const courseAssignments = assignments.filter(a => Number(a.courseId) === Number(id));

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Thẻ thông tin chính */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Text style={styles.codeBadge}>{course.code}</Text>
            <Text style={styles.creditsBadge}>{course.credits} Tín chỉ</Text>
          </View>

          <Text style={styles.title}>{course.name}</Text>
          <Text style={styles.semester}>Học kỳ: {course.semester || 'HK1'}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>👨‍🏫 Giảng viên:</Text>
            <Text style={styles.value}>{course.lecturer || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>📖 Giới thiệu môn học:</Text>
          <Text style={styles.description}>
            {course.description || 'Chưa có mô tả chi tiết cho môn học này.'}
          </Text>

          {lastUpdated ? (
            <View style={{ marginTop: spacing.md }}>
              <LastUpdatedText timestamp={lastUpdated} />
            </View>
          ) : null}
        </View>

        {/* Lịch học của môn */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Lịch học trong tuần ({courseSessions.length})</Text>
          {courseSessions.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có lịch học cụ thể.</Text>
          ) : (
            courseSessions.map(session => (
              <View key={`session-${session.id}`} style={styles.subItem}>
                <Text style={styles.subItemTitle}>
                  Thứ {session.dayOfWeek === 8 ? 'CN' : session.dayOfWeek} • {session.startTime} - {session.endTime}
                </Text>
                <Text style={styles.subItemDetail}>📍 Phòng: {session.room}</Text>
                {session.note ? <Text style={styles.subItemNote}>📌 {session.note}</Text> : null}
              </View>
            ))
          )}
        </View>

        {/* Bài tập của môn */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 Bài tập ({courseAssignments.length})</Text>
          {courseAssignments.length === 0 ? (
            <Text style={styles.emptyText}>Không có bài tập nào cho môn này.</Text>
          ) : (
            courseAssignments.map(assignment => (
              <View key={`assignment-${assignment.id}`} style={styles.subItem}>
                <Text style={styles.subItemTitle}>{assignment.title}</Text>
                <Text style={styles.subItemDetail}>
                  Trạng thái: {assignment.status === 'done' ? '✓ Đã hoàn thành' : '⏳ Chưa hoàn thành'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Nút quay lại */}
        <AppButton
          title="⬅ Quay lại danh sách môn học"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeRow: {
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
    paddingVertical: 4,
    borderRadius: 6,
  },
  creditsBadge: {
    ...typography.captionBold,
    color: colors.success,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  semester: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
  },
  value: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  subItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  subItemTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  subItemDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subItemNote: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
