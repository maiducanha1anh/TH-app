import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }: any) {
  const { student, grades } = useApp();

  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  const avgGpa = (
    grades.reduce((sum, g) => sum + g.overall, 0) / grades.length
  ).toFixed(2);

  return (
    <ScrollView style={styles.container}>
      {/* Header hồ sơ */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.studentId}>MSSV: {student.studentId}</Text>
      </View>

      {/* Tóm tắt học tập */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCredits}</Text>
          <Text style={styles.statLabel}>Tín chỉ tích lũy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.statHighlight]}>{avgGpa}</Text>
          <Text style={styles.statLabel}>Điểm TB tích lũy</Text>
        </View>
      </View>

      {/* Thông tin chi tiết */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Lớp quản lý:</Text>
          <Text style={styles.value}>{student.className}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngành học:</Text>
          <Text style={styles.value}>{student.major}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{student.email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{student.phone}</Text>
        </View>
      </View>

      {/* Các nút điều hướng Stack */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.actionBtnPrimaryText}>✏ Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => navigation.navigate('GradeDetail')}>
          <Text style={styles.actionBtnSecondaryText}>
            📊 Xem chi tiết kết quả học tập ›
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  profileHeader: {
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentId: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statHighlight: {
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  actionBtnPrimary: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtnSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  actionBtnSecondaryText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
});
