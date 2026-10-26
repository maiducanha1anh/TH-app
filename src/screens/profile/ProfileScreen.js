import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import AppButton from '../../components/common/AppButton.js';
import InfoRow from '../../components/profile/InfoRow.js';
import GpaSummary from '../../components/grade/GpaSummary.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { calcGpa } from '../../utils/gpa.js';
import { useAppData } from '../../context/AppDataContext.js';
import ROUTES from '../../navigation/routes.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function ProfileScreen({ navigation }) {
  const {
    student,
    grades,
    courses,
    loading,
    error,
    lastUpdated,
    refreshAll,
  } = useAppData();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !student) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải thông tin cá nhân…" />
      </ScreenContainer>
    );
  }

  if (error && !student) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={refreshAll} />
      </ScreenContainer>
    );
  }

  // Tính GPA và tín chỉ tích lũy đúng chuẩn hợp đồng
  const { gpa, totalCredits } = calcGpa(grades, courses);

  return (
    <ScreenContainer
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Hồ sơ */}
        {student ? (
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {student.fullName ? student.fullName.charAt(0) : 'S'}
              </Text>
            </View>
            <Text style={styles.name}>{student.fullName}</Text>
            <Text style={styles.studentId}>MSSV: {student.studentCode}</Text>
          </View>
        ) : null}

        {/* Khung tóm tắt GPA & Tín chỉ tích lũy */}
        <GpaSummary gpa={gpa} totalCredits={totalCredits} />

        {lastUpdated ? (
          <View style={styles.updatedWrapper}>
            <LastUpdatedText timestamp={lastUpdated} />
          </View>
        ) : null}

        {/* Chi tiết thông tin sinh viên */}
        {student ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <InfoRow label="Mã sinh viên:" value={student.studentCode} />
            <InfoRow label="Lớp sinh hoạt:" value={student.className} />
            <InfoRow label="Chuyên ngành:" value={student.major} />
            <InfoRow label="Email liên hệ:" value={student.email} />
            <InfoRow label="Số điện thoại:" value={student.phone} />
          </View>
        ) : null}

        {/* Các nút hành động */}
        <View style={styles.actionContainer}>
          <AppButton
            title="✏ Chỉnh sửa thông tin"
            variant="primary"
            onPress={() => navigation.navigate(ROUTES.PROFILE.EDIT)}
            style={styles.actionBtn}
          />

          <AppButton
            title="📊 Bảng điểm theo học kỳ ›"
            variant="outline"
            onPress={() => navigation.navigate(ROUTES.PROFILE.GRADE_LIST)}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxxl,
  },
  profileHeader: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  name: {
    ...typography.h2,
    color: colors.textInverse,
  },
  studentId: {
    ...typography.caption,
    color: '#E0E7FF',
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.background,
  },
  actionContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    marginBottom: spacing.xs,
  },
  updatedWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});
