import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import typography from '../../theme/typography.js';

import { useNetworkStatus } from '../../hooks/useNetworkStatus.js';

/**
 * OfflineBanner - Banner hiển thị khi ứng dụng ngoại tuyến
 * Theo mục 5.4 của đề: không có props, đọc trực tiếp từ useNetworkStatus
 * Chỉ hiện khi offline.
 */
export default function OfflineBanner() {
  const { isOnline, isDetermined } = useNetworkStatus();

  // Khi chưa xác định trạng thái mạng hoặc đang online thì không hiện banner
  if (!isDetermined || isOnline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ Bạn đang offline. Dữ liệu hiển thị từ bộ nhớ đệm.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.offline,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
});
