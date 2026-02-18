"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { AdminAuthService } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ API Call
      await AdminAuthService.login(formData);

      // ✅ Success Message
      toast.success("Access Granted. Welcome Administrator.");

      // 🔥 FIX: router.push తీసేసి window.location.href వాడండి.
      // ఇది బ్రౌజర్ ని రీఫ్రెష్ చేసి కుకీలను సర్వర్ కి పంపుతుంది (Middleware Check కోసం)
      //window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Authentication failed. Verify credentials.",
      );
      setIsLoading(false); // Error వస్తేనే లోడింగ్ ఆపాలి (Success అయితే రీడైరెక్ట్ అవుతుంది)
    }
    // finally { setIsLoading(false) } // ఇది తీసేయండి, ఎందుకంటే రీడైరెక్ట్ అయ్యేటప్పుడు లోడింగ్ ఆగిపోకూడదు
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030712] font-sans selection:bg-blue-500/30">
      {/* 🌌 Background: Technical Grid & Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] w-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]"></div>
      </div>

      {/* Login Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        {/* Glass Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-blue-500/10">
          {/* Subtle Top Gradient Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
            >
              <ShieldCheck className="h-8 w-8 text-white drop-shadow-md" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="mt-3 text-sm font-medium text-gray-400">
              Secure access for Hyundai Spares Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                Email / ID
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 transition-colors group-focus-within:text-blue-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 transition-all duration-300 focus:border-blue-500/50 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="admin@hyundai.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 transition-colors group-focus-within:text-blue-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-600 transition-all duration-300 focus:border-blue-500/50 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
                isLoading={isLoading}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {!isLoading && (
                    <Zap className="h-4 w-4" fill="currentColor" />
                  )}
                  Sign In to Dashboard
                </span>
              </Button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Varshini Hyundai Spares &copy; 2025.
              <span className="block mt-1 text-gray-600">
                Restricted Access System
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
