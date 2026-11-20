import type {
    NumberDecimalType,
    PrefundCryptoAccountType,
    PrefundFiatAccountType,
} from '@/types/user/userPrefundAccountsDetailsTypes';

/**
 * Format Mongo NumberDecimal into standard localized number string
 */
export function formatNumberDecimal(
    balance?: NumberDecimalType | null | undefined
): string {
    if (!balance || !balance.$numberDecimal) {
        return '0.00';
    }

    const num = parseFloat(balance.$numberDecimal);
    if (isNaN(num)) {
        return balance.$numberDecimal;
    }

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    });
}

/**
 * Checks whether a fiat prefund account exists and has necessary fields
 */
export function hasFiatAccount(
    fiat?: PrefundFiatAccountType | null | undefined
): boolean {
    if (!fiat || typeof fiat !== 'object') {
        return false;
    }

    return Boolean(
        fiat.account_number || fiat.account_id || fiat.account_currency
    );
}

/**
 * Groups an array of crypto accounts by their network (e.g. ETHEREUM, POLYGON)
 */
export function groupCryptoAccountsByNetwork(
    crypto?: PrefundCryptoAccountType[] | null | undefined
): Record<string, PrefundCryptoAccountType[]> {
    if (!crypto || !Array.isArray(crypto) || crypto.length === 0) {
        return {};
    }

    return crypto.reduce<Record<string, PrefundCryptoAccountType[]>>(
        (acc, account) => {
            const net = account.network || 'OTHER';
            if (!acc[net]) {
                acc[net] = [];
            }
            acc[net].push(account);
            return acc;
        },
        {}
    );
}
