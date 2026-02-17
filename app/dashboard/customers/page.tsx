// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';
// import { TableSkeleton } from '@/components/ui/Skeleton';
// import { toast } from 'sonner';
// import api from '@/lib/api'; // Ensure this is your configured Axios instance

// // --- 1. Define Types based on Backend Response ---
// interface Address {
//   _id: string;
//   addressType: string;
//   street: string;
//   city: string;
//   state: string;
//   pincode: string;
//   isDefault: boolean;
// }

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: string;
//   isActive: boolean;
//   isEmailVerified: boolean;
//   addresses: Address[];
//   createdAt: string;
//   updatedAt: string;
//   lastLogin?: string;
// }

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   // --- 2. Updated Fetch Logic ---
//   const fetchCustomers = async () => {
//     try {
//       setIsLoading(true);

//       // Update endpoint if necessary. Based on your previous context it might be '/admin/users'
//       const response = await api.get('/admin/auth/users');

//       // Backend Response Structure: { success: true, message: "...", data: [...] }
//       if (response.data && response.data.success) {
//         setCustomers(response.data.data);
//       } else {
//         // Fallback if structure differs slightly
//         setCustomers([]);
//         console.warn("Unexpected response format:", response.data);
//       }

//     } catch (error: any) {
//       console.error('Customers fetch error:', error);
//       toast.error(error.response?.data?.message || 'Failed to fetch customers');
//       setCustomers([]); // Clear data on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- 3. Filter Logic (No changes needed, but ensuring null safety) ---
//   const filteredCustomers = customers.filter((customer) =>
//     (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (customer.phone || '').includes(searchQuery)
//   );

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold text-white">Customers</h1>
//         </div>
//         <TableSkeleton />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex items-center justify-between"
//       >
//         <div>
//           <h1 className="text-3xl font-bold text-white">Customers</h1>
//           <p className="mt-1 text-gray-400">
//             Manage your customer database
//           </p>
//         </div>
//       </motion.div>

//       {/* Search */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1, duration: 0.5 }}
//       >
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name, email or phone..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-blue-500/30 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>
//       </motion.div>

//       {/* Stats */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.5 }}
//         className="grid gap-4 sm:grid-cols-3"
//       >
//         <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
//           <p className="text-sm text-gray-400">Total Customers</p>
//           <p className="mt-1 text-2xl font-bold text-white">{customers.length}</p>
//         </div>
//         <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
//           <p className="text-sm text-gray-400">Verified Emails</p>
//           <p className="mt-1 text-2xl font-bold text-green-400">
//             {customers.filter(c => c.isEmailVerified).length}
//           </p>
//         </div>
//         <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
//           <p className="text-sm text-gray-400">With Addresses</p>
//           <p className="mt-1 text-2xl font-bold text-blue-400">
//             {customers.filter(c => c.addresses && c.addresses.length > 0).length}
//           </p>
//         </div>
//       </motion.div>

//       {/* Customers Table */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3, duration: 0.5 }}
//         className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-white/10 bg-white/5">
//                 <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Customer
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Contact
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Location
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
//                   Joined
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {filteredCustomers.map((customer, index) => {
//                 // Determine display address (Default or First)
//                 const displayAddress = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];

//                 return (
//                   <motion.tr
//                     key={customer._id}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.05 * index, duration: 0.3 }}
//                     whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
//                     className="transition-colors"
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
//                           {customer.name?.charAt(0).toUpperCase() || 'U'}
//                         </div>
//                         <div>
//                           <p className="font-medium text-white">{customer.name || 'Unknown'}</p>
//                           <p className="text-xs text-gray-400">ID: {customer._id.slice(-6)}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2 text-sm text-gray-300">
//                           <Mail className="h-3 w-3" />
//                           {customer.email}
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-300">
//                           <Phone className="h-3 w-3" />
//                           {customer.phone || 'N/A'}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       {displayAddress ? (
//                         <div className="flex items-start gap-2 text-sm text-gray-300">
//                           <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                           <span>
//                             {displayAddress.city}, {displayAddress.state}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-sm text-gray-500 italic">No address</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
//                           customer.isEmailVerified
//                             ? 'bg-green-500/10 text-green-400'
//                             : 'bg-yellow-500/10 text-yellow-400'
//                         }`}
//                       >
//                         {customer.isEmailVerified ? 'Verified' : 'Pending'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-sm text-gray-400">
//                         <Calendar className="h-3 w-3" />
//                         {new Date(customer.createdAt).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric'
//                         })}
//                       </div>
//                     </td>
//                   </motion.tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>

//       {/* No Results */}
//       {filteredCustomers.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="flex flex-col items-center justify-center py-12 text-center"
//         >
//           <Search className="h-16 w-16 text-gray-600" />
//           <p className="mt-4 text-lg font-medium text-gray-400">No customers found</p>
//           <p className="mt-1 text-sm text-gray-500">
//             Try adjusting your search criteria
//           </p>
//         </motion.div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Types ---
interface Address {
  _id: string;
  addressType: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search మారుతున్నప్పుడు పేజీ 1 కి వెళ్ళాలి
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/auth/users");
      if (response.data && response.data.success) {
        setCustomers(response.data.data);
      } else {
        setCustomers([]);
      }
    } catch (error: any) {
      console.error("Customers fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch customers");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filter Logic ---
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (customer.phone || "").includes(searchQuery),
  );

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 🔥 REAL LAYOUT SKELETON (Fixes CLS for Customers Page)
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        {/* 1. Header Skeleton */}
        <div className="flex items-center justify-between h-[50px]">
          <div>
            <Skeleton className="h-8 w-32 rounded-lg mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-56 rounded-lg" /> {/* Subtitle */}
          </div>
        </div>

        {/* 2. Search Bar Skeleton */}
        <div className="relative">
          <Skeleton className="h-[46px] w-full rounded-xl" />
        </div>

        {/* 3. Stats Grid Skeleton (3 Cards) */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Skeleton className="h-4 w-24 rounded mb-2" /> {/* Label */}
              <Skeleton className="h-8 w-16 rounded" /> {/* Value */}
            </div>
          ))}
        </div>

        {/* 4. Table Skeleton */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
            <Skeleton className="h-4 w-24 rounded" /> {/* Customer */}
            <Skeleton className="h-4 w-24 rounded" /> {/* Contact */}
            <Skeleton className="h-4 w-24 rounded" /> {/* Location */}
            <Skeleton className="h-4 w-24 rounded" /> {/* Status */}
            <Skeleton className="h-4 w-24 rounded" /> {/* Joined */}
          </div>

          {/* Table Rows (Create 8 Fake Rows) */}
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center px-6 py-4">
                {/* Column 1: Customer (Avatar + Name) */}
                <div className="w-1/5 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>

                {/* Column 2: Contact */}
                <div className="w-1/5 space-y-2">
                  <Skeleton className="h-3 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>

                {/* Column 3: Location */}
                <div className="w-1/5">
                  <Skeleton className="h-4 w-32 rounded" />
                </div>

                {/* Column 4: Status (Badge) */}
                <div className="w-1/5">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Column 5: Date */}
                <div className="w-1/5">
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
            <Skeleton className="h-4 w-48 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" /> {/* Prev */}
              <Skeleton className="h-9 w-32 rounded-lg" /> {/* Page Info */}
              <Skeleton className="h-9 w-9 rounded-lg" /> {/* Next */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Styles ---
  const cardClass =
    "rounded-xl border transition-all duration-300 backdrop-blur-sm border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5";
  const inputClass =
    "w-full rounded-xl border px-4 py-2.5 outline-none transition-all focus:ring-2 border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400 dark:focus:bg-white/10";
  const tableHeaderClass =
    "border-b px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400";
  const tableRowClass =
    "transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]";
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Customers</h1>
          <p className={`mt-1 ${textSecondary}`}>
            Manage your customer database
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textSecondary}`}
          />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${textSecondary}`}>Total Customers</p>
          <p className={`mt-1 text-2xl font-bold ${textPrimary}`}>
            {customers.length}
          </p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${textSecondary}`}>Verified Emails</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {customers.filter((c) => c.isEmailVerified).length}
          </p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${textSecondary}`}>With Addresses</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {
              customers.filter((c) => c.addresses && c.addresses.length > 0)
                .length
            }
          </p>
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Customer</th>
                <th className={tableHeaderClass}>Contact</th>
                <th className={tableHeaderClass}>Location</th>
                <th className={tableHeaderClass}>Status</th>
                <th className={tableHeaderClass}>Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {currentCustomers.map((customer, index) => {
                const displayAddress =
                  customer.addresses?.find((a) => a.isDefault) ||
                  customer.addresses?.[0];

                return (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className={tableRowClass}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white shadow-md">
                          {customer.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>
                            {customer.name || "Unknown"}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            ID: {customer._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-sm ${textSecondary}`}
                        >
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div
                          className={`flex items-center gap-2 text-sm ${textSecondary}`}
                        >
                          <Phone className="h-3 w-3" />
                          {customer.phone || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {displayAddress ? (
                        <div
                          className={`flex items-start gap-2 text-sm ${textSecondary}`}
                        >
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {displayAddress.city}, {displayAddress.state}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm italic text-zinc-400 dark:text-gray-500">
                          No address
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          customer.isEmailVerified
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                        }`}
                      >
                        {customer.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-sm ${textSecondary}`}
                      >
                        <Calendar className="h-3 w-3" />
                        {new Date(customer.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controls --- */}
        {filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
            <div className={`text-sm ${textSecondary}`}>
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredCustomers.length}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className={`text-sm font-medium ${textPrimary}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* No Results */}
      {filteredCustomers.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Search className="h-16 w-16 text-zinc-300 dark:text-gray-600" />
          <p className={`mt-4 text-lg font-medium ${textPrimary}`}>
            No customers found
          </p>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Try adjusting your search criteria
          </p>
        </motion.div>
      )}
    </div>
  );
}
