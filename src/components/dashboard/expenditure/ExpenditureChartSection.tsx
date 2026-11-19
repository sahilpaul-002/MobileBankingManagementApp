import { useGetAllCardsExpendituresQuery } from '@/redux/features/card/cardApi';
import type {
  CardExpenditureChartResponseDataType,
  ExpenditureChartItemType,
} from '@/types/dashboard/expenditureChartSectionTypes';
import { ChartNoAxesCombined, Info } from 'lucide-react-native';
import { Activity, useMemo } from 'react';
import { Text, View } from 'react-native';
import ExpenditureBarChartComponent, {
  type ExpenditureChartDataPoint,
} from './ExpenditureBarChartComponent';

interface ExpenditureChartSectionPropsType {
  userEmail: string | null;
  userCardholderId: string | null;
}

export default function ExpenditureChartSection({
  userEmail,
  userCardholderId,
}: ExpenditureChartSectionPropsType) {
  // ----------------------------- Date Range Calculation (Last 30 Days) ----------------------------- \\
  const { fromDate, toDate, fromDateObject } = useMemo(() => {
    const today = new Date();
    const fromObj = new Date(today);
    fromObj.setDate(today.getDate() - 29);

    const format = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      fromDate: format(fromObj),
      toDate: format(today),
      fromDateObject: fromObj,
    };
  }, []);

  // ----------------------------- Card Expenditures Query ----------------------------- \\
  const {
    data: getAllCardsExpendituresData,
    isLoading: getAllCardsExpendituresIsLoading,
    isFetching: getAllCardsExpendituresIsFetching,
    isError: getAllCardsExpendituresIsError,
  } = useGetAllCardsExpendituresQuery(
    {
      email: userEmail ?? '',
      cardholderId: userCardholderId ?? '',
      fromDate,
      toDate,
    },
    {
      skip: !userEmail || !userCardholderId,
      refetchOnMountOrArgChange: true,
    }
  );

  const allCardsExpendituresResponseData =
    getAllCardsExpendituresData?.data as CardExpenditureChartResponseDataType | undefined;
  const allCardsExpendituresList = useMemo(
    () => (allCardsExpendituresResponseData?.card_spend as ExpenditureChartItemType[]) ?? [],
    [allCardsExpendituresResponseData]
  );

  const hasCardExpenditure =
    !getAllCardsExpendituresIsError &&
    allCardsExpendituresList.some((item) => Number(item.amount) > 0);

  const isExpenditureLoading =
    getAllCardsExpendituresIsLoading || getAllCardsExpendituresIsFetching;

  // Total Card Expenditure
  const totalExpenditure = Number(
    allCardsExpendituresResponseData?.total_card_spend ?? '0'
  );

  // Construct 30-Day Chart Data Points
  const chartData = useMemo<ExpenditureChartDataPoint[]>(() => {
    const cardSpendMap = new Map(
      allCardsExpendituresList.map((item) => [item.date, Number(item.amount)])
    );

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return Array.from({ length: 30 }, (_, index) => {
      const currentDate = new Date(fromDateObject);
      currentDate.setDate(fromDateObject.getDate() + index);
      const date = formatDate(currentDate);

      return {
        date,
        dayIndex: index + 1,
        dayLabel: index === 29 ? 'Today' : `${29 - index}d ago`,
        cardSpend: cardSpendMap.get(date) ?? 0,
      };
    });
  }, [allCardsExpendituresList, fromDateObject]);

  return (
    <View className="w-full">
      {/* Loading State */}
      <Activity mode={isExpenditureLoading ? 'visible' : 'hidden'}>
        <View
          className={
            isExpenditureLoading
              ? 'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm'
              : 'hidden'
          }
        >
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
            <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
              Expenditure
            </Text>
          </View>
          <Text className="mt-1 text-xs text-[var(--color-ink-soft)]">
            Your expenditure for the last 30 days
          </Text>

          <View className="my-10 items-center justify-center">
            <ChartNoAxesCombined size={32} color="#d49a4d" strokeWidth={1.5} />
            <Text className="mt-2 text-xs text-[var(--color-ink-soft)]">
              Loading expenditure data...
            </Text>
          </View>
        </View>
      </Activity>

      {/* Loaded State */}
      <Activity mode={!isExpenditureLoading ? 'visible' : 'hidden'}>
        <View
          className={
            !isExpenditureLoading
              ? 'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm'
              : 'hidden'
          }
        >
          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
                <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
                  Expenditure
                </Text>
              </View>
              <Text className="mt-1 text-xs text-[var(--color-ink-soft)]">
                Your expenditure for the last 30 days
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[11px] font-medium text-[var(--color-ink-soft)]">
                Total USD Expenditure
              </Text>
              <Text className="mt-0.5 text-base font-bold text-[var(--color-ink)]">
                ${totalExpenditure.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {/* Chart or Empty */}
          {!hasCardExpenditure ? (
            <View className="my-8 items-center justify-center gap-2">
              <Info size={28} color="#8a93a8" strokeWidth={1.5} />
              <Text className="text-center text-xs text-[var(--color-ink-soft)]">
                Expenditure data is not available for the last 30 days.
              </Text>
            </View>
          ) : (
            <View className="mt-4 w-full flex-col">
              {/* Bar Chart */}
              <ExpenditureBarChartComponent data={chartData} />

              {/* Legend: Card spend only */}
              <View className="mt-4 flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-sm bg-[var(--color-gold)]" />
                <Text className="text-xs font-semibold text-[var(--color-ink-soft)]">
                  Card spend
                </Text>
              </View>
            </View>
          )}
        </View>
      </Activity>
    </View>
  );
}
