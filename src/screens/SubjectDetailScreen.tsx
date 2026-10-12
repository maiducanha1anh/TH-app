import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Subject } from '../types';

export default function SubjectDetailScreen({ route, navigation }: any) {
  const subject: Subject | undefined = route.params?.subject;

  if (!subject) {
    return (
      <View style={styles.center}>
        <Text>Không có dữ liệu môn học.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerBadge}>
          <Text style={styles.codeText}>{subject.code}</Text>
          <Text style={styles.creditText}>{subject.credits} Tín chỉ</Text>
        </View>

        <Text style={styles.title}>{subject.name}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>👨‍🏫 Giảng viên phụ trách:</Text>
          <Text style={styles.value}>{subject.teacher}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📍 Phòng học:</Text>
          <Text style={styles.value}>{subject.room}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>📖 Mô tả tóm tắt môn học:</Text>
        <Text style={styles.descriptionText}>{subject.description}</Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>⬅ Quay lại danh sách</Text>
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
  headerBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  creditText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  infoRow: {
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
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
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
