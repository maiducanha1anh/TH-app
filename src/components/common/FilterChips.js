import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors.js';
import spacing from '../../theme/spacing.js';
import typography from '../../theme/typography.js';

/**
 * FilterChips - Thanh cuộn ngang các chip bộ lọc
 * @param {object} props
 * @param {Array<{ label: string, value: string | number } | string>} props.options
 * @param {string | number} props.selected
 * @param {(val: any) => void} props.onSelect
 */
export default function FilterChips({ options = [], selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {options.map((opt, index) => {
        const label = typeof opt === 'object' ? opt.label : opt;
        const value = typeof opt === 'object' ? opt.value : opt;
        const isSelected = selected === value;

        return (
          <TouchableOpacity
            key={`chip-${index}-${value}`}
            activeOpacity={0.7}
            onPress={() => onSelect(value)}
            accessibilityLabel={`Bộ lọc ${label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipActive]}>
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
});
