import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { Text } from '@visx/text';
import { LinearGradient } from '@visx/gradient';

const DEFAULT_NPS = [
  { label: '2018', value: 37 },
  { label: '2021', value: 78 },
];

const DEFAULT_MAU = [
  { label: '2018', value: 45 },
  { label: '2021', value: 79 },
];

const getLabel = (d) => d.label;
const getValue = (d) => d.value;

function FinalScoreChart({ width, height, data, fromColor, toColor, textColor }) {
  if (width < 10 || height < 10) return null;

  const margin = { top: 60, bottom: 40, left: 10, right: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleBand({
    range: [0, innerWidth],
    domain: data.map(getLabel),
    padding: 0.25,
  }), [innerWidth, data]);

  const yScale = useMemo(() => scaleLinear({
    range: [innerHeight, 0],
    domain: [0, 100],
  }), [innerHeight]);

  return (
    <svg width={width} height={height}>
      <defs>
        <LinearGradient id={`gradient-${fromColor.replace('#','')}`} from={fromColor} to={toColor} />
        <marker id={`arrow-${fromColor.replace('#','')}`} markerWidth="20" markerHeight="20" refX="10" refY="10" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 2 4 L 10 10 L 2 16" fill="transparent" stroke={textColor} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <Group left={margin.left} top={margin.top}>
        {data.map((d) => {
          const label = getLabel(d);
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - yScale(getValue(d));
          const barX = xScale(label);
          const barY = innerHeight - barHeight;

          return (
            <Group key={`bar-${label}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={`url(#gradient-${fromColor.replace('#','')})`}
                rx={6}
              />
              <Text
                x={barX + barWidth / 2}
                y={barY + 30}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={22}
                fontWeight={700}
                fontFamily="var(--font-sans, Inter, sans-serif)"
              >
                {`${getValue(d)}%`}
              </Text>
              <Text
                x={barX + barWidth / 2}
                y={innerHeight + 24}
                textAnchor="middle"
                fill="var(--text-primary, #333)"
                fontSize={16}
                fontWeight={700}
                fontFamily="var(--font-sans, Inter, sans-serif)"
              >
                {label}
              </Text>
            </Group>
          );
        })}

        {(() => {
          const x1 = xScale(data[0].label) + xScale.bandwidth() / 2;
          const y1 = innerHeight - (innerHeight - yScale(data[0].value));
          const x2 = xScale(data[1].label);
          const y2 = innerHeight - (innerHeight - yScale(data[1].value));

          const startX = x1;
          const startY = y1 - 25;
          const endX = x2 - 10;
          const endY = y2 + 30;

          const cpX = startX + 10;
          const cpY = startY - 30;

          return (
            <Group>
              <path
                 d={`M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`}
                 fill="transparent"
                 stroke={textColor}
                 strokeWidth={4}
                 strokeLinecap="round"
                 markerEnd={`url(#arrow-${fromColor.replace('#','')})`}
              />
            </Group>
          );
        })()}
      </Group>
    </svg>
  );
}

export function renderFinalScores(npsContainerId, mauContainerId, config) {
  const npsConfig = config?.nps || { data: DEFAULT_NPS, fromColor: '#3b82f6', toColor: 'rgba(255, 255, 255, 0.1)', textColor: '#3b82f6' };
  const mauConfig = config?.mau || { data: DEFAULT_MAU, fromColor: '#22c55e', toColor: 'rgba(255, 255, 255, 0.1)', textColor: '#22c55e' };

  const npsContainer = document.getElementById(npsContainerId);
  if (npsContainer) {
    const root = createRoot(npsContainer);
    root.render(
      <ParentSize>
        {({ width, height }) => (
          <FinalScoreChart
            width={width}
            height={height}
            data={npsConfig.data}
            fromColor={npsConfig.fromColor}
            toColor={npsConfig.toColor}
            textColor={npsConfig.textColor}
          />
        )}
      </ParentSize>
    );
  }

  const mauContainer = document.getElementById(mauContainerId);
  if (mauContainer) {
    const root = createRoot(mauContainer);
    root.render(
      <ParentSize>
        {({ width, height }) => (
          <FinalScoreChart
            width={width}
            height={height}
            data={mauConfig.data}
            fromColor={mauConfig.fromColor}
            toColor={mauConfig.toColor}
            textColor={mauConfig.textColor}
          />
        )}
      </ParentSize>
    );
  }
}
