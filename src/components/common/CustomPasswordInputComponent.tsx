import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react-native";
import { forwardRef } from "react";
import {
  Pressable,
  View,
  type TextInput,
  type TextInputProps,
} from "react-native";

export interface CustomPasswordInputProps extends Omit<TextInputProps, "id"> {
  id?: string;
  label?: string;
  error?: string | undefined;
  fieldLabelClassname?: string;
  inputClassname?: string;
  containerClassname?: string;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  showValidationRules?: boolean;
  password?: string;
}

const CustomPasswordInputComponent = forwardRef<
  TextInput,
  CustomPasswordInputProps
>(
  (
    {
      id,
      label,
      error,
      fieldLabelClassname,
      inputClassname,
      containerClassname,
      showPassword,
      setShowPassword,
      showValidationRules = false,
      password = "",
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

        <View className="relative w-full justify-center">
          <Input
            ref={ref}
            testID={id}
            secureTextEntry={!showPassword}
            placeholderTextColor={placeholderTextColor}
            className={cn(
              "h-11 pl-3.5! pr-11! rounded-[var(--radius-control)] border bg-[var(--color-app-surface)] text-[var(--color-ink)] text-sm",
              error
                ? "border-[var(--color-status-danger)]"
                : "border-[var(--color-line-strong)] focus:border-[var(--color-gold)]",
              inputClassname,
              className,
            )}
            {...rest}
          />

          <Pressable
            hitSlop={8}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            className="absolute right-3.5 top-0 bottom-0 justify-center items-center"
          >
            {showPassword ? (
              <EyeOff size={18} color="#8a93a8" />
            ) : (
              <Eye size={18} color="#8a93a8" />
            )}
          </Pressable>
        </View>

        {error && (
          <Text className="text-xs text-[var(--color-status-danger)] font-medium">
            {error}
          </Text>
        )}
      </View>
    );
  },
);

CustomPasswordInputComponent.displayName = "CustomPasswordInputComponent";

export default CustomPasswordInputComponent;
