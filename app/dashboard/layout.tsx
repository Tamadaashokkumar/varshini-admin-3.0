"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider"; // 🔥 Use Global Hook

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // AuthProvider already handles loading state logic safely.
  // We can just return null here if user is missing to prevent flashes.
  if (!user && !loading) return null;

  return (
    <SocketProvider>
      <div className="relative min-h-screen overflow-x-hidden transition-colors duration-300 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Animated Background Elements */}
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

        {/* --- MOBILE OVERLAY --- */}
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

        {/* --- SIDEBAR --- */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* 🔥 Pass User Data */}
          <Sidebar
            isOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-20 flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64">
          <div className="sticky top-0 z-30">
            {/* 🔥 Pass User Data */}
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
