// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation"; // 🔥 Added Router
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Package,
//   Search,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   RefreshCcw,
//   Car,
//   AlertTriangle,
//   X,
//   DollarSign,
//   AlertCircle,
//   Zap,
//   CheckSquare,
//   Square,
//   FileText,
//   Filter,
//   Copy,
//   Save,
//   Download,
//   Upload,
//   ChevronLeft,
//   ChevronRight,
//   QrCode,
//   Printer,
// } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { TableSkeleton } from "@/components/ui/Skeleton";
// import { ProductService } from "@/lib/api";
// import { toast } from "sonner";
// import { formatCurrency, cn } from "@/lib/utils";
// import Image from "next/image";
// import Link from "next/link";

// // 🔥 Extended Interface
// interface Product {
//   _id: string;
//   name: string;
//   partNumber: string;
//   category: string;
//   price: number;
//   stock: number;
//   lowStockThreshold?: number;
//   images: { url: string }[];
//   compatibleModels?: { modelName: string }[];
//   flashSale?: {
//     isActive: boolean;
//     salePrice: number;
//   };
//   finalPrice?: number;
// }

// interface PaginationState {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

// // 🔥 NEW COMPONENT: Label Print Modal
// const LabelPrintModal = ({
//   product,
//   onClose,
// }: {
//   product: Product;
//   onClose: () => void;
// }) => {
//   const printRef = useRef<HTMLDivElement>(null);

//   const handlePrint = () => {
//     const printContent = printRef.current?.innerHTML;
//     const originalContents = document.body.innerHTML;

//     if (printContent) {
//       document.body.innerHTML = printContent;
//       window.print();
//       document.body.innerHTML = originalContents;
//       window.location.reload(); // Reload to restore event listeners
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="w-full max-w-sm bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
//       >
//         <div className="flex justify-between items-center p-4 border-b border-white/10">
//           <h3 className="text-white font-semibold flex items-center gap-2">
//             <QrCode className="h-5 w-5 text-blue-400" /> Print Label
//           </h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-white">
//             <X size={20} />
//           </button>
//         </div>

//         {/* Printable Area */}
//         <div
//           className="p-6 flex flex-col items-center justify-center bg-white text-black"
//           ref={printRef}
//         >
//           <div className="border-2 border-black p-4 rounded-lg w-full max-w-[300px] text-center space-y-2">
//             <h2 className="font-bold text-lg uppercase leading-tight">
//               {product.name}
//             </h2>
//             <p className="text-sm font-mono text-gray-700">
//               PN: {product.partNumber}
//             </p>

//             {/* QR Code Generated via API (No extra libs needed) */}
//             <div className="flex justify-center my-2">
//               <img
//                 src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${product.partNumber}`}
//                 alt="QR Code"
//                 className="w-24 h-24"
//               />
//             </div>

//             <div className="flex justify-between items-end border-t border-black pt-2 mt-2">
//               <div className="text-left">
//                 <p className="text-[10px] text-gray-600">Price</p>
//                 <p className="text-xl font-bold">
//                   {formatCurrency(product.finalPrice || product.price)}
//                 </p>
//               </div>
//               <p className="text-[10px] text-gray-500">Hyundai Spares</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 border-t border-white/10 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handlePrint}
//             className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
//           >
//             <Printer size={18} /> Print Now
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default function ProductsPage() {
//   const router = useRouter(); // 🔥 Added Router for Cloning
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // --- Filters & Pagination State ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     category: "All",
//     stockStatus: "All",
//     priceRange: "All",
//   });
//   const [pagination, setPagination] = useState<PaginationState>({
//     page: 1,
//     limit: 20,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPrevPage: false,
//   });

//   // --- Actions State ---
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editData, setEditData] = useState<{
//     price: number;
//     stock: number;
//   } | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // 🔥 New State for Label Modal
//   const [labelProduct, setLabelProduct] = useState<Product | null>(null);

//   useEffect(() => {
//     fetchProducts(1);
//   }, [filters]);

//   const fetchProducts = async (pageNo: number = 1) => {
//     try {
//       setIsLoading(true);
//       const params: any = {
//         limit: pagination.limit,
//         page: pageNo,
//         search: searchQuery,
//       };
//       if (filters.category !== "All") params.category = filters.category;
//       if (filters.stockStatus === "In Stock") params.inStock = "true";

//       if (filters.priceRange === "Under 1000") params.maxPrice = 1000;
//       if (filters.priceRange === "1000-5000") {
//         params.minPrice = 1000;
//         params.maxPrice = 5000;
//       }
//       if (filters.priceRange === "5000+") params.minPrice = 5000;

//       const response = await ProductService.getAll(params);
//       const incomingData =
//         response.data.data?.products || response.data.data || [];
//       const meta = response.data.pagination || {};

//       if (Array.isArray(incomingData)) setProducts(incomingData);
//       else setProducts([]);

//       if (meta.total !== undefined) {
//         setPagination({
//           page: meta.page || pageNo,
//           limit: meta.limit || 20,
//           total: meta.total || 0,
//           totalPages: meta.totalPages || 1,
//           hasNextPage: meta.hasNextPage || false,
//           hasPrevPage: meta.hasPrevPage || false,
//         });
//       }
//       setSelectedIds(new Set());
//     } catch (error: any) {
//       toast.error("Failed to fetch products");
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Handlers ---
//   const handleSelectAll = () => {
//     if (selectedIds.size === products.length) setSelectedIds(new Set());
//     else setSelectedIds(new Set(products.map((p) => p._id)));
//   };

//   const handleSelectOne = (id: string) => {
//     const newSet = new Set(selectedIds);
//     if (newSet.has(id)) newSet.delete(id);
//     else newSet.add(id);
//     setSelectedIds(newSet);
//   };

//   const handleBulkDelete = async () => {
//     if (!confirm(`Delete ${selectedIds.size} products?`)) return;
//     try {
//       toast.loading("Deleting...");
//       await Promise.all(
//         Array.from(selectedIds).map((id) => ProductService.delete(id)),
//       );
//       toast.dismiss();
//       toast.success("Products deleted");
//       fetchProducts(pagination.page);
//       setSelectedIds(new Set());
//     } catch (error) {
//       toast.dismiss();
//       toast.error("Failed to delete");
//     }
//   };

//   const handleExport = () => {
//     const dataToExport =
//       selectedIds.size > 0
//         ? products.filter((p) => selectedIds.has(p._id))
//         : products;
//     const headers = [
//       "Name",
//       "Part Number",
//       "Category",
//       "Price",
//       "Stock",
//       "Status",
//     ];
//     const rows = dataToExport.map((p) => [
//       `"${p.name}"`,
//       p.partNumber,
//       p.category,
//       p.price,
//       p.stock,
//       p.stock > 0 ? "In Stock" : "Out of Stock",
//     ]);
//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `products_export.csv`);
//     document.body.appendChild(link);
//     link.click();
//   };

//   const startEditing = (product: Product) => {
//     setEditingId(product._id);
//     setEditData({ price: product.price, stock: product.stock });
//   };

//   const saveEditing = async () => {
//     if (!editingId || !editData) return;
//     try {
//       setProducts((prev) =>
//         prev.map((p) => (p._id === editingId ? { ...p, ...editData } : p)),
//       );
//       const formData = new FormData();
//       formData.append("price", editData.price.toString());
//       formData.append("stock", editData.stock.toString());
//       await ProductService.update(editingId, formData);
//       toast.success("Product updated");
//       setEditingId(null);
//     } catch (error) {
//       toast.error("Failed to update");
//       fetchProducts(pagination.page);
//     }
//   };

//   // 🔥 5. Real Clone Functionality
//   const handleDuplicate = (product: Product) => {
//     toast.loading("Preparing to clone...");
//     // Redirect to Add page with source ID
//     router.push(`/dashboard/products/add?cloneId=${product._id}`);
//   };

//   // 🔥 7. Real Label Print Functionality
//   const handlePrintLabel = (product: Product) => {
//     setLabelProduct(product);
//   };

//   const executeDelete = async () => {
//     if (!deleteId) return;
//     setIsDeleting(true);
//     try {
//       await ProductService.delete(deleteId);
//       toast.success("Product deleted successfully");
//       setProducts((prev) => prev.filter((p) => p._id !== deleteId));
//       setDeleteId(null);
//     } catch (error: any) {
//       toast.error("Failed to delete product");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const totalProducts = pagination.total || products.length;
//   const lowStockCount = products.filter(
//     (p) => p.stock <= (p.lowStockThreshold || 5),
//   ).length;
//   const outOfStockCount = products.filter((p) => p.stock === 0).length;
//   const totalInventoryValue = products.reduce(
//     (sum, p) => sum + p.price * p.stock,
//     0,
//   );

//   const categories = [
//     "All",
//     "Engine",
//     "Brake",
//     "Electrical",
//     "Body",
//     "Accessories",
//     "Suspension",
//   ];

//   if (isLoading && products.length === 0)
//     return (
//       <div className="space-y-6">
//         <h1 className="text-3xl font-bold text-white">Products</h1>
//         {TableSkeleton ? (
//           <TableSkeleton />
//         ) : (
//           <div className="text-white">Loading...</div>
//         )}
//       </div>
//     );

//   return (
//     <div className="space-y-6 pb-20 px-2 md:px-0">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
//       >
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-white">
//             Products
//           </h1>
//           <p className="mt-1 text-sm md:text-base text-gray-400">
//             Manage your spare parts inventory
//           </p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => fetchProducts(1)}
//             className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
//           >
//             <RefreshCcw className="h-4 w-4" /> Refresh
//           </button>
//           <button
//             className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
//             title="Import Excel"
//           >
//             <Upload className="h-4 w-4" /> Import
//           </button>
//           <Link href="/dashboard/products/add">
//             {Button ? (
//               <Button variant="primary" size="md">
//                 <Plus className="h-4 w-4 mr-2" /> Add Product
//               </Button>
//             ) : (
//               <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
//                 <Plus className="h-4 w-4 mr-2" /> Add Product
//               </button>
//             )}
//           </Link>
//         </div>
//       </motion.div>

//       {/* Stats Cards */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
//       >
//         <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-colors hover:bg-white/10">
//           <div className="flex items-center gap-4">
//             <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
//               <Package className="h-6 w-6" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-400">
//                 Total Products
//               </p>
//               <p className="text-xl md:text-2xl font-bold text-white">
//                 {totalProducts}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-colors hover:bg-white/10">
//           <div className="flex items-center gap-4">
//             <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-400">
//               <AlertTriangle className="h-6 w-6" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-400">Low Stock</p>
//               <p className="text-xl md:text-2xl font-bold text-white">
//                 {lowStockCount}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-colors hover:bg-white/10">
//           <div className="flex items-center gap-4">
//             <div className="rounded-lg bg-red-500/10 p-3 text-red-400">
//               <AlertCircle className="h-6 w-6" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-400">Out of Stock</p>
//               <p className="text-xl md:text-2xl font-bold text-white">
//                 {outOfStockCount}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-colors hover:bg-white/10">
//           <div className="flex items-center gap-4">
//             <div className="rounded-lg bg-green-500/10 p-3 text-green-400">
//               <DollarSign className="h-6 w-6" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-400">
//                 Inventory Value
//               </p>
//               <p className="text-xl md:text-2xl font-bold text-white">
//                 {formatCurrency(totalInventoryValue)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Bulk Action Bar */}
//       <AnimatePresence>
//         {selectedIds.size > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4"
//           >
//             <div className="flex items-center gap-3">
//               <span className="text-blue-400 font-bold text-sm px-2">
//                 {selectedIds.size} Selected
//               </span>
//               <div className="h-4 w-px bg-blue-500/20"></div>
//               <button
//                 onClick={handleBulkDelete}
//                 className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition"
//               >
//                 <Trash2 size={14} /> Bulk Delete
//               </button>
//               <button
//                 onClick={handleExport}
//                 className="flex items-center gap-1 text-xs font-medium text-white hover:text-blue-300 transition"
//               >
//                 <Download size={14} /> Export Selected
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.5 }}
//         className="flex flex-col gap-4"
//       >
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="relative w-full md:flex-1 md:min-w-[300px]">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by name, part number..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && fetchProducts(1)}
//               className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-blue-500/30 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`p-2.5 rounded-xl border ${showFilters ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/10 text-gray-400"} transition hover:text-white`}
//             >
//               <Filter size={18} />
//             </button>
//             <button
//               onClick={handleExport}
//               className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition"
//               title="Export All to CSV"
//             >
//               <FileText size={18} />
//             </button>
//           </div>
//         </div>
//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="overflow-hidden"
//             >
//               <div className="p-4 bg-white/5 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="text-xs text-gray-500 mb-1 block">
//                     Category
//                   </label>
//                   <select
//                     value={filters.category}
//                     onChange={(e) =>
//                       setFilters({ ...filters, category: e.target.value })
//                     }
//                     className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
//                   >
//                     {categories.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500 mb-1 block">
//                     Stock Status
//                   </label>
//                   <select
//                     value={filters.stockStatus}
//                     onChange={(e) =>
//                       setFilters({ ...filters, stockStatus: e.target.value })
//                     }
//                     className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
//                   >
//                     <option value="All">All</option>
//                     <option value="In Stock">In Stock</option>
//                     <option value="Low Stock">Low Stock</option>
//                     <option value="Out of Stock">Out of Stock</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500 mb-1 block">
//                     Price Range
//                   </label>
//                   <select
//                     value={filters.priceRange}
//                     onChange={(e) =>
//                       setFilters({ ...filters, priceRange: e.target.value })
//                     }
//                     className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
//                   >
//                     <option value="All">All</option>
//                     <option value="Under 1000">Under ₹1000</option>
//                     <option value="1000-5000">₹1000 - ₹5000</option>
//                     <option value="5000+">₹5000+</option>
//                   </select>
//                 </div>
//                 <div className="flex items-end">
//                   <button
//                     onClick={() =>
//                       setFilters({
//                         category: "All",
//                         stockStatus: "All",
//                         priceRange: "All",
//                       })
//                     }
//                     className="text-xs text-red-400 hover:text-red-300 underline mb-2"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {/* Products Table */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3, duration: 0.5 }}
//         className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full whitespace-nowrap">
//             <thead>
//               <tr className="border-b border-white/10 bg-white/5">
//                 <th className="px-4 py-4 text-left w-10">
//                   <button
//                     onClick={handleSelectAll}
//                     className="flex items-center justify-center text-gray-500 hover:text-white"
//                   >
//                     {selectedIds.size > 0 &&
//                     selectedIds.size === products.length ? (
//                       <CheckSquare size={18} className="text-blue-500" />
//                     ) : (
//                       <Square size={18} />
//                     )}
//                   </button>
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Product
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Category
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Models
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Price
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Stock
//                 </th>
//                 <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {products.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="px-6 py-12 text-center text-gray-400"
//                   >
//                     <Package className="h-12 w-12 mx-auto mb-3 text-gray-600" />
//                     <p>No products found</p>
//                   </td>
//                 </tr>
//               ) : (
//                 products.map((product, index) => {
//                   const isSelected = selectedIds.has(product._id);
//                   const isEditing = editingId === product._id;
//                   return (
//                     <motion.tr
//                       key={product._id}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.05 * index, duration: 0.3 }}
//                       whileHover={{
//                         backgroundColor: "rgba(255, 255, 255, 0.02)",
//                       }}
//                       className={`transition-colors group ${isSelected ? "bg-blue-500/5" : ""}`}
//                     >
//                       <td className="px-4 py-4 text-center">
//                         <button onClick={() => handleSelectOne(product._id)}>
//                           {isSelected ? (
//                             <CheckSquare size={18} className="text-blue-500" />
//                           ) : (
//                             <Square
//                               size={18}
//                               className="text-gray-600 group-hover:text-gray-400"
//                             />
//                           )}
//                         </button>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
//                             {product.images && product.images[0] ? (
//                               <Image
//                                 src={product.images[0].url}
//                                 alt={product.name}
//                                 fill
//                                 className="object-cover transition-transform group-hover:scale-110"
//                               />
//                             ) : (
//                               <div className="flex h-full w-full items-center justify-center text-gray-500">
//                                 <Package className="h-5 w-5 md:h-6 md:w-6" />
//                               </div>
//                             )}
//                           </div>
//                           <div>
//                             <p className="font-medium text-white line-clamp-1 text-sm md:text-base">
//                               {product.name}
//                             </p>
//                             <code className="text-xs text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
//                               {product.partNumber}
//                             </code>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
//                           {product.category}
//                         </span>
//                       </td>
//                       <td className="px-4 md:px-6 py-4 max-w-[200px] whitespace-normal">
//                         <div className="flex flex-wrap gap-1">
//                           {product.compatibleModels
//                             ?.slice(0, 2)
//                             .map((model, i) => (
//                               <span
//                                 key={i}
//                                 className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 border border-white/10"
//                               >
//                                 <Car className="h-3 w-3 text-gray-500" />
//                                 {model.modelName}
//                               </span>
//                             ))}
//                           {product.compatibleModels?.length &&
//                             product.compatibleModels.length > 2 && (
//                               <span className="text-[10px] text-gray-500 pl-1">
//                                 +{product.compatibleModels.length - 2} more
//                               </span>
//                             )}
//                         </div>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         {isEditing ? (
//                           <input
//                             type="number"
//                             value={editData?.price}
//                             onChange={(e) =>
//                               setEditData({
//                                 ...editData!,
//                                 price: parseFloat(e.target.value),
//                               })
//                             }
//                             className="w-24 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
//                           />
//                         ) : (
//                           <div className="flex flex-col">
//                             <div className="flex items-center gap-1.5">
//                               <p
//                                 className="font-semibold text-white text-sm md:text-base cursor-pointer hover:text-blue-400 border-b border-dashed border-white/20"
//                                 onClick={() => startEditing(product)}
//                               >
//                                 {formatCurrency(
//                                   product.finalPrice || product.price,
//                                 )}
//                               </p>
//                               {product.flashSale?.isActive && (
//                                 <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400 animate-pulse" />
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         {isEditing ? (
//                           <input
//                             type="number"
//                             value={editData?.stock}
//                             onChange={(e) =>
//                               setEditData({
//                                 ...editData!,
//                                 stock: parseInt(e.target.value),
//                               })
//                             }
//                             className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
//                           />
//                         ) : (
//                           <div
//                             className="flex flex-col gap-1.5 cursor-pointer hover:opacity-80"
//                             onClick={() => startEditing(product)}
//                           >
//                             <span className="text-sm font-semibold text-white border-b border-dashed border-white/20 w-fit">
//                               {product.stock} Units
//                             </span>
//                             <span
//                               className={cn(
//                                 "text-[10px] w-fit font-medium px-2 py-0.5 rounded-full border",
//                                 product.stock > (product.lowStockThreshold || 5)
//                                   ? "bg-green-500/10 text-green-400 border-green-500/20"
//                                   : product.stock === 0
//                                     ? "bg-red-500/10 text-red-400 border-red-500/20"
//                                     : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
//                               )}
//                             >
//                               {product.stock > 0 ? "In Stock" : "Out of Stock"}
//                             </span>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           {isEditing ? (
//                             <>
//                               <button
//                                 onClick={saveEditing}
//                                 className="rounded-lg bg-green-500/20 p-2 text-green-400 hover:bg-green-500/30"
//                                 title="Save"
//                               >
//                                 <Save size={16} />
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setEditingId(null);
//                                   setEditData(null);
//                                 }}
//                                 className="rounded-lg bg-white/10 p-2 text-gray-400 hover:bg-white/20"
//                                 title="Cancel"
//                               >
//                                 <X size={16} />
//                               </button>
//                             </>
//                           ) : (
//                             <>
//                               <Link href={`/dashboard/products/${product._id}`}>
//                                 <motion.button
//                                   whileHover={{ scale: 1.1 }}
//                                   whileTap={{ scale: 0.9 }}
//                                   className="rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
//                                   title="View Details"
//                                 >
//                                   <Eye className="h-4 w-4" />
//                                 </motion.button>
//                               </Link>
//                               <Link
//                                 href={`/dashboard/products/edit/${product._id}`}
//                               >
//                                 <motion.button
//                                   whileHover={{ scale: 1.1 }}
//                                   whileTap={{ scale: 0.9 }}
//                                   className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400 transition-colors hover:bg-yellow-500/20"
//                                   title="Edit Product"
//                                 >
//                                   <Edit className="h-4 w-4" />
//                                 </motion.button>
//                               </Link>
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 onClick={() => handleDuplicate(product)}
//                                 className="rounded-lg bg-purple-500/10 p-2 text-purple-400 transition-colors hover:bg-purple-500/20"
//                                 title="Duplicate Product"
//                               >
//                                 <Copy className="h-4 w-4" />
//                               </motion.button>
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 onClick={() => handlePrintLabel(product)}
//                                 className="rounded-lg bg-white/10 p-2 text-gray-400 transition-colors hover:bg-white/20"
//                                 title="Print Label"
//                               >
//                                 <QrCode className="h-4 w-4" />
//                               </motion.button>
//                               <motion.button
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.9 }}
//                                 onClick={() => openDeleteModal(product._id)}
//                                 className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
//                                 title="Delete Product"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </motion.button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </motion.tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-white/5 p-4">
//           <p className="text-sm text-gray-400">
//             Showing{" "}
//             <span className="font-medium text-white">{products.length}</span> of{" "}
//             <span className="font-medium text-white">{pagination.total}</span>{" "}
//             products
//           </p>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => fetchProducts(pagination.page - 1)}
//               disabled={!pagination.hasPrevPage || isLoading}
//               className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft className="h-4 w-4" /> Previous
//             </button>
//             <div className="flex items-center gap-1">
//               <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
//                 {pagination.page}
//               </span>
//               <span className="text-gray-500 px-1">/</span>
//               <span className="text-gray-400 text-sm">
//                 {pagination.totalPages}
//               </span>
//             </div>
//             <button
//               onClick={() => fetchProducts(pagination.page + 1)}
//               disabled={!pagination.hasNextPage || isLoading}
//               className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       <AnimatePresence>
//         {deleteId && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={closeDeleteModal}
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
//             >
//               <button
//                 onClick={closeDeleteModal}
//                 className="absolute right-4 top-4 text-gray-400 hover:text-white"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//               <div className="flex flex-col items-center text-center">
//                 <div className="mb-4 rounded-full bg-red-500/10 p-4">
//                   <AlertTriangle className="h-8 w-8 text-red-500" />
//                 </div>
//                 <h3 className="mb-2 text-xl font-bold text-white">
//                   Delete Product?
//                 </h3>
//                 <p className="mb-6 text-sm text-gray-400 leading-relaxed">
//                   Are you sure you want to delete this product? <br /> This
//                   action cannot be undone.
//                 </p>
//                 <div className="flex w-full gap-3">
//                   <button
//                     onClick={closeDeleteModal}
//                     disabled={isDeleting}
//                     className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={executeDelete}
//                     disabled={isDeleting}
//                     className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 flex justify-center items-center gap-2"
//                   >
//                     {isDeleting ? (
//                       <>
//                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                         <span>Deleting...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Trash2 className="h-4 w-4" />
//                         <span>Delete Forever</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* 🔥 Print Modal */}
//       <AnimatePresence>
//         {labelProduct && (
//           <LabelPrintModal
//             product={labelProduct}
//             onClose={() => setLabelProduct(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCcw,
  Car,
  AlertTriangle,
  X,
  DollarSign,
  AlertCircle,
  CheckSquare,
  Square,
  FileText,
  Filter,
  Copy,
  Save,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Printer,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductService } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// ... (Product & LabelPrintModal code remains same) ...
// 🔥 Extended Interface
interface Product {
  _id: string;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  images: { url: string }[];
  compatibleModels?: { modelName: string }[];
  flashSale?: {
    isActive: boolean;
    salePrice: number;
  };
  finalPrice?: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 🔥 Label Print Modal Component (Kept same)
const LabelPrintModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  // ... (Code same as before) ...
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl border
            bg-white border-zinc-200 
            dark:bg-[#1e1e1e] dark:border-white/10"
      >
        <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-white/10">
          <h3 className="font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
            <QrCode className="h-5 w-5 text-blue-500 dark:text-blue-400" />{" "}
            Print Label
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div
          className="p-6 flex flex-col items-center justify-center bg-white text-black"
          ref={printRef}
        >
          <div className="border-2 border-black p-4 rounded-lg w-full max-w-[300px] text-center space-y-2">
            <h2 className="font-bold text-lg uppercase leading-tight text-black">
              {product.name}
            </h2>
            <p className="text-sm font-mono text-gray-700">
              PN: {product.partNumber}
            </p>

            <div className="flex justify-center my-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${product.partNumber}`}
                alt="QR Code"
                className="w-24 h-24"
              />
            </div>

            <div className="flex justify-between items-end border-t border-black pt-2 mt-2">
              <div className="text-left">
                <p className="text-[10px] text-gray-600">Price</p>
                <p className="text-xl font-bold text-black">
                  {formatCurrency(product.finalPrice || product.price)}
                </p>
              </div>
              <p className="text-[10px] text-gray-500">Hyundai Spares</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
          >
            <Printer size={18} /> Print Now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filters & Pagination State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "All",
    stockStatus: "All",
    priceRange: "All",
  });

  // 🔥 Default Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20, // Default limit per backend
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ... (Actions State remains same) ...
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    price: number;
    stock: number;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts(1); // Reset to page 1 on filter change
  }, [filters]);

  // 🔥 UPDATED FETCH LOGIC
  const fetchProducts = async (pageNo: number = 1) => {
    try {
      setIsLoading(true);
      const params: any = {
        limit: pagination.limit,
        page: pageNo,
        search: searchQuery,
      };

      // Filter Logic
      if (filters.category !== "All") params.category = filters.category;
      if (filters.stockStatus === "In Stock") params.inStock = "true";
      if (filters.priceRange === "Under 1000") params.maxPrice = 1000;
      if (filters.priceRange === "1000-5000") {
        params.minPrice = 1000;
        params.maxPrice = 5000;
      }
      if (filters.priceRange === "5000+") params.minPrice = 5000;

      const response = await ProductService.getAll(params);

      // ✅ Correct Data Extraction from Backend Response
      const incomingData =
        response.data.data?.products || response.data.data || [];
      const meta =
        response.data.data?.pagination || response.data.pagination || {}; // Handle nested pagination object

      if (Array.isArray(incomingData)) {
        setProducts(incomingData);
      } else {
        setProducts([]);
      }

      // ✅ Correct Pagination State Update
      if (meta.total !== undefined) {
        setPagination({
          page: Number(meta.page) || pageNo,
          limit: Number(meta.limit) || 20,
          total: Number(meta.total) || 0,
          totalPages:
            Number(meta.totalPages) ||
            Math.ceil(Number(meta.total) / Number(meta.limit)) ||
            1,
          hasNextPage:
            meta.hasNextPage ?? pageNo < (Number(meta.totalPages) || 1),
          hasPrevPage: meta.hasPrevPage ?? pageNo > 1,
        });
      }

      setSelectedIds(new Set());
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (All Handlers: Select, Delete, Export, Edit, Clone, Print remain SAME) ...
  const handleSelectAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map((p) => p._id)));
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} products?`)) return;
    try {
      toast.loading("Deleting...");
      await Promise.all(
        Array.from(selectedIds).map((id) => ProductService.delete(id)),
      );
      toast.dismiss();
      toast.success("Products deleted");
      fetchProducts(pagination.page);
      setSelectedIds(new Set());
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete");
    }
  };

  const handleExport = () => {
    const dataToExport =
      selectedIds.size > 0
        ? products.filter((p) => selectedIds.has(p._id))
        : products;
    const headers = [
      "Name",
      "Part Number",
      "Category",
      "Price",
      "Stock",
      "Status",
    ];
    const rows = dataToExport.map((p) => [
      `"${p.name}"`,
      p.partNumber,
      p.category,
      p.price,
      p.stock,
      p.stock > 0 ? "In Stock" : "Out of Stock",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const startEditing = (product: Product) => {
    setEditingId(product._id);
    setEditData({ price: product.price, stock: product.stock });
  };

  const saveEditing = async () => {
    if (!editingId || !editData) return;
    try {
      setProducts((prev) =>
        prev.map((p) => (p._id === editingId ? { ...p, ...editData } : p)),
      );
      const formData = new FormData();
      formData.append("price", editData.price.toString());
      formData.append("stock", editData.stock.toString());
      await ProductService.update(editingId, formData);
      toast.success("Product updated");
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update");
      fetchProducts(pagination.page);
    }
  };

  const handleDuplicate = (product: Product) => {
    toast.info("Redirecting to clone..."); // ✅ ఇది కొన్ని సెకన్లలో ఆటోమేటిక్‌గా పోతుంది
    router.push(`/dashboard/products/add?cloneId=${product._id}`);
  };

  const handlePrintLabel = (product: Product) => {
    setLabelProduct(product);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await ProductService.delete(deleteId);
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // ... (Stats Logic remains same) ...
  const totalProducts = pagination.total || products.length;
  const lowStockCount = products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 5),
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0,
  );

  const categories = [
    "All",
    "Engine",
    "Brake",
    "Electrical",
    "Body",
    "Accessories",
    "Suspension",
  ];

  // 🔥 REAL LAYOUT SKELETON (Fixes CLS)
  if (isLoading && products.length === 0) {
    return (
      <div className="space-y-6 pb-20 px-2 md:px-0">
        {/* 1. Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between h-[60px]">
          <div>
            <Skeleton className="h-8 w-32 rounded-lg mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-48 rounded-lg" /> {/* Subtitle */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" /> {/* Refresh */}
            <Skeleton className="h-10 w-24 rounded-lg" /> {/* Import */}
            <Skeleton className="h-10 w-32 rounded-lg" /> {/* Add Product */}
          </div>
        </div>

        {/* 2. Stats Cards Grid Skeleton */}
        {/* అసలు కార్డ్స్ గ్రిడ్ లాగానే ఇక్కడ కూడా సేమ్ గ్రిడ్ వాడాలి */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 bg-white border-zinc-200 dark:bg-white/5 dark:border-white/10"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" /> {/* Icon Box */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-md" /> {/* Label */}
                  <Skeleton className="h-6 w-12 rounded-md" /> {/* Value */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Search & Filter Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 h-[42px]">
          <Skeleton className="w-full md:flex-1 h-full rounded-xl" />{" "}
          {/* Search Input */}
          <div className="flex gap-2">
            <Skeleton className="h-full w-[42px] rounded-xl" />{" "}
            {/* Filter Btn */}
            <Skeleton className="h-full w-[42px] rounded-xl" />{" "}
            {/* Export Btn */}
          </div>
        </div>

        {/* 4. Table Skeleton */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.02] overflow-hidden">
          {/* Table Header */}
          <div className="h-12 bg-zinc-50 border-b border-zinc-100 dark:bg-white/5 dark:border-white/10 flex items-center px-4 gap-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          {/* Table Rows (Create 5 fake rows) */}
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 px-4 flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
                <div className="flex items-center gap-3 w-48">
                  <Skeleton className="h-10 w-10 rounded-lg" /> {/* Img */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded" /> {/* Name */}
                    <Skeleton className="h-3 w-16 rounded" /> {/* Part No */}
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" /> {/* Category */}
                <Skeleton className="h-4 w-32 rounded" /> {/* Models */}
                <Skeleton className="h-4 w-16 rounded" /> {/* Price */}
                <Skeleton className="h-4 w-16 rounded" /> {/* Stock */}
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-lg" /> {/* Action */}
                  <Skeleton className="h-8 w-8 rounded-lg" /> {/* Action */}
                  <Skeleton className="h-8 w-8 rounded-lg" /> {/* Action */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Styles ---
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";
  const cardClass =
    "rounded-xl border backdrop-blur-sm p-4 transition-colors border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";
  const inputClass =
    "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 dark:bg-[#1e1e1e] dark:border-white/10 dark:text-white dark:placeholder-gray-400";
  const btnSecondary =
    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10";

  return (
    <div className="space-y-6 pb-20 px-2 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        {/* ... (Header Content Same) ... */}
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
            Products
          </h1>
          <p className={`mt-1 text-sm md:text-base ${textSecondary}`}>
            Manage your spare parts inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchProducts(1)}
            className={btnSecondary + " flex items-center gap-2"}
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            className={btnSecondary + " flex items-center gap-2"}
            title="Import Excel"
          >
            <Upload className="h-4 w-4" /> Import
          </button>
          <Link href="/dashboard/products/add">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition font-medium">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>
                Total Products
              </p>
              <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                {totalProducts}
              </p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>
                Low Stock
              </p>
              <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>
                Out of Stock
              </p>
              <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                {outOfStockCount}
              </p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>
                Inventory Value
              </p>
              <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                {formatCurrency(totalInventoryValue)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm px-2">
                {selectedIds.size} Selected
              </span>
              <div className="h-4 w-px bg-blue-200 dark:bg-blue-500/20"></div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition"
              >
                <Trash2 size={14} /> Bulk Delete
              </button>
              <button
                onClick={handleExport}
                className={`flex items-center gap-1 text-xs font-medium transition ${textSecondary} hover:${textPrimary}`}
              >
                <Download size={14} /> Export Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:flex-1 md:min-w-[300px]">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textSecondary}`}
            />
            <input
              type="text"
              placeholder="Search by name, part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts(1)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition ${
                showFilters
                  ? "bg-blue-100 border-blue-300 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/50 dark:text-blue-400"
                  : `bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white`
              }`}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={handleExport}
              className={`p-2.5 rounded-xl border bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white transition`}
              title="Export All to CSV"
            >
              <FileText size={18} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4
                bg-white border-zinc-200 
                dark:bg-white/5 dark:border-white/10"
              >
                {/* ... (Filter Inputs Same) ... */}
                <div>
                  <label className={`text-xs mb-1 block ${textSecondary}`}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className={inputClass}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${textSecondary}`}>
                    Stock Status
                  </label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, stockStatus: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="All">All</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${textSecondary}`}>
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="All">All</option>
                    <option value="Under 1000">Under ₹1000</option>
                    <option value="1000-5000">₹1000 - ₹5000</option>
                    <option value="5000+">₹5000+</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFilters({
                        category: "All",
                        stockStatus: "All",
                        priceRange: "All",
                      })
                    }
                    className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline mb-2"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-white/10">
                <th className="px-4 py-4 text-left w-10">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:text-gray-500 dark:hover:text-white"
                  >
                    {selectedIds.size > 0 &&
                    selectedIds.size === products.length ? (
                      <CheckSquare size={18} className="text-blue-500" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Product
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Category
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Models
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Price
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Stock
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`px-6 py-12 text-center ${textSecondary}`}
                  >
                    <Package className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-gray-600" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const isSelected = selectedIds.has(product._id);
                  const isEditing = editingId === product._id;
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.3 }}
                      whileHover={{
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      }}
                      className={`transition-colors group hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${isSelected ? "bg-blue-50 dark:bg-blue-500/5" : ""}`}
                    >
                      {/* ... (Row Content Same) ... */}
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleSelectOne(product._id)}>
                          {isSelected ? (
                            <CheckSquare
                              size={18}
                              className="text-blue-600 dark:text-blue-500"
                            />
                          ) : (
                            <Square
                              size={18}
                              className="text-zinc-400 group-hover:text-zinc-600 dark:text-gray-600 dark:group-hover:text-gray-400"
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-lg flex-shrink-0 border
                            bg-zinc-100 border-zinc-200 
                            dark:bg-white/5 dark:border-white/10"
                          >
                            {product.images && product.images[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-gray-500">
                                <Package className="h-5 w-5 md:h-6 md:w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-medium line-clamp-1 text-sm md:text-base ${textPrimary}`}
                            >
                              {product.name}
                            </p>
                            <code className="text-xs text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded dark:text-cyan-400 dark:bg-cyan-400/10">
                              {product.partNumber}
                            </code>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium
                          bg-blue-100 text-blue-700 
                          dark:bg-blue-500/10 dark:text-blue-400"
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 max-w-[200px] whitespace-normal">
                        <div className="flex flex-wrap gap-1">
                          {product.compatibleModels
                            ?.slice(0, 2)
                            .map((model, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] border
                                  bg-zinc-100 border-zinc-200 text-zinc-600 
                                  dark:bg-white/5 dark:border-white/10 dark:text-gray-300"
                              >
                                <Car className="h-3 w-3 text-zinc-400 dark:text-gray-500" />
                                {model.modelName}
                              </span>
                            ))}
                          {product.compatibleModels?.length &&
                            product.compatibleModels.length > 2 && (
                              <span
                                className={`text-[10px] pl-1 ${textSecondary}`}
                              >
                                +{product.compatibleModels.length - 2} more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData?.price}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="w-24 border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500
                              bg-white border-zinc-300 text-zinc-900 
                              dark:bg-white/10 dark:border-white/20 dark:text-white"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <p
                                className={`font-semibold text-sm md:text-base cursor-pointer border-b border-dashed border-zinc-300 dark:border-white/20 hover:text-blue-500 dark:hover:text-blue-400 ${textPrimary}`}
                                onClick={() => startEditing(product)}
                              >
                                {formatCurrency(
                                  product.finalPrice || product.price,
                                )}
                              </p>
                              {product.flashSale?.isActive && (
                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400 animate-pulse" />
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData?.stock}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                stock: parseInt(e.target.value),
                              })
                            }
                            className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500
                              bg-white border-zinc-300 text-zinc-900 
                              dark:bg-white/10 dark:border-white/20 dark:text-white"
                          />
                        ) : (
                          <div
                            className="flex flex-col gap-1.5 cursor-pointer hover:opacity-80"
                            onClick={() => startEditing(product)}
                          >
                            <span
                              className={`text-sm font-semibold border-b border-dashed border-zinc-300 dark:border-white/20 w-fit ${textPrimary}`}
                            >
                              {product.stock} Units
                            </span>
                            <span
                              className={cn(
                                "text-[10px] w-fit font-medium px-2 py-0.5 rounded-full border",
                                product.stock > (product.lowStockThreshold || 5)
                                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                                  : product.stock === 0
                                    ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
                              )}
                            >
                              {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEditing}
                                className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditData(null);
                                }}
                                className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link href={`/dashboard/products/${product._id}`}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </motion.button>
                              </Link>
                              <Link
                                href={`/dashboard/products/edit/${product._id}`}
                              >
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="rounded-lg bg-yellow-100 p-2 text-yellow-600 transition-colors hover:bg-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20"
                                  title="Edit Product"
                                >
                                  <Edit className="h-4 w-4" />
                                </motion.button>
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDuplicate(product)}
                                className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
                                title="Duplicate Product"
                              >
                                <Copy className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handlePrintLabel(product)}
                                className="rounded-lg bg-zinc-100 p-2 text-zinc-500 transition-colors hover:bg-zinc-200 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20"
                                title="Print Label"
                              >
                                <QrCode className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openDeleteModal(product._id)}
                                className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 UPDATED PAGINATION CONTROLS */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4
          bg-zinc-50 border-zinc-100 
          dark:bg-white/5 dark:border-white/10"
        >
          <p className={`text-sm ${textSecondary}`}>
            Showing{" "}
            <span className={`font-medium ${textPrimary}`}>
              {products.length}
            </span>{" "}
            of{" "}
            <span className={`font-medium ${textPrimary}`}>
              {pagination.total}
            </span>{" "}
            products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProducts(Math.max(1, pagination.page - 1))}
              disabled={!pagination.hasPrevPage || isLoading}
              className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed
                bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 
                dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="flex items-center gap-1">
              <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
                {pagination.page}
              </span>
              <span className={`px-1 ${textSecondary}`}>/</span>
              <span className={`text-sm ${textSecondary}`}>
                {pagination.totalPages}
              </span>
            </div>
            <button
              onClick={() =>
                fetchProducts(
                  Math.min(pagination.totalPages, pagination.page + 1),
                )
              }
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed
                bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 
                dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Modal (Kept same) */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl
                bg-white border-zinc-200 
                dark:bg-gray-900 dark:border-white/10"
            >
              <button
                onClick={closeDeleteModal}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-500/10">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h3 className={`mb-2 text-xl font-bold ${textPrimary}`}>
                  Delete Product?
                </h3>
                <p className={`mb-6 text-sm leading-relaxed ${textSecondary}`}>
                  Are you sure you want to delete this product? <br /> This
                  action cannot be undone.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors disabled:opacity-50
                      bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 
                      dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Forever</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {labelProduct && (
          <LabelPrintModal
            product={labelProduct}
            onClose={() => setLabelProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
