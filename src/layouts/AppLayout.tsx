import BannerComponent from "@/components/common/BannerComponent";
import DestroySessionComponent from "@/components/common/DestroySessionComponent";
import { useappDispatchType, useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectIsLoggingOut } from "@/redux/slice/appSession/appSessionSlice";
import {
    selectIsAuthenticated,
    selectIsAuthorized,
} from "@/redux/slice/user/userSlice";
import {
    clearBanner,
    clearDestroySession,
    selectDestroySessionParams,
    selectMessageBanner,
    selectShowDestroySession,
    selectShowErrorBanner,
    selectShowInfoBanner,
} from "@/redux/slice/utility/utilitySlice";
import { Slot } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 15 minutes of inactivity before session expiry warning
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export default function AppLayout() {
    const dispatch = useappDispatchType();

    // Redux Selectors
    const showErrorBanner = useAppSelector(selectShowErrorBanner);
    const showInfoBanner = useAppSelector(selectShowInfoBanner);
    const bannerMessage = useAppSelector(selectMessageBanner);
    const showDestroySession = useAppSelector(selectShowDestroySession);
    const destroySessionParams = useAppSelector(selectDestroySessionParams);
    const isLoggingOut = useAppSelector(selectIsLoggingOut);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthorized = useAppSelector(selectIsAuthorized);

    // Active session requires both authentication and 2FA authorization
    const isUserActiveSession = isAuthenticated && isAuthorized;

    // Local UI Inactivity Timer modal state
    const [showInactivityModal, setShowInactivityModal] = useState(false);

    // Inactivity UI Timer
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        if (
            !isUserActiveSession ||
            showDestroySession ||
            showInactivityModal ||
            isLoggingOut
        ) {
            return;
        }

        inactivityTimerRef.current = setTimeout(() => {
            setShowInactivityModal(true);
        }, INACTIVITY_TIMEOUT_MS);
    }, [isUserActiveSession, showDestroySession, showInactivityModal, isLoggingOut]);

    useEffect(() => {
        resetInactivityTimer();
        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [resetInactivityTimer]);

    const handleDismissBanner = useCallback(() => {
        dispatch(clearBanner());
    }, [dispatch]);

    // Redux API DestroySession cancel
    const handleCancelDestroySession = useCallback(() => {
        dispatch(clearDestroySession());
        resetInactivityTimer();
    }, [dispatch, resetInactivityTimer]);

    // UI Inactivity DestroySession cancel
    const handleCancelInactivityModal = useCallback(() => {
        setShowInactivityModal(false);
        resetInactivityTimer();
    }, [resetInactivityTimer]);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
            <View
                className="h-full w-full bg-[#f4f6fa]"
                onStartShouldSetResponderCapture={() => {
                    if (!showInactivityModal && !showDestroySession) {
                        resetInactivityTimer();
                    }
                    return false;
                }}
            >
                {/* Main Screen Content */}
                <Slot />

                {/* Banner Notification (Top Overlay) */}
                <BannerComponent
                    visible={Boolean((showErrorBanner || showInfoBanner) && bannerMessage)}
                    variant={showErrorBanner ? "ERROR" : "INFO"}
                    message={bannerMessage ?? ""}
                    onDismiss={handleDismissBanner}
                    autoDismissMs={6000}
                />

                {/* 1. Redux/API-triggered Destroy Session Modal (e.g. 401, 403, Session Invalidated) */}
                {showDestroySession && (
                    <DestroySessionComponent
                        title={destroySessionParams?.title ?? "Session Expired"}
                        subtitle={destroySessionParams?.subtitle}
                        type={destroySessionParams?.type ?? "DEFAULT"}
                        duration={destroySessionParams?.duration ?? 10}
                        onCancel={handleCancelDestroySession}
                    />
                )}

                {/* 2. Client UI Inactivity Timer Destroy Session Modal */}
                {showInactivityModal && (
                    <DestroySessionComponent
                        title="Session Inactivity"
                        subtitle="You have been inactive for a while. For your security, you will be logged out soon."
                        type="SESSION_INACTIVITY"
                        duration={60}
                        onCancel={handleCancelInactivityModal}
                    />
                )}

                {/* Blocking Full-Screen Overlay During Logout */}
                {isLoggingOut && (
                    <View className="absolute inset-0 z-[99999] items-center justify-center bg-[rgba(12,24,48,0.85)] p-6">
                        <View className="w-full max-w-80 items-center rounded-2xl border border-[#243452] bg-[#0c1830] p-7 shadow-2xl">
                            <ActivityIndicator size="large" color="#d49a4d" />

                            <Text className="mb-1 mt-[18px] text-lg font-bold text-white">
                                Signing Out
                            </Text>

                            <Text className="text-center text-[13px] leading-[18px] text-[#c8d2e6]">
                                Securing your session and signing you out...
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}