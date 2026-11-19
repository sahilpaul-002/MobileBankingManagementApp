import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

export interface ExpenditureChartDataPoint {
  date: string;
  dayIndex: number;
  dayLabel: string;
  cardSpend: number;
  payouts?: number;
  total?: number;
}

interface ExpenditureBarChartComponentProps {
  data: ExpenditureChartDataPoint[];
  showPayouts?: boolean;
}

export default function ExpenditureBarChartComponent({
  data,
  showPayouts = false,
}: ExpenditureBarChartComponentProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [selectedPoint, setSelectedPoint] = useState<ExpenditureChartDataPoint | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const chartHeight = 130;
  const maxSpend = Math.max(
    ...data.map((d) => (showPayouts ? (d.total ?? d.cardSpend + (d.payouts ?? 0)) : d.cardSpend)),
    1
  );

  const barCount = data.length;
  // Calculate bar width and spacing based on container width
  const effectiveWidth = Math.max(containerWidth, 260);
  const barGap = 3;
  const barWidth = Math.max(
    (effectiveWidth - (barCount - 1) * barGap) / barCount,
    4
  );

  return (
    <View className="w-full flex-col" onLayout={handleLayout}>
      {/* Selected Data Tooltip Info */}
      <View className="mb-2 min-h-6 flex-row items-center justify-between">
        {selectedPoint ? (
          <View className="flex-row flex-wrap items-center gap-2 rounded-md bg-[var(--color-app-subtle)] px-2 py-1">
            <Text className="text-xs font-semibold text-[var(--color-ink)]">
              {selectedPoint.date} ({selectedPoint.dayLabel}):
            </Text>

            {showPayouts && (
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-[var(--color-ink-secondary)]" />
                <Text className="text-xs font-medium text-[var(--color-ink-soft)]">
                  Payouts:
                </Text>
                <Text className="text-xs font-bold text-[var(--color-ink)]">
                  ${(selectedPoint.payouts ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}

            <View className="flex-row items-center gap-1">
              <View className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
              <Text className="text-xs font-medium text-[var(--color-ink-soft)]">
                Card:
              </Text>
              <Text className="text-xs font-bold text-[var(--color-gold)]">
                ${selectedPoint.cardSpend.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            {showPayouts && (
              <View className="flex-row items-center gap-1 border-l border-[var(--color-line)] pl-2">
                <Text className="text-xs font-medium text-[var(--color-ink-soft)]">
                  Total:
                </Text>
                <Text className="text-xs font-bold text-[var(--color-ink)]">
                  ${((selectedPoint.payouts ?? 0) + selectedPoint.cardSpend).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-[11px] text-[var(--color-ink-muted)]">
            {showPayouts
              ? 'Tap on any bar to inspect daily expenditure'
              : 'Tap on any bar to inspect daily card spending'}
          </Text>
        )}
      </View>

      {/* SVG Bar Chart */}
      {containerWidth > 0 && (
        <View className="h-[130px] w-full items-center justify-center">
          <Svg width={effectiveWidth} height={chartHeight}>
            {/* Click hitboxes */}
            {data.map((item, index) => {
              const x = index * (barWidth + barGap);

              return (
                <Rect
                  key={`hitbox-${item.date}`}
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  fill="transparent"
                  onPress={() => setSelectedPoint(item)}
                />
              );
            })}

            {/* Visual Bars */}
            {data.map((item, index) => {
              const x = index * (barWidth + barGap);
              const cardSpend = item.cardSpend;
              const payouts = showPayouts ? (item.payouts ?? 0) : 0;
              const total = cardSpend + payouts;
              const isSelected = selectedPoint?.date === item.date;

              if (total === 0) {
                return (
                  <Rect
                    key={`bar-empty-${item.date}`}
                    x={x}
                    y={chartHeight - 2}
                    width={barWidth}
                    height={2}
                    rx={1}
                    ry={1}
                    fill="#e6e8ee"
                    onPress={() => setSelectedPoint(item)}
                  />
                );
              }

              const totalHeight = Math.max((total / maxSpend) * (chartHeight - 10), 6);

              // Admin mode with both Payouts and Card Spend on the same day: Stacked bar
              if (showPayouts && payouts > 0 && cardSpend > 0) {
                const payoutsHeight = Math.max(Math.round((payouts / total) * totalHeight), 3);
                const cardSpendHeight = Math.max(totalHeight - payoutsHeight, 3);
                const payoutsY = chartHeight - payoutsHeight;
                const cardSpendY = chartHeight - totalHeight;

                return (
                  <G key={`bar-stacked-${item.date}`} onPress={() => setSelectedPoint(item)}>
                    {/* Payouts segment (bottom) */}
                    <Rect
                      x={x}
                      y={payoutsY}
                      width={barWidth}
                      height={payoutsHeight}
                      rx={1}
                      ry={1}
                      fill={isSelected ? '#4a5673' : '#2a3450'}
                    />
                    {/* Card spend segment (top) */}
                    <Rect
                      x={x}
                      y={cardSpendY}
                      width={barWidth}
                      height={cardSpendHeight}
                      rx={1}
                      ry={1}
                      fill={isSelected ? '#e2b06b' : '#d49a4d'}
                    />
                  </G>
                );
              }

              // Admin mode with only Payouts
              if (showPayouts && payouts > 0) {
                const y = chartHeight - totalHeight;
                return (
                  <Rect
                    key={`bar-payout-${item.date}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={totalHeight}
                    rx={2}
                    ry={2}
                    fill={isSelected ? '#4a5673' : '#2a3450'}
                    onPress={() => setSelectedPoint(item)}
                  />
                );
              }

              // Card Spend only
              const y = chartHeight - totalHeight;
              return (
                <Rect
                  key={`bar-card-${item.date}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={totalHeight}
                  rx={2}
                  ry={2}
                  fill={
                    isSelected
                      ? '#e2b06b'
                      : '#d49a4d'
                  }
                  onPress={() => setSelectedPoint(item)}
                />
              );
            })}
          </Svg>
        </View>
      )}

      {/* Axis labels: 30d ago, 15d ago, Today */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-[10px] text-[var(--color-ink-muted)]">30d ago</Text>
        <Text className="text-[10px] text-[var(--color-ink-muted)]">15d ago</Text>
        <Text className="text-[10px] text-[var(--color-ink-muted)]">Today</Text>
      </View>
    </View>
  );
}
