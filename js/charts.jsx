import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { Text } from '@visx/text';

const DEFAULT_DATA = [
  { label: 'Before', value: 4.2, color: 'var(--bar-before, #93c5fd)' },
  { label: 'After', value: 1.1, color: 'var(--bar-after, #2563eb)' },
];

const getLabel = (d) => d.label;
const getValue = (d) => d.value;
const getColor = (d) => d.color;

function VisxBarChart({ width, height, data }) {
  if (width < 10 || height < 10) return null;

  const chartData = data || DEFAULT_DATA;

  const margin = { top: 20, bottom: 20, left: 10, right: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleBand({
    range: [0, innerWidth],
    domain: chartData.map(getLabel),
    padding: 0.4,
  }), [innerWidth, chartData]);

  const yScale = useMemo(() => scaleLinear({
    range: [innerHeight, 0],
    domain: [0, Math.max(...chartData.map(getValue))],
    round: true,
  }), [innerHeight, chartData]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {chartData.map((d) => {
          const label = getLabel(d);
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - (yScale(getValue(d)) || 0);
          const barX = xScale(label);
          const barY = innerHeight - barHeight;

          return (
            <Group key={`bar-${label}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={getColor(d)}
                rx={4}
              />
              <Text
                x={barX + barWidth / 2}
                y={innerHeight + 15}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                fontSize={10}
                fontWeight={600}
                style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                {label}
              </Text>
              <Text
                x={barX + barWidth / 2}
                y={barY - 8}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={12}
                fontWeight={700}
                fontFamily="var(--font-mono)"
              >
                {getValue(d)}h
              </Text>
            </Group>
          );
        })}
      </Group>
    </svg>
  );
}

export function renderChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (container) {
    const root = createRoot(container);
    root.render(
      <ParentSize>
        {({ width, height }) => <VisxBarChart width={width} height={height} data={data} />}
      </ParentSize>
    );
  }
}
