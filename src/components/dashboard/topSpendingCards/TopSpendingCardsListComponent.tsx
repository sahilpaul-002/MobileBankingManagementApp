import type { TopSpendingCardItemType } from '@/types/dashboard/topSpendingCardsTypes';
import { View } from 'react-native';
import TopSpendingCardItemComponent from './TopSpendingCardItemComponent';
import type { SpendingLimitPeriodType } from './TopSpendingCardLimitToggleComponent';

interface TopSpendingCardsListComponentPropsType {
  cards: TopSpendingCardItemType[];
  period: SpendingLimitPeriodType;
  onSelectCard?: ((cardId: string) => void) | undefined;
}

export default function TopSpendingCardsListComponent({
  cards,
  period,
  onSelectCard,
}: TopSpendingCardsListComponentPropsType) {
  // Display up to top 3 cards
  const displayCards = cards.slice(0, 3);

  return (
    <View className="w-full flex-col gap-2.5">
      {displayCards.map((card) => (
        <TopSpendingCardItemComponent
          key={card._id}
          card={card}
          period={period}
          onSelectCard={onSelectCard}
        />
      ))}
    </View>
  );
}
