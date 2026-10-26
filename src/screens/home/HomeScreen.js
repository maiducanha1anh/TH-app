import React, { useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import CourseCard from '../../components/course/CourseCard.js';
import AssignmentItem from '../../components/assignment/AssignmentItem.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useSync } from '../../context/SyncContext.js';
import { daysLeft } from '../../utils/date.js';
import ROUTES from '../../navigation/routes.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function HomeScreen({ navigation }) {
  const {
    student,
    courses,
    assignments,
    loading,
    error,
    lastUpdated,
    refreshAll,
    toggleAssignmentStatus,
  } = useAppData();

  const { pendingCount, syncing, syncNow } = useSync();

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
        <LoadingView message="Đang tải dữ liệu tổng quan…" />
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

  // Bài tập chưa hoàn thành đến hạn trong 7 ngày tới theo đúng bảng mục 3 của đề
  const pendingAssignments = assignments.filter(item => {
    if (item.status !== 'todo') return false;
    const remainingDays = daysLeft(item.dueDate);
    return remainingDays >= 0 && remainingDays <= 7;
  });

  // Môn học nổi bật (tối đa 3 môn)
  const featuredCourses = courses.slice(0, 3);

  return (
    <ScreenContainer
      scroll
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }>
      {/* Header Sinh viên */}
      {student ? (
        <View style={styles.studentCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {student.fullName ? student.fullName.charAt(0) : 'S'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <Text style={styles.studentMeta}>MSSV: {student.studentCode}</Text>
            <Text style={styles.studentMeta}>
              {student.className} • {student.major}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Hiển thị số thay đổi đang chờ đồng bộ theo đề */}
      {pendingCount > 0 ? (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingText}>
            ⏳ Đang có <Text style={styles.pendingBold}>{pendingCount}</Text> thay đổi chưa đồng bộ
          </Text>
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={syncNow}
            disabled={syncing}
            accessibilityLabel="Đồng bộ ngay bây giờ"
            accessibilityRole="button">
            <Text style={styles.syncBtnText}>
              {syncing ? 'Đang đồng bộ…' : 'Đồng bộ ngay'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {lastUpdated ? (
        <View style={styles.updatedWrapper}>
          <LastUpdatedText timestamp={lastUpdated} />
        </View>
      ) : null}

      {/* Section 1: Môn học đang học */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Môn học đang học</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.TABS.COURSES)}
            accessibilityLabel="Xem tất cả môn học"
            accessibilityRole="button">
            <Text style={styles.linkText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {featuredCourses.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có môn học nào được đăng ký.</Text>
        ) : (
          featuredCourses.map(course => (
            <CourseCard
              key={`home-course-${course.id}`}
              course={course}
              onPress={() =>
                navigation.navigate(ROUTES.HOME.COURSE_DETAIL, { id: course.id })
              }
            />
          ))
        )}
      </View>

      {/* Section 2: Bài tập cần làm */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            📝 Bài tập sắp đến hạn ({pendingAssignments.length})
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.TABS.ASSIGNMENTS)}
            accessibilityLabel="Xem tất cả bài tập"
            accessibilityRole="button">
            <Text style={styles.linkText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {pendingAssignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>🎉 Tuyệt vời! Bạn không còn bài tập nào chưa xong.</Text>
          </View>
        ) : (
          pendingAssignments.map(assignment => (
            <AssignmentItem
              key={`home-assignment-${assignment.id}`}
              assignment={assignment}
              onPress={() =>
                navigation.navigate(ROUTES.HOME.ASSIGNMENT_DETAIL, { id: assignment.id })
              }
              onToggleStatus={() => toggleAssignmentStatus(assignment.id)}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  studentCard: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.h3,
    color: colors.textInverse,
  },
  studentMeta: {
    ...typography.caption,
    color: '#E0E7FF',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  linkText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  updatedWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  pendingCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    marginRight: spacing.sm,
  },
  pendingBold: {
    ...typography.captionBold,
    color: '#B45309',
  },
  syncBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
});
