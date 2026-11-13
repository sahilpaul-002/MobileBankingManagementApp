import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Activity, forwardRef } from "react";
import { View, type TextInput, type TextInputProps } from "react-native";

export interface CustomInputProps extends Omit<TextInputProps, "id"> {
  id?: string;
  label?: string;
  error?: string | undefined;
  hint?: string | undefined;
  fieldLabelClassname?: string;
  inputClassname?: string;
  containerClassname?: string;
}

const CustomInputComponent = forwardRef<TextInput, CustomInputProps>(
  (
    {
      id,
      label,
      error,
      hint,
      fieldLabelClassname,
      inputClassname,
      containerClassname,
      placeholderTextColor = "#8a93a8",
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <View className={cn("w-full flex-col gap-1.5", containerClassname)}>
        {label && (
          <Text
            className={cn(
              "text-lg font-semibold text-[var(--color-ink-secondary)] tracking-wide",
              fieldLabelClassname,
            )}
          >
            {label}
          </Text>
        )}

        <Input
          ref={ref}
          testID={id}
          placeholderTextColor={placeholderTextColor}
          className={cn(
            "h-12 pl-3.5! pr-3.5! rounded-[var(--radius-control)] border bg-[var(--color-app-surface)] text-[var(--color-ink)] text-md",
            error
              ? "border-[var(--color-status-danger)]"
              : "border-[var(--color-line-strong)] focus:border-[var(--color-gold)]",
            inputClassname,
            className,
          )}
          {...rest}
        />

        <Activity mode={error ? "visible" : "hidden"}>
          <Text className="text-sm text-[var(--color-status-danger)] font-medium">
            {error}
          </Text>
        </Activity>

        <Activity mode={Boolean(hint && !error) ? "visible" : "hidden"}>
          <Text className="text-xs text-[var(--color-ink-muted)]">
            {hint}
          </Text>
        </Activity>
      </View>
    );
  },
);

CustomInputComponent.displayName = "CustomInputComponent";

export default CustomInputComponent;
