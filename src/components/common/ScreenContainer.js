import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OfflineBanner from './OfflineBanner.js';
import colors from '../../theme/colors.js';

/**
 * ScreenContainer - Khung bọc giao diện chuẩn cho mọi màn hình
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.scroll=false] - Cho phép cuộn toàn màn hình nếu true
 * @param {object} [props.style] - Style tùy biến
 */
export default function ScreenContainer({ children, scroll = false, style }) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['bottom', 'left', 'right']}>
      <OfflineBanner />
      {scroll ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.flexOne]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flexOne: {
    flex: 1,
  },
});
