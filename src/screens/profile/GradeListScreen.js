import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import FilterChips from '../../components/common/FilterChips.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import EmptyState from '../../components/common/EmptyState.js';
import GpaSummary from '../../components/grade/GpaSummary.js';
import GradeRow from '../../components/grade/GradeRow.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { calcGpa } from '../../utils/gpa.js';
import { useAppData } from '../../context/AppDataContext.js';
import ROUTES from '../../navigation/routes.js';
import spacing from '../../theme/spacing.js';

export default function GradeListScreen({ navigation }) {
  const { grades, courses, loading, error, lastUpdated, refreshAll } = useAppData();
  const [selectedSemester, setSelectedSemester] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);

  // Danh sách các học kỳ có trong bảng điểm
  const semesterOptions = useMemo(() => {
    const list = ['Tất cả'];
    grades.forEach(g => {
      if (g.semester && !list.includes(g.semester)) {
        list.push(g.semester);
      }
    });
    return list;
  }, [grades]);

  // Lọc điểm theo học kỳ
  const filteredGrades = useMemo(() => {
    if (selectedSemester === 'Tất cả') return grades;
    return grades.filter(g => g.semester === selectedSemester);
  }, [grades, selectedSemester]);

  // Tính GPA cho tập điểm đang hiển thị
  const { gpa, totalCredits } = useMemo(() => {
    return calcGpa(filteredGrades, courses);
  }, [filteredGrades, courses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGrades();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && grades.length === 0) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải bảng điểm…" />
      </ScreenContainer>
    );
  }

  if (error && grades.length === 0) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={loadGrades} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Bộ lọc học kỳ */}
      <FilterChips
        options={semesterOptions}
        selected={selectedSemester}
        onSelect={setSelectedSemester}
      />

      {/* Tóm tắt GPA theo học kỳ */}
      <GpaSummary gpa={gpa} totalCredits={totalCredits} />

      {lastUpdated ? (
        <View style={styles.updatedWrapper}>
          <LastUpdatedText timestamp={lastUpdated} />
        </View>
      ) : null}

      {/* Danh sách điểm các môn học */}
      <FlatList
        data={filteredGrades}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <GradeRow
            grade={item}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE.GRADE_DETAIL, { id: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            title="Chưa có kết quả học tập"
            description="Không tìm thấy điểm của học kỳ này."
            actionLabel="Xem tất cả học kỳ"
            onAction={() => setSelectedSemester('Tất cả')}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  updatedWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
});
