// "use client";

// import { useEffect, useState, useRef, useMemo } from "react";
// import { io, Socket } from "socket.io-client";
// import Cookies from "js-cookie";
// import { format } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Activity,
//   ShoppingCart,
//   Smartphone,
//   Monitor,
//   MapPin,
//   Battery,
//   MessageCircle,
//   Wifi,
//   History,
//   X,
//   Send,
//   User,
//   Bell,
//   MousePointer2,
//   AlertTriangle,
//   Clock,
//   Radio,
//   ShoppingBag,
//   CreditCard,
//   Zap,
//   Package,
//   Sparkles,
//   ChevronRight,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// const SOCKET_URL = (
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
// ).replace(/\/api\/?$/, "");

// // 🔊 Audio Objects
// const notificationSound =
//   typeof window !== "undefined"
//     ? new Audio(
//         "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
//       )
//     : null;

// const cartSound =
//   typeof window !== "undefined"
//     ? new Audio(
//         "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
//       )
//     : null;

// export default function LiveMonitor() {
//   const [logs, setLogs] = useState<any[]>([]);
//   const [isConnected, setIsConnected] = useState(false);

//   // 💬 Chat Modal States
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [targetUserId, setTargetUserId] = useState<string | null>(null);
//   const [targetUserName, setTargetUserName] = useState<string>("");
//   const [messageInput, setMessageInput] = useState("");

//   // 🔥 Incoming Reply Popup State
//   const [incomingReply, setIncomingReply] = useState<any | null>(null);

//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     const token = Cookies.get("accessToken");

//     socketRef.current = io(SOCKET_URL, {
//       auth: { token },
//       path: "/socket.io/",
//       transports: ["websocket"],
//       autoConnect: true,
//     });

//     socketRef.current.on("connect", () => {
//       setIsConnected(true);
//       socketRef.current?.emit("join_room", "admin");
//     });

//     socketRef.current.on("disconnect", () => setIsConnected(false));

//     socketRef.current.on("new_live_activity", (data: any) => {
//       if (data.action === "ADD_TO_CART" && cartSound) {
//         try {
//           cartSound.currentTime = 0;
//           cartSound.play().catch(() => {});
//         } catch (e) {}
//       }
//       setLogs((prev) => [data, ...prev].slice(0, 150));
//     });

//     socketRef.current.on("admin_receive_reply", (data: any) => {
//       try {
//         if (notificationSound) {
//           notificationSound.currentTime = 0;
//           notificationSound.play().catch(() => {});
//         }
//       } catch (e) {}
//       setIncomingReply(data);
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   // =================================================================
//   // 🔥 LOGIC: PERSISTENT CART + PRIORITY STATUS
//   // =================================================================
//   const activeUsers = useMemo(() => {
//     const userGroups = new Map();

//     logs.forEach((log) => {
//       const key = log.userId || log.guestId || log.userName;
//       if (!userGroups.has(key)) {
//         userGroups.set(key, []);
//       }
//       userGroups.get(key).push(log);
//     });

//     const finalDisplayList: any[] = [];

//     userGroups.forEach((userHistory, key) => {
//       let logToShow = userHistory[0]; // Latest Log

//       // 🛒 FIND PERSISTENT CART DATA
//       const logWithCart = userHistory.find(
//         (l: any) => l.meta?.cart?.items?.length > 0,
//       );
//       const persistentCart = logWithCart
//         ? logWithCart.meta.cart
//         : logToShow.meta?.cart || { items: [], total: 0 };

//       // 🚨 PRIORITY STATUS LOGIC
//       const IMPORTANT_ACTIONS = ["ADD_TO_CART", "CHECKOUT_INIT", "BUY_NOW"];
//       const recentImportantLog = userHistory
//         .slice(0, 8)
//         .find((l: any) => IMPORTANT_ACTIONS.includes(l.action));

//       const finalObj = {
//         ...logToShow,
//         statusAction: recentImportantLog
//           ? recentImportantLog.action
//           : logToShow.action,
//         cartData: persistentCart,
//         historyCount: userHistory.length,
//       };

//       finalDisplayList.push(finalObj);
//     });

//     return finalDisplayList;
//   }, [logs]);

//   const openChatModal = (userId: string, userName: string) => {
//     if (!userId) {
//       toast.error("Guest user - Cannot chat");
//       return;
//     }
//     setTargetUserId(userId);
//     setTargetUserName(userName);
//     setIsChatOpen(true);
//     setIncomingReply(null);
//   };

//   const handleSendMessage = () => {
//     if (!messageInput.trim()) return;

//     if (socketRef.current && targetUserId) {
//       socketRef.current.emit("admin_send_message_trigger", {
//         targetUserId: targetUserId,
//         message: messageInput,
//       });
//       toast.success(`Message sent to ${targetUserName}!`);
//       setMessageInput("");
//       setIsChatOpen(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-transparent text-gray-200 font-sans overflow-x-hidden relative selection:bg-cyan-500/30">
//       <Toaster position="top-right" />

//       {/* 🌌 Background Ambience (Dark & Moody) */}
//       <div className="fixed inset-0 pointer-events-none -z-10 bg-[#020617]">
//         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] delay-1000"></div>
//         <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]"></div>
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
//       </div>

//       {/* 🚀 Header */}
//       <header className="sticky top-0 z-40 bg-[#020617]/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 shadow-lg">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex items-center gap-4">
//             <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
//               <Activity className="text-indigo-400 w-6 h-6 animate-pulse" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-widest text-white">
//                 LIVE{" "}
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
//                   SPY
//                 </span>
//               </h1>
//               <div className="flex items-center gap-2 mt-0.5">
//                 <div className="flex items-center gap-1.5">
//                   <span className={`relative flex h-2 w-2`}>
//                     <span
//                       className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
//                     ></span>
//                     <span
//                       className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
//                     ></span>
//                   </span>
//                   <span
//                     className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${isConnected ? "text-emerald-400" : "text-red-400"}`}
//                   >
//                     {isConnected ? "System Online" : "Reconnecting"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md shadow-inner">
//             <Radio
//               size={16}
//               className={`text-cyan-400 ${activeUsers.length > 0 ? "animate-pulse" : ""}`}
//             />
//             <span className="text-sm font-medium text-gray-300">
//               Active Targets:{" "}
//               <span className="text-white text-lg font-bold ml-1">
//                 {activeUsers.length}
//               </span>
//             </span>
//           </div>
//         </div>
//       </header>

//       {/* 📡 Activity Grid */}
//       <main className="max-w-7xl mx-auto p-6 relative z-10">
//         {activeUsers.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex flex-col items-center justify-center h-[60vh] text-gray-500"
//           >
//             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
//               <Wifi size={48} className="text-white/20" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-400 mb-2 tracking-tight">
//               Scanning Network...
//             </h2>
//             <p className="text-sm font-mono text-gray-600 uppercase tracking-widest">
//               Waiting for signals
//             </p>
//           </motion.div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             <AnimatePresence>
//               {activeUsers.map((log) => {
//                 const meta = log.meta || {};
//                 const isTabActive = meta.isTabActive !== false;

//                 const isExitIntent = log.statusAction === "EXIT_INTENT";
//                 const isAddToCart = log.statusAction === "ADD_TO_CART";
//                 const isCheckout = log.statusAction === "CHECKOUT_INIT";

//                 const uniqueKey = log.userId || log.guestId || log.userName;
//                 const cartItems = log.cartData?.items || [];
//                 const cartTotal = log.cartData?.total || 0;

//                 // Dynamic Border Color
//                 const borderColor = isExitIntent
//                   ? "border-red-500/50"
//                   : isAddToCart
//                     ? "border-emerald-500/50"
//                     : "border-white/10";
//                 const shadowColor = isExitIntent
//                   ? "shadow-red-900/20"
//                   : isAddToCart
//                     ? "shadow-emerald-900/20"
//                     : "shadow-black/20";

//                 return (
//                   <motion.div
//                     key={uniqueKey}
//                     layout
//                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     whileHover={{ y: -5, transition: { duration: 0.2 } }}
//                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                     className={`
//                       relative rounded-[1.5rem] overflow-hidden backdrop-blur-xl border transition-all duration-300 shadow-xl group
//                       bg-gray-900/60 ${borderColor} ${shadowColor}
//                     `}
//                   >
//                     {/* Glowing Top Line */}
//                     <div
//                       className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50`}
//                     ></div>

//                     <div className="p-6 relative z-10">
//                       {/* Top Row: User Info & Status */}
//                       <div className="flex justify-between items-start mb-5">
//                         <div className="flex items-center gap-4">
//                           <div
//                             className={`p-3 rounded-2xl border backdrop-blur-md shadow-lg ${meta.device === "Mobile" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-blue-500/20 border-blue-500/30 text-blue-300"}`}
//                           >
//                             {meta.device === "Mobile" ? (
//                               <Smartphone size={20} />
//                             ) : (
//                               <Monitor size={20} />
//                             )}
//                           </div>
//                           <div>
//                             <h3 className="font-bold text-white text-base truncate max-w-[140px] flex items-center gap-2 tracking-tight">
//                               {log.userName}
//                               {log.userId ? (
//                                 <div className="bg-cyan-500/20 p-1 rounded-md border border-cyan-500/30">
//                                   <User size={10} className="text-cyan-300" />
//                                 </div>
//                               ) : (
//                                 <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 border border-white/5 uppercase tracking-wider">
//                                   GUEST
//                                 </span>
//                               )}
//                             </h3>
//                             <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-medium">
//                               <MapPin size={12} className="text-indigo-400" />
//                               {meta.location || "Unknown Location"}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Status Pill */}
//                         <div
//                           className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-2 backdrop-blur-md shadow-lg
//                           ${
//                             isExitIntent
//                               ? "bg-red-500/20 text-red-200 border-red-500/40"
//                               : isAddToCart
//                                 ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
//                                 : isTabActive
//                                   ? "bg-cyan-500/10 text-cyan-200 border-cyan-500/30"
//                                   : "bg-white/5 text-gray-400 border-white/10"
//                           }`}
//                         >
//                           <span
//                             className={`w-1.5 h-1.5 rounded-full ${isExitIntent ? "bg-red-500 animate-ping" : isAddToCart ? "bg-emerald-500 animate-bounce" : isTabActive ? "bg-cyan-500 animate-pulse" : "bg-gray-500"}`}
//                           ></span>
//                           {isExitIntent
//                             ? "LEAVING"
//                             : isAddToCart
//                               ? "BUYING"
//                               : isTabActive
//                                 ? "ONLINE"
//                                 : "IDLE"}
//                         </div>
//                       </div>

//                       {/* 🔥🔥🔥 UPDATED CART LIST (High Contrast) 🔥🔥🔥 */}
//                       {cartItems.length > 0 && (
//                         <div className="mb-5 bg-[#020617]/50 border border-white/10 rounded-xl overflow-hidden shadow-inner backdrop-blur-sm ring-1 ring-black/20">
//                           {/* Header */}
//                           <div className="bg-white/5 px-4 py-2.5 border-b border-white/5 flex justify-between items-center">
//                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
//                               <ShoppingBag
//                                 size={12}
//                                 className="text-emerald-400"
//                               />{" "}
//                               Active Cart{" "}
//                               <span className="bg-white/10 px-1.5 rounded text-white">
//                                 {cartItems.length}
//                               </span>
//                             </span>
//                             <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
//                               ₹{cartTotal.toLocaleString()}
//                             </span>
//                           </div>

//                           {/* List */}
//                           <div className="max-h-[140px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
//                             {cartItems.map((item: any, idx: number) => (
//                               <div
//                                 key={idx}
//                                 className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group/item"
//                               >
//                                 {/* Image */}
//                                 <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10 relative">
//                                   {item.image ? (
//                                     <img
//                                       src={item.image}
//                                       alt=""
//                                       className="w-full h-full object-cover opacity-90 group-hover/item:opacity-100 transition-opacity"
//                                     />
//                                   ) : (
//                                     <Package className="w-full h-full p-2.5 text-gray-600" />
//                                   )}
//                                 </div>
//                                 {/* Details - Fixed Colors for Visibility */}
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-sm font-bold text-gray-100 truncate group-hover/item:text-white transition-colors">
//                                     {item.name || "Product Item"}
//                                   </p>
//                                   <div className="flex justify-between items-center mt-0.5">
//                                     <p className="text-[11px] text-gray-400 font-mono">
//                                       Qty: {item.qty || 1}
//                                     </p>
//                                     <p className="text-[11px] font-bold text-emerald-400">
//                                       ₹{item.price}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Current Action (Frosted Box) */}
//                       <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4 relative overflow-hidden backdrop-blur-sm">
//                         <div className="flex items-center justify-between mb-1 relative z-10">
//                           <span
//                             className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isExitIntent ? "text-red-400" : isAddToCart ? "text-emerald-400" : "text-cyan-400"}`}
//                           >
//                             {isExitIntent ? (
//                               <AlertTriangle size={12} />
//                             ) : isAddToCart ? (
//                               <ShoppingCart size={12} />
//                             ) : (
//                               <Zap size={12} />
//                             )}
//                             {log.action.replace("_", " ")}
//                           </span>
//                           <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
//                             <Clock size={10} />{" "}
//                             {log.timestamp
//                               ? format(new Date(log.timestamp), "HH:mm:ss")
//                               : "Now"}
//                           </span>
//                         </div>
//                         <p className="text-xs text-gray-300 font-mono truncate opacity-80 pl-2 border-l-2 border-white/20">
//                           {log.path}
//                         </p>
//                       </div>

//                       {/* Footer Actions */}
//                       <div className="flex items-center justify-between">
//                         <div className="flex gap-2">
//                           {meta.battery && (
//                             <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
//                               <Battery
//                                 size={10}
//                                 className={
//                                   parseInt(meta.battery) < 20
//                                     ? "text-red-500"
//                                     : "text-emerald-500"
//                                 }
//                               />{" "}
//                               {meta.battery}
//                             </div>
//                           )}
//                         </div>
//                         {log.userId && (
//                           <button
//                             onClick={() =>
//                               openChatModal(log.userId, log.userName)
//                             }
//                             className="text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 border border-indigo-400/20"
//                           >
//                             Message <ChevronRight size={12} />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//           </div>
//         )}
//       </main>

//       {/* ========================================================== */}
//       {/* 🔥 MODERN GLASS POPUP (Fixed Backdrop & Text) */}
//       {/* ========================================================== */}
//       <AnimatePresence>
//         {incomingReply && (
//           <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="absolute inset-0 bg-black/80 backdrop-blur-lg" // Darker blur
//               onClick={() => setIncomingReply(null)}
//             />

//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 50 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 50 }}
//               transition={{ type: "spring", stiffness: 300, damping: 25 }}
//               className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)] overflow-hidden"
//             >
//               {/* Glows */}
//               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>
//               <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]"></div>

//               <div className="p-8 relative z-10">
//                 <div className="flex items-center gap-4 mb-6">
//                   <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 rounded-2xl shadow-lg text-white border border-white/10">
//                     <Sparkles size={26} fill="white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-black text-white tracking-tight">
//                       New Message
//                     </h3>
//                     <div className="flex items-center gap-1.5 mt-1">
//                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
//                       <p className="text-sm text-emerald-400 font-bold">
//                         {incomingReply.userName}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-6 backdrop-blur-md">
//                   <p className="text-white text-lg leading-relaxed font-medium">
//                     "{incomingReply.message}"
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => setIncomingReply(null)}
//                     className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
//                   >
//                     Dismiss
//                   </button>
//                   <button
//                     onClick={() =>
//                       openChatModal(
//                         incomingReply.userId,
//                         incomingReply.userName,
//                       )
//                     }
//                     className="flex-[1.5] py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border-t border-white/20"
//                   >
//                     <Send size={16} /> Quick Reply
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* 💬 Admin Chat Modal (Fixed Contrast) */}
//       <AnimatePresence>
//         {isChatOpen && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="bg-[#0a0a0a] border border-white/10 p-0 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden ring-1 ring-white/10"
//             >
//               <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5">
//                 <h3 className="text-lg font-bold text-white">
//                   Chat with {targetUserName}
//                 </h3>
//                 <button
//                   onClick={() => setIsChatOpen(false)}
//                   className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//               <div className="p-5">
//                 <textarea
//                   value={messageInput}
//                   onChange={(e) => setMessageInput(e.target.value)}
//                   placeholder="Type a message..."
//                   className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder-gray-500 font-medium resize-none"
//                   autoFocus
//                 />
//               </div>
//               <div className="p-5 pt-0 flex justify-end gap-3">
//                 <button
//                   onClick={() => setIsChatOpen(false)}
//                   className="px-5 py-2.5 text-gray-400 hover:text-white text-sm font-bold hover:bg-white/5 rounded-xl transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={!messageInput.trim()}
//                   className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
//                 >
//                   <Send size={16} /> Send
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShoppingCart,
  Smartphone,
  Monitor,
  MapPin,
  Battery,
  MessageCircle,
  Wifi,
  History,
  X,
  Send,
  User,
  Bell,
  MousePointer2,
  AlertTriangle,
  Clock,
  Radio,
  ShoppingBag,
  CreditCard,
  Zap,
  Package,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "");

// 🔊 Audio Objects
const notificationSound =
  typeof window !== "undefined"
    ? new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      )
    : null;

const cartSound =
  typeof window !== "undefined"
    ? new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
      )
    : null;

export default function LiveMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // 💬 Chat Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");

  // 🔥 Incoming Reply Popup State
  const [incomingReply, setIncomingReply] = useState<any | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = Cookies.get("accessToken");

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      path: "/socket.io/",
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current?.emit("join_room", "admin");
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));

    socketRef.current.on("new_live_activity", (data: any) => {
      if (data.action === "ADD_TO_CART" && cartSound) {
        try {
          cartSound.currentTime = 0;
          cartSound.play().catch(() => {});
        } catch (e) {}
      }
      setLogs((prev) => [data, ...prev].slice(0, 150));
    });

    socketRef.current.on("admin_receive_reply", (data: any) => {
      try {
        if (notificationSound) {
          notificationSound.currentTime = 0;
          notificationSound.play().catch(() => {});
        }
      } catch (e) {}
      setIncomingReply(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // =================================================================
  // 🔥 LOGIC: PERSISTENT CART + PRIORITY STATUS
  // =================================================================
  const activeUsers = useMemo(() => {
    const userGroups = new Map();

    logs.forEach((log) => {
      const key = log.userId || log.guestId || log.userName;
      if (!userGroups.has(key)) {
        userGroups.set(key, []);
      }
      userGroups.get(key).push(log);
    });

    const finalDisplayList: any[] = [];

    userGroups.forEach((userHistory, key) => {
      let logToShow = userHistory[0]; // Latest Log

      // 🛒 FIND PERSISTENT CART DATA
      const logWithCart = userHistory.find(
        (l: any) => l.meta?.cart?.items?.length > 0,
      );
      const persistentCart = logWithCart
        ? logWithCart.meta.cart
        : logToShow.meta?.cart || { items: [], total: 0 };

      // 🚨 PRIORITY STATUS LOGIC
      const IMPORTANT_ACTIONS = ["ADD_TO_CART", "CHECKOUT_INIT", "BUY_NOW"];
      const recentImportantLog = userHistory
        .slice(0, 8)
        .find((l: any) => IMPORTANT_ACTIONS.includes(l.action));

      const finalObj = {
        ...logToShow,
        statusAction: recentImportantLog
          ? recentImportantLog.action
          : logToShow.action,
        cartData: persistentCart,
        historyCount: userHistory.length,
      };

      finalDisplayList.push(finalObj);
    });

    return finalDisplayList;
  }, [logs]);

  const openChatModal = (userId: string, userName: string) => {
    if (!userId) {
      toast.error("Guest user - Cannot chat");
      return;
    }
    setTargetUserId(userId);
    setTargetUserName(userName);
    setIsChatOpen(true);
    setIncomingReply(null);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    if (socketRef.current && targetUserId) {
      socketRef.current.emit("admin_send_message_trigger", {
        targetUserId: targetUserId,
        message: messageInput,
      });
      toast.success(`Message sent to ${targetUserName}!`);
      setMessageInput("");
      setIsChatOpen(false);
    }
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden relative selection:bg-cyan-500/30 text-zinc-900 dark:text-gray-200">
      <Toaster position="top-right" />

      {/* 🌌 Background Ambience (Dark Mode Only) */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-white dark:bg-[#020617] transition-colors duration-300">
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] delay-1000"></div>
        <div className="hidden dark:block absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]"></div>
        <div className="hidden dark:block absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* 🚀 Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 shadow-sm backdrop-blur-xl border-b transition-colors duration-300
        bg-white/80 border-zinc-200 
        dark:bg-[#020617]/50 dark:border-white/5 dark:shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-2.5 rounded-xl border shadow-sm
              bg-indigo-50 border-indigo-100 
              dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-purple-500/20 dark:border-white/10 dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Activity className="w-6 h-6 animate-pulse text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-zinc-900 dark:text-white">
                LIVE{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                  SPY
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`relative flex h-2 w-2`}>
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
                    ></span>
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {isConnected ? "System Online" : "Reconnecting"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-3 px-5 py-2 rounded-full border shadow-inner backdrop-blur-md
            bg-zinc-100 border-zinc-200 
            dark:bg-white/5 dark:border-white/5"
          >
            <Radio
              size={16}
              className={`text-cyan-600 dark:text-cyan-400 ${activeUsers.length > 0 ? "animate-pulse" : ""}`}
            />
            <span className="text-sm font-medium text-zinc-600 dark:text-gray-300">
              Active Targets:{" "}
              <span className="text-zinc-900 dark:text-white text-lg font-bold ml-1">
                {activeUsers.length}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* 📡 Activity Grid */}
      <main className="max-w-7xl mx-auto p-6 relative z-10">
        {activeUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 dark:text-gray-500"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse border shadow-sm
              bg-zinc-100 border-zinc-200 
              dark:bg-white/5 dark:border-white/5 dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <Wifi size={48} className="text-zinc-400 dark:text-white/20" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight text-zinc-700 dark:text-gray-400">
              Scanning Network...
            </h2>
            <p className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-gray-600">
              Waiting for signals
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeUsers.map((log) => {
                const meta = log.meta || {};
                const isTabActive = meta.isTabActive !== false;

                const isExitIntent = log.statusAction === "EXIT_INTENT";
                const isAddToCart = log.statusAction === "ADD_TO_CART";
                const isCheckout = log.statusAction === "CHECKOUT_INIT";

                const uniqueKey = log.userId || log.guestId || log.userName;
                const cartItems = log.cartData?.items || [];
                const cartTotal = log.cartData?.total || 0;

                // Dynamic Border Color
                const borderColor = isExitIntent
                  ? "border-red-500/50"
                  : isAddToCart
                    ? "border-emerald-500/50"
                    : "border-zinc-200 dark:border-white/10";

                const shadowColor = isExitIntent
                  ? "shadow-red-500/10 dark:shadow-red-900/20"
                  : isAddToCart
                    ? "shadow-emerald-500/10 dark:shadow-emerald-900/20"
                    : "shadow-lg dark:shadow-black/20";

                return (
                  <motion.div
                    key={uniqueKey}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`
                      relative rounded-[1.5rem] overflow-hidden backdrop-blur-xl border transition-all duration-300 shadow-xl group
                      bg-white dark:bg-gray-900/60 ${borderColor} ${shadowColor}
                    `}
                  >
                    {/* Glowing Top Line */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/20 to-transparent opacity-50`}
                    ></div>

                    <div className="p-6 relative z-10">
                      {/* Top Row: User Info & Status */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-2xl border backdrop-blur-md shadow-sm
                            ${
                              meta.device === "Mobile"
                                ? "bg-purple-100 border-purple-200 text-purple-600 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300"
                                : "bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-300"
                            }`}
                          >
                            {meta.device === "Mobile" ? (
                              <Smartphone size={20} />
                            ) : (
                              <Monitor size={20} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-base truncate max-w-[140px] flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
                              {log.userName}
                              {log.userId ? (
                                <div
                                  className="p-1 rounded-md border
                                  bg-cyan-100 border-cyan-200 
                                  dark:bg-cyan-500/20 dark:border-cyan-500/30"
                                >
                                  <User
                                    size={10}
                                    className="text-cyan-600 dark:text-cyan-300"
                                  />
                                </div>
                              ) : (
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider
                                  bg-zinc-100 border-zinc-200 text-zinc-500 
                                  dark:bg-white/10 dark:border-white/5 dark:text-gray-400"
                                >
                                  GUEST
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs mt-1 font-medium text-zinc-500 dark:text-gray-400">
                              <MapPin
                                size={12}
                                className="text-indigo-500 dark:text-indigo-400"
                              />
                              {meta.location || "Unknown Location"}
                            </div>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <div
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-2 backdrop-blur-md shadow-sm
                          ${
                            isExitIntent
                              ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/40"
                              : isAddToCart
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40"
                                : isTabActive
                                  ? "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-200 dark:border-cyan-500/30"
                                  : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isExitIntent ? "bg-red-500 animate-ping" : isAddToCart ? "bg-emerald-500 animate-bounce" : isTabActive ? "bg-cyan-500 animate-pulse" : "bg-gray-400"}`}
                          ></span>
                          {isExitIntent
                            ? "LEAVING"
                            : isAddToCart
                              ? "BUYING"
                              : isTabActive
                                ? "ONLINE"
                                : "IDLE"}
                        </div>
                      </div>

                      {/* 🔥🔥🔥 UPDATED CART LIST 🔥🔥🔥 */}
                      {cartItems.length > 0 && (
                        <div
                          className="mb-5 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5
                          bg-zinc-50 border-zinc-200 
                          dark:bg-[#020617]/50 dark:border-white/10 dark:ring-black/20"
                        >
                          {/* Header */}
                          <div
                            className="px-4 py-2.5 border-b flex justify-between items-center
                            bg-white border-zinc-200 
                            dark:bg-white/5 dark:border-white/5"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-zinc-500 dark:text-gray-400">
                              <ShoppingBag
                                size={12}
                                className="text-emerald-500 dark:text-emerald-400"
                              />{" "}
                              Active Cart{" "}
                              <span
                                className="px-1.5 rounded
                                bg-zinc-100 text-zinc-700 
                                dark:bg-white/10 dark:text-white"
                              >
                                {cartItems.length}
                              </span>
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded border
                              bg-emerald-100 text-emerald-700 border-emerald-200
                              dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                            >
                              ₹{cartTotal.toLocaleString()}
                            </span>
                          </div>

                          {/* List */}
                          <div className="max-h-[140px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {cartItems.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2 rounded-lg border transition-all group/item
                                bg-white hover:bg-zinc-100 border-zinc-100 
                                dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5"
                              >
                                {/* Image */}
                                <div
                                  className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden border relative
                                  bg-zinc-100 border-zinc-200 
                                  dark:bg-gray-800 dark:border-white/10"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="w-full h-full object-cover opacity-90 group-hover/item:opacity-100 transition-opacity"
                                    />
                                  ) : (
                                    <Package className="w-full h-full p-2.5 text-zinc-400 dark:text-gray-600" />
                                  )}
                                </div>
                                {/* Details */}
                                <div className="flex-1 min-h-0">
                                  <p
                                    className="text-sm font-bold truncate transition-colors
                                    text-zinc-800 group-hover/item:text-zinc-900 
                                    dark:text-gray-100 dark:group-hover/item:text-white"
                                  >
                                    {item.name || "Product Item"}
                                  </p>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-[11px] font-mono text-zinc-500 dark:text-gray-400">
                                      Qty: {item.qty || 1}
                                    </p>
                                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                      ₹{item.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Current Action (Frosted Box) */}
                      <div
                        className="rounded-xl p-3 border mb-4 relative overflow-hidden backdrop-blur-sm
                        bg-zinc-100 border-zinc-200 
                        dark:bg-white/5 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between mb-1 relative z-10">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 
                            ${
                              isExitIntent
                                ? "text-red-500 dark:text-red-400"
                                : isAddToCart
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-cyan-600 dark:text-cyan-400"
                            }`}
                          >
                            {isExitIntent ? (
                              <AlertTriangle size={12} />
                            ) : isAddToCart ? (
                              <ShoppingCart size={12} />
                            ) : (
                              <Zap size={12} />
                            )}
                            {log.action.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono flex items-center gap-1 text-zinc-500 dark:text-gray-500">
                            <Clock size={10} />{" "}
                            {log.timestamp
                              ? format(new Date(log.timestamp), "HH:mm:ss")
                              : "Now"}
                          </span>
                        </div>
                        <p
                          className="text-xs font-mono truncate opacity-80 pl-2 border-l-2
                          text-zinc-600 border-zinc-300 
                          dark:text-gray-300 dark:border-white/20"
                        >
                          {log.path}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {meta.battery && (
                            <div
                              className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg border
                              bg-zinc-100 text-zinc-500 border-zinc-200 
                              dark:bg-white/5 dark:text-gray-400 dark:border-white/5"
                            >
                              <Battery
                                size={10}
                                className={
                                  parseInt(meta.battery) < 20
                                    ? "text-red-500"
                                    : "text-emerald-500"
                                }
                              />{" "}
                              {meta.battery}
                            </div>
                          )}
                        </div>
                        {log.userId && (
                          <button
                            onClick={() =>
                              openChatModal(log.userId, log.userName)
                            }
                            className="text-xs font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border
                            bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 border-indigo-500/20"
                          >
                            Message <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ========================================================== */}
      {/* 🔥 MODERN GLASS POPUP (Fixed Backdrop & Text) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {incomingReply && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-lg"
              onClick={() => setIncomingReply(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md border rounded-[2rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)] overflow-hidden
              bg-white border-zinc-200 
              dark:bg-[#0F172A] dark:border-white/10"
            >
              {/* Glows */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] bg-emerald-500/10 dark:bg-emerald-500/20"></div>

              <div className="p-8 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3.5 rounded-2xl shadow-lg text-white border border-white/10 bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Sparkles size={26} fill="white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                      New Message
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {incomingReply.userName}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 mb-6 backdrop-blur-md border
                  bg-zinc-50 border-zinc-100 
                  dark:bg-white/5 dark:border-white/5"
                >
                  <p className="text-lg leading-relaxed font-medium text-zinc-800 dark:text-white">
                    "{incomingReply.message}"
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIncomingReply(null)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border
                    text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-50 border-zinc-200
                    dark:text-gray-400 dark:hover:text-white dark:bg-transparent dark:hover:bg-white/5 dark:border-white/5"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() =>
                      openChatModal(
                        incomingReply.userId,
                        incomingReply.userName,
                      )
                    }
                    className="flex-[1.5] py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border-t border-white/20"
                  >
                    <Send size={16} /> Quick Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💬 Admin Chat Modal (Fixed Contrast) */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden ring-1
              bg-white border-zinc-200 ring-black/5
              dark:bg-[#0a0a0a] dark:border-white/10 dark:ring-white/10"
            >
              <div
                className="flex justify-between items-center p-5 border-b
                bg-zinc-50 border-zinc-200 
                dark:bg-white/5 dark:border-white/5"
              >
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Chat with {targetUserName}
                </h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="transition-colors p-1.5 rounded-full
                  text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 
                  dark:text-gray-400 dark:hover:text-white dark:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full h-32 border rounded-xl p-4 transition-all font-medium resize-none focus:outline-none focus:ring-1
                  bg-zinc-50 text-zinc-900 border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder-zinc-400
                  dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>
              <div className="p-5 pt-0 flex justify-end gap-3">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all
                  text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 
                  dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
