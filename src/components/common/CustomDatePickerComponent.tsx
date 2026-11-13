import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react-native";
import { Activity, forwardRef, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";

export interface CustomDatePickerProps {
  id?: string;
  label?: string;
  fieldLabel?: string;
  date?: Date;
  setDate: (date: Date | undefined) => void;
  max?: Date;
  restrictTo18Years?: boolean;
  fieldLabelClassName?: string;
  popoverTriggerButtonClassName?: string;
  error?: string | undefined;
  hint?: string | undefined;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CustomDatePickerComponent = forwardRef<View, CustomDatePickerProps>(
  (
    {
      id,
      label,
      fieldLabel,
      date,
      setDate,
      max,
      restrictTo18Years = false,
      fieldLabelClassName,
      popoverTriggerButtonClassName,
      error,
      hint,
      disabled = false,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    // Calculate maximum allowed date (18 years ago or max date)
    const maxAllowedDate = useMemo(() => {
      const today = new Date();
      if (restrictTo18Years) {
        return new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
        );
      }
      return max ?? today;
    }, [restrictTo18Years, max]);

    // Internal view state for month & year navigation
    const initialViewDate = useMemo(() => {
      if (date) return date;
      return maxAllowedDate;
    }, [date, maxAllowedDate]);

    const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

    // Sync view when opening modal
    const handleOpenModal = () => {
      if (disabled) return;
      const target = date || maxAllowedDate;
      setViewYear(target.getFullYear());
      setViewMonth(target.getMonth());
      setShowYearPicker(false);
      setOpen(true);
    };

    // Generate list of available years (from 1920 to max allowed year)
    const availableYears = useMemo(() => {
      const maxYear = maxAllowedDate.getFullYear();
      const minYear = 1920;
      const years: number[] = [];
      for (let y = maxYear; y >= minYear; y--) {
        years.push(y);
      }
      return years;
    }, [maxAllowedDate]);

    // Calculate days for the currently viewed month
    const monthCalendarDays = useMemo(() => {
      const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
      const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      const days: { day: number | null; date: Date | null; disabled: boolean }[] = [];

      // Leading empty padding days
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null, date: null, disabled: true });
      }

      // Actual month days
      for (let d = 1; d <= daysInCurrentMonth; d++) {
        const thisDate = new Date(viewYear, viewMonth, d, 12, 0, 0);
        const isDisabled = thisDate.getTime() > maxAllowedDate.getTime();
        days.push({
          day: d,
          date: thisDate,
          disabled: isDisabled,
        });
      }

      return days;
    }, [viewYear, viewMonth, maxAllowedDate]);

    // Handle Month change
    const handlePrevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((prev) => prev - 1);
      } else {
        setViewMonth((prev) => prev - 1);
      }
    };

    const handleNextMonth = () => {
      const nextMonthDate = new Date(viewYear, viewMonth + 1, 1);
      if (nextMonthDate.getTime() > maxAllowedDate.getTime() && viewMonth >= maxAllowedDate.getMonth() && viewYear >= maxAllowedDate.getFullYear()) {
        return;
      }
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((prev) => prev + 1);
      } else {
        setViewMonth((prev) => prev + 1);
      }
    };

    // Handle Year change
    const handleSelectYear = (year: number) => {
      setViewYear(year);
      setShowYearPicker(false);
    };

    // Select specific date
    const handleSelectDay = (selectedDate: Date) => {
      setDate(selectedDate);
      setOpen(false);
    };

    const titleText = fieldLabel || label || "Select Date";
    const formattedDate = date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

    const isNextMonthDisabled =
      new Date(viewYear, viewMonth + 1, 1).getTime() > maxAllowedDate.getTime();

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
          accessibilityRole="button"
          accessibilityLabel={titleText}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={handleOpenModal}
          className={cn(
            "h-12 w-full flex-row items-center justify-between rounded-[var(--radius-control)] border bg-[var(--color-app-surface)] px-3.5",
            error
              ? "border-[var(--color-status-danger)]"
              : "border-[var(--color-line-strong)] active:border-[var(--color-gold)]",
            disabled && "opacity-50",
            popoverTriggerButtonClassName,
          )}
        >
          <Text
            numberOfLines={1}
            className={cn(
              "flex-1 text-md",
              formattedDate
                ? "font-medium text-[var(--color-ink)]"
                : "text-[var(--color-ink-muted)]",
            )}
          >
            {formattedDate ?? label ?? "Select date"}
          </Text>

          <CalendarIcon size={18} color="#8a93a8" strokeWidth={2} />
        </Pressable>

        {/* Error message with Activity */}
        <Activity mode={error ? "visible" : "hidden"}>
          <Text className="text-sm font-medium text-[var(--color-status-danger)]">
            {error}
          </Text>
        </Activity>

        {/* Hint message with Activity */}
        <Activity mode={Boolean(hint && !error) ? "visible" : "hidden"}>
          <Text className="text-xs text-[var(--color-ink-muted)]">
            {hint}
          </Text>
        </Activity>

        {/* Calendar Picker Modal */}
        <Modal
          visible={open}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            {/* Backdrop Dismiss Area */}
            <Pressable
              className="flex-1"
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close calendar"
            />

            {/* Bottom Sheet Card */}
            <View
              className={cn(
                "w-full rounded-t-3xl border-t border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 pb-8 shadow-2xl",
                Platform.OS === "ios" ? "max-h-[85%]" : "max-h-[80%]",
              )}
            >
              {/* Handle Bar */}
              <View className="mb-3 h-1.5 w-12 self-center rounded-full bg-[var(--color-line-strong)]" />

              {/* Modal Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                  {titleText}
                </Text>

                <Pressable
                  hitSlop={8}
                  onPress={() => setOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                  className="rounded-full bg-[var(--color-app-subtle)] p-1.5 active:bg-[var(--color-app-hover)]"
                >
                  <X size={18} color="#8a93a8" />
                </Pressable>
              </View>

              {/* Month & Year Navigation Bar */}
              <View className="mb-4 flex-row items-center justify-between rounded-xl bg-[var(--color-app)] p-2">
                {/* Prev Month */}
                <Pressable
                  hitSlop={8}
                  onPress={handlePrevMonth}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  className="rounded-lg p-2 active:bg-[var(--color-app-hover)]"
                >
                  <ChevronLeft size={20} color="#0c1830" />
                </Pressable>

                {/* Month & Year Selector Trigger */}
                <Pressable
                  onPress={() => setShowYearPicker((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle year list"
                  className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 active:bg-[var(--color-gold-soft)]/60"
                >
                  <Text className="text-base font-bold text-[var(--color-ink)]">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>
                  <ChevronDown
                    size={16}
                    color="#d49a4d"
                    style={{
                      transform: [{ rotate: showYearPicker ? "180deg" : "0deg" }],
                    }}
                  />
                </Pressable>

                {/* Next Month */}
                <Pressable
                  hitSlop={8}
                  disabled={isNextMonthDisabled}
                  onPress={handleNextMonth}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  className={cn(
                    "rounded-lg p-2",
                    isNextMonthDisabled
                      ? "opacity-20"
                      : "active:bg-[var(--color-app-hover)]",
                  )}
                >
                  <ChevronRight size={20} color="#0c1830" />
                </Pressable>
              </View>

              {/* Year Selector View */}
              {showYearPicker ? (
                <View className="h-64">
                  <Text className="mb-2 text-xs font-semibold text-[var(--color-ink-muted)]">
                    Select Year
                  </Text>
                  <FlatList
                    data={availableYears}
                    keyExtractor={(y) => y.toString()}
                    numColumns={3}
                    showsVerticalScrollIndicator={true}
                    renderItem={({ item: yr }) => {
                      const isCurrentYear = yr === viewYear;
                      return (
                        <Pressable
                          onPress={() => handleSelectYear(yr)}
                          className={cn(
                            "m-1 flex-1 items-center justify-center rounded-xl py-3 border",
                            isCurrentYear
                              ? "border-[var(--color-gold)] bg-[var(--color-navy)]"
                              : "border-[var(--color-line)] bg-[var(--color-app-subtle)] active:bg-[var(--color-app-hover)]",
                          )}
                        >
                          <Text
                            className={cn(
                              "text-base font-semibold",
                              isCurrentYear
                                ? "text-[var(--color-gold)] font-bold"
                                : "text-[var(--color-ink)]",
                            )}
                          >
                            {yr}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                </View>
              ) : (
                /* Month Calendar Grid View */
                <View className="w-full">
                  {/* Days of Week Header */}
                  <View className="mb-2 flex-row justify-between">
                    {WEEK_DAYS.map((wd) => (
                      <View key={wd} className="w-10 items-center justify-center">
                        <Text className="text-xs font-bold text-[var(--color-ink-muted)]">
                          {wd}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Days Matrix */}
                  <View className="flex-row flex-wrap justify-between">
                    {monthCalendarDays.map((item, index) => {
                      if (!item.date || item.day === null) {
                        return (
                          <View
                            key={`empty-${index}`}
                            className="h-10 w-10 my-1"
                          />
                        );
                      }

                      const isSelected =
                        Boolean(date) &&
                        item.date.getFullYear() === date?.getFullYear() &&
                        item.date.getMonth() === date?.getMonth() &&
                        item.date.getDate() === date?.getDate();

                      return (
                        <Pressable
                          key={`day-${item.day}-${index}`}
                          disabled={item.disabled}
                          onPress={() => item.date && handleSelectDay(item.date)}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                          accessibilityState={{
                            selected: isSelected,
                            disabled: item.disabled,
                          }}
                          className={cn(
                            "my-1 h-10 w-10 items-center justify-center rounded-full",
                            isSelected
                              ? "bg-[var(--color-gold)] shadow-sm"
                              : item.disabled
                                ? "opacity-25"
                                : "active:bg-[var(--color-gold-soft)]/60",
                          )}
                        >
                          <Text
                            className={cn(
                              "text-sm font-semibold",
                              isSelected
                                ? "font-bold text-white"
                                : item.disabled
                                  ? "text-[var(--color-ink-muted)]"
                                  : "text-[var(--color-ink)]",
                            )}
                          >
                            {item.day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

CustomDatePickerComponent.displayName = "CustomDatePickerComponent";

export default CustomDatePickerComponent;
