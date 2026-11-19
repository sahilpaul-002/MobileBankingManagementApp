import type { TopSpendingCardItemType } from '@/types/dashboard/topSpendingCardsTypes';
import { Pressable, Text, View } from 'react-native';
import type { SpendingLimitPeriodType } from './TopSpendingCardLimitToggleComponent';
import TopSpendingCardProgressBarComponent from './TopSpendingCardProgressBarComponent';

interface TopSpendingCardItemComponentPropsType {
  card: TopSpendingCardItemType;
  period: SpendingLimitPeriodType;
  onSelectCard?: ((cardId: string) => void) | undefined;
}

const DEFAULT_STATUS_STYLE = {
  bg: 'bg-[var(--color-app-subtle)]',
  text: 'text-[var(--color-ink-muted)]',
};

const CARD_STATUS_CLASSES: Record<string, { bg: string; text: string }> = {
  ACTIVE: {
    bg: 'bg-[var(--color-status-success-bg)]',
    text: 'text-[var(--color-status-success)]',
  },
  BLOCKED: {
    bg: 'bg-[var(--color-status-danger-bg)]',
    text: 'text-[var(--color-status-danger)]',
  },
  FROZEN: {
    bg: 'bg-[var(--color-status-info-bg)]',
    text: 'text-[var(--color-status-info)]',
  },
  INACTIVE: DEFAULT_STATUS_STYLE,
};

function formatCardNumber(cardNumber: string): string {
  if (!cardNumber) return '•••• •••• •••• ••••';
  const cleaned = cardNumber.replace(/\s+/g, '');
  const firstFour = cleaned.slice(0, 4);
  return `${firstFour} •••• •••• ••••`;
}

export default function TopSpendingCardItemComponent({
  card,
  period,
  onSelectCard,
}: TopSpendingCardItemComponentPropsType) {
  const statusKey = card.card_status?.toUpperCase() || 'INACTIVE';
  const statusStyle = CARD_STATUS_CLASSES[statusKey] ?? DEFAULT_STATUS_STYLE;

  return (
    <Pressable
      onPress={() => onSelectCard?.(card._id)}
      className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-subtle)] p-3 active:bg-[var(--color-app-hover)]"
      accessibilityRole="button"
    >
      {/* Top Row: Card Number, Name, Status */}
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-bold tracking-wider text-[var(--color-ink)]">
          {formatCardNumber(card.card_number)}
        </Text>

        <View className="flex-row items-center gap-2">
          <Text
            className="max-w-[120px] text-xs font-medium text-[var(--color-ink-muted)]"
            numberOfLines={1}
          >
            {card.name_on_card || '—'}
          </Text>

          <View className={`rounded px-1.5 py-0.5 ${statusStyle.bg}`}>
            <Text className={`text-[10px] font-bold uppercase ${statusStyle.text}`}>
              {card.card_status || '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Dynamic Progress Bar */}
      <TopSpendingCardProgressBarComponent
        period={period}
        currency={card.card_currency || 'USD'}
        limits={card.card_limits}
        dailyTransaction={card.daily_transaction}
        monthlyTransaction={card.monthly_transaction}
        yearlyTransaction={card.yearly_transaction}
      />
    </Pressable>
  );
}
