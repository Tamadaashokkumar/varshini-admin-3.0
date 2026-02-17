"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function RevenueChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartColors = {
    grid: isDark ? "rgba(255,255,255,0.05)" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
    tooltipBg: isDark ? "#0f0f11" : "#fff",
    tooltipBorder: isDark ? "#333" : "#e5e7eb",
    tooltipText: isDark ? "#fff" : "#1f2937",
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.grid}
          vertical={false}
        />
        <XAxis
          dataKey="monthName"
          stroke={chartColors.text}
          style={{ fontSize: "12px" }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          stroke={chartColors.text}
          style={{ fontSize: "12px" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `₹${val / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            borderColor: chartColors.tooltipBorder,
            borderRadius: "12px",
            color: chartColors.tooltipText,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(val: any) => [formatCurrency(val), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={3}
          fill="url(#colorRevenue)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
