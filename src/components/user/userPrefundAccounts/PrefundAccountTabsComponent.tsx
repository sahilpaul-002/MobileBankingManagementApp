import { Pressable, Text, View } from 'react-native';

interface PrefundAccountsTabsComponentPropsType<T extends string> {
    tabs: { id: T; label: string }[];
    activeTab: T;
    onTabChange: (tabId: T) => void;
    idPrefix: string;
    containerClassName?: string;
}

export default function PrefundAccountsTabsComponent<T extends string>({
    tabs,
    activeTab,
    onTabChange,
    containerClassName = '',
}: PrefundAccountsTabsComponentPropsType<T>) {
    return (
        <View
            className={`flex-row items-center border-b border-[var(--color-line)] bg-[var(--color-app-subtle)] px-2 ${containerClassName}`}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <Pressable
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        className={`flex-1 items-center justify-center py-3 border-b-2 ${
                            isActive
                                ? 'border-[var(--color-gold)] bg-[var(--color-app-surface)]'
                                : 'border-transparent'
                        }`}
                    >
                        <Text
                            className={`text-xs font-bold tracking-wide ${
                                isActive
                                    ? 'text-[var(--color-navy)]'
                                    : 'text-[var(--color-ink-muted)]'
                            }`}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
