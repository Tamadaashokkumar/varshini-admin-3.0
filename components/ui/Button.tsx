"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ✅ FIX 1: ButtonHTMLAttributes బదులు HTMLMotionProps వాడాలి.
// ఇది Framer Motion టైప్ ఎర్రర్స్ ని ఫిక్స్ చేస్తుంది.
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  // ✅ FIX 2: 'outline' ని variant లో యాడ్ చేసాము
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    danger:
      "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    // ✅ FIX 3: Outline స్టైల్స్ డిఫైన్ చేసాము
    outline:
      "bg-transparent border border-white/20 text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      // Loading లేదా Disabled ఉన్నప్పుడు యానిమేషన్ ఆపేస్తున్నాం
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
