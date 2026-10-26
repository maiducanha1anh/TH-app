import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import DaySelector from '../../components/schedule/DaySelector.js';
import SessionCard from '../../components/schedule/SessionCard.js';
import LoadingView from '../../components/common/LoadingView.js';
import ErrorView from '../../components/common/ErrorView.js';
import EmptyState from '../../components/common/EmptyState.js';
import LastUpdatedText from '../../components/common/LastUpdatedText.js';
import { useAppData } from '../../context/AppDataContext.js';
import ROUTES from '../../navigation/routes.js';
import spacing from '../../theme/spacing.js';

export default function ScheduleScreen({ navigation }) {
  const { sessions, loading, error, lastUpdated, refreshAll } = useAppData();

  // Xác định ngày hiện tại theo chuẩn 2..8 (Chủ nhật ở JS là 0 -> 8, Thứ 2 là 1 -> 2, ...)
  const getTodayDayOfWeek = () => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 8 : jsDay + 1;
  };

  const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek);
  const [refreshing, setRefreshing] = useState(false);

  // Lọc danh sách buổi học theo ngày được chọn
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => Number(s.dayOfWeek) === Number(selectedDay));
  }, [sessions, selectedDay]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSessions();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <ScreenContainer>
        <LoadingView message="Đang tải lịch học…" />
      </ScreenContainer>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <ScreenContainer>
        <ErrorView message={error} onRetry={loadSessions} />
      </ScreenContainer>
    );
  }

  const dayLabels = {
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7',
    8: 'Chủ nhật',
  };

  return (
    <ScreenContainer>
      {/* Thanh chọn ngày Thứ 2 -> Chủ nhật */}
      <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {lastUpdated ? (
        <View style={styles.updatedWrapper}>
          <LastUpdatedText timestamp={lastUpdated} />
        </View>
      ) : null}

      {/* Danh sách buổi học trong ngày */}
      <FlatList
        data={filteredSessions}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() =>
              navigation.navigate(ROUTES.SCHEDULE.DETAIL, { id: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            title={`Không có lịch học vào ${dayLabels[selectedDay]}`}
            description="Hãy thư giãn hoặc tranh thủ hoàn thành các bài tập sắp đến hạn!"
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
