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

export default function SessionDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getSessionDetail, lastUpdated } = useAppData();

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy thông tin buổi học.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getSessionDetail(id);
      setSession(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết buổi học.');
    } finally {
      setLoading(false);
    }
  }, [id, getSessionDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const courseName = session?.course?.name || 'Chi tiết buổi học';

  // Cập nhật tiêu đề Header theo tên môn học (quy tắc 2 mục 3)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: courseName,
    });
  }, [navigation, courseName]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải chi tiết buổi học…" />
      </ScreenContainer>
    );
  }

  if (error || !session) {
    return (
      <ScreenContainer>
        <ErrorView message={error || 'Không tìm thấy buổi học.'} onRetry={fetchDetail} />
      </ScreenContainer>
    );
  }

  const dayLabel = session.dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${session.dayOfWeek}`;

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.dayTag}>
            <Text style={styles.dayTagText}>{dayLabel}</Text>
          </View>

          <Text style={styles.title}>{courseName}</Text>
          {session.course?.code ? (
            <Text style={styles.codeText}>Mã môn: {session.course.code}</Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>⏰ Thời gian:</Text>
            <Text style={styles.value}>
              {session.startTime} - {session.endTime}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>📍 Phòng học:</Text>
            <Text style={styles.value}>{session.room}</Text>
          </View>

          {session.course?.lecturer ? (
            <View style={styles.row}>
              <Text style={styles.label}>👨‍🏫 Giảng viên:</Text>
              <Text style={styles.value}>{session.course.lecturer}</Text>
            </View>
          ) : null}

          {session.note ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.noteLabel}>📌 Ghi chú buổi học:</Text>
              <Text style={styles.noteValue}>{session.note}</Text>
            </>
          ) : null}

          {lastUpdated ? (
            <View style={{ marginTop: spacing.md }}>
              <LastUpdatedText timestamp={lastUpdated} />
            </View>
          ) : null}
        </View>

        <AppButton
          title="⬅ Quay lại thời khóa biểu"
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
  dayTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  dayTagText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  codeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
  },
  value: {
    ...typography.bodyBold,
    color: colors.text,
  },
  noteLabel: {
    ...typography.bodyBold,
    color: colors.warning,
    marginBottom: 4,
  },
  noteValue: {
    ...typography.body,
    color: colors.textSecondary,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: 8,
    lineHeight: 20,
  },
  backBtn: {
    marginTop: spacing.md,
  },
});
