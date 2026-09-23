'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface DurationDataPoint {
  date: string;
  label: string;
  minutes: number;
}

interface WorkoutDurationChartProps {
  data: DurationDataPoint[];
}

export function WorkoutDurationChart({ data }: WorkoutDurationChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.minutes), 30);
  const totalMinutes = data.reduce((acc, d) => acc + d.minutes, 0);

  if (totalMinutes === 0) {
    return (
      <Card className="p-6 text-center space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Workout Duration</h4>
        <p className="text-xs text-muted-foreground">
          Not enough activity yet. Complete a few workouts to see your active minutes graph.
        </p>
      </Card>
    );
  }

  const width = Math.max(data.length * 32, 280);
  const height = 120;
  const paddingBottom = 25;
  const chartHeight = height - paddingBottom;

  // Build SVG Path
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (width - 40) + 20;
    const y = chartHeight - (d.minutes / maxVal) * (chartHeight - 20) - 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Workout Duration</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Total minutes exercised over time</p>
        </div>
        <span className="text-sm font-bold text-cync-green">{totalMinutes} min total</span>
      </div>

      <div className="relative pt-6 pb-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
        >
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#durationGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={p.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : p.minutes > 0 ? 3 : 1.5}
                  fill={isHovered ? '#10b981' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X Axis Label */}
                {(data.length <= 14 || i % Math.ceil(data.length / 8) === 0) && (
                  <text
                    x={p.x}
                    y={height - 5}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[9px] fill-muted-foreground select-none"
                  >
                    {p.label}
                  </text>
                )}

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, p.x - 35)}
                      y={Math.max(0, p.y - 28)}
                      width="70"
                      height="20"
                      rx="4"
                      fill="#18181b"
                      stroke="#27272a"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.max(10, p.x - 35) + 35}
                      y={Math.max(0, p.y - 28) + 13}
                      textAnchor="middle"
                      fill="#ffffff"
                      className="text-[10px] font-semibold select-none"
                    >
                      {p.minutes} min
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

