
import { useappDispatchType } from "@/redux/hooks/reduxHooks";
import { logoutUser } from "@/redux/thunks/userThunks";
import { router } from "expo-router";
import { LogOut, ShieldAlert } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

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

    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isModalVisible, setIsModalVisible] = useState(true);

    const isLoggingOutRef = useRef(false);

    // Reset countdown when the initial duration changes.
    useEffect(() => {
        setTimeLeft(initialDuration);
    }, [initialDuration]);

    // Logout handler.
    const handleLogout = useCallback(async () => {
        if (isLoggingOutRef.current) {
            return;
        }

        isLoggingOutRef.current = true;

        // Close modal immediately.
        setIsModalVisible(false);

        try {
            await dispatch(logoutUser()).unwrap();
        } catch {
            // Logout thunk already logs errors.
            // Continue to the authentication route regardless.
        } finally {
            router.replace("/");
        }
    }, [dispatch]);

    // Continue session handler.
    const handleContinue = useCallback(() => {
        // Close modal.
        setIsModalVisible(false);

        // Execute parent's onCancel callback.
        onCancel?.();
    }, [onCancel]);

    // Countdown timer.
    useEffect(() => {
        if (!isModalVisible) {
            return;
        }

        if (timeLeft <= 0) {
            void handleLogout();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((previous) => previous - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, isModalVisible, handleLogout]);

    const progressPercent = Math.min(
        100,
        Math.max(0, ((initialDuration - timeLeft) / initialDuration) * 100)
    );

    return (
        <Modal
            transparent
            animationType="fade"
            statusBarTranslucent
            visible={isModalVisible}
            onRequestClose={type === "SESSION_INACTIVITY" ? handleContinue : undefined}
        >
            <View className="flex-1 bg-[#0c1830]/75 justify-center items-center p-6">
                <View className="w-full max-w-[380px] bg-white rounded-2xl p-6 items-center border border-[#e6e8ee] shadow-lg">

                    {/* Icon */}
                    <View className="w-14 h-14 rounded-full bg-[#f4f6fa] items-center justify-center mb-4">
                        {type === "SESSION_INACTIVITY" ? (
                            <ShieldAlert size={28} color="#d49a4d" />
                        ) : (
                            <LogOut size={28} color="#b03333" />
                        )}
                    </View>

                    {/* Title */}
                    <Text className="text-lg font-bold text-[#0c1830] text-center mb-2">
                        {title}
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-sm text-[#4a5673] text-center leading-5 mb-5">
                        {subtitle}
                    </Text>

                    {/* Progress Bar */}
                    <View className="w-full h-1.5 bg-[#e6e8ee] rounded-full overflow-hidden mb-3">
                        <View
                            className={`h-full rounded-full ${type === "SESSION_INACTIVITY"
                                    ? "bg-[#d49a4d]"
                                    : "bg-[#b03333]"
                                }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </View>

                    {/* Countdown */}
                    <Text className="text-xs font-medium text-[#8a93a8] mb-6">
                        Redirecting in {timeLeft}{" "}
                        {timeLeft === 1 ? "second" : "seconds"}...
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row gap-3 w-full justify-center">
                        {type === "SESSION_INACTIVITY" && onCancel && (
                            <Pressable
                                onPress={handleContinue}
                                accessibilityRole="button"
                                accessibilityLabel="Continue session"
                                className="flex-1 py-3 px-4 rounded-lg bg-[#f0f3f9] border border-[#d2d6de] items-center justify-center active:opacity-80"
                            >
                                <Text className="text-sm font-semibold text-[#0c1830]">
                                    Continue
                                </Text>
                            </Pressable>
                        )}

                        <Pressable
                            onPress={handleLogout}
                            accessibilityRole="button"
                            accessibilityLabel="Log out now"
                            className="flex-1 py-3 px-4 rounded-lg bg-[#b03333] items-center justify-center active:opacity-80"
                        >
                            <Text className="text-sm font-semibold text-white">
                                Logout
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
