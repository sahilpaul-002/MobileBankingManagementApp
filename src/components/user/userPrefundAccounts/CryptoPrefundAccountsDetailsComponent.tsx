import type { PrefundCryptoAccountType } from '@/types/user/userPrefundAccountsDetailsTypes';
import { groupCryptoAccountsByNetwork } from '@/utils/userPrefundAccounts/prefundAccountsHelper';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import CryptoAssetCardComponent from './CryptoAssetCardComponent';
import CryptoNetworkTabsComponent from './CryptoNetworkTabsComponent';
import PrefundAccountsEmptyStateComponent from './PrefundAccountsEmptyStateComponent';

interface CryptoPrefundAccountsDetailsComponentPropsType {
    cryptoDetails?: PrefundCryptoAccountType[] | null | undefined;
}

export default function CryptoPrefundAccountsDetailsComponent({
    cryptoDetails,
}: CryptoPrefundAccountsDetailsComponentPropsType) {
    const cryptoAccountsByNetwork = useMemo(
        () => groupCryptoAccountsByNetwork(cryptoDetails),
        [cryptoDetails]
    );
    const networks = Object.keys(cryptoAccountsByNetwork);

    const [activeNetwork, setActiveNetwork] = useState<string>('');

    if (networks.length === 0) {
        return <PrefundAccountsEmptyStateComponent type="crypto" />;
    }

    const selectedNetwork = networks.includes(activeNetwork)
        ? activeNetwork
        : networks[0]!;
    const selectedNetworkAccounts =
        cryptoAccountsByNetwork[selectedNetwork] ?? [];

    return (
        <View className="w-full flex-col gap-4">
            {/* Header */}
            <View>
                <Text className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                    Crypto Treasury Accounts
                </Text>
                <Text className="text-xs text-[var(--color-ink-muted)]">
                    Deposit addresses and balances grouped by network
                </Text>
            </View>

            {/* Network Sub-Tabs */}
            <CryptoNetworkTabsComponent
                tabs={networks.map((network) => ({
                    id: network,
                    label: network,
                    count: cryptoAccountsByNetwork[network]?.length ?? 0,
                }))}
                activeTab={selectedNetwork}
                onTabChange={setActiveNetwork}
                idPrefix="userPrefundingAccountsPage-cryptoNetwork"
            />

            {/* Network Accounts List */}
            <View className="flex-col gap-4">
                {selectedNetworkAccounts.map((account) => (
                    <CryptoAssetCardComponent
                        key={
                            account.account_id ??
                            `${account.network}-${account.asset}-${account.deposit_address}`
                        }
                        account={account}
                    />
                ))}
            </View>
        </View>
    );
}
