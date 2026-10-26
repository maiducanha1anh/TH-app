import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import SearchBar from '../../components/common/SearchBar.js';
import FilterChips from '../../components/common/FilterChips.js';
import AppButton from '../../components/common/AppButton.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import EmptyState from '../../components/common/EmptyState.js';
import AssignmentItem from '../../components/assignment/AssignmentItem.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { isOverdue } from '../../utils/date.js';
import { useAppData } from '../../context/AppDataContext.js';
import ROUTES from '../../navigation/routes.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';

const FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa xong', value: 'todo' },
  { label: 'Đã xong', value: 'done' },
  { label: 'Quá hạn', value: 'overdue' },
];

export default function AssignmentListScreen({ navigation }) {
  const {
    assignments,
    loading,
    error,
    lastUpdated,
    loadAssignments,
    toggleAssignmentStatus,
  } = useAppData();

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Lọc bài tập theo từ khóa và trạng thái
  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      // 1. Tìm kiếm theo tiêu đề hoặc tên môn
      const titleMatch = item.title.toLowerCase().includes(searchText.toLowerCase());
      const courseMatch = item.course?.name?.toLowerCase().includes(searchText.toLowerCase());
      if (!titleMatch && !courseMatch) return false;

      // 2. Lọc theo trạng thái
      if (filter === 'todo') return item.status === 'todo';
      if (filter === 'done') return item.status === 'done';
      if (filter === 'overdue') return item.status === 'todo' && isOverdue(item.dueDate);

      return true;
    });
  }, [assignments, searchText, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAssignments();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải danh sách bài tập…" />
      </ScreenContainer>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={loadAssignments} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Thanh tìm kiếm & Nút thêm bài tập */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="🔍 Tìm theo tên bài hoặc môn học…"
          />
        </View>
        <AppButton
          title="➕ Thêm"
          variant="primary"
          onPress={() => navigation.navigate(ROUTES.ASSIGNMENTS.FORM)}
          style={styles.addButton}
        />
      </View>

      {/* Thanh lọc trạng thái 4 nút: Tất cả, Chưa xong, Đã xong, Quá hạn */}
      <FilterChips
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />

      {lastUpdated ? (
        <View style={styles.updatedWrapper}>
          <LastUpdatedText timestamp={lastUpdated} />
        </View>
      ) : null}

      {/* Danh sách bài tập FlatList */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <AssignmentItem
            assignment={item}
            onPress={() =>
              navigation.navigate(ROUTES.ASSIGNMENTS.DETAIL, { id: item.id })
            }
            onToggleStatus={() => toggleAssignmentStatus(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            title="Không có bài tập nào phù hợp"
            description="Hãy thử đổi bộ lọc hoặc thêm bài tập mới để theo dõi tiến độ."
            actionLabel="➕ Thêm bài tập mới"
            onAction={() => navigation.navigate(ROUTES.ASSIGNMENTS.FORM)}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addButton: {
    minWidth: 84,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  updatedWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});
