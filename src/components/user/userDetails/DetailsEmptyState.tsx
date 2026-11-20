import { Building2, MapPin, UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface DetailsEmptyStatePropsType {
    type: 'personal' | 'address' | 'bank';
}

export default function DetailsEmptyState({
    type,
}: DetailsEmptyStatePropsType) {
    const isPersonal = type === 'personal';
    const isAddress = type === 'address';

    const Icon = isPersonal
        ? UserRound
        : isAddress
            ? MapPin
            : Building2;

    const title = isPersonal
        ? 'No personal details available'
        : isAddress
            ? 'No address details available'
            : 'No bank details available';

    const description = isPersonal
        ? 'Your personal details are not available yet.'
        : isAddress
            ? 'Your billing and delivery address details are not available yet.'
            : 'Your linked bank account details are not available yet.';

    return (
        <View className="w-full min-h-[220px] items-center justify-center p-6">
            <View className="w-full max-w-sm items-center justify-center text-center">
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-app-subtle)]">
                    <Icon size={24} color="#8a93a8" />
                </View>

                <Text className="text-center text-base font-semibold text-[var(--color-ink)]">
                    {title}
                </Text>

                <Text className="mt-2 text-center text-xs leading-5 text-[var(--color-ink-muted)]">
                    {description}
                </Text>
            </View>
        </View>
    );
}
