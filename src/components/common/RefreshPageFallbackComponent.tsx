import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import { RefreshCw, ShieldAlert } from "lucide-react-native";
import { Modal, StyleSheet, Text, View } from "react-native";

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
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <ShieldAlert size={30} color="#ffffff" />
                    </View>

                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.descriptionText}>{description}</Text>

                    <View style={styles.buttonWrapper}>
                        <CustomButtonComponent
                            variant="outline"
                            onPress={onRetry}
                            disabled={isLoading}
                            showButtonLoader={isLoading}
                            className="w-full flex-row items-center justify-center gap-2 border-[var(--color-line-strong)]"
                        >
                            {!isLoading && (
                                <View style={styles.buttonContent}>
                                    <RefreshCw size={16} color="#0c1830" />
                                    <Text style={styles.buttonText}>Refresh Page</Text>
                                </View>
                            )}
                        </CustomButtonComponent>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(12, 24, 48, 0.72)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e6e8ee",
        borderLeftWidth: 4,
        borderLeftColor: "#b03333",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 10,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#b03333",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0c1830",
        textAlign: "center",
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: "#4a5673",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    buttonWrapper: {
        width: "100%",
        marginTop: 4,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0c1830",
    },
});
