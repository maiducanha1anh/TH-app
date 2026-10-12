import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function EditProfileScreen({ navigation }: any) {
  const { student, updateStudent } = useApp();

  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }

    updateStudent({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    Alert.alert('Thành công', 'Thông tin đã được cập nhật!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Chỉnh sửa thông tin</Text>
        <Text style={styles.subHeader}>
          Mã sinh viên: <Text style={styles.bold}>{student.studentId}</Text> (không thể đổi)
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ tên..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Nhập email..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Nhập số điện thoại..."
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>💾 Lưu thay đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
