import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';

export default function SubjectsScreen({ navigation }: any) {
  const { subjects } = useApp();
  const [searchText, setSearchText] = useState('');

  // Lọc môn học theo tên hoặc mã môn
  const filteredSubjects = subjects.filter(
    item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SubjectDetail', { subject: item })}>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.code}</Text>
        <Text style={styles.creditText}>{item.credits} tín chỉ</Text>
      </View>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.teacherText}>Giảng viên: {item.teacher}</Text>
      <View style={styles.footer}>
        <Text style={styles.roomText}>📍 Phòng học: {item.room}</Text>
        <Text style={styles.detailLink}>Xem chi tiết ›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên hoặc mã môn học..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Danh sách FlatList */}
      <FlatList
        data={filteredSubjects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy môn học nào phù hợp.</Text>
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
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
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
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeText: {
    backgroundColor: '#EEF2FF',
    color: '#3730A3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  creditText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  teacherText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 8,
  },
  roomText: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
