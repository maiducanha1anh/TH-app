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

export default function GradeDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getGradeDetail, lastUpdated } = useAppData();

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError('Không tìm thấy thông tin điểm.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getGradeDetail(id);
      setGrade(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết kết quả học tập.');
    } finally {
      setLoading(false);
    }
  }, [id, getGradeDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const courseName = grade?.course?.name || 'Chi tiết kết quả học tập';

  // Cập nhật tiêu đề Header theo tên môn học (quy tắc 2 mục 3)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: courseName,
    });
  }, [navigation, courseName]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải chi tiết điểm môn học…" />
      </ScreenContainer>
    );
  }

  if (error || !grade) {
    return (
      <ScreenContainer>
        <ErrorView message={error || 'Không tìm thấy kết quả học tập.'} onRetry={fetchDetail} />
      </ScreenContainer>
    );
  }

  const isFailed = grade.letter === 'F';
  const credits = grade.course?.credits || grade.credits || 0;

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.flexOne}>
              <Text style={styles.courseName}>{courseName}</Text>
              <Text style={styles.semester}>
                Học kỳ: {grade.semester} • Số tín chỉ: {credits}
              </Text>
            </View>
            <View style={[styles.letterBadge, isFailed && styles.letterBadgeFailed]}>
              <Text style={[styles.letterText, isFailed && styles.failedText]}>
                {grade.letter}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Bảng điểm thành phần theo công thức: 10% CC + 30% GK + 60% CK */}
          <Text style={styles.sectionHeading}>📊 Điểm thành phần:</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Chuyên cần</Text>
              <Text style={styles.weightText}>(10%)</Text>
              <Text style={styles.scoreVal}>{grade.attendance}</Text>
            </View>

            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Giữa kỳ</Text>
              <Text style={styles.weightText}>(30%)</Text>
              <Text style={styles.scoreVal}>{grade.midterm}</Text>
            </View>

            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Cuối kỳ</Text>
              <Text style={styles.weightText}>(60%)</Text>
              <Text style={styles.scoreVal}>{grade.final}</Text>
            </View>

            <View style={[styles.scoreCol, styles.totalCol]}>
              <Text style={styles.scoreLabel}>Tổng kết</Text>
              <Text style={styles.weightText}>(Hệ 10)</Text>
              <Text style={[styles.scoreVal, styles.totalVal, isFailed && styles.failedText]}>
                {grade.total}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Đánh giá xếp loại:</Text>
            <Text style={[styles.value, isFailed && styles.failedText]}>
              {isFailed ? 'Không đạt (Phải học lại)' : 'Đạt yêu cầu môn học'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tín chỉ tích lũy:</Text>
            <Text style={styles.value}>
              {isFailed ? '0 tín chỉ (Điểm F không tích lũy)' : `+${credits} tín chỉ`}
            </Text>
          </View>

          {lastUpdated ? (
            <View style={{ marginTop: spacing.md }}>
              <LastUpdatedText timestamp={lastUpdated} />
            </View>
          ) : null}
        </View>

        <AppButton
          title="⬅ Quay lại danh sách điểm"
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courseName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  semester: {
    ...typography.caption,
    color: colors.textMuted,
  },
  letterBadge: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  letterBadgeFailed: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  letterText: {
    ...typography.h3,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  totalCol: {
    borderLeftWidth: 1,
    borderColor: colors.border,
  },
  scoreLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  weightText: {
    ...typography.badge,
    color: colors.textMuted,
    marginBottom: 2,
  },
  scoreVal: {
    ...typography.h3,
    color: colors.text,
    marginTop: 2,
  },
  totalVal: {
    color: colors.primaryDark,
  },
  failedText: {
    color: colors.danger,
  },
  infoRow: {
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
  backBtn: {
    marginTop: spacing.md,
  },
});
