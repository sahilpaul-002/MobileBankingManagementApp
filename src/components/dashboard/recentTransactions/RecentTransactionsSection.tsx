import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ROUTE_NAMES } from '@/routes/routeNames';
import type {
  WalletTransactionItemType,
  WalletTransactionsListResponseDataType,
} from '@/types/dashboard/walletTransactionsSectionTypes';
import { useRouter } from 'expo-router';
import { ChevronRight, ReceiptText } from 'lucide-react-native';
import { Activity } from 'react';
import { Text, View } from 'react-native';
import RecentTransactionItemComponent from './RecentTransactionItemComponent';

interface RecentTransactionsSectionPropsType {
  walletTransactions?: WalletTransactionsListResponseDataType | unknown[] | undefined;
  walletTransactionsNotFound?: boolean | undefined;
}

export default function RecentTransactionsSection({
  walletTransactions,
  walletTransactionsNotFound = false,
}: RecentTransactionsSectionPropsType) {
  const router = useRouter();

  const hasWalletTransactions =
    !walletTransactionsNotFound &&
    !!walletTransactions &&
    !Array.isArray(walletTransactions) &&
    walletTransactions.transactions?.length > 0;

  const transactions =
    hasWalletTransactions && walletTransactions && !Array.isArray(walletTransactions)
      ? walletTransactions.transactions
      : [];

  const handleNavigateStatements = () => {
    router.push(ROUTE_NAMES.WALLETS.STATEMENTS as any);
  };

  return (
    <View className="w-full">
      {/* Empty State */}
      <Activity mode={!hasWalletTransactions ? 'visible' : 'hidden'}>
        <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
              Recent Transactions
            </Text>

            <CustomButtonComponent
              id="recent-transactions-empty-statements-button"
              variant="link"
              buttonClassName="flex-row items-center gap-0.5 px-0 py-0"
              onPress={handleNavigateStatements}
            >
              <Text className="text-xs font-semibold text-[var(--color-link)]">
                View statements
              </Text>
              <ChevronRight size={14} color="#9193f7" />
            </CustomButtonComponent>
          </View>

          {/* Empty Icon and Text */}
          <View className="my-6 items-center justify-center">
            <ReceiptText size={32} color="#8a93a8" strokeWidth={1.5} />
            <Text className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              No transactions found
            </Text>
            <Text className="mt-1 text-center text-xs leading-5 text-[var(--color-ink-soft)]">
              Recent transactions will appear here once activity is available.
            </Text>
          </View>
        </View>
      </Activity>

      {/* Found State */}
      <Activity mode={hasWalletTransactions ? 'visible' : 'hidden'}>
        <View className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
              Recent Transactions
            </Text>

            <CustomButtonComponent
              id="recent-transactions-statements-button"
              variant="link"
              buttonClassName="flex-row items-center gap-0.5 px-0 py-0"
              onPress={handleNavigateStatements}
            >
              <Text className="text-xs font-semibold text-[var(--color-link)]">
                View statements
              </Text>
              <ChevronRight size={14} color="#9193f7" />
            </CustomButtonComponent>
          </View>

          {/* Transactions List */}
          <View className="mt-3 w-full flex-col">
            {transactions.map((transaction: WalletTransactionItemType) => (
              <RecentTransactionItemComponent
                key={transaction._id}
                transaction={transaction}
              />
            ))}
          </View>
        </View>
      </Activity>
    </View>
  );
}
