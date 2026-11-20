import { Landmark, Wallet } from 'lucide-react-native';
import { Text, View } from 'react-native';

type PrefundingEmptyStateType = 'notFound' | 'fiat' | 'crypto';

const EMPTY_STATE_CONTENT: Record<
    PrefundingEmptyStateType,
    { title: string; description: string }
> = {
    notFound: {
        title: 'Prefunding accounts not found',
        description:
            'No active fiat or crypto prefunding account is available for your profile yet.',
    },
    fiat: {
        title: 'No fiat account available',
        description:
            'A fiat prefunding account has not been set up for your profile yet.',
    },
    crypto: {
        title: 'No crypto accounts available',
        description:
            'Crypto prefunding accounts have not been set up for your profile yet.',
    },
};

interface PrefundAccountsEmptyStateComponentPropsType {
    type: PrefundingEmptyStateType;
}

export default function PrefundAccountsEmptyStateComponent({
    type,
}: PrefundAccountsEmptyStateComponentPropsType) {
    const { title, description } = EMPTY_STATE_CONTENT[type];
    const Icon = type === 'fiat' ? Landmark : Wallet;

    return (
        <View
            testID={`prefundingEmptyState-${type}`}
            className="w-full min-h-[200px] items-center justify-center py-10 px-6"
        >
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-app-subtle)]">
                <Icon size={22} color="#8a93a8" />
            </View>

            <Text className="text-center text-sm font-bold text-[var(--color-ink)]">
                {title}
            </Text>
            <Text className="mt-1 text-center text-xs leading-5 text-[var(--color-ink-muted)] max-w-xs">
                {description}
            </Text>
        </View>
    );
}
