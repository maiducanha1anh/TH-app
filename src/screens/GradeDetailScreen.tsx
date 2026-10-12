import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { GradeItem } from '../types';

export default function GradeDetailScreen({ navigation }: any) {
  const { grades } = useApp();

  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  const avgGpa = (
    grades.reduce((sum, g) => sum + g.overall, 0) / grades.length
  ).toFixed(2);

  const renderItem = ({ item }: { item: GradeItem }) => (
    <View style={styles.gradeCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.subjectName}>{item.subjectName}</Text>
        <View style={styles.letterBadge}>
          <Text style={styles.letterText}>{item.letterGrade}</Text>
        </View>
      </View>

      <Text style={styles.creditText}>Số tín chỉ: {item.credits}</Text>

      <View style={styles.scoresRow}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Chuyên cần</Text>
          <Text style={styles.scoreVal}>{item.attendance}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Giữa kỳ</Text>
          <Text style={styles.scoreVal}>{item.midterm}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Cuối kỳ</Text>
          <Text style={styles.scoreVal}>{item.final}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel}>Tổng kết</Text>
          <Text style={[styles.scoreVal, styles.overallVal]}>{item.overall}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tóm tắt GPA */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{totalCredits}</Text>
          <Text style={styles.summaryLabel}>Tổng tín chỉ</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, styles.summaryHighlight]}>{avgGpa}</Text>
          <Text style={styles.summaryLabel}>Điểm TB tích lũy (Hệ 10)</Text>
        </View>
      </View>

      <FlatList
        data={grades}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>⬅ Quay lại trang Cá nhân</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryHighlight: {
    color: '#2563EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  letterBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 8,
  },
  letterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  creditText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  scoresRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 8,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  scoreVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  overallVal: {
    color: '#DC2626',
    fontWeight: '700',
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    margin: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
