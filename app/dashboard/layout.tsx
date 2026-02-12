// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import PageTransition from "@/components/PageTransition";
// import { SocketProvider } from "@/components/providers/SocketProvider";
// import { motion, AnimatePresence } from "framer-motion";
// import { AdminAuthService } from "@/lib/api";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [isSidebarOpen, setSidebarOpen] = useState(false); // ఇది మన స్విచ్ (State)

//   // --- SECURITY CHECK ---
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         await AdminAuthService.getProfile();
//         setIsAuthorized(true);
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         router.push("/login");
//       }
//     };

//     checkAuth();
//   }, [router]);

//   if (!isAuthorized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//           <p className="text-gray-400">Verifying session...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <SocketProvider>
//       <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
//         {/* Animated Background Elements */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//           <motion.div
//             animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
//             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//             className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-blue-500/5 blur-3xl"
//           />
//           <motion.div
//             animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
//             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//             className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-cyan-500/5 blur-3xl"
//           />
//         </div>

//         {/* --- ఇక్కడ పాత బటన్ కోడ్ ఉండేది, దాన్ని తీసేసాము --- */}

//         {/* --- MOBILE OVERLAY (Backdrop) --- */}
//         <AnimatePresence>
//           {isSidebarOpen && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setSidebarOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
//             />
//           )}
//         </AnimatePresence>

//         {/* --- SIDEBAR WRAPPER --- */}
//         <div
//           className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
//           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
//         >
//           <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
//         </div>

//         {/* --- MAIN CONTENT AREA --- */}
//         <div className="relative z-20 flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64">
//           {/* Header Container */}
//           <div className="sticky top-0 z-30">
//             {/* --- UPDATE: ఇక్కడ మనం props పాస్ చేస్తున్నాం --- */}
//             <Header
//               isSidebarOpen={isSidebarOpen}
//               setSidebarOpen={setSidebarOpen}
//             />
//           </div>

//           <main className="flex-1 pt-6 lg:pt-8">
//             <div className="p-4 md:p-6 lg:p-8">
//               <PageTransition>{children}</PageTransition>
//             </div>
//           </main>
//         </div>
//       </div>
//     </SocketProvider>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import PageTransition from "@/components/PageTransition";
// import { SocketProvider } from "@/components/providers/SocketProvider";
// import { motion, AnimatePresence } from "framer-motion";
// import { AdminAuthService } from "@/lib/api";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();

//   // 1. State Updates: authorized బదులు user data మరియు loading state వాడదాం
//   const [user, setUser] = useState<any>(null); // User details store చేసుకోవడానికి
//   const [isLoading, setIsLoading] = useState(true); // Loading spinner కోసం
//   const [isSidebarOpen, setSidebarOpen] = useState(false);

//   // --- SECURITY CHECK ---
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // Cookie automatic ga velthundi
//         const response = await AdminAuthService.getProfile();

//         // Success: User data ni save chesukondi (Header lo avatar chupinchadaniki)
//         setUser(response.data.data || response.data);
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         router.push("/login");
//       } finally {
//         setIsLoading(false); // Success ayina, Fail ayina loading aapestham
//       }
//     };

//     checkAuth();
//   }, [router]);

//   // Loading Screen
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//           <p className="text-gray-400 animate-pulse">Verifying session...</p>
//         </div>
//       </div>
//     );
//   }

//   // User login avvakapothe emi chupinchakudadu (Double safety)
//   if (!user) return null;

//   return (
//     <SocketProvider>
//       <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
//         {/* Animated Background Elements */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//           <motion.div
//             animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
//             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//             className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-blue-500/5 blur-3xl"
//           />
//           <motion.div
//             animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
//             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//             className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-cyan-500/5 blur-3xl"
//           />
//         </div>

//         {/* --- MOBILE OVERLAY (Backdrop) --- */}
//         <AnimatePresence>
//           {isSidebarOpen && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setSidebarOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
//             />
//           )}
//         </AnimatePresence>

//         {/* --- SIDEBAR WRAPPER --- */}
//         <div
//           className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
//           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
//         >
//           <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
//         </div>

//         {/* --- MAIN CONTENT AREA --- */}
//         <div className="relative z-20 flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64">
//           {/* Header Container */}
//           <div className="sticky top-0 z-30">
//             <Header
//               isSidebarOpen={isSidebarOpen}
//               setSidebarOpen={setSidebarOpen}
//               user={user} // ⭐ NEW: User Data ni Header ki pass chestunnam
//             />
//           </div>

//           <main className="flex-1 pt-6 lg:pt-8">
//             <div className="p-4 md:p-6 lg:p-8">
//               <PageTransition>{children}</PageTransition>
//             </div>
//           </main>
//         </div>
//       </div>
//     </SocketProvider>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import { AdminAuthService } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- SECURITY CHECK ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await AdminAuthService.getProfile();
        setUser(response.data.data || response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Loading Screen (Updated for Light/Dark Mode)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-zinc-500 dark:text-zinc-400 animate-pulse font-medium">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SocketProvider>
      {/* Here is the Main Change:
          1. Removed fixed 'bg-gray-950'.
          2. Added 'dark:' prefix to the dark gradient.
          3. In Light mode, it becomes transparent so RootLayout's blue gradient shows through.
      */}
      <div className="relative min-h-screen overflow-x-hidden transition-colors duration-300 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Animated Background Elements (Visible mostly in Dark Mode) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50 dark:opacity-100">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10"
          />
        </div>

        {/* --- MOBILE OVERLAY (Backdrop) --- */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* --- SIDEBAR WRAPPER --- */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="relative z-20 flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64">
          {/* Header Container */}
          <div className="sticky top-0 z-30">
            <Header
              isSidebarOpen={isSidebarOpen}
              setSidebarOpen={setSidebarOpen}
              user={user}
            />
          </div>

          <main className="flex-1 pt-6 lg:pt-8">
            <div className="p-4 md:p-6 lg:p-8">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
