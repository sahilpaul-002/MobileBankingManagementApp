import type { PrefundCryptoAccountType } from '@/types/user/userPrefundAccountsDetailsTypes';
import { formatNumberDecimal } from '@/utils/userPrefundAccounts/prefundAccountsHelper';
import { Coins } from 'lucide-react-native';
import { Text, View } from 'react-native';
import PrefundAccountItemDetailsComponent from './PrefundAccountItemDetailsComponent';

interface CryptoAssetCardComponentPropsType {
    account: PrefundCryptoAccountType;
}

export default function CryptoAssetCardComponent({
    account,
}: CryptoAssetCardComponentPropsType) {
    const idPrefix = `cryptoAccount-${account.network}-${account.asset}`;

    return (
        <View className="w-full flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-xs">
            {/* Header */}
            <View className="flex-row items-center gap-3 border-b border-[var(--color-line-faint)] pb-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-navy)]">
                    <Coins size={18} color="#d49a4d" />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-[var(--color-ink)]">
                        {account.asset}
                    </Text>
                    <Text className="text-xs text-[var(--color-ink-muted)]">
                        {account.network} Network Deposit Account
                    </Text>
                </View>
            </View>

            {/* Details */}
            <View className="flex-col gap-3">
                <PrefundAccountItemDetailsComponent
                    id={`${idPrefix}-value-network`}
                    label="Network"
                    value={account.network}
                />

                <PrefundAccountItemDetailsComponent
                    id={`${idPrefix}-value-asset`}
                    label="Asset"
                    value={account.asset}
                />

                <PrefundAccountItemDetailsComponent
                    id={`${idPrefix}-value-balance`}
                    label="Available Balance"
                    value={`${formatNumberDecimal(account.balance)} ${account.asset || ''}`.trim()}
                />

                <PrefundAccountItemDetailsComponent
                    id={`${idPrefix}-value-depositAddress`}
                    label="Deposit Address"
                    value={account.deposit_address}
                    copyable
                    breakAll
                />
            </View>
        </View>
    );
}
