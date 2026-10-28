import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ROUTE_NAMES } from '@/routes/routeNames';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Line, Svg } from 'react-native-svg';

type PulseRing = {
  delay: number;
  size: number;
};

const PULSE_RINGS: PulseRing[] = [
  { delay: 0, size: 96 },
  { delay: 600, size: 144 },
  { delay: 1200, size: 192 },
];

const GEAR_ANGLES: number[] = [0, 45, 90, 135, 180, 225, 270, 315];

function AnimatedPulseRing({ delay, size }: PulseRing) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(2, { duration: 2400, easing: Easing.bezier(0, 0, 0.2, 1) }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2400, easing: Easing.bezier(0, 0, 0.2, 1) }),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ef4444',
        },
        animatedStyle,
      ]}
    />
  );
}

export default function ServiceUnavailableScreenComponent() {
  const [dots, setDots] = useState(0);
  const [progress, setProgress] = useState(12);

  // Dot animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 3;
        return next > 72 ? 72 : next;
      });
    }, 800);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Badge pulse
  const badgePulse = useSharedValue(1);
  useEffect(() => {
    badgePulse.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [badgePulse]);

  const badgeDotStyle = useAnimatedStyle(() => ({
    opacity: badgePulse.value,
  }));

  return (
    <View className="flex-1 bg-[var(--color-app)] items-center justify-center">
      {/* Top accent bar */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-status-danger)]" />

      {/* Main content */}
      <View className="w-[85%] max-w-[440px] items-center">
        {/* Gear icon with pulse rings */}
        <View className="items-center justify-center mb-10!" style={{ height: 192 }}>
          {PULSE_RINGS.map((ring, i) => (
            <AnimatedPulseRing key={i} delay={ring.delay} size={ring.size} />
          ))}

          {/* Gear icon box */}
          <View
            className="bg-[var(--color-app-surface)] border border-[var(--color-line)] items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              elevation: 4,
              shadowColor: '#a8a29e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Svg width={44} height={44} viewBox="0 0 44 44">
              <Circle cx={22} cy={22} r={11} stroke="#ef4444" strokeWidth={2.4} fill="none" />
              <Circle cx={22} cy={22} r={4.5} fill="#ef4444" />
              {GEAR_ANGLES.map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <Line
                    key={i}
                    x1={22 + 11 * Math.cos(rad)}
                    y1={22 + 11 * Math.sin(rad)}
                    x2={22 + 15 * Math.cos(rad)}
                    y2={22 + 15 * Math.sin(rad)}
                    stroke="#ef4444"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Error badge */}
        <View
          className="flex-row items-center gap-2 bg-[var(--color-status-danger-bg)] border border-[var(--color-status-danger)] px-4! py-1.5! mb-5!"
          style={{ borderRadius: 20 }}
        >
          <Animated.View
            style={[
              {
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#ef4444',
              },
              badgeDotStyle,
            ]}
          />
          <Text className="text-xs font-semibold tracking-widest text-[var(--color-status-danger)] uppercase">
            Error 503
          </Text>
        </View>

        {/* Heading */}
        <Text
          className="text-3xl font-bold text-[var(--color-ink)] text-center mb-3!"
          style={{ fontFamily: 'serif' }}
        >
          Service Unavailable
        </Text>

        {/* Subheading */}
        <Text className="text-sm text-[var(--color-ink-muted)] text-center mb-8! max-w-[320px] leading-5">
          Our servers are taking a short breather. We're working hard to get
          everything back online{'.'.repeat(dots + 1)}
        </Text>

        {/* Progress bar */}
        <View className="w-full mb-8!">
          <View className="flex-row justify-between mb-2!">
            <Text className="text-xs text-[var(--color-ink-muted)] font-medium">
              Recovery in progress
            </Text>
            <Text className="text-xs text-[var(--color-ink-muted)] font-medium">
              {Math.round(progress)}%
            </Text>
          </View>
          <View className="w-full h-1.5 bg-[var(--color-line)] rounded-full overflow-hidden">
            <View
              className="h-full bg-[var(--color-gold)] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Try again button */}
        <CustomButtonComponent
          id="serviceUnavailable-tryAgain-button"
          label="Try Again"
          variant="navy"
          size="lg"
          className="px-10!"
          onPress={() => router.replace(ROUTE_NAMES.SIGN_IN)}
        />

        {/* Contact support */}
        <View className="flex-row items-center mt-6">
          <Text className="text-sm text-[var(--color-ink-muted)] mr-1">
            Need immediate help? -
          </Text>
          <Text className="text-sm text-[var(--color-link)] font-semibold">
            Contact Support
          </Text>
        </View>
      </View>
    </View>
  );
}
