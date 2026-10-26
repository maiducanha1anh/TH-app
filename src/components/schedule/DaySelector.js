import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

const DAYS = [
  { dayOfWeek: 2, label: 'Thứ 2' },
  { dayOfWeek: 3, label: 'Thứ 3' },
  { dayOfWeek: 4, label: 'Thứ 4' },
  { dayOfWeek: 5, label: 'Thứ 5' },
  { dayOfWeek: 6, label: 'Thứ 6' },
  { dayOfWeek: 7, label: 'Thứ 7' },
  { dayOfWeek: 8, label: 'Chủ nhật' },
];

/**
 * DaySelector - Chọn ngày trong tuần từ Thứ 2 đến Chủ nhật (2..8)
 * @param {object} props
 * @param {number} props.selectedDay - Ngày đang chọn (2..8)
 * @param {(day: number) => void} props.onSelectDay - Callback khi chọn ngày
 */
export default function DaySelector({ selectedDay, onSelectDay }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {DAYS.map(item => {
          const isSelected = selectedDay === item.dayOfWeek;
          return (
            <TouchableOpacity
              key={`day-${item.dayOfWeek}`}
              activeOpacity={0.7}
              onPress={() => onSelectDay(item.dayOfWeek)}
              accessibilityLabel={`Chọn ${item.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[styles.dayButton, isSelected && styles.dayButtonActive]}>
              <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  dayButton: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: spacing.xs,
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: colors.textInverse,
  },
});
