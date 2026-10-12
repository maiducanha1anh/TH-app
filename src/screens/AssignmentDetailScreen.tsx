import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';

export default function AssignmentDetailScreen({ route, navigation }: any) {
  const initialAssignment: Assignment | undefined = route.params?.assignment;
  const { assignments, toggleAssignment } = useApp();

  // Tìm bài tập trong context để trạng thái luôn đồng bộ
  const currentAssignment =
    assignments.find(a => a.id === initialAssignment?.id) || initialAssignment;

  if (!currentAssignment) {
    return (
      <View style={styles.center}>
        <Text>Không có dữ liệu bài tập.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              currentAssignment.completed ? styles.statusSuccess : styles.statusWarning,
            ]}>
            {currentAssignment.completed ? '✓ ĐÃ HOÀN THÀNH' : '⏳ CHƯA HOÀN THÀNH'}
          </Text>
        </View>

        <Text style={styles.title}>{currentAssignment.title}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>📚 Môn học:</Text>
          <Text style={styles.value}>{currentAssignment.subjectName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>⏰ Hạn nộp:</Text>
          <Text style={styles.dueValue}>{currentAssignment.dueDate}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>📝 Yêu cầu bài tập:</Text>
        <Text style={styles.descText}>{currentAssignment.description}</Text>

        <View style={styles.divider} />

        {/* Nút cập nhật trạng thái */}
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            currentAssignment.completed ? styles.undoBtn : styles.completeBtn,
          ]}
          onPress={() => toggleAssignment(currentAssignment.id)}>
          <Text style={styles.toggleBtnText}>
            {currentAssignment.completed
              ? '↺ Đặt lại: Chưa hoàn thành'
              : '✓ Đánh dấu đã hoàn thành'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>⬅ Quay lại danh sách bài tập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  dueValue: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  toggleBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  completeBtn: {
    backgroundColor: '#059669',
  },
  undoBtn: {
    backgroundColor: '#4B5563',
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
