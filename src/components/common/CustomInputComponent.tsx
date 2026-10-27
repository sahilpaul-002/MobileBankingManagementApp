import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { View, type TextInput, type TextInputProps } from "react-native";

export interface CustomInputProps extends Omit<TextInputProps, "id"> {
  id?: string;
  label?: string;
  error?: string | undefined;
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
              "text-xs font-semibold text-[var(--color-ink-secondary)] tracking-wide",
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
            "h-11 pl-3.5! pr-3.5! rounded-[var(--radius-control)] border bg-[var(--color-app-surface)] text-[var(--color-ink)] text-sm",
            error
              ? "border-[var(--color-status-danger)]"
              : "border-[var(--color-line-strong)] focus:border-[var(--color-gold)]",
            inputClassname,
            className,
          )}
          {...rest}
        />

        {error && (
          <Text className="text-xs text-[var(--color-status-danger)] font-medium">
            {error}
          </Text>
        )}
      </View>
    );
  },
);

CustomInputComponent.displayName = "CustomInputComponent";

export default CustomInputComponent;
