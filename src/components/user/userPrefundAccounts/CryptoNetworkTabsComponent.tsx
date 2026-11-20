import { Pressable, ScrollView, Text, View } from 'react-native';

interface CryptoNetworkTabsComponentPropsType {
    tabs: { id: string; label: string; count?: number }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    idPrefix: string;
    containerClassName?: string;
}

export default function CryptoNetworkTabsComponent({
    tabs,
    activeTab,
    onTabChange,
    containerClassName = '',
}: CryptoNetworkTabsComponentPropsType) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={`w-full py-1 ${containerClassName}`}
            contentContainerStyle={{ gap: 8 }}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <Pressable
                        key={tab.id}
                        onPress={() => onTabChange(tab.id)}
                        className={`flex-row items-center gap-2 rounded-xl px-4 py-2 border ${
                            isActive
                                ? 'border-[var(--color-navy)] bg-[var(--color-navy)] shadow-xs'
                                : 'border-[var(--color-line)] bg-[var(--color-app-surface)] active:bg-[var(--color-app-hover)]'
                        }`}
                    >
                        {/* Indicator dot */}
                        <View
                            className={`h-2 w-2 rounded-full ${
                                isActive ? 'bg-[var(--color-gold)]' : 'bg-[#8a93a8]'
                            }`}
                        />

                        <Text
                            className={`text-xs font-bold ${
                                isActive ? 'text-white' : 'text-[var(--color-ink-soft)]'
                            }`}
                        >
                            {tab.label}
                        </Text>

                        {typeof tab.count === 'number' && (
                            <View
                                className={`items-center justify-center rounded-full px-1.5 py-0.5 ${
                                    isActive
                                        ? 'bg-[#16264a]'
                                        : 'bg-[var(--color-app-subtle)] border border-[var(--color-line)]'
                                }`}
                            >
                                <Text
                                    className={`text-[10px] font-bold ${
                                        isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-ink-muted)]'
                                    }`}
                                >
                                    {tab.count}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
