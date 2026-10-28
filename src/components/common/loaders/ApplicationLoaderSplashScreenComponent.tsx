
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 3_000;
const COLUMN_COUNT = 8;
const COLUMN_DURATION = 700;
const COLUMN_STAGGER = 60;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ApplicationLoaderSplashScreenComponentProps {
    onAnimationComplete: () => void;
}

function AnimatedColumn({ index }: { index: number }) {
    const progress = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        const stagger = (COLUMN_COUNT - 1 - index) * COLUMN_STAGGER;

        progress.value = withDelay(
            stagger,
            withRepeat(
                withSequence(
                    withTiming(1, {
                        duration: COLUMN_DURATION,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(0, { duration: 0 }),
                ),
                -1,
                false,
            ),
        );

        translateY.value = withDelay(
            stagger + COLUMN_DURATION,
            withRepeat(
                withSequence(
                    withTiming(SCREEN_HEIGHT, {
                        duration: COLUMN_DURATION,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(0, { duration: 200 }),
                ),
                -1,
                false,
            ),
        );
    }, [index, progress, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: SCREEN_HEIGHT * progress.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={[styles.column, animatedStyle]} />;
}

export default function ApplicationLoaderSplashScreenComponent({
    onAnimationComplete,
}: ApplicationLoaderSplashScreenComponentProps) {
    const opacity = useSharedValue(1);
    const hasStarted = useRef(false);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const completeAnimation = useCallback(() => {
        onAnimationComplete();
    }, [onAnimationComplete]);

    const FADE_OUT_DURATION = 200;

    const handleLayout = useCallback(() => {
        if (hasStarted.current) return;

        hasStarted.current = true;

        void SplashScreen.hideAsync().finally(() => {
            opacity.value = withDelay(
                DURATION - FADE_OUT_DURATION,
                withTiming(
                    0,
                    {
                        duration: FADE_OUT_DURATION,
                        easing: Easing.out(Easing.cubic),
                    },
                    (finished) => {
                        if (finished) {
                            scheduleOnRN(completeAnimation);
                        }
                    },
                ),
            );
        });
    }, [completeAnimation, opacity]);

    return (
        <Animated.View
            onLayout={handleLayout}
            style={[styles.container, animatedStyle]}
            pointerEvents="auto"
        >
            <View style={styles.glowTopLeft} />
            <View style={styles.glowBottomRight} />

            <View style={styles.columnsContainer}>
                {Array.from({ length: COLUMN_COUNT }, (_, index) => (
                    <AnimatedColumn key={index} index={index} />
                ))}
            </View>

            <Image
                style={styles.image}
                source={require('@/assets/nativeSplashScreenLogo/walletCardLogo.png')}
                contentFit="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#0C1830',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 1000,
    },

    image: {
        width: 200,
        height: 200,
        zIndex: 2,
    },

    glowTopLeft: {
        position: 'absolute',
        top: -120,
        left: -120,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(212,154,77,0.12)',
    },

    glowBottomRight: {
        position: 'absolute',
        bottom: -140,
        right: -140,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(80,130,210,0.10)',
    },

    columnsContainer: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'row',
        zIndex: 1,
    },

    column: {
        flex: 1,
        backgroundColor: '#0C1830',
        borderRightWidth: 2,
        borderRightColor: 'rgba(212,154,77,0.6)',
    },
});
