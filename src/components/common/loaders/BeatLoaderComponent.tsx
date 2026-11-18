
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface BeatLoaderPropsType {
    size?: number;
    color?: string;
    loading?: boolean;
}

interface BeatDotPropsType {
    index: number;
    size: number;
    color: string;
    loading: boolean;
}

function BeatDot({ index, size, color, loading }: BeatDotPropsType) {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (!loading) {
            cancelAnimation(scale);
            scale.value = 1;
            return;
        }

        scale.value = withDelay(
            index * 150,
            withRepeat(
                withSequence(
                    withTiming(1.5, {
                        duration: 400,
                    }),
                    withTiming(1, {
                        duration: 400,
                    }),
                ),
                -1,
                false,
            ),
        );

        return () => {
            cancelAnimation(scale);
        };
    }, [loading, index, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (!loading) return null;

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                animatedStyle,
            ]}
        />
    );
}

export default function BeatLoaderComponent({
    size = 12,
    color = '#000000',
    loading = true,
}: BeatLoaderPropsType) {
    if (!loading) return null;

    return (
        <View className="w-full h-full flex-row items-center justify-center gap-2 py-2 px-4">
            {Array.from({ length: 3 }, (_, index) => (
                <BeatDot
                    key={index}
                    index={index}
                    size={size}
                    color={color}
                    loading={loading}
                />
            ))}
        </View>
    );
}
