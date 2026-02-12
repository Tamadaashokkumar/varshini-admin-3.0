"use client";

import { useEffect, useState } from "react";
import { DashboardService, CartService } from "@/lib/api"; // Ensure CartService is exported in api.ts
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Mail, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AbandonedCart {
  _id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    product: {
      name: string;
      images: { url: string }[];
      price: number;
    };
    quantity: number;
  }[];
  totalAmount: number;
  lastActiveAt: string;
  isReminderSent: boolean;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // 1. Fetch Data
  const fetchCarts = async () => {
    try {
      const res = await CartService.getAbandonedCarts();
      setCarts(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching carts:", error);
      toast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // 2. Handle "Send Mail" Click
  const handleSendMail = async (cartId: string) => {
    setSendingId(cartId);
    try {
      await CartService.sendRecoveryEmail(cartId);
      toast.success("Recovery email sent successfully!");

      // Update UI locally (No need to refresh)
      setCarts((prev) =>
        prev.map((c) =>
          c._id === cartId ? { ...c, isReminderSent: true } : c,
        ),
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
      </div>
    );
  }

  // --- Styles ---
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";
  const cardClass =
    "rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]";
  const tableHeader =
    "text-xs uppercase font-semibold border-b border-zinc-100 bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-gray-400 dark:border-white/5";
  const tableRowHover =
    "hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${textPrimary}`}>
            Abandoned Carts
          </h1>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            Recover lost sales by reminding customers about items left in their
            cart.
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2
          bg-red-50 text-red-600 border border-red-100
          dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
        >
          <AlertTriangle className="h-4 w-4" />
          {carts.length} Potential Orders Lost
        </div>
      </div>

      {/* Table Card */}
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={tableHeader}>
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Cart Items</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Inactive Since</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-sm">
              {carts.length > 0 ? (
                carts.map((cart) => (
                  <tr key={cart._id} className={tableRowHover}>
                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <p className={`font-medium ${textPrimary}`}>
                        {cart.user?.name || "Unknown"}
                      </p>
                      <p className={`text-xs ${textSecondary}`}>
                        {cart.user?.email}
                      </p>
                    </td>

                    {/* Items Preview */}
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {cart.items.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={
                              item.product?.images?.[0]?.url ||
                              "/placeholder.png"
                            }
                            alt={item.product?.name}
                            className="inline-block h-8 w-8 rounded-full ring-2 object-cover bg-zinc-100 ring-white dark:bg-gray-800 dark:ring-[#0f0f11]"
                            title={item.product?.name}
                          />
                        ))}
                        {cart.items.length > 3 && (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-2
                            bg-zinc-100 ring-white text-zinc-600 
                            dark:bg-gray-800 dark:ring-[#0f0f11] dark:text-white"
                          >
                            +{cart.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${textSecondary}`}>
                        {cart.items.length} items
                      </p>
                    </td>

                    {/* Value */}
                    <td className={`px-6 py-4 font-mono ${textPrimary}`}>
                      {formatCurrency(cart.totalAmount)}
                    </td>

                    {/* Time */}
                    <td
                      className={`px-6 py-4 flex items-center gap-2 ${textSecondary}`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(cart.lastActiveAt), {
                        addSuffix: true,
                      })}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      {cart.isReminderSent ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed opacity-80
                          bg-green-100 text-green-700 
                          dark:bg-green-500/20 dark:text-green-400"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Sent
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendMail(cart._id)}
                          disabled={sendingId === cart._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                          bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 
                          dark:shadow-blue-900/20"
                        >
                          {sendingId === cart._id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-3.5 w-3.5" /> Send Reminder
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className={`text-center py-12 ${textSecondary}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-500/50" />
                      <p>No abandoned carts found! Good job.</p>
                    </div>
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
