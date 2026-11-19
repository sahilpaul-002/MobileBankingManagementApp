import type {
  AllWalletBalancesResponseDataType,
  WalletBalanceItemType,
} from '@/types/dashboard/allWalletsBalancesSectionTypes';
import { Wallet } from 'lucide-react-native';
import { Activity, useMemo } from 'react';
import { Text, View } from 'react-native';

interface WalletBalanceSectionPropsType {
  walletsBalances?: AllWalletBalancesResponseDataType | unknown[] | undefined;
  walletsBalancesNotFound?: boolean | undefined;
}

export default function WalletBalanceSection({
  walletsBalances,
  walletsBalancesNotFound = false,
}: WalletBalanceSectionPropsType) {
  const hasWalletBalances =
    !walletsBalancesNotFound &&
    !!walletsBalances &&
    !Array.isArray(walletsBalances) &&
    walletsBalances.wallets_details.length > 0;

  // Get fiat wallets
  const fiatWallets = useMemo<WalletBalanceItemType[]>(() => {
    if (!hasWalletBalances || !walletsBalances || Array.isArray(walletsBalances)) {
      return [];
    }

    return walletsBalances.wallets_details.filter(
      (wallet) => wallet.wallet_type === 'FIAT'
    );
  }, [walletsBalances, hasWalletBalances]);

  // Get crypto wallets
  const cryptoWallets = useMemo<WalletBalanceItemType[]>(() => {
    if (!hasWalletBalances || !walletsBalances || Array.isArray(walletsBalances)) {
      return [];
    }

    return walletsBalances.wallets_details.filter(
      (wallet) => wallet.wallet_type === 'CRYPTO'
    );
  }, [walletsBalances, hasWalletBalances]);

  // Total USD equivalent wallet balance
  const totalUSD =
    hasWalletBalances && walletsBalances && !Array.isArray(walletsBalances)
      ? walletsBalances.total_usd_equivalent
      : '0';

  const formatBalance = (balance: string) => {
    const numericBalance = Number(balance);

    if (!Number.isFinite(numericBalance)) {
      return balance;
    }

    return numericBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View className="w-full">
      {/* Wallets Balances Not Found / Empty State */}
      <Activity mode={!hasWalletBalances ? 'visible' : 'hidden'}>
        <View
          className={
            !hasWalletBalances
              ? 'w-full items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-6 shadow-sm'
              : 'hidden'
          }
        >
          {/* Section label */}
          <View className="mb-4 flex-row items-center gap-1.5 self-start">
            <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
            <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
              Treasury balance
            </Text>
          </View>

          {/* Empty Icon & Text */}
          <View className="my-3 items-center justify-center">
            <Wallet size={32} color="#8a93a8" strokeWidth={1.5} />
            <Text className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              No wallet balances found
            </Text>
            <Text className="mt-1 text-center text-xs leading-5 text-[var(--color-ink-soft)]">
              Your treasury data will appear here once wallets are active.
            </Text>
          </View>
        </View>
      </Activity>

      {/* Wallets Balances Found State */}
      <Activity mode={hasWalletBalances ? 'visible' : 'hidden'}>
        <View
          className={
            hasWalletBalances
              ? 'w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-sm'
              : 'hidden'
          }
        >
          {/* Treasury Total Section */}
          <View className="w-full flex-col items-start gap-2">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-semibold text-[var(--color-gold)]">—</Text>
              <Text className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-soft)]">
                Total treasury · USD equivalent
              </Text>
            </View>

            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="text-3xl font-bold text-[var(--color-ink)]">
                ${formatBalance(totalUSD)}
              </Text>
              <Text className="text-lg font-semibold uppercase text-[var(--color-ink-soft)]">
                USD
              </Text>
            </View>
          </View>

          {/* FIAT & CRYPTO Breakdown */}
          <View className="mt-5 w-full flex-col gap-3 rounded-lg border border-[var(--color-line-faint)] bg-[var(--color-app-subtle)] p-3.5">
            {/* FIAT Section */}
            {fiatWallets.length > 0 && (
              <View className="w-full flex-col gap-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-[var(--color-navy)]" />
                  <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
                    FIAT
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5 pl-4">
                  {fiatWallets.map((wallet) => (
                    <View key={wallet._id} className="flex-row items-center gap-1.5">
                      <View className="h-1.5 w-1.5 rounded-full bg-[var(--color-navy)]" />
                      <Text className="text-xs font-medium text-[var(--color-ink)]">
                        {formatBalance(wallet.account_balance)} {wallet.wallet_currency}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Separator if both exist */}
            {fiatWallets.length > 0 && cryptoWallets.length > 0 && (
              <View className="h-px w-full bg-[var(--color-line)]" />
            )}

            {/* CRYPTO Section */}
            {cryptoWallets.length > 0 && (
              <View className="w-full flex-col gap-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                  <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
                    CRYPTO
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5 pl-4">
                  {cryptoWallets.map((wallet) => (
                    <View key={wallet._id} className="flex-row items-center gap-1.5">
                      <View className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
                      <Text className="text-xs font-medium text-[var(--color-ink)]">
                        {formatBalance(wallet.account_balance)} {wallet.wallet_currency}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Activity>
    </View>
  );
}
