import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

export interface ExpenditureChartDataPoint {
  date: string;
  dayIndex: number;
  dayLabel: string;
  cardSpend: number;
}

interface ExpenditureBarChartComponentProps {
  data: ExpenditureChartDataPoint[];
}

export default function ExpenditureBarChartComponent({
  data,
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
  const maxSpend = Math.max(...data.map((d) => d.cardSpend), 1);

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
          <View className="flex-row items-center gap-2 rounded-md bg-[var(--color-app-subtle)] px-2 py-1">
            <View className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
            <Text className="text-xs font-semibold text-[var(--color-ink)]">
              {selectedPoint.date} ({selectedPoint.dayLabel}):
            </Text>
            <Text className="text-xs font-bold text-[var(--color-gold)]">
              ${selectedPoint.cardSpend.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        ) : (
          <Text className="text-[11px] text-[var(--color-ink-muted)]">
            Tap on any bar to inspect daily card spending
          </Text>
        )}
      </View>

      {/* SVG Bar Chart */}
      {containerWidth > 0 && (
        <View className="h-[130px] w-full items-center justify-center">
          <Svg width={effectiveWidth} height={chartHeight}>
            {data.map((item, index) => {
              const x = index * (barWidth + barGap);

              return (
                <Rect
                  key={item.date}
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  fill="transparent"
                  onPress={() => setSelectedPoint(item)}
                />
              );
            })}

            {data.map((item, index) => {
              const x = index * (barWidth + barGap);
              const barHeight =
                item.cardSpend > 0
                  ? Math.max((item.cardSpend / maxSpend) * (chartHeight - 10), 6)
                  : 2;
              const y = chartHeight - barHeight;
              const isSelected = selectedPoint?.date === item.date;

              return (
                <Rect
                  key={`bar-${item.date}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                  ry={2}
                  fill={
                    item.cardSpend > 0
                      ? isSelected
                        ? '#e2b06b'
                        : '#d49a4d'
                      : '#e6e8ee'
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
