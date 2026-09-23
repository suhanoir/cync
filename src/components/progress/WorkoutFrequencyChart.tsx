'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface DataPoint {
  date: string;
  label: string;
  count: number;
}

interface WorkoutFrequencyChartProps {
  data: DataPoint[];
}

export function WorkoutFrequencyChart({ data }: WorkoutFrequencyChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <Card className="p-6 text-center space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Workout Frequency</h4>
        <p className="text-xs text-muted-foreground">
          Not enough activity yet. Complete a few workouts and your frequency chart will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Workout Frequency</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Sessions completed over selected period</p>
        </div>
        <span className="text-sm font-bold text-cync-green">{total} {total === 1 ? 'session' : 'sessions'}</span>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative pt-6 pb-2">
        <svg
          viewBox={`0 0 ${data.length * 36} 120`}
          className="w-full h-36 overflow-visible"
        >
          {/* Subtle grid line */}
          <line
            x1="0"
            y1="100"
            x2={data.length * 36}
            y2="100"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />

          {data.map((d, i) => {
            const barHeight = (d.count / maxVal) * 80;
            const x = i * 36 + 8;
            const y = 100 - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width="20"
                  height={Math.max(barHeight, d.count > 0 ? 4 : 0)}
                  rx="4"
                  fill={isHovered ? '#10b981' : d.count > 0 ? 'rgba(16, 185, 129, 0.7)' : 'transparent'}
                  className="transition-all duration-150"
                />

                {/* Date Label */}
                {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                  <text
                    x={x + 10}
                    y="116"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[9px] fill-muted-foreground select-none"
                  >
                    {d.label}
                  </text>
                )}

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(0, x - 30)}
                      y={Math.max(0, y - 28)}
                      width="80"
                      height="22"
                      rx="4"
                      fill="#18181b"
                      stroke="#27272a"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.max(0, x - 30) + 40}
                      y={Math.max(0, y - 28) + 14}
                      textAnchor="middle"
                      fill="#ffffff"
                      className="text-[10px] font-semibold select-none"
                    >
                      {d.count} {d.count === 1 ? 'workout' : 'workouts'}
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

