import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 5_000;
const HOLD_DURATION = DURATION * 0.2;
const FADE_DURATION = DURATION * 0.5;

interface AnimatedSplashOverlayComponentProps {
    onAnimationComplete: () => void;
}

export default function AnimatedSplashOverlayComponent({
    onAnimationComplete,
}: AnimatedSplashOverlayComponentProps) {
    const opacity = useSharedValue(1);
    const hasStarted = useRef(false);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const startAnimation = useCallback(() => {
        opacity.value = withDelay(
            HOLD_DURATION,
            withTiming(
                0,
                {
                    duration: FADE_DURATION,
                    easing: Easing.out(Easing.cubic),
                },
                (finished) => {
                    if (finished) {
                        scheduleOnRN(onAnimationComplete);
                    }
                },
            ),
        );
    }, [onAnimationComplete, opacity]);

    const handleLayout = useCallback(() => {
        if (hasStarted.current) return;

        hasStarted.current = true;

        SplashScreen.hideAsync().finally(() => {
            startAnimation();
        });
    }, [startAnimation]);

    return (
        <Animated.View
            onLayout={handleLayout}
            style={[styles.splashOverlay, animatedStyle]}
            pointerEvents="auto"
        >
            <Image
                style={styles.image}
                source={require('@/assets/nativeSplashScreenLogo/walletCardLogo.png')}
                contentFit="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 200,
        height: 200,
    },
    splashOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#0C1830',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
});