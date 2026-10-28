import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';
import {
  type DimensionValue,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type SkeletonVariant = 'light' | 'navy';

export interface SkeletonItemProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  delay?: number; // In seconds
  variant?: SkeletonVariant;
}

export interface FormSkeletonFieldConfig {
  labelWidth?: DimensionValue;
  delay?: number;
}

export interface FormSkeletonComponentProps {
  fieldCount?: number;
  fields?: FormSkeletonFieldConfig[];
  showTitle?: boolean;
  titleWidth?: DimensionValue;
  subtitleWidth?: DimensionValue;
  showSubmitButton?: boolean;
  showFooter?: boolean;
  variant?: SkeletonVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// -----------------------------------------------------------------------------
// Atomic Skeleton Item
// -----------------------------------------------------------------------------

export function SkeletonItem({
  width = '100%',
  height = 16,
  borderRadius = 6,
  className,
  style,
  delay = 0,
  variant = 'light',
}: SkeletonItemProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(0.85, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.4, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor:
      variant === 'navy' ? 'rgba(36, 52, 82, 0.9)' : 'rgba(12, 24, 48, 0.08)',
    borderColor:
      variant === 'navy'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(12, 24, 48, 0.04)',
    borderWidth: StyleSheet.hairlineWidth,
  };

  const animatedProps = {
    style: [baseStyle, animatedStyle, style],
    ...(className ? { className } : {}),
  };

  return <Animated.View {...animatedProps} />;
}

// -----------------------------------------------------------------------------
// Field Skeleton (Label + Input)
// -----------------------------------------------------------------------------

export function FormFieldSkeleton({
  labelWidth = 64,
  delay = 0,
  variant = 'light',
}: {
  labelWidth?: DimensionValue;
  delay?: number;
  variant?: SkeletonVariant;
}) {
  return (
    <View className="w-full flex-col gap-1.5">
      <SkeletonItem
        width={labelWidth}
        height={12}
        borderRadius={4}
        delay={delay}
        variant={variant}
      />
      <SkeletonItem
        width="100%"
        height={44}
        borderRadius={6}
        delay={delay + 0.05}
        variant={variant}
      />
    </View>
  );
}

// -----------------------------------------------------------------------------
// Reusable Form Skeleton Component
// -----------------------------------------------------------------------------

export default function FormSkeletonComponent({
  fieldCount = 2,
  fields,
  showTitle = false,
  titleWidth = 140,
  subtitleWidth = 220,
  showSubmitButton = true,
  showFooter = true,
  variant = 'light',
  className,
  style,
}: FormSkeletonComponentProps) {
  // Resolve field configs
  const resolvedFields: FormSkeletonFieldConfig[] =
    fields && fields.length > 0
      ? fields
      : Array.from({ length: fieldCount }, (_, index) => ({
          labelWidth: index === 0 ? 60 : 76,
          delay: 0.15 + index * 0.1,
        }));

  const lastField =
    resolvedFields.length > 0
      ? resolvedFields[resolvedFields.length - 1]
      : undefined;
  const lastFieldDelay = lastField?.delay ?? 0.2;

  const submitButtonDelay = lastFieldDelay + 0.1;
  const footerDelay = submitButtonDelay + 0.1;

  const containerProps = {
    entering: FadeIn.duration(350),
    exiting: FadeOut.duration(250),
    style,
    className: cn('w-full flex-col gap-4', className),
  };

  return (
    <Animated.View {...containerProps}>
      {/* Optional Title Block */}
      {showTitle && (
        <View className="w-full items-center gap-2 mb-2">
          <SkeletonItem
            width={titleWidth}
            height={22}
            borderRadius={6}
            delay={0.05}
            variant={variant}
          />
          <SkeletonItem
            width={subtitleWidth}
            height={12}
            borderRadius={4}
            delay={0.1}
            variant={variant}
          />
        </View>
      )}

      {/* Field List */}
      <View className="w-full flex-col gap-3.5">
        {resolvedFields.map((field, idx) => (
          <FormFieldSkeleton
            key={`skeleton-field-${idx}`}
            labelWidth={field.labelWidth ?? (idx === 0 ? 60 : 76)}
            delay={field.delay ?? 0.15 + idx * 0.1}
            variant={variant}
          />
        ))}
      </View>

      {/* Submit Button Skeleton */}
      {showSubmitButton && (
        <View className="w-full pt-2 items-center">
          <SkeletonItem
            width="100%"
            height={44}
            borderRadius={6}
            delay={submitButtonDelay}
            variant={variant}
          />
        </View>
      )}

      {/* Footer Link Skeleton */}
      {showFooter && (
        <View className="w-full items-center justify-center pt-2">
          <SkeletonItem
            width={160}
            height={12}
            borderRadius={4}
            delay={footerDelay}
            variant={variant}
          />
        </View>
      )}
    </Animated.View>
  );
}
