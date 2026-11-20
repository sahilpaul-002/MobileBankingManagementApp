import type { PrefundFiatAccountType } from '@/types/user/userPrefundAccountsDetailsTypes';
import {
    formatNumberDecimal,
    hasFiatAccount,
} from '@/utils/userPrefundAccounts/prefundAccountsHelper';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { Text, View } from 'react-native';
import PrefundAccountItemDetailsComponent from './PrefundAccountItemDetailsComponent';
import PrefundAccountsEmptyStateComponent from './PrefundAccountsEmptyStateComponent';

function ActiveStatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <View
            className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-0.5 ${
                isActive
                    ? 'border border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)]'
                    : 'border border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)]'
            }`}
        >
            {isActive ? (
                <CheckCircle2 size={11} color="#1f8a5b" />
            ) : (
                <XCircle size={11} color="#b03333" />
            )}
            <Text
                className={`text-xs font-semibold ${
                    isActive
                        ? 'text-[var(--color-status-success)]'
                        : 'text-[var(--color-status-danger)]'
                }`}
            >
                {isActive ? 'Active' : 'Inactive'}
            </Text>
        </View>
    );
}

interface FiatPrefundAccountDetailsComponentPropsType {
    fiatDetails?: PrefundFiatAccountType | null | undefined;
}

export default function FiatPrefundAccountDetailsComponent({
    fiatDetails,
}: FiatPrefundAccountDetailsComponentPropsType) {
    if (!hasFiatAccount(fiatDetails)) {
        return <PrefundAccountsEmptyStateComponent type="fiat" />;
    }

    return (
        <View className="w-full flex-col gap-4">
            {/* Header */}
            <View>
                <Text className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                    Fiat Treasury Account
                </Text>
                <Text className="text-xs text-[var(--color-ink-muted)]">
                    Primary prefunding fiat deposit information
                </Text>
            </View>

            {/* Account Card */}
            <View className="flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-xs">
                {/* Account Number */}
                <PrefundAccountItemDetailsComponent
                    id="fiatAccount-value-accountNumber"
                    label="Account Number"
                    value={fiatDetails?.account_number}
                    copyable
                />

                {/* Account Currency */}
                <PrefundAccountItemDetailsComponent
                    id="fiatAccount-value-accountCurrency"
                    label="Account Currency"
                    value={fiatDetails?.account_currency}
                />

                {/* Account Balance */}
                <PrefundAccountItemDetailsComponent
                    id="fiatAccount-value-accountBalance"
                    label="Account Balance"
                    value={`${formatNumberDecimal(fiatDetails?.account_balance)} ${fiatDetails?.account_currency ?? ''}`.trim()}
                />

                {/* Status */}
                <PrefundAccountItemDetailsComponent
                    id="fiatAccount-value-status"
                    label="Account Status"
                >
                    <ActiveStatusBadge isActive={!!fiatDetails?.is_active} />
                </PrefundAccountItemDetailsComponent>
            </View>
        </View>
    );
}
