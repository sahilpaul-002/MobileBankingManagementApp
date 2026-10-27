import { BadgeInfo, CircleX, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BannerVariant = "ERROR" | "INFO";

export interface BannerProps {
    message: string;
    variant: BannerVariant;
    visible: boolean;
    onDismiss?: (() => void) | undefined;
    autoDismissMs?: number | undefined;
}

type VariantConfig = {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
    label: string;
};

const VARIANT_CONFIG: Record<BannerVariant, VariantConfig> = {
    ERROR: {
        backgroundColor: "#FEE2E2",
        borderColor: "#FCA5A5",
        textColor: "#991B1B",
        icon: <CircleX size={18} color="#991B1B" />,
        label: "Error",
    },
    INFO: {
        backgroundColor: "#FEF3C7",
        borderColor: "#FCD34D",
        textColor: "#92400E",
        icon: <BadgeInfo size={18} color="#92400E" />,
        label: "Info",
    },
};

export default function BannerComponent({
    message,
    variant,
    visible,
    onDismiss,
    autoDismissMs,
}: BannerProps) {
    const insets = useSafeAreaInsets();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [translateY] = useState(() => new Animated.Value(-100));

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();

            if (autoDismissMs && onDismiss) {
                timerRef.current = setTimeout(onDismiss, autoDismissMs);
            }
        } else {
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible, autoDismissMs, onDismiss, translateY]);

    if (!visible) return null;

    const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.INFO;

    return (
        <Animated.View
            accessibilityRole="alert"
            accessibilityLabel={`${config.label}: ${message}`}
            style={[
                styles.container,
                {
                    paddingTop: Math.max(insets.top, 8),
                    backgroundColor: config.backgroundColor,
                    borderBottomColor: config.borderColor,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.contentRow}>
                <View style={styles.iconWrapper}>{config.icon}</View>

                <Text
                    style={[styles.messageText, { color: config.textColor }]}
                    numberOfLines={3}
                >
                    {message}
                </Text>

                {onDismiss && (
                    <Pressable
                        onPress={onDismiss}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss banner"
                        style={({ pressed }) => [
                            styles.dismissButton,
                            pressed && styles.dismissButtonPressed,
                        ]}
                    >
                        <X size={16} color={config.textColor} />
                    </Pressable>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        borderBottomWidth: 1,
        paddingHorizontal: 16,
        paddingBottom: 10,
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconWrapper: {
        flexShrink: 0,
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    dismissButton: {
        flexShrink: 0,
        padding: 4,
        borderRadius: 4,
    },
    dismissButtonPressed: {
        opacity: 0.6,
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
});
