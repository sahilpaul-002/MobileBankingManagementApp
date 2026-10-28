import { useEffect } from 'react';
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

const COLUMN_COUNT = 8;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function AnimatedColumn({ index }: { index: number }) {
    const progress = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        const stagger = (COLUMN_COUNT - 1 - index) * 60;

        progress.value = withDelay(
            stagger,
            withRepeat(
                withSequence(
                    // Phase 1: Wipe-In
                    withTiming(1, {
                        duration: 700,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    // Phase 2: Wipe-Out
                    withTiming(1, {
                        duration: 0,
                    })
                ),
                -1,
                false
            )
        );

        translateY.value = withDelay(
            stagger + 700,
            withRepeat(
                withSequence(
                    withTiming(SCREEN_HEIGHT, {
                        duration: 700,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(0, {
                        duration: 200,
                    })
                ),
                -1,
                false
            )
        );
    }, [index, progress, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: SCREEN_HEIGHT * progress.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={[styles.column, animatedStyle]} />;
}

export default function ApplicationLoaderComponent() {
    return (
        <View style={styles.container}>
            {/* Background glow - top left */}
            <View style={styles.glowTopLeft} />

            {/* Background glow - bottom right */}
            <View style={styles.glowBottomRight} />

            {/* Animated columns */}
            <View style={styles.columnsContainer}>
                {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
                    <AnimatedColumn key={index} index={index} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
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
    },

    column: {
        flex: 1,
        backgroundColor: '#0C1830', // --nav-bg
        borderRightWidth: 2,
        borderRightColor: 'rgba(212,154,77,0.6)', // --gold
    },
});