// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import {
//   DollarSign,
//   ShoppingCart,
//   TrendingUp,
//   AlertCircle,
//   ArrowRight,
//   Download,
//   RefreshCw,
//   Calendar,
//   Plus,
//   Package,
//   Target,
// } from "lucide-react";
// import StatsCard from "@/components/StatsCard";
// import { StatsSkeleton, Skeleton } from "@/components/ui/Skeleton";
// import { DashboardService } from "@/lib/api";
// import { toast } from "sonner";
// import {
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   Cell,
//   PieChart,
//   Pie,
// } from "recharts";
// import { formatCurrency, getOrderStatusColor, downloadCSV } from "@/lib/utils";
// import Link from "next/link";
// import dynamic from "next/dynamic";

// // 🔥 IMPORT NEW COMPONENTS
// const SalesHeatmap = dynamic(
//   () => import("@/components/dashboard/SalesHeatmap"),
//   {
//     ssr: false,
//   },
// );

// const InventoryForecast = dynamic(
//   () => import("@/components/dashboard/InventoryForecast"),
//   {
//     ssr: false,
//   },
// );

// // --- Styled Components / Utilities ---
// const glassCard =
//   "rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md shadow-xl p-6 hover:bg-white/[0.05] transition-all duration-300";
// const actionBtn =
//   "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all cursor-pointer group h-full";

// export default function DashboardPage() {
//   // --- State ---
//   const [stats, setStats] = useState<any>(null);
//   const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
//   const [recentOrders, setRecentOrders] = useState<any[]>([]);
//   const [topProducts, setTopProducts] = useState<any[]>([]);

//   // UI States
//   const [isLoading, setIsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState("30days");
//   const [hasMounted, setHasMounted] = useState(false);

//   // Mock Target (Backend integration later)
//   const MONTHLY_TARGET = 50000;

//   useEffect(() => {
//     setHasMounted(true);
//     fetchDashboardData();
//   }, [dateRange]);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
//       const [statsRes, monthlyRevRes, ordersRes, productsRes] =
//         await Promise.all([
//           DashboardService.getStats(),
//           DashboardService.getMonthlyRevenue(),
//           DashboardService.getRecentOrders(5),
//           DashboardService.getTopSellingProducts(4),
//         ]);

//       setStats(statsRes.data?.data?.stats || statsRes.data?.stats || {});
//       setMonthlyRevenue(
//         Array.isArray(monthlyRevRes.data?.data?.data)
//           ? monthlyRevRes.data?.data?.data
//           : [],
//       );
//       setRecentOrders(
//         Array.isArray(ordersRes.data?.data?.orders)
//           ? ordersRes.data?.data?.orders
//           : [],
//       );
//       setTopProducts(
//         Array.isArray(productsRes.data?.data?.products)
//           ? productsRes.data?.data?.products
//           : [],
//       );
//     } catch (error: any) {
//       console.error("Dashboard data fetch error:", error);
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Calculations
//   const avgOrderValue = useMemo(() => {
//     if (!stats?.totalRevenue || !stats?.totalOrders) return 0;
//     return Math.round(stats.totalRevenue / stats.totalOrders);
//   }, [stats]);

//   const targetProgress = useMemo(() => {
//     if (!stats?.totalRevenue) return 0;
//     const progress = (stats.totalRevenue / MONTHLY_TARGET) * 100;
//     return Math.min(progress, 100);
//   }, [stats]);

//   // Handle Export
//   const handleExport = () => {
//     if (monthlyRevenue.length === 0) {
//       toast.error("No data to export");
//       return;
//     }
//     const reportData = monthlyRevenue.map((item) => ({
//       Month: item.monthName,
//       Orders: item.orders || 0,
//       Revenue: `₹${(item.revenue || 0).toLocaleString("en-IN")}`,
//     }));
//     downloadCSV(
//       reportData,
//       `Dashboard_Report_${new Date().toISOString().split("T")[0]}`,
//     );
//     toast.success("Report downloaded!");
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <StatsSkeleton />
//         <div className="grid gap-6 lg:grid-cols-3">
//           <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
//           <Skeleton className="h-80 rounded-2xl" />
//         </div>
//       </div>
//     );
//   }

//   if (!hasMounted) {
//     return <StatsSkeleton />;
//   }

//   return (
//     <div className="space-y-6 pb-10">
//       {/* --- HEADER --- */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold text-white tracking-tight">
//             Dashboard
//           </h1>
//           <p className="mt-1 text-gray-400 text-sm">
//             Overview of your store's performance today.
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <div className="relative group">
//             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
//             <select
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
//             >
//               <option value="7days" className="bg-gray-900">
//                 Last 7 Days
//               </option>
//               <option value="30days" className="bg-gray-900">
//                 Last 30 Days
//               </option>
//               <option value="month" className="bg-gray-900">
//                 This Month
//               </option>
//             </select>
//           </div>

//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20 backdrop-blur-sm"
//           >
//             <Download className="h-4 w-4" /> Report
//           </button>

//           <button
//             onClick={fetchDashboardData}
//             className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
//           >
//             <RefreshCw
//               className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
//             />
//           </button>
//         </div>
//       </motion.div>

//       {/* --- 1. KPI SECTION --- */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <StatsCard
//           title="Total Revenue"
//           value={stats?.totalRevenue || 0}
//           prefix="₹"
//           icon={DollarSign}
//           iconColor="text-emerald-400"
//           iconBg="bg-emerald-500/10"
//           description={`+${formatCurrency(stats?.todayRevenue || 0)} today`}
//           delay={0}
//         />
//         <StatsCard
//           title="Total Orders"
//           value={stats?.totalOrders || 0}
//           icon={ShoppingCart}
//           iconColor="text-blue-400"
//           iconBg="bg-blue-500/10"
//           description={`+${stats?.todayOrders || 0} today`}
//           delay={0.1}
//         />
//         <StatsCard
//           title="Avg Order Value"
//           value={avgOrderValue}
//           prefix="₹"
//           icon={TrendingUp}
//           iconColor="text-purple-400"
//           iconBg="bg-purple-500/10"
//           description="Per transaction"
//           delay={0.2}
//         />
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className={`${glassCard} border-l-4 ${
//             stats?.pendingOrders > 0
//               ? "border-l-amber-500"
//               : "border-l-gray-600"
//           }`}
//         >
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-400">
//                 Pending Actions
//               </p>
//               <h3 className="text-2xl font-bold text-white mt-1">
//                 {stats?.pendingOrders || 0}
//               </h3>
//               <p className="text-xs text-amber-400 mt-1">Orders need packing</p>
//             </div>
//             <div className="p-2 bg-amber-500/10 rounded-lg">
//               <AlertCircle className="h-5 w-5 text-amber-400" />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* --- 2. MAIN CONTENT: Revenue & Forecast --- */}
//       <div className="grid gap-6 lg:grid-cols-3 min-h-[400px]">
//         {/* Left: Revenue Chart (2 Cols) */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className={`${glassCard} lg:col-span-2 flex flex-col`}
//         >
//           <div className="mb-6 flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold text-white">
//                 Revenue Trends
//               </h3>
//               <p className="text-sm text-gray-400">Performance over time</p>
//             </div>
//             <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
//               <TrendingUp className="h-3 w-3" /> +12.5% vs last period
//             </div>
//           </div>
//           <div className="flex-1 min-h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={monthlyRevenue}>
//                 <defs>
//                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke="rgba(255,255,255,0.05)"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="monthName"
//                   stroke="#6b7280"
//                   style={{ fontSize: "12px" }}
//                   axisLine={false}
//                   tickLine={false}
//                   dy={10}
//                 />
//                 <YAxis
//                   stroke="#6b7280"
//                   style={{ fontSize: "12px" }}
//                   axisLine={false}
//                   tickLine={false}
//                   tickFormatter={(val) => `₹${val / 1000}k`}
//                 />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#0f0f11",
//                     borderColor: "#333",
//                     borderRadius: "12px",
//                     color: "#fff",
//                   }}
//                   formatter={(val: any) => [formatCurrency(val), "Revenue"]}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#10b981"
//                   strokeWidth={3}
//                   fill="url(#colorRevenue)"
//                   animationDuration={1500}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>

//         {/* Right: Targets & AI Forecast (1 Col) */}
//         <div className="flex flex-col gap-6">
//           {/* Sales Target Widget */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             className={glassCard}
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-base font-semibold text-white flex items-center gap-2">
//                 <Target className="h-4 w-4 text-blue-400" /> Monthly Target
//               </h3>
//               <span className="text-xs text-gray-400">
//                 Goal: {formatCurrency(MONTHLY_TARGET)}
//               </span>
//             </div>

//             <div className="relative h-32 flex items-center justify-center">
//               <PieChart width={120} height={120}>
//                 <Pie
//                   data={[
//                     { value: targetProgress },
//                     { value: 100 - targetProgress },
//                   ]}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={45}
//                   outerRadius={55}
//                   startAngle={90}
//                   endAngle={-270}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   <Cell fill="#3b82f6" />
//                   <Cell fill="rgba(255,255,255,0.1)" />
//                 </Pie>
//               </PieChart>
//               <div className="absolute flex flex-col items-center">
//                 <span className="text-2xl font-bold text-white">
//                   {Math.round(targetProgress)}%
//                 </span>
//               </div>
//             </div>
//             <p className="text-center text-sm text-gray-400 mt-2">
//               {formatCurrency(MONTHLY_TARGET - (stats?.totalRevenue || 0))} more
//               to reach goal
//             </p>
//           </motion.div>

//           {/* 🔥 NEW: Inventory Forecast Widget (Replaced Trending) */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.1 }}
//             className="flex-1"
//           >
//             <InventoryForecast />
//           </motion.div>
//         </div>
//       </div>

//       {/* --- 3. HEATMAP & ACTIONS --- */}
//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Left: Heatmap (2 Cols) */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="lg:col-span-2"
//         >
//           <div className="mb-4">
//             <h3 className="text-lg font-bold text-white">
//               Live Sales Activity
//             </h3>
//             <p className="text-sm text-gray-400">
//               Real-time order locations & density
//             </p>
//           </div>
//           <SalesHeatmap />
//         </motion.div>

//         {/* Right: Quick Actions (1 Col) */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="grid grid-cols-2 gap-4 h-full content-start pt-14"
//         >
//           <Link href="/dashboard/products/add" className={actionBtn}>
//             <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
//               <Plus className="h-6 w-6" />
//             </div>
//             <span className="text-sm font-medium text-white">Add Product</span>
//           </Link>
//           <Link href="/dashboard/orders" className={actionBtn}>
//             <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
//               <Package className="h-6 w-6" />
//             </div>
//             <span className="text-sm font-medium text-white">Orders</span>
//           </Link>
//           <div className={actionBtn}>
//             <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
//               <AlertCircle className="h-6 w-6" />
//             </div>
//             <span className="text-sm font-medium text-white">Alerts</span>
//           </div>
//           <div className={actionBtn}>
//             <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
//               <DollarSign className="h-6 w-6" />
//             </div>
//             <span className="text-sm font-medium text-white">Finances</span>
//           </div>
//         </motion.div>
//       </div>

//       {/* --- 4. RECENT ORDERS TABLE --- */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={`${glassCard}`}
//       >
//         <div className="mb-6 flex justify-between items-center">
//           <h3 className="text-lg font-semibold text-white">
//             Recent Transactions
//           </h3>
//           <Link
//             href="/dashboard/orders"
//             className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
//           >
//             View All <ArrowRight className="h-3 w-3" />
//           </Link>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
//               <tr>
//                 <th className="px-4 py-3 rounded-l-lg">Order ID</th>
//                 <th className="px-4 py-3">Customer</th>
//                 <th className="px-4 py-3">Amount</th>
//                 <th className="px-4 py-3">Status</th>
//                 <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5 text-sm text-gray-300">
//               {recentOrders.length > 0 ? (
//                 recentOrders.map((order) => (
//                   <tr
//                     key={order._id}
//                     className="hover:bg-white/5 transition group cursor-pointer"
//                   >
//                     <td className="px-4 py-4 text-white font-medium group-hover:text-blue-400 transition-colors">
//                       {order.orderNumber}
//                     </td>
//                     <td className="px-4 py-4">{order.user?.name || "Guest"}</td>
//                     <td className="px-4 py-4 font-mono text-gray-200">
//                       {formatCurrency(order.totalAmount)}
//                     </td>
//                     <td className="px-4 py-4">
//                       <span
//                         className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(order.orderStatus)} border-opacity-20`}
//                       >
//                         {order.orderStatus}
//                       </span>
//                     </td>
//                     <td className="px-4 py-4 text-gray-500 text-right">
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="text-center py-8 text-gray-500">
//                     No recent orders found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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
import { StatsSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { DashboardService } from "@/lib/api";
import { toast } from "sonner";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { formatCurrency, getOrderStatusColor, downloadCSV } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes"; // ⭐ Import useTheme for Charts

// 🔥 IMPORT NEW COMPONENTS
const SalesHeatmap = dynamic(
  () => import("@/components/dashboard/SalesHeatmap"),
  {
    ssr: false,
  },
);

const InventoryForecast = dynamic(
  () => import("@/components/dashboard/InventoryForecast"),
  {
    ssr: false,
  },
);

// --- Styled Components / Utilities (UPDATED FOR LIGHT/DARK MODE) ---
const glassCard =
  "rounded-2xl border p-6 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 " +
  "border-zinc-200 bg-white hover:bg-zinc-50 " + // Light Mode
  "dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"; // Dark Mode

const actionBtn =
  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all cursor-pointer group h-full " +
  "border-zinc-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 " + // Light Mode
  "dark:border-white/10 dark:bg-white/5 dark:hover:bg-blue-500/20 dark:hover:border-blue-500/50 dark:hover:text-blue-400"; // Dark Mode

export default function DashboardPage() {
  const { theme } = useTheme(); // ⭐ Get current theme

  // --- State ---
  const [stats, setStats] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [hasMounted, setHasMounted] = useState(false);

  // Mock Target (Backend integration later)
  const MONTHLY_TARGET = 50000;

  useEffect(() => {
    setHasMounted(true);
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, monthlyRevRes, ordersRes, productsRes] =
        await Promise.all([
          DashboardService.getStats(),
          DashboardService.getMonthlyRevenue(),
          DashboardService.getRecentOrders(5),
          DashboardService.getTopSellingProducts(4),
        ]);

      setStats(statsRes.data?.data?.stats || statsRes.data?.stats || {});
      setMonthlyRevenue(
        Array.isArray(monthlyRevRes.data?.data?.data)
          ? monthlyRevRes.data?.data?.data
          : [],
      );
      setRecentOrders(
        Array.isArray(ordersRes.data?.data?.orders)
          ? ordersRes.data?.data?.orders
          : [],
      );
      setTopProducts(
        Array.isArray(productsRes.data?.data?.products)
          ? productsRes.data?.data?.products
          : [],
      );
    } catch (error: any) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle Export
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!hasMounted) {
    return <StatsSkeleton />;
  }

  // ⭐ Chart Colors based on Theme
  const chartGridColor =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "#e5e7eb";
  const chartTextColor = theme === "dark" ? "#9ca3af" : "#6b7280";
  const pieEmptyColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  return (
    <div className="space-y-6 pb-10">
      {/* --- HEADER --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          {/* Fixed Text Colors */}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">
            Overview of your store's performance today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-gray-400 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all border
              bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50
              dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
            >
              <option
                value="7days"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                Last 7 Days
              </option>
              <option
                value="30days"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                Last 30 Days
              </option>
              <option
                value="month"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                This Month
              </option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 backdrop-blur-sm"
          >
            <Download className="h-4 w-4" /> Report
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl border transition-all
            bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900
            dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </motion.div>

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
          delay={0.1}
        />
        <StatsCard
          title="Avg Order Value"
          value={avgOrderValue}
          prefix="₹"
          icon={TrendingUp}
          iconColor="text-purple-500 dark:text-purple-400"
          iconBg="bg-purple-100 dark:bg-purple-500/10"
          description="Per transaction"
          delay={0.2}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${glassCard} border-l-4 ${
            stats?.pendingOrders > 0
              ? "border-l-amber-500"
              : "border-l-zinc-300 dark:border-l-gray-600"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-gray-400">
                Pending Actions
              </p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">
                {stats?.pendingOrders || 0}
              </h3>
              <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                Orders need packing
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- 2. MAIN CONTENT: Revenue & Forecast --- */}
      <div className="grid gap-6 lg:grid-cols-3 min-h-[400px]">
        {/* Left: Revenue Chart (2 Cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${glassCard} lg:col-span-2 flex flex-col`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Revenue Trends
              </h3>
              <p className="text-sm text-zinc-500 dark:text-gray-400">
                Performance over time
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
              bg-emerald-100 text-emerald-700 border-emerald-200 border
              dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            >
              <TrendingUp className="h-3 w-3" /> +12.5% vs last period
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartGridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="monthName"
                  stroke={chartTextColor}
                  style={{ fontSize: "12px" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={chartTextColor}
                  style={{ fontSize: "12px" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f0f11" : "#fff",
                    borderColor: theme === "dark" ? "#333" : "#e5e7eb",
                    borderRadius: "12px",
                    color: theme === "dark" ? "#fff" : "#1f2937",
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
          </div>
        </motion.div>

        {/* Right: Targets & AI Forecast (1 Col) */}
        <div className="flex flex-col gap-6">
          {/* Sales Target Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={glassCard}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                <Target className="h-4 w-4 text-blue-500" /> Monthly Target
              </h3>
              <span className="text-xs text-zinc-500 dark:text-gray-400">
                Goal: {formatCurrency(MONTHLY_TARGET)}
              </span>
            </div>

            <div className="relative h-32 flex items-center justify-center">
              <PieChart width={120} height={120}>
                <Pie
                  data={[
                    { value: targetProgress },
                    { value: 100 - targetProgress },
                  ]}
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
                  <Cell fill={pieEmptyColor} />
                </Pie>
              </PieChart>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {Math.round(targetProgress)}%
                </span>
              </div>
            </div>
            <p className="text-center text-sm mt-2 text-zinc-500 dark:text-gray-400">
              {formatCurrency(MONTHLY_TARGET - (stats?.totalRevenue || 0))} more
              to reach goal
            </p>
          </motion.div>

          {/* Forecast Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <InventoryForecast />
          </motion.div>
        </div>
      </div>

      {/* --- 3. HEATMAP & ACTIONS --- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Heatmap (2 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Live Sales Activity
            </h3>
            <p className="text-sm text-zinc-500 dark:text-gray-400">
              Real-time order locations & density
            </p>
          </div>
          <SalesHeatmap />
        </motion.div>

        {/* Right: Quick Actions (1 Col) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 h-full content-start pt-14"
        >
          <Link href="/dashboard/products/add" className={actionBtn}>
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center transition-colors
              bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white
              dark:bg-blue-500/20 dark:text-blue-400"
            >
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Add Product
            </span>
          </Link>
          <Link href="/dashboard/orders" className={actionBtn}>
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center transition-colors
              bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white
              dark:bg-purple-500/20 dark:text-purple-400"
            >
              <Package className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Orders
            </span>
          </Link>
          <div className={actionBtn}>
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center transition-colors
              bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white
              dark:bg-orange-500/20 dark:text-orange-400"
            >
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Alerts
            </span>
          </div>
          <div className={actionBtn}>
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center transition-colors
              bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white
              dark:bg-green-500/20 dark:text-green-400"
            >
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Finances
            </span>
          </div>
        </motion.div>
      </div>

      {/* --- 4. RECENT ORDERS TABLE --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={glassCard}
      >
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Transactions
          </h3>
          <Link
            href="/dashboard/orders"
            className="text-xs font-medium flex items-center gap-1
            text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead
              className="text-xs uppercase font-semibold
              bg-zinc-50 text-zinc-500
              dark:bg-white/5 dark:text-gray-400"
            >
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
              </tr>
            </thead>
            <tbody
              className="text-sm divide-y 
              divide-zinc-100 text-zinc-700
              dark:divide-white/5 dark:text-gray-300"
            >
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition group cursor-pointer
                    hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    <td
                      className="px-4 py-4 font-medium transition-colors
                      text-zinc-900 group-hover:text-blue-600
                      dark:text-white dark:group-hover:text-blue-400"
                    >
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4">{order.user?.name || "Guest"}</td>
                    <td className="px-4 py-4 font-mono text-zinc-900 dark:text-gray-200">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(
                          order.orderStatus,
                        )} border-opacity-20`}
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
      </motion.div>
    </div>
  );
}
