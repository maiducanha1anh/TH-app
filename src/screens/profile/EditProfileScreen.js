import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer.js';
import FormInput from '../../components/common/FormInput.js';
import AppButton from '../../components/common/AppButton.js';
import { validateProfileForm } from '../../utils/validators.js';
import { useAppData } from '../../context/AppDataContext.js';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

export default function EditProfileScreen({ navigation }) {
  const { student, updateStudent } = useAppData();

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    const validation = validateProfileForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await updateStudent(formData);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), // Quy tắc 3 mục 3: tự quay về sau khi lưu
        },
      ]);
    } catch (err) {
      // Đã được thông báo lỗi trong context
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.header}>Chỉnh sửa thông tin cá nhân</Text>
          <Text style={styles.subHeader}>
            Mã sinh viên: <Text style={styles.bold}>{student?.studentCode}</Text> (Cố định)
          </Text>

          <FormInput
            label="Họ và tên: *"
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
            }}
            placeholder="Nhập họ và tên…"
            error={errors.fullName}
          />

          <FormInput
            label="Địa chỉ Email:"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            placeholder="example@student.edu.vn"
            error={errors.email}
          />

          <FormInput
            label="Số điện thoại:"
            value={phone}
            onChangeText={text => {
              setPhone(text);
              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
            }}
            keyboardType="phone-pad"
            placeholder="0912345678"
            error={errors.phone}
          />

          <AppButton
            title="💾 Lưu thay đổi"
            variant="primary"
            loading={saving}
            onPress={handleSave}
            style={styles.saveBtn}
          />

          <AppButton
            title="Hủy bỏ"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  subHeader: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  bold: {
    ...typography.captionBold,
    color: colors.text,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
  cancelBtn: {
    marginTop: spacing.sm,
  },
});
