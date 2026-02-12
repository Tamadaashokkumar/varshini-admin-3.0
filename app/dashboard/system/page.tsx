"use client";

import { motion } from "framer-motion";
import {
  Server,
  Database,
  Cpu,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function SystemStatusPage() {
  // Mock Data (Real project lo API nundi techukovali)
  const services = [
    {
      name: "API Server",
      status: "Operational",
      uptime: "99.9%",
      latency: "45ms",
      icon: Server,
    },
    {
      name: "MongoDB Database",
      status: "Operational",
      uptime: "100%",
      latency: "12ms",
      icon: Database,
    },
    {
      name: "Redis Cache",
      status: "Operational",
      uptime: "99.9%",
      latency: "2ms",
      icon: Activity,
    },
    {
      name: "Image Storage (Cloudinary)",
      status: "Operational",
      uptime: "100%",
      latency: "-",
      icon: Server,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        System Status
      </h1>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Overall Health"
          value="98%"
          icon={<Activity className="text-green-500" />}
        />
        <StatusCard
          title="Total Requests"
          value="1.2M"
          icon={<Server className="text-blue-500" />}
        />
        <StatusCard
          title="Avg Response Time"
          value="45ms"
          icon={<Clock className="text-orange-500" />}
        />
        <StatusCard
          title="Active Sessions"
          value="24"
          icon={<Cpu className="text-purple-500" />}
        />
      </div>

      {/* Services List */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            Service Health
          </h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-white/10">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-zinc-100 p-2 dark:bg-white/5">
                  <service.icon
                    size={20}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {service.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Latency: {service.latency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle size={12} />
                  {service.status}
                </span>
                <span className="text-sm text-zinc-500">{service.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon }: any) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-full bg-zinc-100 p-3 dark:bg-white/5">
          {icon}
        </div>
      </div>
    </div>
  );
}
