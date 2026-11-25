import { useGetAllCardsExpendituresQuery } from '@/redux/features/card/cardApi';
import { useGetPayoutsExpendituresQuery } from '@/redux/features/transfer/transferApis';
import { useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectIsAdmin, selectIsMasterAdmin } from '@/redux/slice/user/userSlice';
import type {
  CardExpenditureChartResponseDataType,
  ExpenditureChartItemType,
  PayoutExpenditureChartResponseDataType,
} from '@/types/dashboard/expenditureChartSectionTypes';
import ShowInConsole from '@/utils/ShowInConsole';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChartNoAxesCombined, Info } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import ExpenditureAreaChartComponent from './ExpenditureAreaChartComponent';
import ExpenditureBarChartComponent, {
  type ExpenditureChartDataPoint,
} from './ExpenditureBarChartComponent';

interface ExpenditureChartSectionPropsType {
  userEmail: string | null;
  userCardholderId: string | null;
  userId?: string | null;
}

export default function ExpenditureChartSection({
  userEmail,
  userCardholderId,
  userId,
}: ExpenditureChartSectionPropsType) {
  // Check user role permissions
  const isAdmin = useAppSelector(selectIsAdmin);
  const isMasterAdmin = useAppSelector(selectIsMasterAdmin);
  const canAccessPayoutsExpenditures = isAdmin || isMasterAdmin;

  // Resolve user id from prop or async storage
  const [asyncStorageUserId, setAsyncStorageUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      AsyncStorage.getItem('userId').then((storedId) => {
        if (storedId) {
          setAsyncStorageUserId(storedId);
        }
      });
    }
  }, [userId]);

  const effectiveUserId = userId || asyncStorageUserId;

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

  // ----------------------------- Payouts Expenditures Query (Admin only) ----------------------------- \\
  const {
    data: getPayoutsExpendituresData,
    isLoading: getPayoutsExpendituresIsLoading,
    isFetching: getPayoutsExpendituresIsFetching,
    isError: getPayoutsExpendituresIsError,
  } = useGetPayoutsExpendituresQuery(
    {
      email: userEmail ?? '',
      userId: effectiveUserId ?? '',
      fromDate,
      toDate,
    },
    {
      skip: !userEmail || !effectiveUserId || !canAccessPayoutsExpenditures,
      refetchOnMountOrArgChange: true,
    }
  );

  const payoutsExpendituresResponseData =
    getPayoutsExpendituresData?.data as PayoutExpenditureChartResponseDataType | undefined;
  const payoutsExpendituresList = useMemo(
    () => (payoutsExpendituresResponseData?.payout_spend as ExpenditureChartItemType[]) ?? [],
    [payoutsExpendituresResponseData]
  );
  const hasPayoutExpenditure =
    canAccessPayoutsExpenditures &&
    !getPayoutsExpendituresIsError &&
    payoutsExpendituresList.some((item) => Number(item.amount) > 0);

  // ----------------------------- Card Expenditures Query (All Users) ----------------------------- \\
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

  // Debug logging
  useEffect(() => {
    if (canAccessPayoutsExpenditures && payoutsExpendituresResponseData) {
      ShowInConsole('Payouts Expenditures', payoutsExpendituresResponseData);
    }
  }, [canAccessPayoutsExpenditures, payoutsExpendituresResponseData]);

  useEffect(() => {
    if (allCardsExpendituresResponseData) {
      ShowInConsole('All Cards Expenditures', allCardsExpendituresResponseData);
    }
  }, [allCardsExpendituresResponseData]);

  // Loading and Data flags
  const hasExpenditureData = canAccessPayoutsExpenditures
    ? hasPayoutExpenditure || hasCardExpenditure
    : hasCardExpenditure;

  const isExpenditureLoading =
    getAllCardsExpendituresIsLoading ||
    getAllCardsExpendituresIsFetching ||
    (canAccessPayoutsExpenditures &&
      (getPayoutsExpendituresIsLoading || getPayoutsExpendituresIsFetching));

  // Total Expenditures Values
  const totalPayoutSpend = Number(
    payoutsExpendituresResponseData?.total_payout_spend ?? '0'
  );
  const totalCardSpend = Number(
    allCardsExpendituresResponseData?.total_card_spend ?? '0'
  );
  const totalExpenditure = canAccessPayoutsExpenditures
    ? totalPayoutSpend + totalCardSpend
    : totalCardSpend;

  // Construct 30-Day Chart Data Points
  const chartData = useMemo<ExpenditureChartDataPoint[]>(() => {
    const payoutsMap = new Map(
      payoutsExpendituresList.map((item) => [item.date, Number(item.amount)])
    );
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

      const cardSpend = cardSpendMap.get(date) ?? 0;
      const payouts = canAccessPayoutsExpenditures ? (payoutsMap.get(date) ?? 0) : 0;

      return {
        date,
        dayIndex: index + 1,
        dayLabel: index === 29 ? 'Today' : `${29 - index}d ago`,
        cardSpend,
        payouts,
        total: cardSpend + payouts,
      };
    });
  }, [
    allCardsExpendituresList,
    payoutsExpendituresList,
    fromDateObject,
    canAccessPayoutsExpenditures,
  ]);

  return (
    <View className="w-full">
      {/* Loading State */}
      {isExpenditureLoading ? (
        <View className="w-full">
          <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
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
        </View>
      ) : null}

      {/* Loaded State */}
      {!isExpenditureLoading ? (
        <View className="w-full">
          <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
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
                  Total USD Equivalent Expenditure
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
            {!hasExpenditureData ? (
              <View className="my-8 items-center justify-center gap-2">
                <Info size={28} color="#8a93a8" strokeWidth={1.5} />
                <Text className="text-center text-xs text-[var(--color-ink-soft)]">
                  Expenditure data is not available for the last 30 days.
                </Text>
              </View>
            ) : (
              <View className="mt-4 w-full flex-col">
                {/* Chart: Admin sees Stacked Bar Chart, Non-Admin sees Smooth Area Chart */}
                {canAccessPayoutsExpenditures ? (
                  <ExpenditureBarChartComponent data={chartData} />
                ) : (
                  <ExpenditureAreaChartComponent data={chartData} />
                )}

                {/* Legend: Admin shows both Payouts & Card spend, Non-admin shows only Card spend */}
                <View className="mt-4 flex-row items-center gap-4">
                  {canAccessPayoutsExpenditures && (
                    <View className="flex-row items-center gap-2">
                      <View className="h-2.5 w-2.5 rounded-sm bg-[var(--color-ink-secondary)]" />
                      <Text className="text-xs font-semibold text-[var(--color-ink-soft)]">
                        Payouts
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center gap-2">
                    <View className="h-2.5 w-2.5 rounded-sm bg-[var(--color-gold)]" />
                    <Text className="text-xs font-semibold text-[var(--color-ink-soft)]">
                      Card spend
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}
