"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { NotificationService } from "@/lib/api"; // API Import
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns"; // npm install date-fns (Time format kosam)

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getAll();
      const data = response.data.data; // Backend response structure batti adjust cheyandi

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown open chesinappudu refresh cheyali
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    } else {
      // Initial load (unread count badge kosam)
      fetchNotifications();
    }
  }, [isOpen]);

  // 2. Mark Single as Read
  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Already read aithe em cheyoddu

    try {
      // Optimistic Update (UI ni ventane update chestham)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // API Call
      await NotificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  // 3. Mark All as Read
  const markAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await NotificationService.markAllAsRead();
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // Helper: Get Icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case "order_placed":
      case "payment_success":
      case "order_delivered":
        return <CheckCircle size={16} className="text-green-500" />;
      case "low_stock":
      case "payment_failed":
        return <AlertTriangle size={16} className="text-orange-500" />;
      case "out_of_stock":
      case "order_cancelled":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-white/5 dark:bg-white/5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="animate-spin text-zinc-400" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() =>
                        markAsRead(notification._id, notification.isRead)
                      }
                      className={`cursor-pointer border-b border-zinc-50 px-4 py-3 hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/5 ${
                        !notification.isRead
                          ? "bg-blue-50/50 dark:bg-blue-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${!notification.isRead ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-400">
                            {/* install date-fns: npm install date-fns */}
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
