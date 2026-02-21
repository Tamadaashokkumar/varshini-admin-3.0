"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Download,
  RefreshCw,
  Calendar,
  Plus,
  Package,
  Target,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { DashboardService } from "@/lib/api";
import { toast } from "sonner";
import {
  formatCurrency,
  getOrderStatusColor,
  downloadCSV,
  cn,
} from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// 🔥 Dynamic Imports with Exact Height Skeletons (CLS Fix)
const SalesHeatmap = dynamic(
  () => import("@/components/dashboard/SalesHeatmap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-2xl border border-white/10 bg-zinc-100 dark:bg-white/5 animate-pulse" />
    ),
  },
);

const InventoryForecast = dynamic(
  () => import("@/components/dashboard/InventoryForecast"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[150px] w-full rounded-2xl" />,
  },
);

const RevenueChart = dynamic(
  () => import("@/components/dashboard/RevenueChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
  },
);

const TargetChart = dynamic(
  () => import("@/components/dashboard/TargetChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-32 rounded-full" />,
  },
);

// --- Types ---
interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
}

export default function DashboardPage() {
  const { theme } = useTheme();

  // --- State ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [hasMounted, setHasMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // Mock Target
  const MONTHLY_TARGET = 50000;

  // Calculations
  const avgOrderValue = useMemo(() => {
    if (!stats?.totalRevenue || !stats?.totalOrders) return 0;
    return Math.round(stats.totalRevenue / stats.totalOrders);
  }, [stats]);

  const targetProgress = useMemo(() => {
    if (!stats?.totalRevenue) return 0;
    const progress = (stats.totalRevenue / MONTHLY_TARGET) * 100;
    return Math.min(progress, 100);
  }, [stats]);

  useEffect(() => {
    setHasMounted(true);
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const results = await Promise.allSettled([
        DashboardService.getStats(),
        DashboardService.getMonthlyRevenue(),
        DashboardService.getRecentOrders(5),
      ]);

      if (results[0].status === "fulfilled") {
        const res = results[0].value;
        setStats(res.data?.data?.stats || res.data?.stats || {});
      }

      if (results[1].status === "fulfilled") {
        const res = results[1].value;
        setMonthlyRevenue(
          Array.isArray(res.data?.data?.data) ? res.data?.data?.data : [],
        );
      }

      if (results[2].status === "fulfilled") {
        const res = results[2].value;
        setRecentOrders(
          Array.isArray(res.data?.data?.orders) ? res.data?.data?.orders : [],
        );
      }
    } catch (error: any) {
      console.error("Dashboard error:", error);
      toast.error("Partial data load failure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (monthlyRevenue.length === 0) {
      toast.error("No data to export");
      return;
    }
    const reportData = monthlyRevenue.map((item) => ({
      Month: item.monthName,
      Orders: item.orders || 0,
      Revenue: `₹${(item.revenue || 0).toLocaleString("en-IN")}`,
    }));
    downloadCSV(
      reportData,
      `Dashboard_Report_${new Date().toISOString().split("T")[0]}`,
    );
    toast.success("Report downloaded!");
  };

  if (!hasMounted)
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;

  // 🔥 CUSTOM LOADING STATE (Matches Real Layout Exactly to Fix CLS)
  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        {/* 1. Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 h-[80px]">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* 2. KPI Cards Grid Skeleton (Matches exact grid of real content) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
        </div>

        {/* 3. Revenue & Target Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3 min-h-[400px]">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[180px] rounded-2xl" />
            <Skeleton className="h-[180px] rounded-2xl" />
          </div>
        </div>

        {/* 4. Heatmap & Actions Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Styles
  const glassCard = cn(
    "rounded-2xl border p-6 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300",
    "border-zinc-200 bg-white hover:bg-zinc-50",
    "dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]",
  );

  const actionBtn = cn(
    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all cursor-pointer group h-full",
    "border-zinc-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600",
    "dark:border-white/10 dark:bg-white/5 dark:hover:bg-blue-500/20 dark:hover:border-blue-500/50 dark:hover:text-blue-400",
  );

  return (
    <div className="space-y-6 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">
            Overview of your store's performance today ({currentDate}).
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Select Date Range"
              className="pl-10 pr-8 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all border bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
            >
              <option value="7days" className="dark:bg-gray-900">
                Last 7 Days
              </option>
              <option value="30days" className="dark:bg-gray-900">
                Last 30 Days
              </option>
              <option value="month" className="dark:bg-gray-900">
                This Month
              </option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
          >
            <Download className="h-4 w-4" /> Report
          </button>

          <button
            onClick={fetchDashboardData}
            aria-label="Refresh Dashboard Data"
            className="p-2 rounded-xl border transition-all bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* --- 1. KPI SECTION --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          prefix="₹"
          icon={DollarSign}
          iconColor="text-emerald-500 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-500/10"
          description={`+${formatCurrency(stats?.todayRevenue || 0)} today`}
          delay={0}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          iconColor="text-blue-500 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-500/10"
          description={`+${stats?.todayOrders || 0} today`}
          delay={0}
        />
        <StatsCard
          title="Avg Order Value"
          value={avgOrderValue}
          prefix="₹"
          icon={TrendingUp}
          iconColor="text-purple-500 dark:text-purple-400"
          iconBg="bg-purple-100 dark:bg-purple-500/10"
          description="Per transaction"
          delay={0}
        />
        <div
          className={cn(
            glassCard,
            "border-l-4",
            (stats?.pendingOrders || 0) > 0
              ? "border-l-amber-500"
              : "border-l-zinc-300 dark:border-l-gray-600",
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-gray-400">
                Pending Actions
              </p>
              <h2 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">
                {stats?.pendingOrders || 0}
              </h2>
              <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                Orders need packing
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. REVENUE & FORECAST --- */}
      <div className="grid gap-6 lg:grid-cols-3 min-h-[400px]">
        <div className={cn(glassCard, "lg:col-span-2 flex flex-col")}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Revenue Trends
              </h2>
              <p className="text-sm text-zinc-500 dark:text-gray-400">
                Performance over time
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> Growth
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <RevenueChart data={monthlyRevenue} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Target Widget */}
          <div className={glassCard}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                <Target className="h-4 w-4 text-blue-500" /> Monthly Target
              </h2>
              <span className="text-xs text-zinc-500 dark:text-gray-400">
                Goal: {formatCurrency(MONTHLY_TARGET)}
              </span>
            </div>
            <TargetChart
              progress={targetProgress}
              target={MONTHLY_TARGET}
              currentRevenue={stats?.totalRevenue || 0}
            />
          </div>

          {/* Inventory Forecast Widget */}
          <div className="flex-1">
            <InventoryForecast />
          </div>
        </div>
      </div>

      {/* --- 3. HEATMAP & QUICK ACTIONS --- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Live Sales Activity{" "}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-gray-400">
              Real-time order locations & density
            </p>
          </div>
          <SalesHeatmap />
        </div>

        <div className="grid grid-cols-2 gap-4 h-full content-start pt-14">
          <Link href="/dashboard/products/add" className={actionBtn}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center transition-colors bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-400">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Add Product
            </span>
          </Link>
          <Link href="/dashboard/orders" className={actionBtn}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center transition-colors bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white dark:bg-purple-500/20 dark:text-purple-400">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Orders
            </span>
          </Link>
          <div className={actionBtn}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center transition-colors bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/20 dark:text-orange-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Alerts
            </span>
          </div>
          <div className={actionBtn}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center transition-colors bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white dark:bg-green-500/20 dark:text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Finances
            </span>
          </div>
        </div>
      </div>

      {/* --- 4. RECENT ORDERS TABLE --- */}
      <div className={glassCard}>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Transactions
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-medium flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs uppercase font-semibold bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-100 text-zinc-700 dark:divide-white/5 dark:text-gray-300">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition group cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-4 font-medium transition-colors text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4">{order.user?.name || "Guest"}</td>
                    <td className="px-4 py-4 font-mono text-zinc-900 dark:text-gray-200">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold border border-opacity-20",
                          getOrderStatusColor(order.orderStatus),
                        )}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-500 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-zinc-500 dark:text-gray-500"
                  >
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
