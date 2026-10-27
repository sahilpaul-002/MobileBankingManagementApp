import { useappDispatchType } from "@/redux/hooks/reduxHooks";
import { logoutUser } from "@/redux/thunks/userThunks";
import { LogOut, ShieldAlert } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type destroySessionPropsTypes = {
    title: string;
    subtitle?: string | undefined;
    type?: "SESSION_INACTIVITY" | "DEFAULT" | undefined;
    duration?: number | undefined;
    onCancel?: (() => void) | undefined;
};

export default function DestroySessionComponent({
    title,
    subtitle = "Redirecting, logging you out...",
    type = "DEFAULT",
    duration = 10,
    onCancel,
}: destroySessionPropsTypes) {
    const dispatch = useappDispatchType();
    const initialDuration = type === "SESSION_INACTIVITY" ? 60 : duration;
    const [prevInitialDuration, setPrevInitialDuration] = useState(initialDuration);
    const [timeLeft, setTimeLeft] = useState(initialDuration);

    if (prevInitialDuration !== initialDuration) {
        setPrevInitialDuration(initialDuration);
        setTimeLeft(initialDuration);
    }

    const handleLogout = useCallback(() => {
        dispatch(logoutUser());
    }, [dispatch]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleLogout();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, handleLogout]);

    const progressPercent = Math.min(
        100,
        Math.max(0, ((initialDuration - timeLeft) / initialDuration) * 100)
    );

    return (
        <Modal
            transparent
            animationType="fade"
            statusBarTranslucent
            visible
            onRequestClose={type === "SESSION_INACTIVITY" ? onCancel : undefined}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        {type === "SESSION_INACTIVITY" ? (
                            <ShieldAlert size={28} color="#d49a4d" />
                        ) : (
                            <LogOut size={28} color="#b03333" />
                        )}
                    </View>

                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.subtitleText}>{subtitle}</Text>

                    <View style={styles.progressBarTrack}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${progressPercent}%`,
                                    backgroundColor:
                                        type === "SESSION_INACTIVITY" ? "#d49a4d" : "#b03333",
                                },
                            ]}
                        />
                    </View>

                    <Text style={styles.countdownText}>
                        Redirecting in {timeLeft} {timeLeft === 1 ? "second" : "seconds"}...
                    </Text>

                    <View style={styles.buttonRow}>
                        {type === "SESSION_INACTIVITY" && onCancel && (
                            <Pressable
                                onPress={onCancel}
                                accessibilityRole="button"
                                accessibilityLabel="Continue session"
                                style={({ pressed }) => [
                                    styles.continueButton,
                                    pressed && styles.buttonPressed,
                                ]}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
                            </Pressable>
                        )}

                        <Pressable
                            onPress={handleLogout}
                            accessibilityRole="button"
                            accessibilityLabel="Log out now"
                            style={({ pressed }) => [
                                styles.logoutButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </Pressable>
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
        justifyContent: "center",
        alignItems: "center",
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
        backgroundColor: "#f4f6fa",
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
    subtitleText: {
        fontSize: 14,
        color: "#4a5673",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    progressBarTrack: {
        width: "100%",
        height: 6,
        backgroundColor: "#e6e8ee",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    countdownText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#8a93a8",
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
        justifyContent: "center",
    },
    continueButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#f0f3f9",
        borderWidth: 1,
        borderColor: "#d2d6de",
        alignItems: "center",
        justifyContent: "center",
    },
    continueButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0c1830",
    },
    logoutButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#b03333",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    buttonPressed: {
        opacity: 0.8,
    },
});
