// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   Send,
//   Paperclip,
//   MoreVertical,
//   Phone,
//   Video,
//   ArrowLeft,
//   Check,
//   CheckCheck,
//   Smile,
//   Mic,
//   Loader2,
//   Lock,
//   X,
//   StopCircle,
//   Bot, // 🔥 NEW: Imported Bot Icon
// } from "lucide-react";
// import { format } from "date-fns";
// import { io, Socket } from "socket.io-client";
// import { ChatService, AdminAuthService } from "@/lib/api";
// import { toast } from "sonner";

// // --- Types ---
// interface ChatUser {
//   _id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   roomId: string;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   unreadCount?: number;
//   isOnline?: boolean;
// }

// interface ChatMessage {
//   _id: string;
//   senderId:
//     | { _id: string; name: string; email: string; profilePicture?: string }
//     | string;
//   text: string;
//   createdAt: string;
//   isRead: boolean;
//   messageType: "text" | "image" | "video" | "audio";
//   fileUrl?: string;
//   roomId: string;
//   tempId?: number; // For identifying optimistic messages
// }

// // Quick Replies
// const QUICK_REPLIES = [
//   "Hello! How can I help you?",
//   "Your order has been shipped.",
//   "Please provide your Order ID.",
//   "The item is currently out of stock.",
//   "Thank you for contacting us!",
//   "Price for this bumper is ₹2,400.",
// ];

// // Helper: Safe ID Extraction
// const getSafeId = (data: any): string => {
//   if (!data) return "";
//   return typeof data === "object" ? data._id : data;
// };

// // --- STYLES ---
// const glassPanel =
//   "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl";
// const glassInput =
//   "bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all";

// // 🔥 Stylish Scrollbar Class (Dark Mode Friendly)
// const customScrollbar = `
//   scrollbar-thin
//   scrollbar-thumb-white/10
//   scrollbar-track-transparent
//   hover:scrollbar-thumb-white/20
//   [&::-webkit-scrollbar]:w-1.5
//   [&::-webkit-scrollbar-track]:bg-transparent
//   [&::-webkit-scrollbar-thumb]:bg-white/10
//   [&::-webkit-scrollbar-thumb]:rounded-full
//   hover:[&::-webkit-scrollbar-thumb]:bg-white/20
// `;

// export default function ChatPage() {
//   // --- STATE ---
//   const [adminId, setAdminId] = useState<string>("");
//   const [users, setUsers] = useState<ChatUser[]>([]);
//   const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUploading, setIsUploading] = useState(false);

//   // Features State
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSearching, setIsSearching] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showQuickReplies, setShowQuickReplies] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
//     null,
//   );
//   const [isDragging, setIsDragging] = useState(false);

//   // 🔥 NEW STATE: AI Auto Reply
//   const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(false);

//   // File State
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // Refs
//   const activeUserRef = useRef<ChatUser | null>(null);
//   const adminIdRef = useRef<string>("");
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
//   const sentAudioRef = useRef<HTMLAudioElement | null>(null); // 🔥 NEW: Sent Sound Ref
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // UI
//   const [isMobileView, setIsMobileView] = useState(false);
//   const [showChatOnMobile, setShowChatOnMobile] = useState(false);

//   // Sync Refs to avoid stale closures in socket listeners
//   useEffect(() => {
//     activeUserRef.current = activeUser;
//   }, [activeUser]);
//   useEffect(() => {
//     adminIdRef.current = adminId;
//   }, [adminId]);

//   // --- 1. INITIAL SETUP ---
//   useEffect(() => {
//     let pollingInterval: NodeJS.Timeout;

//     if (typeof window !== "undefined") {
//       notificationAudioRef.current = new Audio("/alert.mp3");
//       sentAudioRef.current = new Audio("/sent.mp3"); // 🔥 NEW: Initialize Sent Sound (ensure sent.mp3 exists in public folder)
//     }

//     const initChat = async () => {
//       try {
//         console.log("🚀 Admin Chat Initializing...");

//         // Get Admin Profile
//         const profileRes = await AdminAuthService.getProfile();
//         const rootData = profileRes.data;
//         const adminData =
//           rootData?.data?.data || rootData?.data?.admin || rootData?.data;

//         if (adminData?._id) {
//           setAdminId(adminData._id);
//           adminIdRef.current = adminData._id;
//           // 🔥 NEW: Set AI Status from DB
//           setIsAutoReplyEnabled(adminData.isAutoReplyEnabled || false);
//         }

//         // Load Users List
//         await fetchUserList();

//         // Socket Connection
//         const token =
//           localStorage.getItem("token") ||
//           localStorage.getItem("adminToken") ||
//           "";
//         const socketUrl =
//           process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
//           "http://localhost:5000";

//         const newSocket = io(socketUrl, {
//           withCredentials: true,
//           transports: ["websocket", "polling"],
//           auth: { token },
//           reconnection: true,
//         });

//         // --- SOCKET EVENT LISTENERS ---

//         newSocket.on("connect", () => {
//           console.log("🟢 Admin Socket Connected:", newSocket.id);
//           if (adminData?._id) newSocket.emit("join_room", adminData._id);
//         });

//         newSocket.on("connect", () => {
//           console.log("🟢 Admin Socket Connected:", newSocket.id);
//           if (adminData?._id) newSocket.emit("join_room", adminData._id);

//           // 👇 NEW: కనెక్ట్ అవ్వగానే ఆన్‌లైన్ లిస్ట్ అడగాలి
//           newSocket.emit("get_online_users");
//         });

//         // 👇 NEW: సర్వర్ నుండి వచ్చిన ఆన్‌లైన్ లిస్ట్‌తో స్టేట్ అప్‌డేట్ చేయాలి
//         newSocket.on("online_users_list", (onlineIds: string[]) => {
//           setUsers((prev) =>
//             prev.map((u) => ({
//               ...u,
//               // లిస్ట్‌లో ఈ యూజర్ ID ఉంటే Online అని మార్చు, లేకపోతే పాత స్టేటస్ లేదా Offline
//               isOnline: onlineIds.includes(String(u._id)),
//             })),
//           );
//         });

//         // 1. INCOMING MESSAGE
//         newSocket.on("receive_message", (newMsg: ChatMessage) => {
//           handleIncomingMessage(newMsg, newSocket);
//         });

//         // 🔹 READ RECEIPTS UPDATE
//         newSocket.on("messages_marked_read", ({ roomId }) => {
//           // Only update active room messages
//           if (activeUserRef.current?.roomId === roomId) {
//             setMessages((prev) =>
//               prev.map((msg) =>
//                 getSafeId(msg.senderId) === adminIdRef.current
//                   ? { ...msg, isRead: true }
//                   : msg,
//               ),
//             );
//           }
//         });

//         // 2. ONLINE STATUS UPDATE
//         newSocket.on(
//           "user_status_update",
//           (data: { userId: string; isOnline: boolean }) => {
//             setUsers((prev) =>
//               prev.map((u) =>
//                 String(u._id) === String(data.userId)
//                   ? { ...u, isOnline: data.isOnline }
//                   : u,
//               ),
//             );

//             // If the status update is for the currently active user, update that state too
//             if (activeUserRef.current?._id === data.userId) {
//               setActiveUser((prev) =>
//                 prev ? { ...prev, isOnline: data.isOnline } : null,
//               );
//             }
//           },
//         );

//         // 3. TYPING INDICATOR
//         newSocket.on("display_typing", ({ roomId, userId }) => {
//           // Only show typing for ACTIVE chat
//           if (
//             activeUserRef.current?.roomId === roomId &&
//             userId !== adminIdRef.current
//           ) {
//             setIsTyping(true);
//           }
//         });

//         newSocket.on("hide_typing", ({ roomId }) => {
//           // Hide typing ONLY if same active room
//           if (activeUserRef.current?.roomId === roomId) {
//             setIsTyping(false);
//           }
//         });

//         // 👇👇👇 NEW CODE START 👇👇👇
//         // 1.5 INITIAL ONLINE STATUS CHECK RESPONSE
//         newSocket.on(
//           "is_user_online_response",
//           (data: { userId: string; isOnline: boolean }) => {
//             // Update Users List
//             setUsers((prev) =>
//               prev.map((u) =>
//                 String(u._id) === String(data.userId)
//                   ? { ...u, isOnline: data.isOnline }
//                   : u,
//               ),
//             );

//             // Update Active Chat Header if same user
//             if (String(activeUserRef.current?._id) === String(data.userId)) {
//               setActiveUser((prev) =>
//                 prev ? { ...prev, isOnline: data.isOnline } : null,
//               );
//             }
//           },
//         );

//         // 4. SENT CONFIRMATION (Update optimistic ID)
//         newSocket.on(
//           "message_sent",
//           (data: { tempId: number; messageId: string }) => {
//             setMessages((prev) =>
//               prev.map((msg) =>
//                 msg.tempId === data.tempId
//                   ? { ...msg, _id: data.messageId, isDelivered: true }
//                   : msg,
//               ),
//             );
//           },
//         );

//         setSocket(newSocket);

//         // Polling Backup to ensure data consistency
//         pollingInterval = setInterval(() => {
//           fetchUserList(true);
//         }, 5000);
//       } catch (error) {
//         console.error("Chat init error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const handleResize = () => setIsMobileView(window.innerWidth < 768);
//     handleResize();
//     window.addEventListener("resize", handleResize);

//     initChat();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (socket) socket.disconnect();
//       clearInterval(pollingInterval);
//     };
//   }, []);

//   // --- API Helpers ---
//   const fetchUserList = async (silent = false) => {
//     try {
//       const roomsRes = await ChatService.getChatRooms();
//       const roomsList = roomsRes.data?.data?.rooms || [];

//       const formattedUsers: ChatUser[] = roomsList.map((room: any) => ({
//         _id: room.otherUser._id,
//         name: room.otherUser.name,
//         email: room.otherUser.email,
//         avatar: room.otherUser.profilePicture,
//         roomId: room.roomId,
//         lastMessage: room.lastMessage,
//         lastMessageTime: room.lastMessageTime,
//         unreadCount: room.unreadCount,
//         // Use online status from API if available, otherwise default to false (socket handles updates)
//         isOnline: room.otherUser.isOnline || false,
//       }));

//       setUsers((prev) => {
//         return formattedUsers.map((newUser) => {
//           // Merge with existing state to preserve real-time online status from socket
//           const existing = prev.find((u) => u._id === newUser._id);
//           return existing
//             ? { ...newUser, isOnline: existing.isOnline }
//             : newUser;
//         });
//       });

//       if (socket) {
//         socket.emit("get_online_users");
//       }
//     } catch (e) {
//       if (!silent) console.error("Failed to fetch users", e);
//     }
//   };

//   // 🔥 NEW: Toggle AI Auto Reply Function
//   const toggleAutoReply = async () => {
//     try {
//       const token =
//         localStorage.getItem("token") || localStorage.getItem("adminToken");
//       const newStatus = !isAutoReplyEnabled;

//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/auth/toggle-ai`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status: newStatus }),
//         },
//       );

//       const data = await response.json();

//       if (data.success) {
//         setIsAutoReplyEnabled(newStatus);
//         toast.success(`AI Auto-Reply Turned ${newStatus ? "ON 🟢" : "OFF 🔴"}`);
//       } else {
//         toast.error("Failed to update AI status");
//       }
//     } catch (error) {
//       console.error("AI Toggle Error:", error);
//       toast.error("Something went wrong");
//     }
//   };

//   // --- 2. Handle User Select ---
//   const handleUserSelect = async (user: ChatUser) => {
//     setActiveUser(user);
//     setIsSearching(false);
//     if (isMobileView) setShowChatOnMobile(true);

//     // Join the specific room
//     socket?.emit("join_room", user.roomId); // Backend expects just roomId string or object? Code says `socket.join(roomToJoin)`
//     // 👇👇👇 NEW LINE: Check if this specific user is online 👇👇👇
//     socket?.emit("check_online_status", { userId: user._id });
//     // 👆👆👆
//     try {
//       const res = await ChatService.getMessages(user.roomId);
//       const history = res.data?.data?.messages || [];

//       // Sort: Oldest first for rendering
//       setMessages(history.reverse());
//       scrollToBottom();

//       // Reset unread locally
//       setUsers((prev) =>
//         prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u)),
//       );

//       if (history.length > 0) await ChatService.markAsRead(user.roomId);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   };

//   // --- 3. INCOMING MESSAGE LOGIC ---
//   const handleIncomingMessage = (
//     newMsg: ChatMessage,
//     socketInstance: Socket,
//   ) => {
//     const currentActive = activeUserRef.current;
//     const currentAdmin = adminIdRef.current;
//     const senderId = getSafeId(newMsg.senderId);

//     // A. Update Active Chat Window
//     if (currentActive && currentActive.roomId === newMsg.roomId) {
//       setMessages((prev) => {
//         // Prevent Duplicates
//         if (prev.some((m) => m._id === newMsg._id)) return prev;

//         // If sender is ME (Admin), check for tempId match and replace
//         if (senderId === currentAdmin) {
//           return prev.map((m) =>
//             m.tempId && m.text === newMsg.text ? newMsg : m,
//           );
//         }

//         // If sender is USER, play sound & mark read
//         if (senderId !== currentAdmin) {
//           socketInstance.emit("mark_read", {
//             roomId: newMsg.roomId,
//             userId: currentAdmin,
//           });
//           try {
//             notificationAudioRef.current?.play();
//           } catch (e) {}
//         }

//         return [...prev, newMsg];
//       });

//       scrollToBottom();
//       setIsTyping(false);
//     } else {
//       // Notification
//       try {
//         notificationAudioRef.current?.play();
//       } catch (e) {}
//       toast.info(`New message received`);
//     }

//     // B. Update Sidebar List
//     fetchUserList(true);
//   };

//   // --- 4. Send Message (Optimistic UI) ---
//   const handleSendMessage = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if ((!inputText.trim() && !selectedFile) || !activeUser || !socket) return;

//     // 🔥 NEW: Play Sent Sound
//     try {
//       if (sentAudioRef.current) {
//         sentAudioRef.current.currentTime = 0;
//         sentAudioRef.current.play();
//       }
//     } catch (error) {
//       console.log("Audio play error", error);
//     }

//     if (selectedFile) {
//       await handleFileUpload();
//       return;
//     }

//     const tempId = Date.now();
//     const payload = {
//       senderId: adminId,
//       receiverId: activeUser._id,
//       text: inputText,
//       roomId: activeUser.roomId,
//       messageType: "text",
//       senderModel: "Admin",
//       receiverModel: "User",
//       tempId: tempId,
//     };

//     const optimisticMsg: ChatMessage = {
//       _id: `temp-${tempId}`,
//       senderId: adminId,
//       text: inputText,
//       createdAt: new Date().toISOString(),
//       isRead: false,
//       messageType: "text",
//       roomId: activeUser.roomId,
//       tempId: tempId,
//     };

//     setMessages((prev) => [...prev, optimisticMsg]);
//     setInputText("");
//     scrollToBottom();
//     setShowQuickReplies(false);

//     socket.emit("stop_typing", { roomId: activeUser.roomId }); // Fixed: Send Object
//     socket.emit("send_message", payload);

//     // Sidebar Update
//     setUsers((prev) =>
//       prev
//         .map((u) =>
//           u._id === activeUser._id
//             ? {
//                 ...u,
//                 lastMessage: payload.text,
//                 lastMessageTime: new Date().toISOString(),
//               }
//             : u,
//         )
//         .sort(
//           (a, b) =>
//             new Date(b.lastMessageTime || 0).getTime() -
//             new Date(a.lastMessageTime || 0).getTime(),
//         ),
//     );
//   };

//   // --- 5. File Upload ---
//   const handleFileUpload = async () => {
//     if (!selectedFile || !activeUser || !socket) return;

//     setIsUploading(true);
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const res = await ChatService.uploadFile(formData);
//       const { fileUrl, fileType } = res.data.data;

//       // Detect audio manually if needed
//       let finalType = fileType;
//       if (
//         selectedFile.type.startsWith("audio") ||
//         selectedFile.name.endsWith(".webm")
//       ) {
//         finalType = "audio";
//       }

//       const payload = {
//         senderId: adminId,
//         receiverId: activeUser._id,
//         text: "",
//         roomId: activeUser.roomId,
//         messageType: finalType,
//         fileUrl: fileUrl,
//         senderModel: "Admin",
//         receiverModel: "User",
//       };

//       const tempMsg: ChatMessage = {
//         _id: `temp-${Date.now()}`,
//         senderId: adminId,
//         text: "",
//         fileUrl: fileUrl,
//         messageType: finalType as any,
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         roomId: activeUser.roomId,
//       };

//       setMessages((prev) => [...prev, tempMsg]);
//       scrollToBottom();

//       socket.emit("send_message", payload);
//       fetchUserList(true);
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error("Failed to upload file");
//     } finally {
//       setIsUploading(false);
//       setSelectedFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   // --- 6. Voice Recording ---
//   // --- 6. Voice Recording Features (FIXED) ---

//   const streamRef = useRef<MediaStream | null>(null);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;

//       // Browser Compatibility Check (Safari vs Chrome)
//       let mimeType = "audio/webm";
//       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
//         mimeType = "audio/webm;codecs=opus";
//       } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
//         mimeType = "audio/mp4";
//       }

//       const recorder = new MediaRecorder(stream, { mimeType });
//       setMediaRecorder(recorder);
//       const chunks: Blob[] = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunks.push(e.data);
//       };

//       recorder.onstop = () => {
//         // Create Blob & File
//         const audioBlob = new Blob(chunks, { type: mimeType });
//         const fileExt = mimeType.includes("mp4") ? "mp4" : "webm";
//         const fileName = `voice_note_${Date.now()}.${fileExt}`;

//         const file = new File([audioBlob], fileName, {
//           type: mimeType,
//         });

//         // 🔥 FIX 1: Don't set selectedFile for auto-send (avoids preview stuck issue)
//         // setSelectedFile(file); <--- REMOVED THIS LINE

//         // Auto Upload & Send
//         uploadAndSendRecordedFile(file);

//         // Stop Microphone Tracks
//         stream.getTracks().forEach((track) => track.stop());
//       };

//       recorder.start();
//       setIsRecording(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Microphone access denied");
//     }
//   };

//   const uploadAndSendRecordedFile = async (file: File) => {
//     if (!activeUser || !socket) return;

//     setIsUploading(true);
//     const formData = new FormData();
//     // 🔥 Make sure your backend accepts field name "file"
//     formData.append("file", file);

//     try {
//       const res = await ChatService.uploadFile(formData);
//       console.log("Audio Upload Response:", res.data);

//       // 🔥 FIX 2: Safe URL Extraction (Handle different API responses)
//       const responseData = res.data;
//       const fileUrl =
//         responseData?.data?.fileUrl ||
//         responseData?.fileUrl ||
//         responseData?.url ||
//         responseData?.secure_url;

//       if (!fileUrl) {
//         toast.error("Audio upload failed: No URL received");
//         return;
//       }

//       const payload = {
//         senderId: adminId,
//         receiverId: activeUser._id,
//         text: "",
//         roomId: activeUser.roomId,
//         messageType: "audio", // ✅ Correctly set as audio
//         fileUrl: fileUrl,
//         senderModel: "Admin",
//         receiverModel: "User",
//       };

//       const tempMsg: ChatMessage = {
//         _id: `temp-${Date.now()}`,
//         senderId: adminId,
//         text: "",
//         fileUrl: fileUrl,
//         messageType: "audio",
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         roomId: activeUser.roomId,
//       };

//       setMessages((prev) => [...prev, tempMsg]);
//       scrollToBottom();
//       socket.emit("send_message", payload);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to send voice note");
//     } finally {
//       setIsUploading(false);
//       setIsRecording(false);
//       setSelectedFile(null); // 🔥 FIX 3: Ensure file is cleared from state
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state !== "inactive") {
//       mediaRecorder.stop();
//       setIsRecording(false);
//     }
//   };

//   // --- 7. UI Helpers ---
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     setInputText(val);

//     // Quick Reply Trigger
//     if (val === "/") setShowQuickReplies(true);
//     else setShowQuickReplies(false);

//     if (socket && activeUser) {
//       // Send as object to be safe
//       socket.emit("typing", { roomId: activeUser.roomId, userId: adminId });

//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("stop_typing", {
//           roomId: activeUser.roomId,
//           userId: adminId,
//         });
//       }, 2000);
//     }
//   };

//   const selectQuickReply = (text: string) => {
//     setInputText(text);
//     setShowQuickReplies(false);
//   };

//   // Drag & Drop
//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };
//   const handleDragLeave = () => setIsDragging(false);
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = e.dataTransfer.files;
//     if (files && files.length > 0) setSelectedFile(files[0]);
//   };

//   const filteredUsers = users.filter((u) =>
//     u.name.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   if (isLoading)
//     return (
//       <div className="flex h-[100dvh] items-center justify-center">
//         <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
//       </div>
//     );

//   return (
//     // 🔥 UPDATED: Full screen container with proper mobile support (100dvh)
//     <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col md:flex-row gap-4">
//       {/* --- LEFT SIDEBAR: USERS LIST --- */}
//       <AnimatePresence mode="popLayout">
//         {(!isMobileView || !showChatOnMobile) && (
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             // 🔥 UPDATED: Full width on mobile, fixed width on desktop
//             className={`flex-1 md:flex-none md:w-[350px] lg:w-[400px] flex flex-col ${glassPanel} rounded-2xl h-full`}
//           >
//             <div className="p-4 border-b border-white/10 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-white">Chats</h2>

//               {/* 🔥 NEW: AI Auto Reply Toggle Button */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={toggleAutoReply}
//                   className={`p-2 rounded-full transition-all ${isAutoReplyEnabled ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
//                   title={
//                     isAutoReplyEnabled
//                       ? "AI Auto-Reply is ON"
//                       : "AI Auto-Reply is OFF"
//                   }
//                 >
//                   <Bot size={20} />
//                 </button>
//                 <button className="p-2 hover:bg-white/10 rounded-full text-gray-300">
//                   <MoreVertical size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="px-4 py-3">
//               <div
//                 className={`flex items-center gap-2 px-3 py-2 rounded-xl ${glassInput}`}
//               >
//                 <Search size={18} className="text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search users..."
//                   className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
//                 />
//               </div>
//             </div>

//             {/* 🔥 UPDATED: Added custom scrollbar class */}
//             <div className={`flex-1 overflow-y-auto ${customScrollbar}`}>
//               {filteredUsers.map((user) => (
//                 <motion.div
//                   key={user._id}
//                   whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
//                   onClick={() => handleUserSelect(user)}
//                   className={`flex items-center gap-3 p-4 cursor-pointer border-b border-white/5 transition-colors
//                     ${activeUser?._id === user._id ? "bg-white/10 border-l-4 border-l-blue-500" : ""}`}
//                 >
//                   <div className="relative">
//                     <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
//                       {user.avatar ? (
//                         <img
//                           src={user.avatar}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         user.name.charAt(0).toUpperCase()
//                       )}
//                     </div>
//                     {/* 🟢 Online Status Dot */}
//                     {user.isOnline && (
//                       <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></span>
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-center mb-1">
//                       <h3 className="font-semibold text-white truncate">
//                         {user.name}
//                       </h3>
//                       <span className="text-xs text-gray-500">
//                         {user.lastMessageTime
//                           ? format(new Date(user.lastMessageTime), "HH:mm")
//                           : ""}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <p className="text-sm text-gray-400 truncate w-[90%]">
//                         {user.lastMessage || "Start conversation"}
//                       </p>
//                       {user.unreadCount && user.unreadCount > 0 ? (
//                         <span className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
//                           {user.unreadCount}
//                         </span>
//                       ) : null}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* --- RIGHT SIDE: CHAT WINDOW --- */}
//       <AnimatePresence mode="popLayout">
//         {(!isMobileView || showChatOnMobile) && (
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             // 🔥 UPDATED: Flexible width handling for mobile/desktop
//             className={`flex-1 flex flex-col ${glassPanel} rounded-2xl h-full overflow-hidden relative transition-colors ${isDragging ? "bg-blue-500/10 border-blue-500" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             {activeUser ? (
//               <>
//                 {/* Header */}
//                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
//                   <div className="flex items-center gap-3">
//                     {isMobileView && (
//                       <button
//                         onClick={() => setShowChatOnMobile(false)}
//                         className="mr-1 text-gray-300 hover:text-white"
//                       >
//                         <ArrowLeft size={22} />
//                       </button>
//                     )}
//                     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
//                       {activeUser.avatar ? (
//                         <img
//                           src={activeUser.avatar}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         activeUser.name.charAt(0).toUpperCase()
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-white leading-tight">
//                         {activeUser.name}
//                       </h3>
//                       <p className="text-xs text-blue-400">
//                         {isTyping ? (
//                           <span className="text-green-400 animate-pulse">
//                             Typing...
//                           </span>
//                         ) : activeUser.isOnline ? (
//                           "Online"
//                         ) : (
//                           "Offline"
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-4 text-gray-400">
//                     <Phone
//                       size={20}
//                       className="hover:text-white cursor-pointer"
//                     />
//                     <Video
//                       size={20}
//                       className="hover:text-white cursor-pointer"
//                     />
//                   </div>
//                 </div>

//                 {/* Messages */}
//                 {/* 🔥 UPDATED: Added custom scrollbar class */}
//                 <div
//                   className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/20 to-black/40 relative ${customScrollbar}`}
//                 >
//                   {isDragging && (
//                     <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-blue-500 m-4 rounded-xl">
//                       <p className="text-white font-bold text-xl">
//                         Drop files here to upload
//                       </p>
//                     </div>
//                   )}

//                   {messages.map((msg, idx) => {
//                     const senderId = getSafeId(msg.senderId);
//                     const isMe = senderId === adminId;

//                     return (
//                       <motion.div
//                         key={msg._id || idx}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//                       >
//                         <div
//                           className={`max-w-[85%] md:max-w-[65%] px-4 py-2 rounded-2xl relative shadow-md
//                           ${
//                             isMe
//                               ? "bg-blue-600 text-white rounded-tr-none"
//                               : "bg-white/10 backdrop-blur-md text-gray-100 rounded-tl-none border border-white/5"
//                           }`}
//                         >
//                           {/* Media */}
//                           {msg.messageType === "image" && msg.fileUrl && (
//                             <img
//                               src={msg.fileUrl}
//                               alt="attachment"
//                               className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer"
//                               onClick={() => window.open(msg.fileUrl, "_blank")}
//                             />
//                           )}
//                           {msg.messageType === "video" && msg.fileUrl && (
//                             <video
//                               src={msg.fileUrl}
//                               controls
//                               className="rounded-lg mb-2 max-h-60 w-full"
//                             />
//                           )}
//                           {msg.messageType === "audio" && msg.fileUrl && (
//                             <div className="flex items-center gap-2 mb-2 min-w-[200px] md:min-w-[220px] bg-black/20 p-2 rounded-lg">
//                               <audio
//                                 controls
//                                 className="w-full h-8"
//                                 preload="metadata"
//                               >
//                                 <source src={msg.fileUrl} type="audio/webm" />
//                                 <source src={msg.fileUrl} type="audio/mp4" />
//                                 <source src={msg.fileUrl} type="audio/mpeg" />
//                                 Your browser does not support the audio element.
//                               </audio>
//                             </div>
//                           )}

//                           {msg.text && (
//                             <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
//                               {msg.text}
//                             </p>
//                           )}

//                           <div
//                             className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}
//                           >
//                             {format(new Date(msg.createdAt), "HH:mm")}
//                             {isMe &&
//                               (msg.isRead ? (
//                                 <CheckCheck
//                                   size={14}
//                                   className="text-emerald-400"
//                                 /> // ✔✔ GREEN
//                               ) : (
//                                 <Check size={14} className="text-black" /> // ✔ BLACK
//                               ))}
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 {/* Quick Replies Popup */}
//                 <AnimatePresence>
//                   {showQuickReplies && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 10 }}
//                       className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 shadow-2xl z-20 flex flex-wrap gap-2"
//                     >
//                       {QUICK_REPLIES.map((reply, i) => (
//                         <button
//                           key={i}
//                           onClick={() => selectQuickReply(reply)}
//                           className="bg-white/5 hover:bg-blue-600 text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition"
//                         >
//                           {reply}
//                         </button>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* File Preview */}
//                 <AnimatePresence>
//                   {selectedFile && (
//                     <motion.div
//                       initial={{ y: 20, opacity: 0 }}
//                       animate={{ y: 0, opacity: 1 }}
//                       exit={{ y: 20, opacity: 0 }}
//                       className="absolute bottom-20 left-4 right-4 p-3 bg-black/80 backdrop-blur-md rounded-xl flex items-center gap-3 border border-white/10 z-30"
//                     >
//                       <Paperclip className="text-white" />
//                       <span className="text-white text-sm truncate flex-1">
//                         {selectedFile.name}
//                       </span>
//                       <button onClick={() => setSelectedFile(null)}>
//                         <X className="text-white hover:text-red-500" />
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Input Area */}
//                 <div className="p-3 md:p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
//                   <form
//                     onSubmit={handleSendMessage}
//                     className="flex items-center gap-2 md:gap-3"
//                   >
//                     <button
//                       type="button"
//                       className="text-gray-400 hover:text-white transition shrink-0"
//                     >
//                       <Smile size={24} />
//                     </button>

//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       className="hidden"
//                       accept="image/*,video/*,audio/*"
//                       onChange={(e) =>
//                         e.target.files && setSelectedFile(e.target.files[0])
//                       }
//                     />
//                     <button
//                       type="button"
//                       className="text-gray-400 hover:text-white transition shrink-0"
//                       onClick={() => fileInputRef.current?.click()}
//                     >
//                       <Paperclip size={22} />
//                     </button>

//                     <div className="flex-1 relative">
//                       <input
//                         type="text"
//                         value={inputText}
//                         onChange={handleInputChange}
//                         placeholder={
//                           isRecording
//                             ? "Recording..."
//                             : isMobileView
//                               ? "Message..."
//                               : "Type a message... (/ for replies)"
//                         }
//                         className={`w-full py-3 pl-4 pr-10 rounded-xl ${glassInput} ${isRecording ? "text-red-400 placeholder-red-400" : ""}`}
//                         disabled={isRecording || isUploading}
//                       />
//                       {isUploading && (
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                           <Loader2
//                             size={18}
//                             className="animate-spin text-blue-400"
//                           />
//                         </div>
//                       )}
//                     </div>

//                     {inputText.trim() || selectedFile ? (
//                       <button
//                         type="submit"
//                         disabled={isUploading}
//                         className="h-11 w-11 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 shrink-0"
//                       >
//                         <Send size={20} className="ml-0.5" />
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={isRecording ? stopRecording : startRecording}
//                         className={`h-11 w-11 rounded-full flex items-center justify-center text-white transition shrink-0 ${isRecording ? "bg-red-600 animate-pulse" : "bg-white/10 hover:bg-white/20"}`}
//                       >
//                         {isRecording ? (
//                           <StopCircle size={20} />
//                         ) : (
//                           <Mic size={20} />
//                         )}
//                       </button>
//                     )}
//                   </form>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
//                 <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
//                   <Send size={40} className="text-blue-400 ml-2" />
//                 </div>
//                 <h2 className="text-2xl font-bold text-white mb-2">
//                   Welcome to Live Chat
//                 </h2>
//                 <p className="text-gray-400 max-w-md">
//                   Select a customer from the left sidebar to start messaging.
//                 </p>
//                 <div className="mt-8 flex gap-2 text-sm text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <Lock size={12} /> End-to-end encrypted
//                   </div>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
  Smile,
  Mic,
  Loader2,
  Lock,
  X,
  StopCircle,
  Bot,
  Maximize2,
} from "lucide-react";
import { format } from "date-fns";
import { io, Socket } from "socket.io-client";
import { ChatService, AdminAuthService } from "@/lib/api";
import { toast } from "sonner";

// --- Types ---
interface ChatUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  roomId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ChatMessage {
  _id: string;
  senderId:
    | { _id: string; name: string; email: string; profilePicture?: string }
    | string;
  text: string;
  createdAt: string;
  isRead: boolean;
  messageType: "text" | "image" | "video" | "audio";
  fileUrl?: string;
  roomId: string;
  tempId?: number;
}

// Quick Replies
const QUICK_REPLIES = [
  "Hello! How can I help you?",
  "Your order has been shipped.",
  "Please provide your Order ID.",
  "The item is currently out of stock.",
  "Thank you for contacting us!",
  "Price for this bumper is ₹2,400.",
];

// Helper: Safe ID Extraction
const getSafeId = (data: any): string => {
  if (!data) return "";
  return typeof data === "object" ? data._id : data;
};

// --- STYLES ---
const glassPanel =
  "bg-white border border-gray-200 shadow-sm dark:bg-[#121212] dark:border-white/10 dark:shadow-xl transition-colors duration-300";
const glassInput =
  "bg-gray-100 border border-transparent text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500/50 dark:bg-[#2a2a2a] dark:border-white/10 dark:text-white dark:placeholder-gray-400 dark:focus:bg-black/30 transition-all";

const customScrollbar = `
  scrollbar-thin 
  scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 
  scrollbar-track-transparent 
  hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-white/20
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10
  [&::-webkit-scrollbar-thumb]:rounded-full
  hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20
`;

export default function ChatPage() {
  // --- STATE ---
  const [adminId, setAdminId] = useState<string>("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Features State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

  // AI Auto Reply
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(false);

  // File & Image Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refs
  const activeUserRef = useRef<ChatUser | null>(null);
  const adminIdRef = useRef<string>("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const sentAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Sync Refs
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);
  useEffect(() => {
    adminIdRef.current = adminId;
  }, [adminId]);

  // --- 1. INITIAL SETUP ---
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (typeof window !== "undefined") {
      notificationAudioRef.current = new Audio("/alert.mp3");
      sentAudioRef.current = new Audio("/sent.mp3");
    }

    const initChat = async () => {
      try {
        console.log("🚀 Admin Chat Initializing...");

        const profileRes = await AdminAuthService.getProfile();
        const rootData = profileRes.data;
        const adminData =
          rootData?.data?.data || rootData?.data?.admin || rootData?.data;

        if (adminData?._id) {
          setAdminId(adminData._id);
          adminIdRef.current = adminData._id;
          setIsAutoReplyEnabled(adminData.isAutoReplyEnabled || false);
        }

        await fetchUserList();

        // 🔥 FIX FOR HTTP ONLY COOKIE: Removed localStorage token
        const socketUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
          "http://localhost:5000";

        const newSocket = io(socketUrl, {
          withCredentials: true, // ✅ This automatically sends the HttpOnly cookie
          transports: ["websocket", "polling"],
          // auth: { token }, ❌ REMOVED: JS cannot read the cookie
          reconnection: true,
        });

        newSocket.on("connect", () => {
          console.log("🟢 Admin Socket Connected:", newSocket.id);
          if (adminData?._id) newSocket.emit("join_room", adminData._id);
          newSocket.emit("get_online_users");
        });

        newSocket.on("online_users_list", (onlineIds: string[]) => {
          setUsers((prev) =>
            prev.map((u) => ({
              ...u,
              isOnline: onlineIds.includes(String(u._id)),
            })),
          );
        });

        newSocket.on("receive_message", (newMsg: ChatMessage) => {
          handleIncomingMessage(newMsg, newSocket);
        });

        newSocket.on("messages_marked_read", ({ roomId }) => {
          if (activeUserRef.current?.roomId === roomId) {
            setMessages((prev) =>
              prev.map((msg) =>
                getSafeId(msg.senderId) === adminIdRef.current
                  ? { ...msg, isRead: true }
                  : msg,
              ),
            );
          }
        });

        newSocket.on(
          "user_status_update",
          (data: { userId: string; isOnline: boolean }) => {
            setUsers((prev) =>
              prev.map((u) =>
                String(u._id) === String(data.userId)
                  ? { ...u, isOnline: data.isOnline }
                  : u,
              ),
            );

            if (activeUserRef.current?._id === data.userId) {
              setActiveUser((prev) =>
                prev ? { ...prev, isOnline: data.isOnline } : null,
              );
            }
          },
        );

        newSocket.on("display_typing", ({ roomId, userId }) => {
          if (
            activeUserRef.current?.roomId === roomId &&
            userId !== adminIdRef.current
          ) {
            setIsTyping(true);
          }
        });

        newSocket.on("hide_typing", ({ roomId }) => {
          if (activeUserRef.current?.roomId === roomId) {
            setIsTyping(false);
          }
        });

        newSocket.on(
          "is_user_online_response",
          (data: { userId: string; isOnline: boolean }) => {
            setUsers((prev) =>
              prev.map((u) =>
                String(u._id) === String(data.userId)
                  ? { ...u, isOnline: data.isOnline }
                  : u,
              ),
            );

            if (String(activeUserRef.current?._id) === String(data.userId)) {
              setActiveUser((prev) =>
                prev ? { ...prev, isOnline: data.isOnline } : null,
              );
            }
          },
        );

        newSocket.on(
          "message_sent",
          (data: { tempId: number; messageId: string }) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === data.tempId
                  ? { ...msg, _id: data.messageId, isDelivered: true }
                  : msg,
              ),
            );
          },
        );

        setSocket(newSocket);

        pollingInterval = setInterval(() => {
          fetchUserList(true);
        }, 5000);
      } catch (error) {
        console.error("Chat init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    initChat();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (socket) socket.disconnect();
      clearInterval(pollingInterval);
    };
  }, []);

  // --- API Helpers ---
  const fetchUserList = async (silent = false) => {
    try {
      const roomsRes = await ChatService.getChatRooms();
      const roomsList = roomsRes.data?.data?.rooms || [];

      const formattedUsers: ChatUser[] = roomsList.map((room: any) => ({
        _id: room.otherUser._id,
        name: room.otherUser.name,
        email: room.otherUser.email,
        avatar: room.otherUser.profilePicture,
        roomId: room.roomId,
        lastMessage: room.lastMessage,
        lastMessageTime: room.lastMessageTime,
        unreadCount: room.unreadCount,
        isOnline: room.otherUser.isOnline || false,
      }));

      setUsers((prev) => {
        return formattedUsers.map((newUser) => {
          const existing = prev.find((u) => u._id === newUser._id);
          return existing
            ? { ...newUser, isOnline: existing.isOnline }
            : newUser;
        });
      });

      if (socket) {
        socket.emit("get_online_users");
      }
    } catch (e) {
      if (!silent) console.error("Failed to fetch users", e);
    }
  };

  const toggleAutoReply = async () => {
    try {
      // 🔥 FIX FOR HTTP ONLY COOKIE: Removed localStorage token
      const newStatus = !isAutoReplyEnabled;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/auth/toggle-ai`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Authorization header removed because cookie handles auth
          },
          credentials: "include", // ✅ Important: Sends the HttpOnly cookie
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setIsAutoReplyEnabled(newStatus);
        toast.success(`AI Auto-Reply Turned ${newStatus ? "ON 🟢" : "OFF 🔴"}`);
      } else {
        toast.error("Failed to update AI status");
      }
    } catch (error) {
      console.error("AI Toggle Error:", error);
      toast.error("Something went wrong");
    }
  };

  // --- 2. Handle User Select ---
  const handleUserSelect = async (user: ChatUser) => {
    setActiveUser(user);
    setIsSearching(false);
    if (isMobileView) setShowChatOnMobile(true);

    socket?.emit("join_room", user.roomId);
    socket?.emit("check_online_status", { userId: user._id });

    try {
      const res = await ChatService.getMessages(user.roomId);
      const history = res.data?.data?.messages || [];
      setMessages(history.reverse());
      scrollToBottom();

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u)),
      );

      if (history.length > 0) await ChatService.markAsRead(user.roomId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- 3. INCOMING MESSAGE LOGIC ---
  const handleIncomingMessage = (
    newMsg: ChatMessage,
    socketInstance: Socket,
  ) => {
    const currentActive = activeUserRef.current;
    const currentAdmin = adminIdRef.current;
    const senderId = getSafeId(newMsg.senderId);

    if (currentActive && currentActive.roomId === newMsg.roomId) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;

        if (senderId === currentAdmin) {
          return prev.map((m) =>
            m.tempId && m.text === newMsg.text ? newMsg : m,
          );
        }

        if (senderId !== currentAdmin) {
          socketInstance.emit("mark_read", {
            roomId: newMsg.roomId,
            userId: currentAdmin,
          });
          try {
            notificationAudioRef.current?.play();
          } catch (e) {}
        }

        return [...prev, newMsg];
      });

      scrollToBottom();
      setIsTyping(false);
    } else {
      try {
        notificationAudioRef.current?.play();
      } catch (e) {}
      toast.info(`New message received`);
    }

    fetchUserList(true);
  };

  // --- 4. Send Message (Optimistic UI) ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !activeUser || !socket) return;

    try {
      if (sentAudioRef.current) {
        sentAudioRef.current.currentTime = 0;
        sentAudioRef.current.play();
      }
    } catch (error) {
      console.log("Audio play error", error);
    }

    if (selectedFile) {
      await handleFileUpload();
      return;
    }

    const tempId = Date.now();
    const payload = {
      senderId: adminId,
      receiverId: activeUser._id,
      text: inputText,
      roomId: activeUser.roomId,
      messageType: "text",
      senderModel: "Admin",
      receiverModel: "User",
      tempId: tempId,
    };

    const optimisticMsg: ChatMessage = {
      _id: `temp-${tempId}`,
      senderId: adminId,
      text: inputText,
      createdAt: new Date().toISOString(),
      isRead: false,
      messageType: "text",
      roomId: activeUser.roomId,
      tempId: tempId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    scrollToBottom();
    setShowQuickReplies(false);

    socket.emit("stop_typing", { roomId: activeUser.roomId });
    socket.emit("send_message", payload);

    setUsers((prev) =>
      prev
        .map((u) =>
          u._id === activeUser._id
            ? {
                ...u,
                lastMessage: payload.text,
                lastMessageTime: new Date().toISOString(),
              }
            : u,
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        ),
    );
  };

  // --- 5. File Upload ---
  const handleFileUpload = async () => {
    if (!selectedFile || !activeUser || !socket) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await ChatService.uploadFile(formData);
      const { fileUrl, fileType } = res.data.data;

      let finalType = fileType;
      if (
        selectedFile.type.startsWith("audio") ||
        selectedFile.name.endsWith(".webm")
      ) {
        finalType = "audio";
      }

      const payload = {
        senderId: adminId,
        receiverId: activeUser._id,
        text: "",
        roomId: activeUser.roomId,
        messageType: finalType,
        fileUrl: fileUrl,
        senderModel: "Admin",
        receiverModel: "User",
      };

      const tempMsg: ChatMessage = {
        _id: `temp-${Date.now()}`,
        senderId: adminId,
        text: "",
        fileUrl: fileUrl,
        messageType: finalType as any,
        createdAt: new Date().toISOString(),
        isRead: false,
        roomId: activeUser.roomId,
      };

      setMessages((prev) => [...prev, tempMsg]);
      scrollToBottom();

      socket.emit("send_message", payload);
      fetchUserList(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 6. Voice Recording ---
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        const fileExt = mimeType.includes("mp4") ? "mp4" : "webm";
        const fileName = `voice_note_${Date.now()}.${fileExt}`;

        const file = new File([audioBlob], fileName, {
          type: mimeType,
        });

        uploadAndSendRecordedFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied");
    }
  };

  const uploadAndSendRecordedFile = async (file: File) => {
    if (!activeUser || !socket) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await ChatService.uploadFile(formData);
      console.log("Audio Upload Response:", res.data);

      const responseData = res.data;
      const fileUrl =
        responseData?.data?.fileUrl ||
        responseData?.fileUrl ||
        responseData?.url ||
        responseData?.secure_url;

      if (!fileUrl) {
        toast.error("Audio upload failed: No URL received");
        return;
      }

      const payload = {
        senderId: adminId,
        receiverId: activeUser._id,
        text: "",
        roomId: activeUser.roomId,
        messageType: "audio",
        fileUrl: fileUrl,
        senderModel: "Admin",
        receiverModel: "User",
      };

      const tempMsg: ChatMessage = {
        _id: `temp-${Date.now()}`,
        senderId: adminId,
        text: "",
        fileUrl: fileUrl,
        messageType: "audio",
        createdAt: new Date().toISOString(),
        isRead: false,
        roomId: activeUser.roomId,
      };

      setMessages((prev) => [...prev, tempMsg]);
      scrollToBottom();
      socket.emit("send_message", payload);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send voice note");
    } finally {
      setIsUploading(false);
      setIsRecording(false);
      setSelectedFile(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // --- 7. UI Helpers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val === "/") setShowQuickReplies(true);
    else setShowQuickReplies(false);

    if (socket && activeUser) {
      socket.emit("typing", { roomId: activeUser.roomId, userId: adminId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          roomId: activeUser.roomId,
          userId: adminId,
        });
      }, 2000);
    }
  };

  const selectQuickReply = (text: string) => {
    setInputText(text);
    setShowQuickReplies(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) setSelectedFile(files[0]);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
      </div>
    );

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col md:flex-row gap-4">
      {/* --- LEFT SIDEBAR: USERS LIST --- */}
      <AnimatePresence mode="popLayout">
        {(!isMobileView || !showChatOnMobile) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex-1 md:flex-none md:w-[350px] lg:w-[400px] flex flex-col ${glassPanel} rounded-2xl h-full`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Chats
              </h2>

              {/* AI Auto Reply Toggle Button */}
              <div className="flex gap-2">
                <button
                  onClick={toggleAutoReply}
                  className={`p-2 rounded-full transition-all ${isAutoReplyEnabled ? "bg-green-100 text-green-600 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/50" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"}`}
                  title={
                    isAutoReplyEnabled
                      ? "AI Auto-Reply is ON"
                      : "AI Auto-Reply is OFF"
                  }
                >
                  <Bot size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-300">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 py-3">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${glassInput}`}
              >
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto ${customScrollbar}`}>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                  onClick={() => handleUserSelect(user)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 dark:border-white/5 transition-colors
                  ${activeUser?._id === user._id ? "bg-blue-50 border-l-4 border-l-blue-500 dark:bg-white/10" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* 🟢 Online Status Dot */}
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {user.lastMessageTime
                          ? format(new Date(user.lastMessageTime), "HH:mm")
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-[90%]">
                        {user.lastMessage || "Start conversation"}
                      </p>
                      {user.unreadCount && user.unreadCount > 0 ? (
                        <span className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {user.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- RIGHT SIDE: CHAT WINDOW --- */}
      <AnimatePresence mode="popLayout">
        {(!isMobileView || showChatOnMobile) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex-1 flex flex-col ${glassPanel} dark:bg-[#0a0a0a] rounded-2xl h-full overflow-hidden relative transition-colors ${isDragging ? "bg-blue-50 border-blue-500 dark:bg-blue-500/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {activeUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-[#111]">
                  <div className="flex items-center gap-3">
                    {isMobileView && (
                      <button
                        onClick={() => setShowChatOnMobile(false)}
                        className="mr-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      >
                        <ArrowLeft size={22} />
                      </button>
                    )}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0 shadow-sm">
                      {activeUser.avatar ? (
                        <img
                          src={activeUser.avatar}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        activeUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                        {activeUser.name}
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {isTyping ? (
                          <span className="text-green-600 dark:text-green-400 animate-pulse">
                            Typing...
                          </span>
                        ) : activeUser.isOnline ? (
                          "Online"
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                    <Phone
                      size={20}
                      className="hover:text-blue-600 dark:hover:text-white cursor-pointer"
                    />
                    <Video
                      size={20}
                      className="hover:text-blue-600 dark:hover:text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Messages */}
                <div
                  className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0a0a0a] relative ${customScrollbar}`}
                >
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-blue-500 m-4 rounded-xl">
                      <p className="text-blue-700 dark:text-white font-bold text-xl">
                        Drop files here to upload
                      </p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const senderId = getSafeId(msg.senderId);
                    const isMe = senderId === adminId;

                    return (
                      <motion.div
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[65%] px-4 py-2 rounded-2xl relative shadow-sm group
                          ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white border border-gray-200 text-gray-900 rounded-tl-none dark:bg-[#1a1a1a] dark:text-gray-100 dark:border-white/5"
                          }`}
                        >
                          {/* Media */}
                          {msg.messageType === "image" && msg.fileUrl && (
                            <div className="relative group/image">
                              <img
                                src={msg.fileUrl}
                                alt="attachment"
                                className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() =>
                                  msg.fileUrl && setPreviewImage(msg.fileUrl)
                                }
                              />
                              <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
                                <Maximize2 size={14} className="text-white" />
                              </div>
                            </div>
                          )}
                          {msg.messageType === "video" && msg.fileUrl && (
                            <video
                              src={msg.fileUrl}
                              controls
                              className="rounded-lg mb-2 max-h-60 w-full"
                            />
                          )}
                          {msg.messageType === "audio" && msg.fileUrl && (
                            <div className="flex items-center gap-2 mb-2 min-w-[200px] md:min-w-[220px] bg-black/10 dark:bg-black/20 p-2 rounded-lg">
                              <audio
                                controls
                                className="w-full h-8"
                                preload="metadata"
                              >
                                <source src={msg.fileUrl} type="audio/webm" />
                                <source src={msg.fileUrl} type="audio/mp4" />
                                <source src={msg.fileUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}

                          {msg.text && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          )}

                          <div
                            className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-200" : "text-gray-400 dark:text-gray-500"}`}
                          >
                            {format(new Date(msg.createdAt), "HH:mm")}
                            {isMe &&
                              (msg.isRead ? (
                                <CheckCheck
                                  size={14}
                                  className="text-emerald-300 dark:text-emerald-400"
                                />
                              ) : (
                                <Check
                                  size={14}
                                  className="text-white/70 dark:text-gray-400"
                                />
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies Popup */}
                <AnimatePresence>
                  {showQuickReplies && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-20 left-4 right-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl p-2 shadow-2xl z-20 flex flex-wrap gap-2"
                    >
                      {QUICK_REPLIES.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => selectQuickReply(reply)}
                          className="bg-gray-100 hover:bg-blue-600 hover:text-white text-sm text-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white px-3 py-1.5 rounded-full transition"
                        >
                          {reply}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File Preview */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="absolute bottom-20 left-4 right-4 p-3 bg-white/90 dark:bg-[#1a1a1a] backdrop-blur-md rounded-xl flex items-center gap-3 border border-gray-200 dark:border-white/10 z-30 shadow-lg"
                    >
                      <Paperclip className="text-gray-600 dark:text-white" />
                      <span className="text-gray-800 dark:text-white text-sm truncate flex-1">
                        {selectedFile.name}
                      </span>
                      <button onClick={() => setSelectedFile(null)}>
                        <X className="text-gray-600 hover:text-red-500 dark:text-white dark:hover:text-red-500" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-3 md:p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] backdrop-blur-md">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 md:gap-3"
                  >
                    <button
                      type="button"
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition shrink-0"
                    >
                      <Smile size={24} />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/*,audio/*"
                      onChange={(e) =>
                        e.target.files && setSelectedFile(e.target.files[0])
                      }
                    />
                    <button
                      type="button"
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={22} />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder={
                          isRecording
                            ? "Recording..."
                            : isMobileView
                              ? "Message..."
                              : "Type a message... (/ for replies)"
                        }
                        className={`w-full py-3 pl-4 pr-10 rounded-xl ${glassInput} ${isRecording ? "text-red-500 placeholder-red-400 dark:text-red-400 dark:placeholder-red-400" : ""}`}
                        disabled={isRecording || isUploading}
                      />
                      {isUploading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2
                            size={18}
                            className="animate-spin text-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {inputText.trim() || selectedFile ? (
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="h-11 w-11 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 shrink-0"
                      >
                        <Send size={20} className="ml-0.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-gray-600 dark:text-white transition shrink-0 ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20"}`}
                      >
                        {isRecording ? (
                          <StopCircle size={20} />
                        ) : (
                          <Mic size={20} />
                        )}
                      </button>
                    )}
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                <div className="h-24 w-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-white/10">
                  <Send size={40} className="text-blue-500 ml-2" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Live Chat
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Select a customer from the left sidebar to start messaging.
                </p>
                <div className="mt-8 flex gap-2 text-sm text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lock size={12} /> End-to-end encrypted
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
            >
              <img
                src={previewImage}
                alt="Full preview"
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
                className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
