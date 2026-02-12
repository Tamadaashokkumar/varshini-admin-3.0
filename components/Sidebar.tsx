// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
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
//   GalleryHorizontal, // Close icon for mobile
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { AdminAuthService } from "@/lib/api";

// interface AdminProfile {
//   name: string;
//   email: string;
//   avatar?: string;
// }

// // --- PROPS FOR RESPONSIVENESS ---
// interface SidebarProps {
//   isOpen?: boolean; // మొబైల్‌లో ఓపెన్ ఉందా లేదా?
//   setSidebarOpen?: (open: boolean) => void; // క్లోజ్ చేయడానికి ఫంక్షన్
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
//   { label: "Settings", href: "/dashboard/settings", icon: Settings },
// ];

// export default function Sidebar({
//   isOpen = false,
//   setSidebarOpen,
// }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [admin, setAdmin] = useState<AdminProfile | null>(null);

//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         const response = await AdminAuthService.getProfile();
//         // Handle inconsistent API structures
//         const rootResponse = response.data;
//         const userData =
//           rootResponse.data?.data || rootResponse.data || rootResponse;
//         setAdmin(userData);
//       } catch (error) {
//         console.error("Failed to load admin profile", error);
//       }
//     };
//     fetchAdminData();
//   }, []);

//   const handleLogoutClick = () => {
//     setShowLogoutModal(true);
//   };

//   const confirmLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await AdminAuthService.logout();
//       router.push("/login"); // Updated path to typical login route
//     } catch (error) {
//       console.error("Logout failed", error);
//       setIsLoggingOut(false);
//       setShowLogoutModal(false);
//     }
//   };

//   return (
//     <>
//       {/* --- MOBILE BACKDROP OVERLAY --- */}
//       {/* ఇది కేవలం మొబైల్‌లో సైడ్‌బార్ ఓపెన్ అయినప్పుడు మాత్రమే కనిపిస్తుంది */}
//       {isOpen && (
//         <div
//           onClick={() => setSidebarOpen && setSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
//         />
//       )}

//       {/* --- SIDEBAR CONTAINER --- */}
//       <aside
//         className={cn(
//           "fixed top-0 left-0 z-50 h-screen w-64 border-r border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl transition-transform duration-300 ease-in-out",
//           // Desktop: Always visible (translate-x-0)
//           // Mobile: Based on isOpen prop
//           isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
//         )}
//       >
//         <div className="flex h-full flex-col">
//           {/* --- STYLISH LOGO SECTION --- */}
//           <div className="relative flex h-20 items-center justify-between border-b border-white/5 px-6">
//             <div className="flex items-center gap-3">
//               {/* Animated/Glowing Logo Icon */}
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

//               {/* Stylish Text */}
//               <div>
//                 <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400">
//                   Varshini
//                 </h1>
//                 <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
//                   Hyundai Spares
//                 </p>
//               </div>
//             </div>

//             {/* Mobile Close Button (Visible inside sidebar on mobile only) */}
//             <button
//               onClick={() => setSidebarOpen && setSidebarOpen(false)}
//               className="lg:hidden text-gray-400 hover:text-white"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           {/* --- NAVIGATION --- */}
//           <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               const Icon = item.icon;
//               return (
//                 <Link key={item.href} href={item.href}>
//                   <div
//                     className={cn(
//                       "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
//                       isActive
//                         ? "bg-white/10 text-white shadow-inner"
//                         : "text-gray-400 hover:bg-white/5 hover:text-white",
//                     )}
//                   >
//                     {isActive && (
//                       <motion.div
//                         layoutId="activeTab"
//                         className="absolute inset-0 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-cyan-500/10"
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
//                           ? "text-blue-400"
//                           : "text-gray-500 group-hover:text-gray-300",
//                       )}
//                     />
//                     <span className="relative z-10">{item.label}</span>

//                     {/* Active Indicator Dot */}
//                     {isActive && (
//                       <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
//                     )}
//                   </div>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* --- USER PROFILE FOOTER --- */}
//           <div className="border-t border-white/5 p-4 bg-black/20">
//             <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors group">
//               {admin?.avatar ? (
//                 <img
//                   src={admin.avatar}
//                   alt={admin.name}
//                   className="h-10 w-10 rounded-full object-cover border-2 border-white/10"
//                 />
//               ) : (
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-600 text-sm font-bold text-white shadow-lg">
//                   {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
//                 </div>
//               )}

//               <div className="flex-1 min-w-0">
//                 <p className="truncate text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
//                   {admin?.name || "Admin User"}
//                 </p>
//                 <p
//                   className="truncate text-xs text-gray-500"
//                   title={admin?.email}
//                 >
//                   {admin?.email || "Loading..."}
//                 </p>
//               </div>

//               <button
//                 onClick={handleLogoutClick}
//                 className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
//                 title="Logout"
//               >
//                 <LogOut className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* --- LOGOUT MODAL --- */}
//       <AnimatePresence>
//         {showLogoutModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowLogoutModal(false)}
//               className="absolute inset-0 bg-black/80 backdrop-blur-md"
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl"
//             >
//               <div className="flex flex-col items-center text-center">
//                 <div className="mb-4 rounded-full bg-red-500/10 p-4 border border-red-500/20">
//                   <AlertTriangle className="h-8 w-8 text-red-500" />
//                 </div>
//                 <h3 className="mb-2 text-xl font-bold text-white">Sign Out?</h3>
//                 <p className="mb-6 text-sm text-gray-400">
//                   Are you sure you want to end your current session?
//                 </p>
//                 <div className="flex w-full gap-3">
//                   <button
//                     onClick={() => setShowLogoutModal(false)}
//                     disabled={isLoggingOut}
//                     className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmLogout}
//                     disabled={isLoggingOut}
//                     className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors flex justify-center gap-2"
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
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminAuthService } from "@/lib/api";

interface AdminProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
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
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({
  isOpen = false,
  setSidebarOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await AdminAuthService.getProfile();
        const rootResponse = response.data;
        const userData =
          rootResponse.data?.data || rootResponse.data || rootResponse;
        setAdmin(userData);
      } catch (error) {
        console.error("Failed to load admin profile", error);
      }
    };
    fetchAdminData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AdminAuthService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {/* --- MOBILE BACKDROP OVERLAY --- */}
      {isOpen && (
        <div
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside
        className={cn(
          // Updated for Light/Dark Mode
          "fixed top-0 left-0 z-50 h-screen w-64 border-r transition-transform duration-300 ease-in-out backdrop-blur-xl",
          // Light Mode Colors
          "bg-white/90 border-zinc-200",
          // Dark Mode Colors (Preserved)
          "dark:border-white/10 dark:bg-[#0a0a0a]/90",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* --- STYLISH LOGO SECTION --- */}
          <div className="relative flex h-20 items-center justify-between border-b px-6 border-zinc-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              {/* Animated/Glowing Logo Icon */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                <div className="absolute inset-0 rounded-xl bg-blue-400 blur opacity-20"></div>
                <svg
                  className="relative h-6 w-6 text-white"
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

              {/* Stylish Text */}
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-blue-800 to-zinc-600 dark:from-white dark:via-blue-100 dark:to-gray-400">
                  Varshini
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Hyundai Spares
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- NAVIGATION --- */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-white/10 dark:text-white dark:shadow-inner"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:border-blue-500/30 dark:bg-gradient-to-r dark:from-blue-600/10 dark:to-cyan-500/10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "relative z-10 h-5 w-5 transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 group-hover:text-zinc-600 dark:text-gray-500 dark:group-hover:text-gray-300",
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>

                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-blue-600 shadow-blue-400/50 dark:bg-blue-400 dark:shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* --- USER PROFILE FOOTER --- */}
          <div className="border-t p-4 border-zinc-200 bg-zinc-50/50 dark:border-white/5 dark:bg-black/20">
            <div className="flex items-center gap-3 rounded-xl p-3 backdrop-blur-sm transition-colors group border border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10">
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-zinc-100 dark:border-white/10"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 text-zinc-700 shadow-sm dark:from-gray-700 dark:to-gray-600 dark:text-white dark:shadow-lg">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-200 transition-colors">
                  {admin?.name || "Admin User"}
                </p>
                <p
                  className="truncate text-xs text-zinc-500 dark:text-gray-500"
                  title={admin?.email}
                >
                  {admin?.email || "Loading..."}
                </p>
              </div>

              <button
                onClick={handleLogoutClick}
                className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all active:scale-95"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- LOGOUT MODAL --- */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md dark:bg-black/80"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl bg-white border-zinc-200 dark:border-white/10 dark:bg-[#121212]"
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 rounded-full p-4 border bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
                  Sign Out?
                </h3>
                <p className="mb-6 text-sm text-zinc-500 dark:text-gray-400">
                  Are you sure you want to end your current session?
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors flex justify-center gap-2"
                  >
                    {isLoggingOut ? "Processing..." : "Logout"}
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
