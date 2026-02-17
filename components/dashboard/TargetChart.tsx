"use client";

import { PieChart, Pie, Cell } from "recharts";
import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";

interface TargetChartProps {
  progress: number;
  target: number;
  currentRevenue: number;
}

export default function TargetChart({
  progress,
  target,
  currentRevenue,
}: TargetChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartColors = {
    pieEmpty: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 flex items-center justify-center">
        <PieChart width={120} height={120}>
          <Pie
            data={[{ value: progress }, { value: 100 - progress }]}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={55}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#3b82f6" />
            <Cell fill={chartColors.pieEmpty} />
          </Pie>
        </PieChart>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <p className="text-center text-sm mt-2 text-zinc-500 dark:text-gray-400">
        {formatCurrency(Math.max(0, target - currentRevenue))} more to reach
        goal
      </p>
    </div>
  );
}
