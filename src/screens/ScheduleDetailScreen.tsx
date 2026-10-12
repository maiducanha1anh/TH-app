import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScheduleItem } from '../types';

export default function ScheduleDetailScreen({ route, navigation }: any) {
  const schedule: ScheduleItem | undefined = route.params?.schedule;

  if (!schedule) {
    return (
      <View style={styles.center}>
        <Text>Không có dữ liệu buổi học.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.dayTag}>
          <Text style={styles.dayTagText}>{schedule.dayOfWeek}</Text>
        </View>

        <Text style={styles.title}>{schedule.subjectName}</Text>
        <Text style={styles.code}>Mã môn: {schedule.subjectCode}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>⏰ Thời gian:</Text>
          <Text style={styles.value}>{schedule.time}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>📍 Phòng học:</Text>
          <Text style={styles.value}>{schedule.room}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>👨‍🏫 Giảng viên:</Text>
          <Text style={styles.value}>{schedule.teacher}</Text>
        </View>

        {schedule.notes ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.noteLabel}>📌 Ghi chú buổi học:</Text>
            <Text style={styles.noteValue}>{schedule.notes}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>⬅ Quay lại thời khóa biểu</Text>
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
  dayTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  dayTagText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  code: {
    fontSize: 13,
    color: '#6B7280',
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
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  noteValue: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
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
