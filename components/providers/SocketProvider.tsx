"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  PackageCheck,
  TruckIcon,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
// పైన ఉన్న imports లిస్ట్ లో ఇది యాడ్ చేయండి
import api from "@/lib/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinOrderRoom: () => {},
  leaveOrderRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVanp8LNlHAU+ku3z0H0pBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBSh+zPLaizsIGGS57OihUBELTKXh8bllHAQ7ktXzzn8qBQ==",
      );
      audio.volume = 0.3;
      audio.play().catch((err) => console.log("Audio play failed:", err));
    }
  }, []);

  // useEffect(() => {
  //   // Get token from localStorage
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     console.log("No auth token found, skipping socket connection");
  //     return;
  //   }

  //   // Initialize socket connection with authentication
  //   const socketInstance = io(
  //     process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  //     {
  //       auth: {
  //         token: token,
  //       },
  //       transports: ["websocket"],
  //       autoConnect: true,
  //     },
  //   );

  //   // Connection events
  //   socketInstance.on("connect", () => {
  //     console.log("✅ Socket connected:", socketInstance.id);
  //     setIsConnected(true);
  //   });

  //   socketInstance.on("disconnect", () => {
  //     console.log("❌ Socket disconnected");
  //     setIsConnected(false);
  //   });

  //   socketInstance.on("connect_error", (error) => {
  //     console.error("Socket connection error:", error);
  //     setIsConnected(false);
  //   });

  //   // Server event: Connection success
  //   socketInstance.on("connected", (data) => {
  //     console.log("🎉 Connected to server:", data);
  //   });

  //   // Server event: New Order (Admin only)
  //   socketInstance.on("new_order", (orderData) => {
  //     console.log("🔔 New order received:", orderData);
  //     playNotificationSound();

  //     toast(
  //       <motion.div
  //         initial={{ x: 50, opacity: 0 }}
  //         animate={{ x: 0, opacity: 1 }}
  //         className="flex items-center gap-3"
  //       >
  //         <motion.div
  //           animate={{
  //             rotate: [0, -10, 10, -10, 0],
  //             scale: [1, 1.1, 1],
  //           }}
  //           transition={{ duration: 0.5 }}
  //           className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg"
  //         >
  //           <ShoppingCart className="h-6 w-6 text-white" />
  //         </motion.div>
  //         <div>
  //           <p className="font-bold text-white">🎉 New Order Received!</p>
  //           <p className="text-sm text-gray-300">
  //             Order #{orderData.orderNumber}
  //           </p>
  //           <p className="text-xs text-gray-400">
  //             Amount: ₹{orderData.totalAmount?.toLocaleString("en-IN")}
  //           </p>
  //         </div>
  //       </motion.div>,
  //       {
  //         duration: 6000,
  //         style: {
  //           background:
  //             "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
  //           border: "1px solid rgba(16, 185, 129, 0.3)",
  //         },
  //       },
  //     );
  //   });

  //   // Server event: Order Status Updated
  //   socketInstance.on("order_status_updated", (data) => {
  //     console.log("📦 Order status updated:", data);

  //     const statusIcons = {
  //       Placed: ShoppingCart,
  //       Packed: PackageCheck,
  //       Shipped: TruckIcon,
  //       Delivered: PackageCheck,
  //       Cancelled: AlertTriangle,
  //     };

  //     const statusColors = {
  //       Placed: "from-blue-500 to-cyan-500",
  //       Packed: "from-purple-500 to-pink-500",
  //       Shipped: "from-yellow-500 to-orange-500",
  //       Delivered: "from-green-500 to-emerald-500",
  //       Cancelled: "from-red-500 to-rose-500",
  //     };

  //     const Icon =
  //       statusIcons[data.orderStatus as keyof typeof statusIcons] ||
  //       PackageCheck;
  //     const colorClass =
  //       statusColors[data.orderStatus as keyof typeof statusColors] ||
  //       "from-blue-500 to-cyan-500";

  //     toast(
  //       <motion.div
  //         initial={{ x: 50, opacity: 0 }}
  //         animate={{ x: 0, opacity: 1 }}
  //         className="flex items-center gap-3"
  //       >
  //         <div
  //           className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass}`}
  //         >
  //           <Icon className="h-5 w-5 text-white" />
  //         </div>
  //         <div>
  //           <p className="font-semibold text-white">Order Status Updated</p>
  //           <p className="text-sm text-gray-300">
  //             Order #{data.orderNumber} → {data.orderStatus}
  //           </p>
  //         </div>
  //       </motion.div>,
  //       {
  //         duration: 4000,
  //       },
  //     );
  //   });

  //   // Server event: Payment Success
  //   socketInstance.on("payment_success", (data) => {
  //     console.log("💳 Payment successful:", data);

  //     toast(
  //       <motion.div
  //         initial={{ scale: 0.8, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         className="flex items-center gap-3"
  //       >
  //         <motion.div
  //           animate={{ rotate: [0, 360] }}
  //           transition={{ duration: 0.6 }}
  //           className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500"
  //         >
  //           <CreditCard className="h-5 w-5 text-white" />
  //         </motion.div>
  //         <div>
  //           <p className="font-semibold text-white">✅ Payment Successful</p>
  //           <p className="text-sm text-gray-300">Order #{data.orderNumber}</p>
  //           <p className="text-xs text-gray-400">
  //             Amount: ₹{data.amount?.toLocaleString("en-IN")}
  //           </p>
  //         </div>
  //       </motion.div>,
  //       {
  //         duration: 5000,
  //         style: {
  //           background:
  //             "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
  //           border: "1px solid rgba(16, 185, 129, 0.3)",
  //         },
  //       },
  //     );
  //   });

  //   // Server event: Payment Failed
  //   socketInstance.on("payment_failed", (data) => {
  //     console.log("❌ Payment failed:", data);

  //     toast.error(
  //       <div>
  //         <p className="font-semibold">Payment Failed</p>
  //         <p className="text-sm">Order #{data.orderNumber}</p>
  //       </div>,
  //       {
  //         duration: 5000,
  //       },
  //     );
  //   });

  //   // Server event: Order Placed
  //   socketInstance.on("order_placed", (data) => {
  //     console.log("📦 Order placed:", data);
  //   });

  //   // Server event: Low Stock Alert (if implemented on backend)
  //   socketInstance.on("low_stock_alert", (data) => {
  //     console.log("⚠️ Low stock alert:", data);

  //     toast.warning(
  //       <motion.div
  //         initial={{ x: 50, opacity: 0 }}
  //         animate={{ x: 0, opacity: 1 }}
  //         className="flex items-center gap-3"
  //       >
  //         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
  //           <AlertTriangle className="h-5 w-5 text-yellow-400" />
  //         </div>
  //         <div>
  //           <p className="font-semibold text-white">⚠️ Low Stock Alert</p>
  //           <p className="text-sm text-gray-300">{data.productName}</p>
  //           <p className="text-xs text-gray-400">
  //             Only {data.stock} units remaining
  //           </p>
  //         </div>
  //       </motion.div>,
  //       {
  //         duration: 6000,
  //       },
  //     );
  //   });

  //   setSocket(socketInstance);

  //   return () => {
  //     socketInstance.disconnect();
  //   };
  // }, [playNotificationSound]);

  // Join order room

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const initSocket = async () => {
      try {
        // 1. Backend API కాల్ చేసి టోకెన్ తెచ్చుకుంటున్నాం (ఇదే కొత్త మార్పు)
        const response = await api.get("/admin/auth/get-socket-token");
        const token = response.data?.token;

        if (!token) {
          console.log(
            "⚠️ No auth token found via API, skipping socket connection",
          );
          return;
        }

        // 2. Token దొరికింది, ఇప్పుడు Socket ని కనెక్ట్ చేస్తున్నాం
        socketInstance = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
          {
            auth: {
              token: token, // API నుండి వచ్చిన టోకెన్
            },
            transports: ["websocket"],
            autoConnect: true,
          },
        );

        // --- Connection Events ---
        socketInstance.on("connect", () => {
          console.log("✅ Socket connected:", socketInstance?.id);
          setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
          console.log("❌ Socket disconnected");
          setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });

        socketInstance.on("connected", (data) => {
          console.log("🎉 Connected to server:", data);
        });

        // --- Notification Events (మీ పాత కోడ్ మొత్తం ఇక్కడ ఉంది) ---

        // 1. New Order Alert
        socketInstance.on("new_order", (orderData) => {
          console.log("🔔 New order received:", orderData);
          playNotificationSound();

          toast(
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg"
              >
                <ShoppingCart className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <p className="font-bold text-white">🎉 New Order Received!</p>
                <p className="text-sm text-gray-300">
                  Order #{orderData.orderNumber}
                </p>
                <p className="text-xs text-gray-400">
                  Amount: ₹{orderData.totalAmount?.toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>,
            {
              duration: 6000,
              style: {
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            },
          );
        });

        // 2. Order Status Updated
        socketInstance.on("order_status_updated", (data) => {
          console.log("📦 Order status updated:", data);

          const statusIcons = {
            Placed: ShoppingCart,
            Packed: PackageCheck,
            Shipped: TruckIcon,
            Delivered: PackageCheck,
            Cancelled: AlertTriangle,
          };

          const statusColors = {
            Placed: "from-blue-500 to-cyan-500",
            Packed: "from-purple-500 to-pink-500",
            Shipped: "from-yellow-500 to-orange-500",
            Delivered: "from-green-500 to-emerald-500",
            Cancelled: "from-red-500 to-rose-500",
          };

          const Icon =
            statusIcons[data.orderStatus as keyof typeof statusIcons] ||
            PackageCheck;
          const colorClass =
            statusColors[data.orderStatus as keyof typeof statusColors] ||
            "from-blue-500 to-cyan-500";

          toast(
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass}`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Order Status Updated</p>
                <p className="text-sm text-gray-300">
                  Order #{data.orderNumber} → {data.orderStatus}
                </p>
              </div>
            </motion.div>,
            {
              duration: 4000,
            },
          );
        });

        // 3. Payment Success
        socketInstance.on("payment_success", (data) => {
          console.log("💳 Payment successful:", data);

          toast(
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.6 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500"
              >
                <CreditCard className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="font-semibold text-white">
                  ✅ Payment Successful
                </p>
                <p className="text-sm text-gray-300">
                  Order #{data.orderNumber}
                </p>
                <p className="text-xs text-gray-400">
                  Amount: ₹{data.amount?.toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>,
            {
              duration: 5000,
              style: {
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            },
          );
        });

        // 4. Payment Failed
        socketInstance.on("payment_failed", (data) => {
          console.log("❌ Payment failed:", data);

          toast.error(
            <div>
              <p className="font-semibold">Payment Failed</p>
              <p className="text-sm">Order #{data.orderNumber}</p>
            </div>,
            {
              duration: 5000,
            },
          );
        });

        // 5. Order Placed Log
        socketInstance.on("order_placed", (data) => {
          console.log("📦 Order placed:", data);
        });

        // 6. Low Stock Alert
        socketInstance.on("low_stock_alert", (data) => {
          console.log("⚠️ Low stock alert:", data);

          toast.warning(
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-white">⚠️ Low Stock Alert</p>
                <p className="text-sm text-gray-300">{data.productName}</p>
                <p className="text-xs text-gray-400">
                  Only {data.stock} units remaining
                </p>
              </div>
            </motion.div>,
            {
              duration: 6000,
            },
          );
        });

        // చివరగా స్టేట్ ని అప్డేట్ చేస్తున్నాం
        setSocket(socketInstance);
      } catch (error) {
        console.error("Socket initialization failed:", error);
      }
    };

    // ఫంక్షన్ ని కాల్ చేస్తున్నాం
    initSocket();

    // Cleanup Function
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [playNotificationSound]);

  const joinOrderRoom = useCallback(
    (orderId: string) => {
      if (socket && isConnected) {
        socket.emit("join_order_room", orderId);
        console.log(`📥 Joined order room: ${orderId}`);
      }
    },
    [socket, isConnected],
  );

  // Leave order room
  const leaveOrderRoom = useCallback(
    (orderId: string) => {
      if (socket && isConnected) {
        socket.emit("leave_order_room", orderId);
        console.log(`📤 Left order room: ${orderId}`);
      }
    },
    [socket, isConnected],
  );

  const value = {
    socket,
    isConnected,
    joinOrderRoom,
    leaveOrderRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
