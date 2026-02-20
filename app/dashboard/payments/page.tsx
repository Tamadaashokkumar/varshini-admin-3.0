"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Loader2,
  CreditCard,
  Search,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// టైప్స్ డిఫైన్ చేసుకుందాం
interface Payment {
  _id: string;
  order: { _id: string; orderNumber: string; totalAmount: number };
  user: { name: string; email: string; phone: string };
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // బ్యాకెండ్ నుండి డేటా తెచ్చుకోవడం
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/admin/all");
        if (res.data.success) {
          setPayments(res.data.data.payments);
        }
      } catch (error) {
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // స్టేటస్ ని బట్టి కలర్ బ్యాడ్జ్ ఇచ్చే ఫంక్షన్
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-bold">
            <CheckCircle size={12} /> Success
          </span>
        );
      case "Failed":
        return (
          <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-xs font-bold">
            <XCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md text-xs font-bold">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="text-blue-500" /> Transactions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor all your online and COD payments here.
          </p>
        </div>

        {/* Search Box (Optional) */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search TXN ID..."
            className="bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-gray-400 text-sm">Loading transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Method & TXN ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Date */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium text-white">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      </td>

                      {/* Order ID Link */}
                      <td className="p-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/orders?id=${payment.order?._id}`}
                          className="text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-1"
                        >
                          {payment.order?.orderNumber || "N/A"}
                          <ArrowUpRight
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-white truncate max-w-[150px]">
                          {payment.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.user?.phone || ""}
                        </div>
                      </td>

                      {/* Payment Method & Transaction ID */}
                      <td className="p-4">
                        <div className="font-bold text-gray-200">
                          {payment.paymentMethod}
                        </div>
                        {payment.razorpayPaymentId && (
                          <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                            {payment.razorpayPaymentId}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-black text-white">
                          ₹
                          {(
                            payment.amount ||
                            payment.order?.totalAmount ||
                            0
                          ).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(payment.paymentStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
