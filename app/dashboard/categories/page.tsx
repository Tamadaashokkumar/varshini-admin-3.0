// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Package, TrendingUp, DollarSign } from 'lucide-react';
// import { ProductService } from '@/lib/api';
// import { toast } from 'sonner';
// import { formatCurrency, cn } from '@/lib/utils';
// import type { Product, ProductCategory } from '@/types';
// import Link from 'next/link';
// import Image from 'next/image';

// const CATEGORIES: ProductCategory[] = [
//   'Engine',
//   'Brake',
//   'Electrical',
//   'Body',
//   'Accessories',
//   'Suspension',
//   'Transmission',
//   'Interior',
//   'Exterior',
//   'Service Parts',
// ];

// const CATEGORY_ICONS: Record<string, string> = {
//   Engine: '⚙️',
//   Brake: '🛑',
//   Electrical: '⚡',
//   Body: '🚗',
//   Accessories: '🔧',
//   Suspension: '🏎️',
//   Transmission: '⚙️',
//   Interior: '🪑',
//   Exterior: '✨',
//   'Service Parts': '🔩',
// };

// export default function CategoriesPage() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Engine');
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categoryStats, setCategoryStats] = useState<Record<string, { count: number; revenue: number }>>({});

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   useEffect(() => {
//     fetchProductsByCategory(selectedCategory);
//   }, [selectedCategory]);

//   const fetchAllProducts = async () => {
//     try {
//       // Assuming getAll returns a paginated list, we might need a way to get *all* stats.
//       // If your API supports a stats endpoint, that's better.
//       // For now, we'll try to fetch a large number to calculate local stats or rely on what's returned.

//       const response = await ProductService.getAll({ limit: 1000 }); // Fetch large batch to calculate stats accurately
//       const allProducts = response.data.data?.products || response.data.products || response.data || [];

//       // Calculate stats for each category
//       const stats: Record<string, { count: number; revenue: number }> = {};

//       // Initialize with 0
//       CATEGORIES.forEach(cat => {
//         stats[cat] = { count: 0, revenue: 0 };
//       });

//       if (Array.isArray(allProducts)) {
//         allProducts.forEach((p: Product) => {
//           if (p.category && stats[p.category]) {
//             stats[p.category].count += 1;
//             // Assuming 'revenue' is calculated from price * totalSales, or just use price for potential value
//             // If totalSales exists on product:
//             stats[p.category].revenue += (p.price * (p.totalSales || 0));
//           }
//         });
//       }

//       setCategoryStats(stats);
//     } catch (error: any) {
//       console.error('Products fetch error:', error);
//     }
//   };

//   const fetchProductsByCategory = async (category: ProductCategory) => {
//     try {
//       setIsLoading(true);
//       // Fetch specific category products
//       const response = await ProductService.getByCategory(category);
//       const data = response.data.data || response.data;

//       // Handle different API response structures
//       const categoryProducts = Array.isArray(data) ? data : data.products || [];
//       setProducts(categoryProducts);

//     } catch (error: any) {
//       console.error('Category products fetch error:', error);
//       toast.error(`Failed to fetch ${category} products`);
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-white">Categories</h1>
//         <p className="mt-1 text-gray-400">
//           Browse products by category
//         </p>
//       </motion.div>

//       {/* Category Grid */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//         {CATEGORIES.map((category, index) => {
//           const stats = categoryStats[category] || { count: 0, revenue: 0 };
//           const isSelected = selectedCategory === category;

//           return (
//             <motion.button
//               key={category}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: index * 0.05 }}
//               whileHover={{ y: -4, scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => setSelectedCategory(category)}
//               className={cn(
//                 'rounded-2xl border p-6 text-left transition-all',
//                 isSelected
//                   ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-lg shadow-blue-500/20'
//                   : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
//               )}
//             >
//               <div className="mb-3 text-4xl">{CATEGORY_ICONS[category]}</div>
//               <h3 className="text-lg font-semibold text-white">{category}</h3>
//               <div className="mt-3 space-y-1">
//                 <div className="flex items-center gap-2 text-sm text-gray-400">
//                   <Package className="h-3 w-3" />
//                   {/* Displaying the updated count */}
//                   {stats.count} Products
//                 </div>
//                 {stats.revenue > 0 && (
//                   <div className="flex items-center gap-2 text-sm text-green-400">
//                     <DollarSign className="h-3 w-3" />
//                     {formatCurrency(stats.revenue)}
//                   </div>
//                 )}
//               </div>
//             </motion.button>
//           );
//         })}
//       </div>

//       {/* Products List */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
//       >
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-semibold text-white">{selectedCategory} Products</h2>
//             <p className="mt-1 text-sm text-gray-400">
//               {products.length} {products.length === 1 ? 'product' : 'products'} found
//             </p>
//           </div>
//           <Link href="/dashboard/products/add">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-600"
//             >
//               Add Product
//             </motion.button>
//           </Link>
//         </div>

//         {isLoading ? (
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <div key={i} className="h-64 animate-pulse rounded-xl bg-white/5" />
//             ))}
//           </div>
//         ) : products.length > 0 ? (
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {products.map((product, index) => (
//               <motion.div
//                 key={product._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 whileHover={{ y: -4 }}
//                 className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:shadow-lg"
//               >
//                 <Link href={`/dashboard/products/${product._id}`}>
//                   <div className="aspect-square overflow-hidden bg-white/5">
//                     {product.images && product.images.length > 0 ? (
//                       <Image
//                         src={product.images[0].url}
//                         alt={product.name}
//                         width={300}
//                         height={300}
//                         className="h-full w-full object-cover transition-transform group-hover:scale-110"
//                       />
//                     ) : (
//                       <div className="flex h-full items-center justify-center text-4xl">
//                         {CATEGORY_ICONS[product.category]}
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-4">
//                     <h3 className="font-semibold text-white line-clamp-2">{product.name}</h3>
//                     <p className="mt-1 text-xs text-gray-400 font-mono">{product.partNumber}</p>

//                     <div className="mt-3 flex items-center justify-between">
//                       <div>
//                         <p className="text-lg font-bold text-white">
//                           {formatCurrency(product.finalPrice)}
//                         </p>
//                         {product.discountPrice && (
//                           <p className="text-xs text-gray-500 line-through">
//                             {formatCurrency(product.price)}
//                           </p>
//                         )}
//                       </div>

//                       <span className={cn(
//                         'text-xs font-medium',
//                         product.stockStatus === 'In Stock' ? 'text-green-400' :
//                         product.stockStatus === 'Low Stock' ? 'text-yellow-400' :
//                         'text-red-400'
//                       )}>
//                         {product.stockStatus}
//                       </span>
//                     </div>
//                   </div>
//                 </Link>
//               </motion.div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-12 text-center">
//             <Package className="h-16 w-16 text-gray-600" />
//             <p className="mt-4 text-lg font-medium text-gray-400">No products found</p>
//             <p className="mt-1 text-sm text-gray-500">
//               Add products to this category to see them here
//             </p>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, DollarSign } from "lucide-react";
import { ProductService } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES: ProductCategory[] = [
  "Engine",
  "Brake",
  "Electrical",
  "Body",
  "Accessories",
  "Suspension",
  "Transmission",
  "Interior",
  "Exterior",
  "Service Parts",
];

const CATEGORY_ICONS: Record<string, string> = {
  Engine: "⚙️",
  Brake: "🛑",
  Electrical: "⚡",
  Body: "🚗",
  Accessories: "🔧",
  Suspension: "🏎️",
  Transmission: "⚙️",
  Interior: "🪑",
  Exterior: "✨",
  "Service Parts": "🔩",
};

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("Engine");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { count: number; revenue: number }>
  >({});

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchAllProducts = async () => {
    try {
      const response = await ProductService.getAll({ limit: 1000 });
      const allProducts =
        response.data.data?.products ||
        response.data.products ||
        response.data ||
        [];

      const stats: Record<string, { count: number; revenue: number }> = {};

      CATEGORIES.forEach((cat) => {
        stats[cat] = { count: 0, revenue: 0 };
      });

      if (Array.isArray(allProducts)) {
        allProducts.forEach((p: Product) => {
          if (p.category && stats[p.category]) {
            stats[p.category].count += 1;
            stats[p.category].revenue += p.price * (p.totalSales || 0);
          }
        });
      }

      setCategoryStats(stats);
    } catch (error: any) {
      console.error("Products fetch error:", error);
    }
  };

  const fetchProductsByCategory = async (category: ProductCategory) => {
    try {
      setIsLoading(true);
      const response = await ProductService.getByCategory(category);
      const data = response.data.data || response.data;
      const categoryProducts = Array.isArray(data) ? data : data.products || [];
      setProducts(categoryProducts);
    } catch (error: any) {
      console.error("Category products fetch error:", error);
      toast.error(`Failed to fetch ${category} products`);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Styles ---
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";
  const cardBg = "bg-white dark:bg-white/[0.02]";
  const cardBorder = "border-zinc-200 dark:border-white/10";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold ${textPrimary}`}>Categories</h1>
        <p className={`mt-1 ${textSecondary}`}>Browse products by category</p>
      </motion.div>

      {/* Category Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((category, index) => {
          const stats = categoryStats[category] || { count: 0, revenue: 0 };
          const isSelected = selectedCategory === category;

          return (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-2xl border p-6 text-left transition-all",
                isSelected
                  ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-lg shadow-blue-500/20"
                  : `border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 
                     dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.05]`,
              )}
            >
              <div className="mb-3 text-4xl">{CATEGORY_ICONS[category]}</div>
              <h3
                className={`text-lg font-semibold ${isSelected ? "text-blue-600 dark:text-blue-400" : textPrimary}`}
              >
                {category}
              </h3>
              <div className="mt-3 space-y-1">
                <div
                  className={`flex items-center gap-2 text-sm ${textSecondary}`}
                >
                  <Package className="h-3 w-3" />
                  {stats.count} Products
                </div>
                {stats.revenue > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(stats.revenue)}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Products List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl border p-6 backdrop-blur-sm ${cardBorder} ${cardBg}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              {selectedCategory} Products
            </h2>
            <p className={`mt-1 text-sm ${textSecondary}`}>
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              found
            </p>
          </div>
          <Link href="/dashboard/products/add">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
            >
              Add Product
            </motion.button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg 
                  ${cardBorder} ${cardBg} hover:border-zinc-300 dark:hover:border-white/20`}
              >
                <Link href={`/dashboard/products/${product._id}`}>
                  <div className="aspect-square overflow-hidden bg-zinc-50 dark:bg-white/5">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        {CATEGORY_ICONS[product.category]}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className={`font-semibold line-clamp-2 ${textPrimary}`}>
                      {product.name}
                    </h3>
                    <p className={`mt-1 text-xs font-mono ${textSecondary}`}>
                      {product.partNumber}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className={`text-lg font-bold ${textPrimary}`}>
                          {formatCurrency(product.finalPrice)}
                        </p>
                        {product.discountPrice && (
                          <p className="text-xs text-zinc-400 line-through dark:text-gray-500">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>

                      <span
                        className={cn(
                          "text-xs font-medium",
                          product.stockStatus === "In Stock"
                            ? "text-green-600 dark:text-green-400"
                            : product.stockStatus === "Low Stock"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {product.stockStatus}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-zinc-300 dark:text-gray-600" />
            <p className={`mt-4 text-lg font-medium ${textPrimary}`}>
              No products found
            </p>
            <p className={`mt-1 text-sm ${textSecondary}`}>
              Add products to this category to see them here
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
