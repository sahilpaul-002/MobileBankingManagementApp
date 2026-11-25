import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export interface RadioChoiceItem {
  title: string;
  description: string;
  value: string;
  icon?: any;
}

export interface CustomRadioGroupChoiceCardProps {
  id?: string;
  label?: string;
  fieldLegendClassname?: string;
  defaultItem?: string;
  value?: string;
  feildLabelClassname?: string;
  fieldLabelClassname?: string;
  fieldItems: RadioChoiceItem[];
  onValueChange: (value: string) => void;
  error?: string;
  containerClassname?: string;
}

export default function CustonRadioGroupChoiceCardComponent({
  id,
  label,
  fieldLegendClassname,
  defaultItem,
  value: controlledValue,
  feildLabelClassname,
  fieldLabelClassname,
  fieldItems,
  onValueChange,
  error,
  containerClassname,
}: CustomRadioGroupChoiceCardProps) {
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue ?? defaultItem ?? (fieldItems[0]?.value || "")
  );

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (itemValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(itemValue);
    }
    onValueChange(itemValue);
  };

  const labelClass = fieldLabelClassname || feildLabelClassname;

  return (
    <View testID={id} className={cn("w-full flex-col gap-3", containerClassname)}>
      {Boolean(label) ? (
        <Text
          className={cn(
            "text-base font-semibold text-[var(--color-ink-secondary)] tracking-wide text-center",
            fieldLegendClassname
          )}
        >
          {label}
        </Text>
      ) : null}

      <View className="w-full flex-col gap-2.5">
        {fieldItems.map((item) => {
          const isSelected = selectedValue === item.value;

          return (
            <Pressable
              key={item.value}
              onPress={() => handleSelect(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className={cn(
                "w-full flex-row items-center justify-between p-4 rounded-xl border bg-[var(--color-app-surface)] shadow-sm shadow-black/5 active:bg-[var(--color-app-hover)]",
                isSelected
                  ? "border-[var(--color-gold)] bg-[var(--color-gold-soft)]/20"
                  : error
                  ? "border-[var(--color-status-danger)]"
                  : "border-[var(--color-line)]",
                labelClass
              )}
            >
              <View className="flex-1 pr-3 flex-col gap-1">
                <Text
                  className={cn(
                    "text-base font-bold",
                    isSelected
                      ? "text-[var(--color-navy)]"
                      : "text-[var(--color-ink)]"
                  )}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                  {item.description}
                </Text>
              </View>

              {/* Radio Indicator */}
              <View
                className={cn(
                  "w-6 h-6 rounded-full border-2 items-center justify-center",
                  isSelected
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]"
                    : "border-[var(--color-line-strong)] bg-[var(--color-app-surface)]"
                )}
              >
                {isSelected ? (
                  <Check size={14} color="#ffffff" strokeWidth={3} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {Boolean(error) ? (
        <Text className="text-sm text-[var(--color-status-danger)] font-medium text-center">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export { CustonRadioGroupChoiceCardComponent as CustomRadioGroupChoiceCardComponent };
