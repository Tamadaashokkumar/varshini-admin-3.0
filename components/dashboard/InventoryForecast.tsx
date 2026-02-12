"use client";
import { useEffect, useState } from "react";
import { DashboardService } from "@/lib/api";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function InventoryForecast() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    try {
      const res = await DashboardService.getInventoryForecast();
      setProducts(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAI = async () => {
    setLoading(true);
    try {
      await DashboardService.triggerAICalculation();
      toast.success("AI Analysis Updated!");
      fetchForecast(); // Refresh list
    } catch (e) {
      toast.error("Failed to update AI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> AI Stock Alerts
          </h3>
          <p className="text-sm text-gray-400">Predicted to run out soon</p>
        </div>
        <button
          onClick={refreshAI}
          disabled={loading}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
        >
          <RefreshCw
            className={`h-4 w-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Inventory looks healthy! ✅
          </p>
        ) : (
          products.map((p: any) => (
            <div
              key={p._id}
              className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl"
            >
              <img
                src={p.images?.[0]?.url}
                className="h-10 w-10 rounded-md object-cover"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">Stock: {p.stock} units</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-400">
                  {p.inventoryAnalytics?.daysRemaining || 0}
                </p>
                <p className="text-[10px] text-red-300/70">Days Left</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
