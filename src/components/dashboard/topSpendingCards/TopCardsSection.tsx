import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ROUTE_NAMES } from '@/routes/routeNames';
import type { TopSpendingCardItemType } from '@/types/dashboard/topSpendingCardsTypes';
import { useRouter } from 'expo-router';
import { ChevronRight, CreditCard } from 'lucide-react-native';
import { Activity, useState } from 'react';
import { Text, View } from 'react-native';
import TopSpendingCardLimitToggleComponent, {
  type SpendingLimitPeriodType,
} from './TopSpendingCardLimitToggleComponent';
import TopSpendingCardsListComponent from './TopSpendingCardsListComponent';

interface TopCardsSectionPropsType {
  cardsList?: TopSpendingCardItemType[] | undefined;
  cardsListNotFound?: boolean | undefined;
}

export default function TopCardsSection({
  cardsList,
  cardsListNotFound = false,
}: TopCardsSectionPropsType) {
  const router = useRouter();

  // Period toggle state: default to 'yearly'
  const [period, setPeriod] = useState<SpendingLimitPeriodType>('yearly');

  // Availability check
  const hasCards =
    !cardsListNotFound && Array.isArray(cardsList) && cardsList.length > 0;

  const handleSelectCard = (cardId: string) => {
    router.push({
      pathname: '/dashboard/cards/manageCards/[id]',
      params: { id: cardId },
    } as any);
  };

  const handleNavigateAllCards = () => {
    router.push(ROUTE_NAMES.CARDS.MANAGE_CARDS as any);
  };

  return (
    <View className="w-full">
      {/* Empty State */}
      <Activity mode={!hasCards ? 'visible' : 'hidden'}>
        <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
              <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
                Top Spending Cards
              </Text>
            </View>

            <CustomButtonComponent
              id="top-cards-empty-all-cards"
              variant="link"
              buttonClassName="w-auto shrink-0 flex-row items-center gap-0.5 px-0 py-0"
              onPress={handleNavigateAllCards}
            >
              <Text className="text-xs font-semibold text-[var(--color-link)]">
                All cards
              </Text>
              <ChevronRight size={14} color="#9193f7" />
            </CustomButtonComponent>
          </View>

          {/* Empty Icon and Text */}
          <View className="my-6 items-center justify-center">
            <CreditCard size={32} color="#8a93a8" strokeWidth={1.5} />
            <Text className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              No top spending cards found
            </Text>
            <Text className="mt-1 text-center text-xs leading-5 text-[var(--color-ink-soft)]">
              Your top spending cards will appear here once cards are active.
            </Text>
          </View>
        </View>
      </Activity>

      {/* Cards List Found State */}
      <Activity mode={hasCards ? 'visible' : 'hidden'}>
        <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
              <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
                Top Spending Cards
              </Text>
            </View>

            <CustomButtonComponent
              id="top-cards-all-cards"
              variant="link"
              buttonClassName="w-auto shrink-0 flex-row items-center gap-0.5 px-0 py-0"
              onPress={handleNavigateAllCards}
            >
              <Text className="text-xs font-semibold text-[var(--color-link)]">
                All cards
              </Text>
              <ChevronRight size={14} color="#9193f7" />
            </CustomButtonComponent>
          </View>

          {/* Toggle Button Row */}
          <View className="my-3 flex-row items-center justify-end">
            <TopSpendingCardLimitToggleComponent
              period={period}
              onChange={setPeriod}
            />
          </View>

          {/* Cards List */}
          <TopSpendingCardsListComponent
            cards={cardsList ?? []}
            period={period}
            onSelectCard={handleSelectCard}
          />
        </View>
      </Activity>
    </View>
  );
}
