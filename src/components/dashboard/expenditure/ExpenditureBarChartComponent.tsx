import SvgChart, { SVGRenderer } from '@wuba/react-native-echarts/svgChart';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';

// Register necessary ECharts components with SVG renderer
echarts.use([
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  BarChart,
]);

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
}

const CHART_HEIGHT = 160;

export default function ExpenditureBarChartComponent({
  data,
}: ExpenditureBarChartComponentProps) {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(Math.floor(width));
    }
  };

  const payoutsData = useMemo(() => data.map((d) => d.payouts ?? 0), [data]);
  const cardSpendData = useMemo(() => data.map((d) => d.cardSpend), [data]);
  const categories = useMemo(() => data.map((d) => d.dayLabel), [data]);

  const option = useMemo<EChartsOption>(() => {
    return {
      grid: {
        left: 0,
        right: 0,
        top: 10,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: categories,
        show: false,
        boundaryGap: true,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
      },
      series: [
        {
          name: 'Payouts',
          type: 'bar',
          stack: 'expenditure',
          data: payoutsData,
          barMaxWidth: 14,
          itemStyle: {
            color: '#2a3450',
            borderRadius: [2, 2, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#4a5673',
            },
          },
        },
        {
          name: 'Card spend',
          type: 'bar',
          stack: 'expenditure',
          data: cardSpendData,
          barMaxWidth: 14,
          itemStyle: {
            color: '#d49a4d',
            borderRadius: [2, 2, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#e2b06b',
            },
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        renderMode: 'richText',
        backgroundColor: '#ffffff',
        borderColor: '#e6e8ee',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          color: '#0c1830',
          fontSize: 12,
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(212, 154, 77, 0.1)',
          },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const dataIndex = params[0].dataIndex;
          const current = data[dataIndex];
          if (!current) return '';
          const payouts = current.payouts ?? 0;
          const cardSpend = current.cardSpend ?? 0;
          const total = payouts + cardSpend;

          return `${current.date} (${current.dayLabel})\nPayouts: $${payouts.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\nCard spend: $${cardSpend.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}\nTotal: $${total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        },
      },
    };
  }, [payoutsData, cardSpendData, categories, data]);

  // Initialize or re-initialize chart when container width changes
  useEffect(() => {
    let chart: any;
    if (chartRef.current && containerWidth > 0) {
      chart = echarts.init(chartRef.current, 'light', {
        renderer: 'svg',
        width: containerWidth,
        height: CHART_HEIGHT,
      });
      chartInstance.current = chart;
      chart.setOption(option);
    }

    return () => {
      chart?.dispose();
      chartInstance.current = null;
    };
  }, [containerWidth]);

  // Update option dynamically when data changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);

  return (
    <View className="w-full flex-col" onLayout={handleLayout}>
      {/* ECharts SVG Bar Chart View */}
      <View className="h-40 w-full items-center justify-center">
        {containerWidth > 0 && <SvgChart ref={chartRef} />}
      </View>

      {/* Axis labels: 30d ago, 15d ago, Today */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-[10px] text-[var(--color-ink-muted)]">30d ago</Text>
        <Text className="text-[10px] text-[var(--color-ink-muted)]">15d ago</Text>
        <Text className="text-[10px] text-[var(--color-ink-muted)]">Today</Text>
      </View>
    </View>
  );
}
