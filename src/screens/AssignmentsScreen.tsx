import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';

export default function AssignmentsScreen({ navigation }: any) {
  const { assignments, toggleAssignment } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredAssignments = assignments.filter(item => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const renderItem = ({ item }: { item: Assignment }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}>
        <View style={styles.badgeRow}>
          <Text style={styles.subjectTag}>{item.subjectName}</Text>
          <Text
            style={[
              styles.statusTag,
              item.completed ? styles.statusCompleted : styles.statusPending,
            ]}>
            {item.completed ? '✓ Đã hoàn thành' : '⏳ Chưa xong'}
          </Text>
        </View>

        <Text style={[styles.title, item.completed && styles.titleCompleted]}>
          {item.title}
        </Text>

        <Text style={styles.dueDate}>⏰ Hạn chót: {item.dueDate}</Text>
      </TouchableOpacity>

      {/* Nút cập nhật trạng thái */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            item.completed ? styles.btnUndo : styles.btnComplete,
          ]}
          onPress={() => toggleAssignment(item.id)}>
          <Text
            style={[
              styles.toggleBtnText,
              item.completed ? styles.btnUndoText : styles.btnCompleteText,
            ]}>
            {item.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}>
          <Text style={styles.detailLink}>Chi tiết ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thanh lọc theo trạng thái */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterChipText,
              filter === 'all' && styles.filterChipTextActive,
            ]}>
            Tất cả ({assignments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}>
          <Text
            style={[
              styles.filterChipText,
              filter === 'pending' && styles.filterChipTextActive,
            ]}>
            Chưa làm ({assignments.filter(i => !i.completed).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'completed' && styles.filterChipActive,
          ]}
          onPress={() => setFilter('completed')}>
          <Text
            style={[
              styles.filterChipText,
              filter === 'completed' && styles.filterChipTextActive,
            ]}>
            Đã xong ({assignments.filter(i => i.completed).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAssignments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có bài tập nào trong mục này.</Text>
          </View>
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
  filterRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-around',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardMain: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectTag: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  dueDate: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 10,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnComplete: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  btnCompleteText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  btnUndo: {
    borderColor: '#6B7280',
    backgroundColor: '#F9FAFB',
  },
  btnUndoText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  detailLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
