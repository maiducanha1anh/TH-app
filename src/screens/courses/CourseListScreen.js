import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import SearchBar from '../../components/common/SearchBar.js';
import FilterChips from '../../components/common/FilterChips.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import EmptyState from '../../components/common/EmptyState.js';
import CourseCard from '../../components/course/CourseCard.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { useAppData } from '../../context/AppDataContext.js';
import ROUTES from '../../navigation/routes.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';

export default function CourseListScreen({ navigation }) {
  const { courses, loading, error, lastUpdated, refreshAll } = useAppData();
  const [searchText, setSearchText] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);

  // Tạo danh sách các học kỳ từ dữ liệu môn học
  const semesterOptions = useMemo(() => {
    const list = ['Tất cả'];
    courses.forEach(c => {
      if (c.semester && !list.includes(c.semester)) {
        list.push(c.semester);
      }
    });
    return list;
  }, [courses]);

  // Lọc theo tìm kiếm và học kỳ
  const filteredCourses = useMemo(() => {
    return courses.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase());

      const matchSemester =
        selectedSemester === 'Tất cả' || item.semester === selectedSemester;

      return matchSearch && matchSemester;
    });
  }, [courses, searchText, selectedSemester]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCourses();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải danh sách môn học…" />
      </ScreenContainer>
    );
  }

  if (error && courses.length === 0) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={loadCourses} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Ô tìm kiếm */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="🔍 Tìm kiếm môn học theo tên hoặc mã…"
        />
      </View>

      {/* Bộ lọc học kỳ */}
      <FilterChips
        options={semesterOptions}
        selected={selectedSemester}
        onSelect={setSelectedSemester}
      />

      {lastUpdated ? (
        <View style={styles.updatedContainer}>
          <LastUpdatedText timestamp={lastUpdated} />
        </View>
      ) : null}

      {/* Danh sách môn học */}
      <FlatList
        data={filteredCourses}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate(ROUTES.COURSES.DETAIL, { id: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            title="Không tìm thấy môn học nào"
            description="Hãy thử đổi từ khóa tìm kiếm hoặc chọn học kỳ khác."
            actionLabel="Xem tất cả"
            onAction={() => {
              setSearchText('');
              setSelectedSemester('Tất cả');
            }}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  updatedContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});
