import SvgChart, { SVGRenderer } from '@wuba/react-native-echarts/svgChart';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';
import type { ExpenditureChartDataPoint } from './ExpenditureBarChartComponent';

// Register ECharts LineChart and components
echarts.use([
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  LineChart,
]);

interface ExpenditureAreaChartComponentProps {
  data: ExpenditureChartDataPoint[];
}

const CHART_HEIGHT = 160;

export default function ExpenditureAreaChartComponent({
  data,
}: ExpenditureAreaChartComponentProps) {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(Math.floor(width));
    }
  };

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
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
      },
      series: [
        {
          name: 'Card spend',
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 6,
          data: cardSpendData,
          lineStyle: {
            color: '#d49a4d',
            width: 2.5,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(212, 154, 77, 0.35)' },
                { offset: 1, color: 'rgba(212, 154, 77, 0.02)' },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              color: '#d49a4d',
              borderColor: '#ffffff',
              borderWidth: 2,
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
          type: 'line',
          lineStyle: {
            color: '#d49a4d',
            width: 1,
            type: 'dashed',
          },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const dataIndex = params[0].dataIndex;
          const current = data[dataIndex];
          if (!current) return '';
          const cardSpend = current.cardSpend ?? 0;

          return `${current.date} (${current.dayLabel})\nCard spend: $${cardSpend.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        },
      },
    };
  }, [cardSpendData, categories, data]);

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
      {/* ECharts SVG Area Chart View */}
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
