"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        // LIGHT MODE: bg-zinc-200 (Gray)
        // DARK MODE: bg-white/5 (Glass/Translucent)
        "relative overflow-hidden rounded-lg bg-zinc-200 dark:bg-white/5",
        className,
      )}
    >
      {/* Shimmer Effect: Adjusted for visibility in both modes */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {/* Using darker skeleton for header to distinguish it */}
        <Skeleton className="h-10 w-1/4 bg-zinc-300 dark:bg-white/10" />
        <Skeleton className="h-10 w-1/4 bg-zinc-300 dark:bg-white/10" />
        <Skeleton className="h-10 w-1/4 bg-zinc-300 dark:bg-white/10" />
        <Skeleton className="h-10 w-1/4 bg-zinc-300 dark:bg-white/10" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 backdrop-blur-sm",
        // Light Mode: White bg, visible border
        "border-zinc-200 bg-white",
        // Dark Mode: Glass effect
        "dark:border-white/5 dark:bg-white/5",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
