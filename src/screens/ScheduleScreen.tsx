import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ScheduleItem } from '../types';

export default function ScheduleScreen({ navigation }: any) {
  const { schedules } = useApp();

  const renderItem = ({ item }: { item: ScheduleItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ScheduleDetail', { schedule: item })}>
      <View style={styles.dayBadge}>
        <Text style={styles.dayText}>{item.dayOfWeek}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subjectName}>{item.subjectName}</Text>
        <Text style={styles.timeText}>⏰ {item.time}</Text>
        <Text style={styles.roomText}>📍 Phòng: {item.room}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>📅 Lịch học trong tuần này</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    padding: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    minWidth: 80,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  content: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
  },
  roomText: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
