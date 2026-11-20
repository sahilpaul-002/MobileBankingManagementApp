import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import { RefreshCw, ShieldAlert } from "lucide-react-native";
import { Modal, Text, View } from "react-native";

export interface RefreshPageFallbackProps {
    visible: boolean;
    onRetry: () => void;
    isLoading: boolean;
    title?: string | undefined;
    description?: string | undefined;
}

export default function RefreshPageFallbackComponent({
    visible,
    onRetry,
    isLoading,
    title = "Some Services Are Unavailable",
    description = "We couldn't load some of the required portal services. Please try again later.",
}: RefreshPageFallbackProps) {
    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            statusBarTranslucent
            visible={visible}
        >
            <View className="flex-1 items-center justify-center bg-[#0c1830]/75 p-6">
                <View className="w-full max-w-[360px] items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-6 shadow-2xl">
                    {/* Security Warning Icon */}
                    <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-[#0c1830] border border-[var(--color-gold)]/40 shadow-sm">
                        <ShieldAlert size={28} color="#d49a4d" />
                    </View>

                    {/* Title */}
                    <Text className="mb-2 text-center text-lg font-bold text-[var(--color-ink)]">
                        {title}
                    </Text>

                    {/* Description */}
                    <Text className="mb-6 text-center text-xs leading-5 text-[var(--color-ink-soft)]">
                        {description}
                    </Text>

                    {/* Action Button */}
                    <View className="w-full">
                        <CustomButtonComponent
                            id="refresh-page-fallback-btn"
                            variant="navy"
                            onPress={onRetry}
                            disabled={isLoading}
                            showButtonLoader={isLoading}
                            buttonClassName="w-full h-11 flex-row items-center justify-center gap-2 rounded-xl border border-[var(--color-gold)] bg-[var(--color-navy)] active:bg-[var(--color-navy-active)]"
                        >
                            <RefreshCw size={15} color="#d49a4d" />
                            <Text className="text-sm font-bold text-white text-center">
                                Refresh Page
                            </Text>
                        </CustomButtonComponent>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
