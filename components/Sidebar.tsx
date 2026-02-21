// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Settings,
//   BarChart3,
//   Tag,
//   LogOut,
//   AlertTriangle,
//   Mail,
//   X,
//   Activity,
//   GalleryHorizontal,
//   CreditCard,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/components/providers/AuthProvider"; // 🔥 Import Hook

// interface SidebarProps {
//   isOpen?: boolean;
//   setSidebarOpen?: (open: boolean) => void;
//   user?: any; // Recieve user from layout
// }

// const navItems = [
//   { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//   { label: "Products", href: "/dashboard/products", icon: Package },
//   { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
//   { label: "Customers", href: "/dashboard/customers", icon: Users },
//   { label: "Messages", href: "/dashboard/chat", icon: Mail },
//   { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
//   { label: "Categories", href: "/dashboard/categories", icon: Tag },
//   { label: "Carousel", href: "/dashboard/carousel", icon: GalleryHorizontal },
//   {
//     label: "Abandoned Carts",
//     href: "/dashboard/abandoned-carts",
//     icon: ShoppingCart,
//   },
//   { label: "👀 Live Monitor", href: "/dashboard/monitor", icon: Activity },
//   {
//     label: "Payments / Transactions",
//     href: "/dashboard/payments",
//     icon: CreditCard,
//   },
//   { label: "Settings", href: "/dashboard/settings", icon: Settings },
// ];

// export default function Sidebar({
//   isOpen = false,
//   setSidebarOpen,
//   user,
// }: SidebarProps) {
//   const pathname = usePathname();
//   const { logout } = useAuth(); // 🔥 Use Global Logout
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const confirmLogout = async () => {
//     setIsLoggingOut(true);
//     await logout();
//     setIsLoggingOut(false);
//     setShowLogoutModal(false);
//   };

//   return (
//     <>
//       {isOpen && (
//         <div
//           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
//         />
//       )}

//       <aside
//         className={cn(
//           "fixed top-0 left-0 z-50 h-screen w-64 border-r transition-transform duration-300 ease-in-out backdrop-blur-xl",
//           "bg-white/90 border-zinc-200",
//           "dark:border-white/10 dark:bg-[#0a0a0a]/90",
//           isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
//         )}
//       >
//         <div className="flex h-full flex-col">
//           {/* LOGO */}
//           <div className="relative flex h-20 items-center justify-between border-b px-6 border-zinc-200 dark:border-white/5">
//             <div className="flex items-center gap-3">
//               <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
//                 <div className="absolute inset-0 rounded-xl bg-blue-400 blur opacity-20"></div>
//                 <svg
//                   className="relative h-6 w-6 text-white"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2.5}
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-blue-800 to-zinc-600 dark:from-white dark:via-blue-100 dark:to-gray-400">
//                   Varshini
//                 </h1>
//                 <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
//                   Hyundai Spares
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setSidebarOpen && setSidebarOpen(false)}
//               className="lg:hidden text-zinc-500 dark:text-gray-400"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               const Icon = item.icon;
//               return (
//                 <Link key={item.href} href={item.href}>
//                   <div
//                     className={cn(
//                       "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
//                       isActive
//                         ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-white/10 dark:text-white dark:shadow-inner"
//                         : "text-zinc-600 hover:bg-zinc-100 dark:text-gray-400 dark:hover:bg-white/5",
//                     )}
//                   >
//                     {isActive && (
//                       <motion.div
//                         layoutId="activeTab"
//                         className="absolute inset-0 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:border-blue-500/30 dark:bg-gradient-to-r dark:from-blue-600/10 dark:to-cyan-500/10"
//                         transition={{
//                           type: "spring",
//                           bounce: 0.2,
//                           duration: 0.6,
//                         }}
//                       />
//                     )}
//                     <Icon
//                       className={cn(
//                         "relative z-10 h-5 w-5 transition-colors",
//                         isActive
//                           ? "text-blue-600 dark:text-blue-400"
//                           : "text-zinc-400 group-hover:text-zinc-600 dark:text-gray-500 dark:group-hover:text-gray-300",
//                       )}
//                     />
//                     <span className="relative z-10">{item.label}</span>
//                     {isActive && (
//                       <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-blue-600 shadow-blue-400/50 dark:bg-blue-400 dark:shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
//                     )}
//                   </div>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* User Profile Footer */}
//           <div className="border-t p-4 border-zinc-200 bg-zinc-50/50 dark:border-white/5 dark:bg-black/20">
//             <div className="flex items-center gap-3 rounded-xl p-3 border border-zinc-200 bg-white dark:border-white/5 dark:bg-white/5">
//               {/* 🔥 Using user prop passed from Layout */}
//               {user?.data?.avatar ? (
//                 <img
//                   src={user.data.avatar}
//                   alt={user.data.name}
//                   className="h-10 w-10 rounded-full object-cover border-2 border-zinc-100 dark:border-white/10"
//                 />
//               ) : (
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-gray-700 dark:to-gray-600">
//                   {user?.data?.name
//                     ? user.data.name.charAt(0).toUpperCase()
//                     : "A"}
//                 </div>
//               )}

//               <div className="flex-1 min-w-0">
//                 <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600">
//                   {user?.data?.name || "Admin"}
//                 </p>
//                 <p className="truncate text-xs text-zinc-500 dark:text-gray-500">
//                   {user?.data?.email || "Loading..."}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setShowLogoutModal(true)}
//                 className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
//               >
//                 <LogOut className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* LOGOUT MODAL */}
//       <AnimatePresence>
//         {showLogoutModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowLogoutModal(false)}
//               className="absolute inset-0 bg-black/60 backdrop-blur-md"
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className="relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl bg-white border-zinc-200 dark:border-white/10 dark:bg-[#121212]"
//             >
//               <div className="flex flex-col items-center text-center p-6">
//                 <div className="mb-4 rounded-full p-4 border bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
//                   <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
//                 </div>
//                 <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
//                   Sign Out?
//                 </h3>
//                 <p className="mb-6 text-sm text-zinc-500 dark:text-gray-400">
//                   Are you sure you want to end your current session?
//                 </p>
//                 <div className="flex w-full gap-3">
//                   <button
//                     onClick={() => setShowLogoutModal(false)}
//                     disabled={isLoggingOut}
//                     className="flex-1 rounded-xl border py-2.5 text-sm font-medium border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmLogout}
//                     disabled={isLoggingOut}
//                     className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 flex justify-center gap-2"
//                   >
//                     {isLoggingOut ? "Processing..." : "Logout"}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tag,
  LogOut,
  AlertTriangle,
  Mail,
  X,
  Activity,
  GalleryHorizontal,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

interface SidebarProps {
  isOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  user?: any;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Messages", href: "/dashboard/chat", icon: Mail },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Categories", href: "/dashboard/categories", icon: Tag },
  { label: "Carousel", href: "/dashboard/carousel", icon: GalleryHorizontal },
  {
    label: "Abandoned Carts",
    href: "/dashboard/abandoned-carts",
    icon: ShoppingCart,
  },
  { label: "👀 Live Monitor", href: "/dashboard/monitor", icon: Activity },
  {
    label: "Payments / Txns",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// --- Animations ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
};

export default function Sidebar({
  isOpen = false,
  setSidebarOpen,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          // 🔥 మొబైల్ బ్రౌజర్ల కోసం h-[100dvh] వాడాను
          "fixed top-0 left-0 z-50 h-[100dvh] w-[280px] border-r transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          // 🔥 బ్యూటిఫుల్ ఫ్రాస్టెడ్ గ్లాస్ ఎఫెక్ట్ (మొబైల్ లో కూడా టెక్స్ట్ క్లియర్ గా కనిపిస్తుంది)
          "bg-white/60 border-white/50 shadow-[20px_0_40px_rgba(0,0,0,0.08)] backdrop-blur-3xl",
          "dark:border-white/10 dark:bg-[#0a0a0a]/70 dark:shadow-[20px_0_50px_rgba(0,0,0,0.6)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* LOGO SECTION */}
          <div className="relative flex h-24 items-center justify-between px-6 mb-2">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/30 overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <svg
                  className="relative h-6 w-6 text-white transform group-hover:scale-110 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-blue-800 to-zinc-700 dark:from-white dark:via-blue-200 dark:to-gray-300">
                  Varshini
                </h1>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-0.5">
                  Hyundai Spares
                </p>
              </div>
            </div>

            {/* Mobile Close Button (ఇప్పుడు మరింత స్పష్టంగా కనిపిస్తుంది) */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Subtle bottom gradient divider */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/20 to-transparent" />
          </div>

          {/* NAVIGATION */}
          <motion.nav
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            // 🔥 SCROLLBAR REMOVED COMPLETELY (బట్ స్క్రోల్ అవుతుంది)
            className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <motion.div key={item.href} variants={navItemVariant}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen?.(false)}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
                        isActive
                          ? "text-blue-700 dark:text-white"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                      )}
                    >
                      {/* Active Background Glow */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-2xl bg-white/60 border border-white/80 shadow-[0_8px_30px_rgba(59,130,246,0.12)] dark:bg-white/10 dark:border-white/20 dark:shadow-[0_8px_30px_rgba(255,255,255,0.05)] backdrop-blur-md"
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 14,
                            mass: 0.8,
                          }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-center rounded-xl bg-transparent transition-colors duration-300">
                        <Icon
                          className={cn(
                            "h-[22px] w-[22px] transition-all duration-300",
                            isActive
                              ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-md"
                              : "text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-white",
                          )}
                        />
                      </div>
                      <span className="relative z-10 flex-1 tracking-wide">
                        {item.label}
                      </span>

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative z-10 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)] dark:bg-blue-400 dark:shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* USER PROFILE FOOTER - Glassmorphism blended */}
          <div className="p-5 pt-2">
            <div className="relative overflow-hidden flex items-center gap-3 rounded-2xl p-3 border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm dark:border-white/10 dark:bg-white/5 group transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10">
              {user?.data?.avatar ? (
                <img
                  src={user.data.avatar}
                  alt={user.data.name}
                  className="h-12 w-12 rounded-xl object-cover border-2 border-white/80 dark:border-white/20 shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-zinc-800 dark:to-zinc-700 text-blue-600 dark:text-white font-black text-xl shadow-inner border border-white/50 dark:border-white/10">
                  {user?.data?.name
                    ? user.data.name.charAt(0).toUpperCase()
                    : "A"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {user?.data?.name || "Admin"}
                </p>
                <p className="truncate text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {user?.data?.email || "Loading..."}
                </p>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="rounded-xl p-3 text-zinc-500 hover:bg-red-500/10 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-all duration-300 active:scale-95"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* PREMIUM LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm dark:bg-black/80"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.2)] bg-white/95 backdrop-blur-3xl dark:border-white/10 dark:bg-[#121212]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="flex flex-col items-center text-center p-8">
                <div className="mb-5 rounded-full p-4 bg-red-50/80 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-inner">
                  <AlertTriangle className="h-9 w-9 text-red-500 drop-shadow-sm" />
                </div>
                <h3 className="mb-2 text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Sign Out?
                </h3>
                <p className="mb-8 text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Are you sure you want to end your current session and logout?
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-2xl border-2 py-3.5 text-sm font-bold border-zinc-200/50 bg-white/50 text-zinc-700 hover:bg-white hover:border-zinc-300 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white hover:bg-red-600 shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    {isLoggingOut ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
