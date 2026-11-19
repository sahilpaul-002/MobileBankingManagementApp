import { Pressable, Text, View } from 'react-native';

export type SpendingLimitPeriodType = 'daily' | 'monthly' | 'yearly';

interface TopSpendingCardLimitToggleComponentPropsType {
  period: SpendingLimitPeriodType;
  onChange: (period: SpendingLimitPeriodType) => void;
}

const PERIOD_OPTIONS: { label: string; value: SpendingLimitPeriodType }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function TopSpendingCardLimitToggleComponent({
  period,
  onChange,
}: TopSpendingCardLimitToggleComponentPropsType) {
  return (
    <View className="flex-row items-center rounded-lg border border-[var(--color-line)] bg-[var(--color-app-subtle)] p-1">
      {PERIOD_OPTIONS.map((option) => {
        const isActive = period === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 ${
              isActive ? 'bg-[var(--color-navy)]' : 'bg-transparent'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? 'text-white' : 'text-[var(--color-ink-soft)]'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
