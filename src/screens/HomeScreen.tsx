import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }: any) {
  const { student, subjects, assignments } = useApp();

  const pendingAssignments = assignments.filter(item => !item.completed);

  return (
    <ScrollView style={styles.container}>
      {/* Header thông tin sinh viên */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMeta}>MSSV: {student.studentId}</Text>
          <Text style={styles.studentMeta}>
            Lớp: {student.className} - {student.major}
          </Text>
        </View>
      </View>

      {/* Danh sách môn học đang học */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Môn học đang học</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SubjectsTab')}>
            <Text style={styles.linkText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {subjects.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => navigation.navigate('SubjectDetail', { subject: item })}>
            <View style={styles.flexOne}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>
                {item.code} • {item.credits} tín chỉ • Phòng {item.room}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bài tập sắp đến hạn */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 Bài tập sắp đến hạn</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AssignmentsTab')}>
            <Text style={styles.linkText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {pendingAssignments.length === 0 ? (
          <Text style={styles.emptyText}>Tuyệt vời! Không có bài tập nào còn nợ.</Text>
        ) : (
          pendingAssignments.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() =>
                navigation.navigate('AssignmentDetail', { assignment: item })
              }>
              <View style={styles.flexOne}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subjectName}</Text>
                <Text style={styles.dueText}>⏰ Hạn nộp: {item.dueDate}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentMeta: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  linkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  dueText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginTop: 4,
  },
  arrow: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  emptyText: {
    color: '#6B7280',
    fontStyle: 'italic',
    padding: 12,
  },
  flexOne: {
    flex: 1,
  },
});
