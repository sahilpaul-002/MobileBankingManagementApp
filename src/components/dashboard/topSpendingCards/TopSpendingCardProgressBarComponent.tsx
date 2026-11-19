import type {
  CardLimitsType,
  DailyTransactionType,
  MonthlyTransactionType,
  YearlyTransactionType,
} from '@/types/dashboard/topSpendingCardsTypes';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { SpendingLimitPeriodType } from './TopSpendingCardLimitToggleComponent';

interface TopSpendingCardProgressBarComponentPropsType {
  period: SpendingLimitPeriodType;
  currency: string;
  limits?: CardLimitsType | undefined;
  dailyTransaction?: DailyTransactionType | undefined;
  monthlyTransaction?: MonthlyTransactionType | undefined;
  yearlyTransaction?: YearlyTransactionType | undefined;
}

function parseDecimal(value?: string): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TopSpendingCardProgressBarComponent({
  period,
  currency,
  limits,
  dailyTransaction,
  monthlyTransaction,
  yearlyTransaction,
}: TopSpendingCardProgressBarComponentPropsType) {
  const { debit, limit, usagePercent } = useMemo(() => {
    let debitValue = 0;
    let limitValue = 0;

    switch (period) {
      case 'daily':
        debitValue = parseDecimal(dailyTransaction?.debit?.$numberDecimal);
        limitValue = parseDecimal(limits?.daily_limit?.$numberDecimal);
        break;
      case 'monthly':
        debitValue = parseDecimal(monthlyTransaction?.debit?.$numberDecimal);
        limitValue = parseDecimal(limits?.monthly_limit?.$numberDecimal);
        break;
      case 'yearly':
      default:
        debitValue = parseDecimal(yearlyTransaction?.debit?.$numberDecimal);
        limitValue = parseDecimal(limits?.yearly_limit?.$numberDecimal);
        break;
    }

    const percent =
      limitValue > 0
        ? Math.min(100, Math.max(0, (debitValue / limitValue) * 100))
        : 0;

    return {
      debit: debitValue,
      limit: limitValue,
      usagePercent: percent,
    };
  }, [period, limits, dailyTransaction, monthlyTransaction, yearlyTransaction]);

  return (
    <View className="mt-2 w-full flex-col gap-1.5">
      {/* Progress Track and Bar */}
      <View className="w-full flex-row items-center gap-2">
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
          <View
            className="h-full rounded-full bg-[var(--color-gold)]"
            style={{ width: `${usagePercent}%` }}
          />
        </View>

        <Text className="font-mono text-xs font-semibold text-[var(--color-ink-soft)]">
          {usagePercent.toFixed(1)}%
        </Text>
      </View>

      {/* Spend vs Limit info */}
      <View className="flex-row items-center justify-between text-xs">
        <Text className="text-xs capitalize text-[var(--color-ink-muted)]">
          {period} spend
        </Text>

        <View className="flex-row items-center">
          <Text className="text-xs font-semibold text-[var(--color-ink)]">
            {currency} {formatAmount(debit)}
          </Text>
          <Text className="mx-1 text-xs text-[var(--color-ink-muted)]">/</Text>
          <Text className="text-xs text-[var(--color-ink-soft)]">
            {currency} {formatAmount(limit)}
          </Text>
        </View>
      </View>
    </View>
  );
}
