"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Package,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCcw,
  X,
  MapPin,
  Calendar,
  User as UserIcon,
  CreditCard,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  CheckSquare,
  Square,
  ArrowUpRight,
  Undo2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderService, downloadInvoice } from "@/lib/api";
import { toast } from "sonner";

import { formatCurrency, getOrderStatusColor, cn } from "@/lib/utils";
import { useSocket } from "@/components/providers/SocketProvider";
import Image from "next/image";

// --- Custom Toast Component ---
const NewOrderToast = ({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) => (
  <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0a0a0a]/95 p-0 shadow-2xl backdrop-blur-xl">
    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />
    <div className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 ring-1 ring-blue-500/40">
          <div className="relative">
            <div className="absolute -inset-1 animate-ping rounded-full bg-blue-500 opacity-50" />
            <PackageCheck className="relative h-6 w-6 text-blue-400" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">
              New Order Received!
            </h4>
            <span className="text-xs font-medium text-gray-400">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-300">
            Order{" "}
            <span className="font-mono text-cyan-400">#{data.orderNumber}</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 p-3">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="text-sm font-medium text-white">
                {data.customerName || "Guest"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(data.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/20"
        >
          Dismiss
        </button>
        <button
          onClick={() => {
            onClose();
          }}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-lg shadow-blue-500/20"
        >
          View Order
        </button>
      </div>
    </div>
  </div>
);

// --- Types ---
interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  type?: string;
}

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
  partNumber?: string;

  // 🔥 Return Management
  returnStatus?: "None" | "Requested" | "Approved" | "Rejected" | "Returned";
  product?:
    | string
    | {
        images: { url: string }[];
      };
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  shippingCharges: number;
  couponCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "COD" | "Razorpay";
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded";
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
  };
  orderStatus:
    | "Placed"
    | "Packed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  // 🔥 Timeline Feature

  statusHistory?: StatusHistory[];
  createdAt: string;
  invoicePath?: string;
  invoiceNumber?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ORDER_STATUSES = [
  "Placed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

const STATUS_ICONS: Record<string, any> = {
  Placed: Package,
  Packed: PackageCheck,
  Shipped: Truck,
  Delivered: CheckCircle,
  Cancelled: XCircle,
  Returned: Undo2,
};

// --- Components ---

// 1. Order Details Modal (Updated with Timeline & RMA)
const OrderDetailsModal = ({
  order,
  onClose,
  onStatusUpdate,
  onReturnAction,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  onReturnAction: (
    orderId: string,
    itemId: string,
    action: "Approved" | "Rejected",
  ) => void;
}) => {
  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] dark:bg-[#1e1e1e] dark:border-white/10"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 md:p-6 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Order Details
            </h2>
            <p className="text-sm text-cyan-600 font-mono mt-1 dark:text-cyan-400">
              {order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar">
          {/* Customer & Date Info */}
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-3">
              <div className="mt-1 rounded-lg bg-blue-100 p-2 h-fit dark:bg-blue-500/10">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-gray-400">
                  Customer
                </p>
                <p className="font-medium text-zinc-900 text-lg dark:text-white">
                  {order.user?.name || "Guest User"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-gray-400">
                  {order.user?.email}
                </p>
                {order.shippingAddress?.phone && (
                  <p className="text-sm text-zinc-500 dark:text-gray-400">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 rounded-lg bg-purple-100 p-2 h-fit dark:bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-gray-400">
                  Order Date
                </p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-zinc-500 dark:text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* 🔥 2. Order Timeline Feature */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 dark:text-gray-400">
                Order Timeline
              </h3>
              <div className="relative border-l border-zinc-200 ml-3 space-y-6 dark:border-white/10">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative ml-6">
                    <span
                      className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#1e1e1e] ${idx === order.statusHistory!.length - 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                    ></span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {history.status}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-gray-500">
                      {new Date(history.timestamp).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-xs text-zinc-400 mt-1 italic dark:text-gray-400">
                        "{history.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items List with Return Management */}
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-3 dark:text-gray-400">
              Items ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const itemImg =
                  item.image ||
                  (typeof item.product === "object"
                    ? item.product?.images?.[0]?.url
                    : null);
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-3 border border-zinc-100 dark:bg-white/5 dark:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-zinc-200 dark:bg-white/10 dark:border-transparent">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 line-clamp-1 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {formatCurrency(
                            item.subtotal || item.price * item.quantity,
                          )}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-zinc-500 dark:text-gray-500">
                            {formatCurrency(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 🔥 Return Management Actions */}
                    {item.returnStatus === "Requested" && (
                      <div className="flex items-center justify-between border-t border-zinc-200 pt-2 mt-1 dark:border-white/10">
                        <span className="text-xs text-yellow-600 font-medium flex items-center gap-1 dark:text-yellow-400">
                          <Undo2 size={12} /> Return Requested
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              onReturnAction(order._id, item._id, "Approved")
                            }
                            className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs hover:bg-green-200 transition dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              onReturnAction(order._id, item._id, "Rejected")
                            }
                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs hover:bg-red-200 transition dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {item.returnStatus === "Approved" && (
                      <div className="border-t border-zinc-200 pt-2 mt-1 dark:border-white/10">
                        <span className="text-xs text-green-600 font-medium dark:text-green-400">
                          Return Approved
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Address & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Shipping Address</span>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 border border-zinc-100 leading-relaxed dark:bg-white/5 dark:text-gray-300 dark:border-white/5">
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>PIN: {order.shippingAddress?.pincode}</p>
                <p className="text-xs text-zinc-500 mt-1 dark:text-gray-500">
                  {order.shippingAddress?.type}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-gray-400">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Details</span>
              </div>
              {/* Payment Details Card (Updated) */}
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 space-y-3 dark:bg-white/5 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500 dark:text-gray-400">
                    Method
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      order.paymentMethod === "COD"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
                    )}
                  >
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      order.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* 🔥 NEW: Transaction ID (ఇక్కడ యాడ్ చేశాను) 🔥 */}
                {order.paymentDetails?.razorpayPaymentId && (
                  <div className="flex justify-between items-center border-t border-zinc-200 pt-2 mt-2 dark:border-white/5">
                    <span className="text-sm text-zinc-500 dark:text-gray-400">
                      Txn ID
                    </span>
                    <span className="text-xs font-mono text-zinc-900 dark:text-gray-300">
                      {order.paymentDetails.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 space-y-2 dark:border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-gray-400">Subtotal</span>
              <span className="text-zinc-900 dark:text-white">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-gray-400">
                Tax ({order.taxPercentage}%)
              </span>
              <span className="text-zinc-900 dark:text-white">
                {formatCurrency(order.tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-gray-400">Shipping</span>
              <span className="text-zinc-900 dark:text-white">
                {formatCurrency(order.shippingCharges)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Discount
                </span>
                <span className="text-green-600 dark:text-green-400">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-white/5">
              <p className="text-sm font-bold text-zinc-700 dark:text-gray-300">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-gray-400">
              Update Order Status
            </label>
            <div className="relative">
              <select
                value={order.orderStatus}
                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                className="w-full appearance-none rounded-xl border px-4 py-3 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100
                dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                {ORDER_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                    className="text-zinc-900 bg-white dark:bg-[#1e1e1e] dark:text-white"
                  >
                    {status}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-gray-400">
                <RefreshCcw className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page Component ---
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 🔥 Advanced Filter States
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);

  // 🔥 Bulk Action States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const { socket, isConnected } = useSocket();

  const fetchOrders = async (pageNo = 1) => {
    try {
      setIsLoading(true);
      // Construct Query params including date filters
      const params: any = { limit: pagination.limit, page: pageNo };
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await OrderService.getAllOrders(params);
      const incomingData = response.data.data || [];
      const meta = response.data.pagination || {};

      if (Array.isArray(incomingData)) {
        setOrders(incomingData);
      } else if (incomingData.orders && Array.isArray(incomingData.orders)) {
        setOrders(incomingData.orders);
      } else {
        setOrders([]);
      }

      if (meta.total !== undefined) {
        setPagination({
          page: meta.page || pageNo,
          limit: meta.limit || 20,
          total: meta.total || 0,
          totalPages: meta.totalPages || 1,
          hasNextPage: meta.hasNextPage || false,
          hasPrevPage: meta.hasPrevPage || false,
        });
      }
      // Reset selection on page change
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [dateRange]); // Refetch when date filter changes

  // Socket Logic
  useEffect(() => {
    if (socket && isConnected) {
      socket.on("new_order", (data: any) => {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch((err) => console.warn("Audio blocked:", err));
        toast.custom(
          (t) => <NewOrderToast data={data} onClose={() => toast.dismiss(t)} />,
          { duration: 5000, position: "top-right" },
        );
        fetchOrders(1);
      });
      socket.on("order_status_updated", (data: any) => {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === data.orderId
              ? { ...order, orderStatus: data.orderStatus }
              : order,
          ),
        );
        if (selectedOrder && selectedOrder._id === data.orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, orderStatus: data.orderStatus } : null,
          );
        }
      });
      return () => {
        socket.off("new_order");
        socket.off("order_status_updated");
      };
    }
  }, [socket, isConnected, selectedOrder]);

  // --- Bulk Action Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredOrders.map((o) => o._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      toast.loading(`Updating ${selectedIds.size} orders...`);
      // Assuming API has a bulk update endpoint, or we loop (Looping for now as per likely API)
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          OrderService.updateStatus(id, {
            orderStatus: status as
              | "Placed"
              | "Packed"
              | "Shipped"
              | "Delivered"
              | "Cancelled",
          }),
        ),
      );
      toast.dismiss();
      toast.success("Bulk update successful");
      fetchOrders(pagination.page);
      setSelectedIds(new Set());
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to update some orders");
    }
  };

  const handleExport = () => {
    // Basic CSV Export Logic
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.user?.name,
      o.totalAmount,
      o.orderStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // 1. Optimistic Update (తక్షణమే UI మారడానికి)
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: newStatus as any } : o,
      ),
    );
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
    }

    try {
      // 2. API Call
      const response = await OrderService.updateStatus(orderId, {
        orderStatus: newStatus as any,
      });

      // 3. 🔥 FIX: Backend నుండి వచ్చిన లేటెస్ట్ డేటాను తీసుకోవాలి
      // (ఇందులో Payment Status: 'Completed' అని మారిపోయి ఉంటుంది)
      const updatedOrder = response.data.data?.order || response.data?.order;

      if (updatedOrder) {
        // లిస్ట్ అప్‌డేట్
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? updatedOrder : o)),
        );

        // మోడల్ ఓపెన్ అయి ఉంటే దాన్ని కూడా అప్‌డేట్ చేయాలి
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      fetchOrders(pagination.page); // ఎర్రర్ వస్తే పాత డేటా తెచ్చేస్తాం
    }
  };

  const handleReturnAction = async (
    orderId: string,
    itemId: string,
    action: "Approved" | "Rejected",
  ) => {
    // Logic to call API to approve/reject return
    // For UI demo, we simulate
    toast.success(`Return ${action} for item`);
    // In real implementation: await OrderService.processReturn(orderId, itemId, action);
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      toast.loading("Downloading invoice...");
      await downloadInvoice(order._id, order.orderNumber);
      toast.dismiss();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download invoice");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (order.orderNumber || "").toLowerCase().includes(query) ||
      (order.user?.name || "").toLowerCase().includes(query) ||
      (order.user?.email || "").toLowerCase().includes(query);
    const matchesStatus =
      selectedStatus === "All" || order.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // 🔥 REAL LAYOUT SKELETON (CLS Fix for Orders Page)
  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-6 relative px-2 md:px-0">
        {/* 1. Header Section Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between h-[60px]">
          <div>
            <Skeleton className="h-8 w-48 rounded-lg mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-64 rounded-lg" /> {/* Subtitle */}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20 rounded-lg" /> {/* Live Status */}
            <Skeleton className="h-10 w-24 rounded-lg" /> {/* Refresh Btn */}
          </div>
        </div>

        {/* 2. Filters & Search Skeleton */}
        <div className="flex flex-col sm:flex-row items-center gap-4 h-[44px]">
          <Skeleton className="w-full sm:flex-1 h-full rounded-xl" />{" "}
          {/* Search Input */}
          <div className="flex gap-2">
            <Skeleton className="h-full w-[44px] rounded-xl" />{" "}
            {/* Filter Toggle */}
            <Skeleton className="h-full w-[44px] rounded-xl" />{" "}
            {/* Export Btn */}
          </div>
        </div>

        {/* 3. Status Tabs Skeleton */}
        <div className="flex w-full sm:w-auto items-center gap-2 overflow-hidden h-[36px]">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
          ))}
        </div>

        {/* 4. Stats Cards Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 bg-white border-zinc-200 dark:bg-white/5 dark:border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-9 w-9 rounded-lg" /> {/* Icon Box */}
                <Skeleton className="h-4 w-16 rounded" /> {/* Label */}
              </div>
              <Skeleton className="h-8 w-12 rounded mt-2" /> {/* Count */}
            </div>
          ))}
        </div>

        {/* 5. Orders Table Skeleton */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.02] overflow-hidden">
          {/* Table Header */}
          <div className="h-12 bg-zinc-50 border-b border-zinc-200 dark:bg-white/5 dark:border-white/10 flex items-center px-4 gap-4">
            <Skeleton className="h-5 w-5 rounded" /> {/* Checkbox */}
            <Skeleton className="h-4 w-20 rounded" /> {/* Order */}
            <Skeleton className="h-4 w-24 rounded" /> {/* Date */}
            <Skeleton className="h-4 w-32 rounded" /> {/* Customer */}
            <Skeleton className="h-4 w-20 rounded" /> {/* Payment */}
            <Skeleton className="h-4 w-20 rounded" /> {/* Amount */}
            <Skeleton className="h-4 w-20 rounded" /> {/* Status */}
            <Skeleton className="h-4 w-16 rounded ml-auto" /> {/* Actions */}
          </div>

          {/* Table Rows (8 Fake Rows) */}
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 h-[72px]"
              >
                <Skeleton className="h-5 w-5 rounded shrink-0" />{" "}
                {/* Checkbox */}
                {/* Order Column (Image + ID) */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 rounded hidden md:block" />{" "}
                {/* Date */}
                <div className="flex-1 space-y-1 hidden sm:block">
                  <Skeleton className="h-4 w-32 rounded" /> {/* Name */}
                  <Skeleton className="h-3 w-24 rounded" /> {/* Email */}
                </div>
                <div className="w-24 hidden lg:block space-y-1">
                  <Skeleton className="h-5 w-16 rounded-full" />{" "}
                  {/* Payment Type */}
                  <Skeleton className="h-3 w-12 rounded" /> {/* Pay Status */}
                </div>
                <Skeleton className="h-5 w-20 rounded font-bold" />{" "}
                {/* Amount */}
                <Skeleton className="h-6 w-24 rounded-full" />{" "}
                {/* Order Status */}
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Styles for Main Page
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";
  const cardClass =
    "rounded-xl border backdrop-blur-sm p-4 transition-colors border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";
  const inputClass =
    "w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500/20";
  const btnSecondary =
    "rounded-xl border p-2.5 transition hover:bg-zinc-100 bg-white border-zinc-200 text-zinc-500 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <div className="space-y-6 relative px-2 md:px-0">
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            onReturnAction={handleReturnAction}
          />
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>
            Orders Dashboard
          </h1>
          <p className={`mt-1 ${textSecondary}`}>
            Manage orders and view details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              isConnected
                ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-white/5 dark:text-green-400"
                : "bg-red-100 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-white/5 dark:text-red-400",
            )}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                isConnected
                  ? "bg-green-500 dark:bg-green-400"
                  : "bg-red-500 dark:bg-red-400",
              )}
            />
            {isConnected ? "Live" : "Offline"}
          </div>
          <button
            onClick={() => fetchOrders(1)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors
            bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50
            dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <RefreshCcw className="h-4 w-4" /> <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 🔥 Bulk Action Bar (Shows when items selected) */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between dark:bg-blue-500/10 dark:border-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-bold text-sm px-2 dark:text-blue-400">
              {selectedIds.size} Selected
            </span>
            <div className="h-4 w-px bg-blue-200 dark:bg-blue-500/20"></div>
            <button
              onClick={() => handleBulkStatusUpdate("Shipped")}
              className="text-xs font-medium text-zinc-600 hover:text-blue-600 transition dark:text-white dark:hover:text-blue-300"
            >
              Mark Shipped
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("Delivered")}
              className="text-xs font-medium text-zinc-600 hover:text-blue-600 transition dark:text-white dark:hover:text-blue-300"
            >
              Mark Delivered
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
          >
            <Download size={14} /> Export Selected
          </button>
        </motion.div>
      )}

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textSecondary}`}
          />
          <input
            type="text"
            placeholder="Search Order ID, Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 🔥 Advanced Filter Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition ${
              showFilters
                ? "bg-blue-100 border-blue-300 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/50 dark:text-blue-400"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Filter size={18} />
          </button>
          <button
            onClick={handleExport}
            className={btnSecondary}
            title="Export All to CSV"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* 🔥 Advanced Filters Expandable Area */}
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
              <div>
                <label className={`text-xs mb-1 block ${textSecondary}`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${textSecondary}`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="text-xs text-red-500 hover:text-red-600 underline mb-2 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto rounded-xl border p-1 scrollbar-hide
        bg-zinc-100 border-zinc-200
        dark:bg-white/5 dark:border-white/10"
      >
        {["All", ...ORDER_STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white",
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {ORDER_STATUSES.map((status) => {
          const count = orders.filter((o) => o.orderStatus === status).length;
          const Icon = STATUS_ICONS[status] || Package;
          const isCancelled = status === "Cancelled";
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cardClass}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isCancelled
                      ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${textSecondary}`}>
                  {status}
                </span>
              </div>
              <p className={`text-2xl font-bold pl-1 ${textPrimary}`}>
                {count}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
                {/* 🔥 Checkbox Header */}
                <th className="px-4 py-4 text-left w-10">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (selectedIds.size === filteredOrders.length)
                          setSelectedIds(new Set());
                        else
                          setSelectedIds(
                            new Set(filteredOrders.map((o) => o._id)),
                          );
                      }}
                    >
                      {selectedIds.size > 0 &&
                      selectedIds.size === filteredOrders.length ? (
                        <CheckSquare
                          size={18}
                          className="text-blue-600 dark:text-blue-500"
                        />
                      ) : (
                        <Square
                          size={18}
                          className="text-zinc-400 dark:text-gray-500"
                        />
                      )}
                    </button>
                  </div>
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Order
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Date
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Customer
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Payment
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Amount
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Status
                </th>
                <th
                  className={`px-4 md:px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondary}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className={`px-4 md:px-6 py-12 text-center ${textSecondary}`}
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const itemImage =
                    firstItem?.image ||
                    (typeof firstItem?.product === "object"
                      ? firstItem.product?.images?.[0]?.url
                      : null);
                  const totalItems =
                    order.items?.reduce(
                      (acc, item) => acc + item.quantity,
                      0,
                    ) || 0;
                  const isSelected = selectedIds.has(order._id);

                  return (
                    <motion.tr
                      key={order._id}
                      whileHover={{
                        backgroundColor: "rgba(0,0,0,0.02)",
                      }}
                      className={`group hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${isSelected ? "bg-blue-50 dark:bg-blue-500/5" : ""}`}
                    >
                      {/* 🔥 Checkbox Cell */}
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleSelectOne(order._id)}>
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
                            className="relative h-12 w-12 overflow-hidden rounded-lg border flex-shrink-0
                            bg-zinc-100 border-zinc-200
                            dark:bg-white/5 dark:border-white/10"
                          >
                            {itemImage ? (
                              <Image
                                src={itemImage}
                                alt="Item"
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-gray-500">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <code
                              className="rounded px-2 py-1 text-xs font-mono
                              bg-cyan-100 text-cyan-700
                              dark:bg-white/5 dark:text-cyan-400"
                            >
                              {order.orderNumber}
                            </code>
                            <div className="mt-1">
                              <span
                                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium
                                bg-zinc-100 border-zinc-200 text-zinc-600
                                dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                              >
                                {totalItems} Item{totalItems !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium ${textPrimary}`}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-xs flex items-center gap-1 ${textSecondary}`}
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <p className={`font-medium ${textPrimary}`}>
                          {order.user?.name || "Guest"}
                        </p>
                        <p className={`text-xs ${textSecondary}`}>
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
                              order.paymentMethod === "COD"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                            )}
                          >
                            {order.paymentMethod}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              order.paymentStatus === "Completed"
                                ? "text-green-600 dark:text-green-400"
                                : order.paymentStatus === "Failed"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-zinc-500 dark:text-gray-400",
                            )}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-4 md:px-6 py-4 font-semibold ${textPrimary}`}
                      >
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            getOrderStatusColor(order.orderStatus),
                          )}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="rounded-lg bg-green-100 p-2 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4
          bg-zinc-50 border-zinc-200
          dark:bg-white/5 dark:border-white/10"
        >
          <p className={`text-sm ${textSecondary}`}>
            Showing{" "}
            <span className={`font-medium ${textPrimary}`}>
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className={`font-medium ${textPrimary}`}>
              {pagination.total}
            </span>{" "}
            orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
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
              <span className={`text-zinc-400 px-1 dark:text-gray-500`}>/</span>
              <span className={`text-sm ${textSecondary}`}>
                {pagination.totalPages}
              </span>
            </div>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed
                bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50
                dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
