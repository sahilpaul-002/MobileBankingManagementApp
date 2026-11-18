import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React, { Activity, useRef, useState } from "react";
import {
  Pressable,
  TextInput,
  View,
} from "react-native";

export interface CustomOtpInputProps {
  id?: string;
  label?: string;
  otpValue: string;
  onChange: (value: string) => void;
  onPaste?: (e: any) => void;
  error?: string;
  otpLength?: number;
  fieldLabelClassname?: string;
  otpInputClassName?: string;
  otpInputGroupClass?: string;
  containerClassname?: string;
  disabled?: boolean;
}

export default function CustomOtpInputComponent({
  id,
  label,
  otpValue,
  onChange,
  error,
  otpLength = 6,
  fieldLabelClassname,
  otpInputClassName,
  otpInputGroupClass,
  containerClassname,
  disabled = false,
}: CustomOtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleBoxPress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const handleChangeText = (text: string) => {
    const numericText = text.replace(/\D/g, "").slice(0, otpLength);
    onChange(numericText);
  };

  const digits = Array.from({ length: otpLength }, (_, index) => {
    return otpValue[index] || "";
  });

  return (
    <View className={cn("w-full flex-col items-center gap-2", containerClassname)}>
      <Activity mode={Boolean(label) ? "visible" : "hidden"}>
        <Text
          className={cn(
            "text-base font-semibold text-[var(--color-ink-secondary)] tracking-wide text-center",
            fieldLabelClassname
          )}
        >
          {label}
        </Text>
      </Activity>

      <Pressable
        onPress={handleBoxPress}
        className={cn("w-full flex-row justify-center items-center gap-2.5 py-1", otpInputGroupClass)}
        accessibilityRole="button"
        accessibilityLabel="OTP input field"
      >
        {digits.map((digit, index) => {
          const isCurrentIndex = isFocused && (otpValue.length === index || (otpValue.length === otpLength && index === otpLength - 1));
          const hasValue = Boolean(digit);

          return (
            <View
              key={index}
              className={cn(
                "w-12 h-14 rounded-lg border bg-[var(--color-app-surface)] items-center justify-center shadow-sm shadow-black/5",
                error
                  ? "border-[var(--color-status-danger)]"
                  : isCurrentIndex
                  ? "border-[var(--color-gold)] border-2"
                  : hasValue
                  ? "border-[var(--color-gold)]/60"
                  : "border-[var(--color-line-strong)]",
                otpInputClassName
              )}
            >
              <Text className="text-xl font-bold text-[var(--color-navy)]">
                {digit}
              </Text>
            </View>
          );
        })}
      </Pressable>

      {/* Hidden text input for receiving inputs / paste */}
      <TextInput
        ref={inputRef}
        testID={id}
        value={otpValue}
        onChangeText={handleChangeText}
        maxLength={otpLength}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute w-1 h-1 pointer-events-none"
        aria-hidden={true}
      />

      <Activity mode={Boolean(error) ? "visible" : "hidden"}>
        <Text className="text-sm text-[var(--color-status-danger)] font-medium text-center">
          {error}
        </Text>
      </Activity>
    </View>
  );
}
