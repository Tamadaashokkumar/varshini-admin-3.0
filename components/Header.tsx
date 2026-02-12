"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  ChevronDown,
  Command,
  Calendar,
  Sun,
  Moon,
  Maximize,
  Minimize,
  ShieldCheck,
  Laptop,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes"; // ⭐ IMPORTED: Theme Hook
import { toast } from "sonner";
import { AdminAuthService } from "@/lib/api";
import NotificationDropdown from "@/components/NotificationDropdown"; // ⭐ IMPORTED: Notifications

interface HeaderProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user?: any;
}

export default function Header({
  isSidebarOpen,
  setSidebarOpen,
  user,
}: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // ⭐ Theme Hook Usage

  // --- STATE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false); // To prevent hydration mismatch
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- DATA PARSING ---
  const profile = user?.admin || user || {};

  // --- HYDRATION FIX ---
  // Wait until mounted to show theme icon to avoid server/client mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- FULLSCREEN LOGIC ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // --- OUTSIDE CLICK ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(
        `/dashboard/products?search=${encodeURIComponent(searchQuery)}`,
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AdminAuthService.logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Failed to logout");
    } finally {
      setIsLogoutOpen(false);
    }
  };

  // Navigation Handler
  const navigateTo = (path: string) => {
    router.push(path);
    setIsProfileOpen(false);
  };

  // Date Formatting
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300"
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* --- LEFT: MENU & DATE --- */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100 lg:hidden transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Date Badge */}
            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                <span className="tracking-wide">{today}</span>
              </div>
            </div>
          </div>

          {/* --- CENTER: SEARCH --- */}
          <div className="hidden max-w-md flex-1 px-8 lg:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-100 py-2 pl-10 pr-12 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 transition-all"
              />
              <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 lg:flex">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-2">
            {/* Fullscreen */}
            <HeaderIconButton onClick={toggleFullscreen} tooltip="Fullscreen">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </HeaderIconButton>

            {/* Theme Toggle (Updated for next-themes) */}
            <HeaderIconButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              tooltip="Toggle Theme"
            >
              {mounted ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? (
                      <Moon size={18} />
                    ) : (
                      <Sun size={18} className="text-orange-500" />
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-[18px] h-[18px]" /> // Placeholder to prevent layout shift
              )}
            </HeaderIconButton>

            {/* Notifications Dropdown */}
            <div className="flex items-center">
              <NotificationDropdown />
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-2" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1 pr-3 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-white/20"
              >
                <div className="relative h-8 w-8">
                  <div className="h-full w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="User"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-none mb-0.5">
                    {profile?.name || "Admin"}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none capitalize">
                    {profile?.role || "User"}
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Content */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-900 dark:shadow-2xl dark:ring-white/10"
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                        {profile?.name || "Admin User"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                        {profile?.email || "admin@example.com"}
                      </p>

                      {/* Role Badge */}
                      {profile?.role === "superadmin" && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                          <ShieldCheck size={12} />
                          SUPER ADMIN
                        </div>
                      )}
                    </div>

                    {/* Menu Items (Functional) */}
                    <div className="p-1.5 space-y-0.5">
                      <MenuItem
                        icon={<User size={16} />}
                        label="My Profile"
                        onClick={() => navigateTo("/dashboard/settings")}
                      />
                      <MenuItem
                        icon={<Settings size={16} />}
                        label="Settings"
                        onClick={() => navigateTo("/dashboard/settings")}
                      />
                      <MenuItem
                        icon={<Laptop size={16} />}
                        label="System Status"
                        onClick={() => navigateTo("/dashboard/system")}
                      />
                    </div>

                    <div className="p-1.5 border-t border-zinc-100 dark:border-white/5">
                      <button
                        onClick={() => setIsLogoutOpen(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- LOGOUT MODAL --- */}
      <AnimatePresence>
        {isLogoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm dark:bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-500/10">
                  <LogOut className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Confirm Logout
                </h3>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                  Are you sure you want to end your current session?
                </p>
                <div className="grid w-full grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsLogoutOpen(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 shadow-sm"
                  >
                    Log Out
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

// --- REUSABLE COMPONENTS ---

function HeaderIconButton({
  onClick,
  children,
  tooltip,
}: {
  onClick: () => void;
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="group relative rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 transition-colors"
    >
      <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
      {label}
    </button>
  );
}
