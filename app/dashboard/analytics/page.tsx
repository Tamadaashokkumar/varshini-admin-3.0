// "use client";

// import { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
// } from "recharts";
// import {
//   DollarSign,
//   ShoppingCart,
//   Users,
//   Clock,
//   Download,
//   Calendar,
//   MapPin,
//   CreditCard,
//   TrendingUp,
//   AlertTriangle,
//   PackageX,
//   Zap,
// } from "lucide-react";
// import { formatCurrency } from "@/lib/utils";
// import { DashboardService } from "@/lib/api";
// import { toast } from "sonner";

// // --- Colors for Charts ---
// const COLORS = [
//   "#3B82F6",
//   "#10B981",
//   "#F59E0B",
//   "#EF4444",
//   "#8B5CF6",
//   "#EC4899",
// ];

// // --- Types ---
// type DateRangeOption = "7days" | "30days" | "thisMonth" | "lastMonth" | "all";
// type InventoryTab = "low" | "dead" | "fast";

// export default function AnalyticsPage() {
//   const [loading, setLoading] = useState(true);

//   // State for Data
//   const [kpi, setKpi] = useState<any>({});
//   const [funnelData, setFunnelData] = useState<any[]>([]);
//   const [paymentData, setPaymentData] = useState<any[]>([]);
//   const [geoData, setGeoData] = useState<any[]>([]);
//   const [inventoryData, setInventoryData] = useState<any>({
//     lowStock: [],
//     deadStock: [],
//     fastMoving: [],
//   });
//   const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
//   const [salesByCategory, setSalesByCategory] = useState<any[]>([]);

//   // Filter States
//   const [dateRange, setDateRange] = useState<DateRangeOption>("30days");
//   const [activeInvTab, setActiveInvTab] = useState<InventoryTab>("low");

//   // --- Helper: Get Date Objects based on selection ---
//   const getDateParams = () => {
//     const end = new Date();
//     const start = new Date();

//     switch (dateRange) {
//       case "7days":
//         start.setDate(end.getDate() - 7);
//         break;
//       case "30days":
//         start.setDate(end.getDate() - 30);
//         break;
//       case "thisMonth":
//         start.setDate(1);
//         break;
//       case "lastMonth":
//         start.setMonth(start.getMonth() - 1);
//         start.setDate(1);
//         end.setDate(0);
//         break;
//       case "all":
//         return {}; // No filter
//     }
//     return { startDate: start.toISOString(), endDate: end.toISOString() };
//   };

//   // --- Fetch Data ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const dateParams = getDateParams();

//         // Parallel API Calls
//         const [advancedRes, invRes, growthRes, categoryRes] = await Promise.all(
//           [
//             DashboardService.getAdvancedAnalytics(dateParams),
//             DashboardService.getInventoryHealth(), // Inventory usually doesn't depend on date range filter
//             DashboardService.getCustomerGrowth(dateParams),
//             DashboardService.getSalesByCategory(dateParams),
//           ],
//         );

//         // 1. Process Advanced Analytics (KPI, Funnel, Geo, Payments)
//         const advData = advancedRes.data?.data || {};
//         setKpi(advData.kpi || {});
//         setFunnelData(advData.funnel || []);
//         setGeoData(advData.geo || []);
//         setPaymentData(advData.paymentMethods || []);

//         // 2. Process Inventory
//         const inv = invRes.data?.data || {};
//         setInventoryData({
//           lowStock: inv.lowStock?.products || [],
//           deadStock: inv.deadStock?.products || [],
//           fastMoving: inv.fastMoving || [],
//         });

//         // 3. Process Growth
//         const growth = growthRes.data?.data?.data || [];
//         setCustomerGrowth(
//           growth.map((item: any) => ({
//             name: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day || 1).padStart(2, "0")}`,
//             value: item.newCustomers,
//           })),
//         );

//         // 4. Sales Category
//         setSalesByCategory(categoryRes.data?.data?.data || []);
//       } catch (error) {
//         console.error("Analytics fetch error:", error);
//         toast.error("Failed to load analytics data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [dateRange]); // Re-run when date filter changes

//   // --- Export Handler ---
//   const handleExport = async () => {
//     try {
//       toast.loading("Preparing report...");
//       const dateParams = getDateParams();
//       const res = await DashboardService.getExportData(dateParams);

//       // Convert JSON to CSV logic (Simplified)
//       const orders = res.data?.data?.orders || [];
//       if (orders.length === 0) {
//         toast.dismiss();
//         toast.info("No data to export for this period");
//         return;
//       }

//       const headers = [
//         "Order ID",
//         "Date",
//         "Customer",
//         "Amount",
//         "Status",
//         "Payment",
//       ];
//       const csvContent = [
//         headers.join(","),
//         ...orders.map((o: any) =>
//           [
//             o.orderNumber,
//             new Date(o.createdAt).toLocaleDateString(),
//             o.user?.name || "Guest",
//             o.totalAmount,
//             o.orderStatus,
//             o.paymentMethod,
//           ].join(","),
//         ),
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `sales-report-${dateRange}.csv`;
//       a.click();
//       toast.dismiss();
//       toast.success("Report downloaded");
//     } catch (e) {
//       toast.dismiss();
//       toast.error("Export failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-8 text-center text-gray-400 animate-pulse">
//         Loading Analytics...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-20 px-2 md:px-0">
//       {/* --- HEADER: Title & Filters --- */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-white">Business Analytics</h1>
//           <p className="text-gray-400 mt-1 text-sm">
//             Performance metrics and insights
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           {/* Date Filter Dropdown */}
//           <div className="relative">
//             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <select
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
//               className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
//             >
//               <option value="7days" className="bg-gray-900">
//                 Last 7 Days
//               </option>
//               <option value="30days" className="bg-gray-900">
//                 Last 30 Days
//               </option>
//               <option value="thisMonth" className="bg-gray-900">
//                 This Month
//               </option>
//               <option value="lastMonth" className="bg-gray-900">
//                 Last Month
//               </option>
//               <option value="all" className="bg-gray-900">
//                 All Time
//               </option>
//             </select>
//           </div>

//           {/* Export Button */}
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
//           >
//             <Download className="h-4 w-4" />
//             Export Report
//           </button>
//         </div>
//       </div>

//       {/* --- 1. KPI CARDS (AOV & LTV Added) --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard
//           title="Total Revenue"
//           value={formatCurrency(kpi.totalRevenue || 0)}
//           icon={DollarSign}
//           trend="+12% vs last period" // Static for now, can be dynamic
//           color="text-emerald-400"
//           bg="bg-emerald-400/10"
//         />
//         <KPICard
//           title="Total Orders"
//           value={kpi.totalOrders || 0}
//           icon={ShoppingCart}
//           trend="Order Volume"
//           color="text-blue-400"
//           bg="bg-blue-400/10"
//         />
//         <KPICard
//           title="Avg. Order Value"
//           value={formatCurrency(Math.round(kpi.avgOrderValue || 0))}
//           icon={TrendingUp}
//           trend="Per Transaction"
//           color="text-purple-400"
//           bg="bg-purple-400/10"
//         />
//         <KPICard
//           title="Customer LTV"
//           value={formatCurrency(Math.round(kpi.customerLTV || 0))}
//           icon={Users}
//           trend="Lifetime Value"
//           color="text-amber-400"
//           bg="bg-amber-400/10"
//         />
//       </div>

//       {/* --- 2. MAIN CHARTS (Growth & Payments) --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Customer Growth Chart */}
//         <div className="lg:col-span-2 bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
//           <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//             <Users className="h-5 w-5 text-blue-400" /> Customer Acquisition
//           </h3>
//           <div className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={customerGrowth}>
//                 <defs>
//                   <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke="#374151"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="name"
//                   stroke="#9CA3AF"
//                   fontSize={12}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <YAxis
//                   stroke="#9CA3AF"
//                   fontSize={12}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#111827",
//                     borderColor: "#374151",
//                     borderRadius: "8px",
//                     color: "#fff",
//                   }}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#3B82F6"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorGrowth)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Payment Methods Pie Chart */}
//         <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
//           <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//             <CreditCard className="h-5 w-5 text-emerald-400" /> Payment Split
//           </h3>
//           <div className="h-72 relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={paymentData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="count"
//                   nameKey="_id"
//                 >
//                   {paymentData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={entry._id === "COD" ? "#F59E0B" : "#10B981"}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value: number) => [value, "Orders"]}
//                   contentStyle={{
//                     backgroundColor: "#111827",
//                     borderColor: "#374151",
//                     color: "#fff",
//                   }}
//                 />
//                 <Legend verticalAlign="bottom" height={36} />
//               </PieChart>
//             </ResponsiveContainer>
//             {/* Center Text */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
//               <span className="text-2xl font-bold text-white">
//                 {kpi.totalOrders}
//               </span>
//               <p className="text-xs text-gray-400">Total</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- 3. ADVANCED ANALYSIS (Funnel & Geo) --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Order Status Funnel */}
//         <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
//           <h3 className="text-lg font-semibold text-white mb-6">
//             Order Status Funnel
//           </h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={funnelData}
//                 layout="vertical"
//                 margin={{ left: 20 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke="#374151"
//                   horizontal={false}
//                 />
//                 <XAxis type="number" stroke="#9CA3AF" hide />
//                 <YAxis
//                   dataKey="_id"
//                   type="category"
//                   stroke="#9CA3AF"
//                   width={80}
//                   tick={{ fill: "#E5E7EB" }}
//                 />
//                 <Tooltip
//                   cursor={{ fill: "rgba(255,255,255,0.05)" }}
//                   contentStyle={{
//                     backgroundColor: "#111827",
//                     borderColor: "#374151",
//                     color: "#fff",
//                   }}
//                 />
//                 <Bar
//                   dataKey="count"
//                   fill="#8B5CF6"
//                   radius={[0, 4, 4, 0]}
//                   barSize={20}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Top Cities (Geo) */}
//         <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
//           <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//             <MapPin className="h-5 w-5 text-red-400" /> Top Cities by Sales
//           </h3>
//           <div className="space-y-4">
//             {geoData.map((city, idx) => (
//               <div key={idx} className="relative">
//                 <div className="flex justify-between items-center text-sm mb-1">
//                   <span className="text-gray-300 font-medium">
//                     {city._id || "Unknown"}
//                   </span>
//                   <span className="text-white font-bold">
//                     {formatCurrency(city.revenue)}
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-700 rounded-full h-2">
//                   <div
//                     className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
//                     style={{
//                       width: `${(city.revenue / kpi.totalRevenue) * 100}%`,
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}
//             {geoData.length === 0 && (
//               <p className="text-gray-500 text-center py-4">
//                 No location data available
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- 4. INVENTORY HEALTH SECTION --- */}
//       <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 overflow-hidden">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//           <h3 className="text-lg font-semibold text-white">Inventory Health</h3>

//           {/* Inventory Tabs */}
//           <div className="flex bg-black/40 p-1 rounded-lg w-fit">
//             <button
//               onClick={() => setActiveInvTab("low")}
//               className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${activeInvTab === "low" ? "bg-red-500/20 text-red-400 shadow-sm" : "text-gray-400 hover:text-white"}`}
//             >
//               <AlertTriangle className="h-3 w-3" /> Low Stock
//             </button>
//             <button
//               onClick={() => setActiveInvTab("dead")}
//               className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${activeInvTab === "dead" ? "bg-gray-600/20 text-gray-300 shadow-sm" : "text-gray-400 hover:text-white"}`}
//             >
//               <PackageX className="h-3 w-3" /> Dead Stock
//             </button>
//             <button
//               onClick={() => setActiveInvTab("fast")}
//               className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${activeInvTab === "fast" ? "bg-green-500/20 text-green-400 shadow-sm" : "text-gray-400 hover:text-white"}`}
//             >
//               <Zap className="h-3 w-3" /> Fast Moving
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
//               <tr>
//                 <th className="px-6 py-4 rounded-tl-lg">Product</th>
//                 <th className="px-6 py-4">Stock</th>
//                 <th className="px-6 py-4">Price</th>
//                 <th className="px-6 py-4 rounded-tr-lg">Metric</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5 text-sm">
//               {/* Logic to choose which array to map based on activeTab */}
//               {(activeInvTab === "low"
//                 ? inventoryData.lowStock
//                 : activeInvTab === "dead"
//                   ? inventoryData.deadStock
//                   : inventoryData.fastMoving
//               ).map((item: any, idx: number) => (
//                 <tr
//                   key={item._id || idx}
//                   className="hover:bg-white/5 transition"
//                 >
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
//                         {item.images?.[0] && (
//                           <img
//                             src={item.images[0].url}
//                             alt=""
//                             className="h-full w-full object-cover"
//                           />
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-white font-medium line-clamp-1">
//                           {item.name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {item.partNumber}
//                         </p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${item.stock <= 5 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
//                     >
//                       {item.stock} Units
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-white font-medium">
//                     {formatCurrency(item.price)}
//                   </td>
//                   <td className="px-6 py-4 text-gray-400">
//                     {activeInvTab === "fast"
//                       ? `${item.totalSales} Sold`
//                       : activeInvTab === "dead"
//                         ? `Since ${new Date(item.createdAt).toLocaleDateString()}`
//                         : "Reorder Now"}
//                   </td>
//                 </tr>
//               ))}
//               {/* Empty State */}
//               {(activeInvTab === "low"
//                 ? inventoryData.lowStock
//                 : activeInvTab === "dead"
//                   ? inventoryData.deadStock
//                   : inventoryData.fastMoving
//               ).length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={4}
//                     className="px-6 py-8 text-center text-gray-500"
//                   >
//                     Excellent! No items found in this category.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- Helper Component: KPI Card ---
// function KPICard({ title, value, trend, icon: Icon, color, bg }: any) {
//   return (
//     <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.02] transition-colors">
//       <div className="flex justify-between items-start">
//         <div>
//           <p className="text-gray-400 text-sm font-medium">{title}</p>
//           <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
//           <p className="text-xs text-gray-500 mt-1">{trend}</p>
//         </div>
//         <div className={`p-3 rounded-xl ${bg}`}>
//           <Icon className={`h-6 w-6 ${color}`} />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Download,
  Calendar,
  MapPin,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  PackageX,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardService } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes"; // ⭐ Import useTheme

// --- Types ---
type DateRangeOption = "7days" | "30days" | "thisMonth" | "lastMonth" | "all";
type InventoryTab = "low" | "dead" | "fast";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // ⭐ Get current theme

  // State for Data
  const [kpi, setKpi] = useState<any>({});
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any>({
    lowStock: [],
    deadStock: [],
    fastMoving: [],
  });
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);

  // Filter States
  const [dateRange, setDateRange] = useState<DateRangeOption>("30days");
  const [activeInvTab, setActiveInvTab] = useState<InventoryTab>("low");

  // --- Helper: Get Date Objects based on selection ---
  const getDateParams = () => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "7days":
        start.setDate(end.getDate() - 7);
        break;
      case "30days":
        start.setDate(end.getDate() - 30);
        break;
      case "thisMonth":
        start.setDate(1);
        break;
      case "lastMonth":
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
        break;
      case "all":
        return {}; // No filter
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dateParams = getDateParams();

        // Parallel API Calls
        const [advancedRes, invRes, growthRes, categoryRes] = await Promise.all(
          [
            DashboardService.getAdvancedAnalytics(dateParams),
            DashboardService.getInventoryHealth(),
            DashboardService.getCustomerGrowth(dateParams),
            DashboardService.getSalesByCategory(dateParams),
          ],
        );

        // 1. Process Advanced Analytics (KPI, Funnel, Geo, Payments)
        const advData = advancedRes.data?.data || {};
        setKpi(advData.kpi || {});
        setFunnelData(advData.funnel || []);
        setGeoData(advData.geo || []);
        setPaymentData(advData.paymentMethods || []);

        // 2. Process Inventory
        const inv = invRes.data?.data || {};
        setInventoryData({
          lowStock: inv.lowStock?.products || [],
          deadStock: inv.deadStock?.products || [],
          fastMoving: inv.fastMoving || [],
        });

        // 3. Process Growth
        const growth = growthRes.data?.data?.data || [];
        setCustomerGrowth(
          growth.map((item: any) => ({
            name: `${item._id.year}-${String(item._id.month).padStart(
              2,
              "0",
            )}-${String(item._id.day || 1).padStart(2, "0")}`,
            value: item.newCustomers,
          })),
        );

        // 4. Sales Category
        setSalesByCategory(categoryRes.data?.data?.data || []);
      } catch (error) {
        console.error("Analytics fetch error:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // --- Export Handler ---
  const handleExport = async () => {
    try {
      toast.loading("Preparing report...");
      const dateParams = getDateParams();
      const res = await DashboardService.getExportData(dateParams);

      // Convert JSON to CSV logic (Simplified)
      const orders = res.data?.data?.orders || [];
      if (orders.length === 0) {
        toast.dismiss();
        toast.info("No data to export for this period");
        return;
      }

      const headers = [
        "Order ID",
        "Date",
        "Customer",
        "Amount",
        "Status",
        "Payment",
      ];
      const csvContent = [
        headers.join(","),
        ...orders.map((o: any) =>
          [
            o.orderNumber,
            new Date(o.createdAt).toLocaleDateString(),
            o.user?.name || "Guest",
            o.totalAmount,
            o.orderStatus,
            o.paymentMethod,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${dateRange}.csv`;
      a.click();
      toast.dismiss();
      toast.success("Report downloaded");
    } catch (e) {
      toast.dismiss();
      toast.error("Export failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-gray-400 animate-pulse">
        Loading Analytics...
      </div>
    );
  }

  // ⭐ Dynamic Chart Colors based on Theme
  const isDark = theme === "dark";
  const chartGridColor = isDark ? "#374151" : "#e5e7eb"; // Dark Gray / Light Gray
  const chartTextColor = isDark ? "#9CA3AF" : "#6b7280"; // Light Gray / Dark Gray
  const tooltipStyle = {
    backgroundColor: isDark ? "#111827" : "#fff",
    borderColor: isDark ? "#374151" : "#e5e7eb",
    borderRadius: "12px",
    color: isDark ? "#fff" : "#18181b",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  // --- Common Styles ---
  const cardClass =
    "rounded-2xl border p-6 backdrop-blur-sm transition-all border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900/50";
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";

  return (
    <div className="space-y-6 pb-20 px-2 md:px-0">
      {/* --- HEADER: Title & Filters --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>
            Business Analytics
          </h1>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Performance metrics and insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative group">
            <Calendar
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`}
            />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-colors border
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
                value="thisMonth"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                This Month
              </option>
              <option
                value="lastMonth"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                Last Month
              </option>
              <option
                value="all"
                className="text-zinc-900 dark:text-white dark:bg-gray-900"
              >
                All Time
              </option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* --- 1. KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(kpi.totalRevenue || 0)}
          icon={DollarSign}
          trend="+12% vs last period"
          color="text-emerald-500 dark:text-emerald-400"
          bg="bg-emerald-100 dark:bg-emerald-400/10"
        />
        <KPICard
          title="Total Orders"
          value={kpi.totalOrders || 0}
          icon={ShoppingCart}
          trend="Order Volume"
          color="text-blue-500 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-400/10"
        />
        <KPICard
          title="Avg. Order Value"
          value={formatCurrency(Math.round(kpi.avgOrderValue || 0))}
          icon={TrendingUp}
          trend="Per Transaction"
          color="text-purple-500 dark:text-purple-400"
          bg="bg-purple-100 dark:bg-purple-400/10"
        />
        <KPICard
          title="Customer LTV"
          value={formatCurrency(Math.round(kpi.customerLTV || 0))}
          icon={Users}
          trend="Lifetime Value"
          color="text-amber-500 dark:text-amber-400"
          bg="bg-amber-100 dark:bg-amber-400/10"
        />
      </div>

      {/* --- 2. MAIN CHARTS (Growth & Payments) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Growth Chart */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <h3
            className={`text-lg font-semibold mb-6 flex items-center gap-2 ${textPrimary}`}
          >
            <Users className="h-5 w-5 text-blue-500" /> Customer Acquisition
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowth}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartGridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartTextColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={chartTextColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className={cardClass}>
          <h3
            className={`text-lg font-semibold mb-6 flex items-center gap-2 ${textPrimary}`}
          >
            <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Split
          </h3>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                  stroke={isDark ? "none" : "#fff"}
                  strokeWidth={2}
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry._id === "COD" ? "#F59E0B" : "#10B981"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Orders"]}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className={textSecondary}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className={`text-2xl font-bold ${textPrimary}`}>
                {kpi.totalOrders}
              </span>
              <p className={`text-xs ${textSecondary}`}>Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. ADVANCED ANALYSIS (Funnel & Geo) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Funnel */}
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-6 ${textPrimary}`}>
            Order Status Funnel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartGridColor}
                  horizontal={false}
                />
                <XAxis type="number" stroke={chartTextColor} hide />
                <YAxis
                  dataKey="_id"
                  type="category"
                  stroke={chartTextColor}
                  width={80}
                  tick={{ fill: isDark ? "#E5E7EB" : "#374151" }}
                />
                <Tooltip
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  }}
                  contentStyle={tooltipStyle}
                />
                <Bar
                  dataKey="count"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities (Geo) */}
        <div className={cardClass}>
          <h3
            className={`text-lg font-semibold mb-6 flex items-center gap-2 ${textPrimary}`}
          >
            <MapPin className="h-5 w-5 text-red-500" /> Top Cities by Sales
          </h3>
          <div className="space-y-4">
            {geoData.map((city, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className={`font-medium ${textSecondary}`}>
                    {city._id || "Unknown"}
                  </span>
                  <span className={`font-bold ${textPrimary}`}>
                    {formatCurrency(city.revenue)}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(city.revenue / kpi.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {geoData.length === 0 && (
              <p className={`text-center py-4 ${textSecondary}`}>
                No location data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- 4. INVENTORY HEALTH SECTION --- */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Inventory Health
          </h3>

          {/* Inventory Tabs */}
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveInvTab("low")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 
              ${
                activeInvTab === "low"
                  ? "bg-red-100 text-red-600 shadow-sm dark:bg-red-500/20 dark:text-red-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> Low Stock
            </button>
            <button
              onClick={() => setActiveInvTab("dead")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 
              ${
                activeInvTab === "dead"
                  ? "bg-gray-200 text-gray-700 shadow-sm dark:bg-gray-600/20 dark:text-gray-300"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <PackageX className="h-3 w-3" /> Dead Stock
            </button>
            <button
              onClick={() => setActiveInvTab("fast")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 
              ${
                activeInvTab === "fast"
                  ? "bg-green-100 text-green-600 shadow-sm dark:bg-green-500/20 dark:text-green-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3" /> Fast Moving
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className="text-xs uppercase font-semibold
              bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-gray-400"
            >
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Product</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 rounded-tr-lg">Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm divide-zinc-100 dark:divide-white/5">
              {(activeInvTab === "low"
                ? inventoryData.lowStock
                : activeInvTab === "dead"
                  ? inventoryData.deadStock
                  : inventoryData.fastMoving
              ).map((item: any, idx: number) => (
                <tr
                  key={item._id || idx}
                  className="transition hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium line-clamp-1 ${textPrimary}`}
                        >
                          {item.name}
                        </p>
                        <p className={`text-xs ${textSecondary}`}>
                          {item.partNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.stock <= 5
                          ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      }`}
                    >
                      {item.stock} Units
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${textPrimary}`}>
                    {formatCurrency(item.price)}
                  </td>
                  <td className={`px-6 py-4 ${textSecondary}`}>
                    {activeInvTab === "fast"
                      ? `${item.totalSales} Sold`
                      : activeInvTab === "dead"
                        ? `Since ${new Date(item.createdAt).toLocaleDateString()}`
                        : "Reorder Now"}
                  </td>
                </tr>
              ))}
              {/* Empty State */}
              {(activeInvTab === "low"
                ? inventoryData.lowStock
                : activeInvTab === "dead"
                  ? inventoryData.deadStock
                  : inventoryData.fastMoving
              ).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-6 py-8 text-center ${textSecondary}`}
                  >
                    Excellent! No items found in this category.
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

// --- Helper Component: KPI Card (Corrected Styles) ---
function KPICard({ title, value, trend, icon: Icon, color, bg }: any) {
  return (
    <div className="rounded-2xl border p-6 backdrop-blur-sm transition-colors border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-gray-900/50 dark:hover:bg-white/[0.02]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 dark:text-gray-400 text-sm font-medium">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            {value}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-gray-500 mt-1">
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
