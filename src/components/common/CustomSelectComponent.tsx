import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react-native";
import { Activity, forwardRef, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

export type LabelItem = string | { id?: string; label: string; value: string };

export interface CustomSelectProps {
  id?: string;
  label?: string;
  fieldLabel?: string;
  labelCategory?: string;
  labels: LabelItem[] | null | undefined;
  selectTriggerClassName?: string;
  selectGroupClassName?: string;
  fieldLabelClassName?: string;
  placeholder?: string;
  value: string | null;
  onChange: (value: string) => void;
  error?: string | undefined;
  hint?: string | undefined;
  disabled?: boolean;
}

const CustomSelectComponent = forwardRef<View, CustomSelectProps>(
  (
    {
      id,
      label,
      fieldLabel,
      labels,
      selectTriggerClassName,
      fieldLabelClassName,
      placeholder,
      value,
      onChange,
      error,
      hint,
      disabled = false,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Find the currently selected item
    const selectedItem = useMemo(() => {
      if (!labels || value === null || value === undefined) return null;
      return labels.find((item) => {
        const itemVal = typeof item === "string" ? item : item.value;
        return itemVal === value;
      });
    }, [labels, value]);

    // Format selected display text
    const displayValue = useMemo(() => {
      if (!selectedItem) {
        return value || null;
      }
      if (typeof selectedItem === "string") {
        return selectedItem;
      }
      if (selectedItem.value && selectedItem.value.startsWith("+")) {
        return `${selectedItem.label} (${selectedItem.value})`;
      }
      if (
        selectedItem.label &&
        selectedItem.value &&
        selectedItem.label !== selectedItem.value
      ) {
        return `${selectedItem.label} (${selectedItem.value})`;
      }
      return selectedItem.label || selectedItem.value;
    }, [selectedItem, value]);

    // Filter items based on search query
    const filteredLabels = useMemo(() => {
      if (!labels) return [];
      if (!searchQuery.trim()) return labels;

      const q = searchQuery.toLowerCase().trim();
      return labels.filter((item) => {
        if (typeof item === "string") {
          return item.toLowerCase().includes(q);
        }
        return (
          item.label.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q)
        );
      });
    }, [labels, searchQuery]);

    const titleText = fieldLabel || label || "Select Option";
    const placeholderText = placeholder || label || "Select option";

    return (
      <View ref={ref} testID={id} className="w-full flex-col gap-1.5">
        {/* Field Label */}
        {fieldLabel && (
          <Text
            className={cn(
              "text-lg font-semibold text-[var(--color-ink-secondary)] tracking-wide",
              fieldLabelClassName,
            )}
          >
            {fieldLabel}
          </Text>
        )}

        {/* Trigger Button */}
        <Pressable
          accessibilityRole="combobox"
          accessibilityLabel={titleText}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={() => {
            setSearchQuery("");
            setOpen(true);
          }}
          className={cn(
            "h-12 w-full flex-row items-center justify-between rounded-[var(--radius-control)] border bg-[var(--color-app-surface)] px-3.5",
            error
              ? "border-[var(--color-status-danger)]"
              : "border-[var(--color-line-strong)] active:border-[var(--color-navy)]",
            disabled && "opacity-50",
            selectTriggerClassName,
          )}
        >
          <Text
            numberOfLines={1}
            className={cn(
              "flex-1 text-md",
              displayValue
                ? "font-medium text-[var(--color-ink)]"
                : "text-[var(--color-ink-muted)]",
            )}
          >
            {displayValue ?? placeholderText}
          </Text>

          <ChevronDown size={18} color="#0c1830" strokeWidth={2} />
        </Pressable>

        {/* Error message with Activity */}
        <Activity mode={error ? "visible" : "hidden"}>
          <Text className="text-sm font-medium text-[var(--color-status-danger)]">
            {error}
          </Text>
        </Activity>

        {/* Hint message with Activity */}
        <Activity mode={Boolean(hint && !error) ? "visible" : "hidden"}>
          <Text className="text-xs text-[var(--color-ink-muted)]">{hint}</Text>
        </Activity>

        {/* Modal Selection Dialog */}
        <Modal
          visible={open}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-end bg-black/50"
          >
            {/* Backdrop Dismiss Area */}
            <Pressable
              className="flex-1"
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close selection modal"
            />

            {/* Bottom Sheet Card with fixed height so it does not collapse on short search results */}
            <View className="h-[520px] w-full rounded-t-3xl border-t border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 pb-8 shadow-2xl">
              {/* Handle Bar */}
              <View className="mb-3 h-1.5 w-12 self-center rounded-full bg-[var(--color-line-strong)]" />

              {/* Modal Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
                  {titleText}
                </Text>

                <Pressable
                  hitSlop={8}
                  onPress={() => setOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                  className="rounded-full bg-[var(--color-app-subtle)] p-1.5 active:bg-[var(--color-app-hover)]"
                >
                  <X size={18} color="#0c1830" />
                </Pressable>
              </View>

              {/* Search Bar (if list has more than 5 items) */}
              {labels && labels.length > 5 && (
                <View className="mb-3 flex-row items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-app)] px-3">
                  <Search size={16} color="#0c1830" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search ${titleText.toLowerCase()}...`}
                    placeholderTextColor="#8a93a8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="h-10 flex-1 pl-2 text-sm text-[var(--color-ink)]"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      hitSlop={6}
                      onPress={() => setSearchQuery("")}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                    >
                      <X size={14} color="#0c1830" />
                    </Pressable>
                  )}
                </View>
              )}

              {/* List of Options */}
              <FlatList
                data={filteredLabels}
                className="flex-1"
                keyExtractor={(item, index) => {
                  if (typeof item === "string") return `${item}-${index}`;
                  return item.id || `${item.value}-${index}`;
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 16 }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-8">
                    <Text className="text-sm text-[var(--color-ink-muted)]">
                      {`No options found matching "${searchQuery}"`}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isString = typeof item === "string";
                  const itemValue = isString ? item : item.value;
                  const itemLabel = isString ? item : item.label;
                  const isSelected = itemValue === value;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        onChange(itemValue);
                        setOpen(false);
                      }}
                      className={cn(
                        "my-0.5 flex-row items-center justify-between rounded-xl px-3.5 py-3 border-b border-[var(--color-line-faint)]",
                        isSelected
                          ? "bg-[var(--color-navy)]/10 border-[var(--color-navy)]/30"
                          : "active:bg-[var(--color-app-hover)]",
                      )}
                    >
                      <View className="flex-1 flex-row items-center justify-between pr-2">
                        <Text
                          numberOfLines={1}
                          className={cn(
                            "flex-1 text-md",
                            isSelected
                              ? "font-bold text-[var(--color-navy)]"
                              : "font-normal text-[var(--color-ink-secondary)]",
                          )}
                        >
                          {itemLabel}
                        </Text>

                        {!isString && item.value && (
                          <View className="ml-2 rounded-md bg-[var(--color-navy)]/10 px-2 py-0.5">
                            <Text
                              className={cn(
                                "text-xs font-semibold",
                                isSelected
                                  ? "text-[var(--color-navy)] font-bold"
                                  : "text-[var(--color-ink-soft)]",
                              )}
                            >
                              {item.value}
                            </Text>
                          </View>
                        )}
                      </View>

                      {isSelected && (
                        <Check size={18} color="#0c1830" strokeWidth={2.5} />
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  },
);

CustomSelectComponent.displayName = "CustomSelectComponent";

export default CustomSelectComponent;
