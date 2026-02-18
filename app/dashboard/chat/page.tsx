"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
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
import api from "@/lib/api";

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
  isTyping?: boolean;
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

interface SenderDetails {
  name?: string;
  email?: string;
  profilePicture?: string;
  _id?: string;
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // 🔥 New Loading State

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
  const joinedRoomsRef = useRef<Set<string>>(new Set());

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
    let newSocket: Socket;

    if (typeof window !== "undefined") {
      notificationAudioRef.current = new Audio("/sounds/message-receive.mp3");
      sentAudioRef.current = new Audio("/sounds/message-send.mp3");
    }

    const initChat = async () => {
      try {
        const profileRes = await AdminAuthService.getProfile();
        const rootData = profileRes.data;
        const adminData =
          rootData?.data?.data || rootData?.data?.admin || rootData?.data;

        if (adminData?._id) {
          setAdminId(adminData._id);
          adminIdRef.current = adminData._id;
          setIsAutoReplyEnabled(adminData.isAutoReplyEnabled || false);
        }

        // const socketUrl =
        //   process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        //   "http://localhost:5000";

        // newSocket = io(socketUrl, {
        //   withCredentials: true,
        //   transports: ["websocket", "polling"],
        //   reconnection: true,
        // });

        // 🔥 CHANGE START: Token తెచ్చుకోవడం & Socket Connect చేయడం
        const tokenRes = await api.get("/admin/auth/get-socket-token");
        const token = tokenRes.data?.token;

        const socketUrl =
          process.env.NEXT_PUBLIC_SOCKET_URL ||
          process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
          "http://localhost:5000";

        // Token ఉంటేనే కనెక్ట్ అవ్వాలి, లేకపోతే మామూలుగా (కానీ Auth ఎర్రర్ రావచ్చు)
        newSocket = io(socketUrl, {
          auth: {
            token: token, // ✅ టోకెన్ ఇక్కడ పాస్ చేస్తున్నాం
          },
          withCredentials: true,
          transports: ["websocket", "polling"],
          reconnection: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
          if (adminData?._id) newSocket.emit("join_room", adminData._id);
          fetchUserList(newSocket);
        });

        // 🔥 ROBUST SOCKET LISTENER
        newSocket.on("receive_message", (newMsg: ChatMessage) => {
          // 1. Audio Play
          try {
            if (notificationAudioRef.current) {
              const playPromise = notificationAudioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {});
              }
            }
          } catch (e) {}

          const senderId =
            typeof newMsg.senderId === "object"
              ? newMsg.senderId._id
              : newMsg.senderId;
          const currentAdminId = adminIdRef.current;

          // 2. Sidebar Update
          setUsers((prevUsers) => {
            const userIndex = prevUsers.findIndex(
              (u) => u.roomId === newMsg.roomId,
            );

            // New Customer -> Refresh
            if (userIndex === -1 && senderId !== currentAdminId) {
              // Temporary Add for Instant UI
              const senderObj: any =
                typeof newMsg.senderId === "object" ? newMsg.senderId : {};
              const newUser: any = {
                _id: senderId,
                name: senderObj.name || "New Customer",
                email: senderObj.email || "",
                avatar: senderObj.profilePicture || "",
                roomId: newMsg.roomId,
                lastMessage:
                  newMsg.messageType === "text"
                    ? newMsg.text
                    : `Sent a ${newMsg.messageType}`,
                lastMessageTime: newMsg.createdAt,
                unreadCount: 1,
                isOnline: true,
              };
              return [newUser, ...prevUsers];
            }

            if (userIndex !== -1) {
              const updatedList = [...prevUsers];
              const userToMove = { ...updatedList[userIndex] };

              userToMove.lastMessage =
                newMsg.messageType === "text"
                  ? newMsg.text
                  : `Sent a ${newMsg.messageType}`;
              userToMove.lastMessageTime = newMsg.createdAt;

              if (
                activeUserRef.current?.roomId !== newMsg.roomId &&
                senderId !== currentAdminId
              ) {
                userToMove.unreadCount = (userToMove.unreadCount || 0) + 1;
              }

              updatedList.splice(userIndex, 1);
              updatedList.unshift(userToMove);
              return updatedList;
            }
            return prevUsers;
          });

          // 3. Chat Window Update
          if (activeUserRef.current?.roomId === newMsg.roomId) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === newMsg._id)) return prev;
              if (senderId === currentAdminId) return prev;
              return [...prev, newMsg];
            });
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        });

        newSocket.on("online_users_list", (onlineIds: string[]) => {
          setUsers((prev) =>
            prev.map((u) => ({
              ...u,
              isOnline: onlineIds.includes(String(u._id)),
            })),
          );
        });

        newSocket.on("user_status_update", (data) => {
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
        });

        // 🔥 ChatPage.tsx లోని socket listeners ని ఇలా update చేయండి

        newSocket.on("display_typing", ({ roomId, userId }) => {
          const currentAdminId = adminIdRef.current;

          // 1. Active Chat Window కోసం (పాత logic)
          if (
            activeUserRef.current?.roomId === roomId &&
            String(userId) !== String(currentAdminId)
          ) {
            setIsTyping(true);
          }

          // 2. 🔥 SIDEBAR కోసం: User list లో ఈ roomId ఉన్న user కి 'isTyping' flag పెట్టాలి
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.roomId === roomId ? { ...u, isTyping: true } : u,
            ),
          );
        });

        newSocket.on("hide_typing", ({ roomId }) => {
          // 1. Active Chat Window కోసం
          if (activeUserRef.current?.roomId === roomId) {
            setIsTyping(false);
          }

          // 2. 🔥 SIDEBAR కోసం: Typing ఆగిపోతే flag తీసేయాలి
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.roomId === roomId ? { ...u, isTyping: false } : u,
            ),
          );
        });
        newSocket.on("message_sent", (data) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === data.tempId
                ? { ...msg, _id: data.messageId, isDelivered: true }
                : msg,
            ),
          );
        });

        // Polling fallback
        pollingInterval = setInterval(
          () => fetchUserList(newSocket, true),
          10000,
        );
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
      if (newSocket) newSocket.disconnect();
      clearInterval(pollingInterval);
    };
  }, []);

  // --- API Helpers ---
  const fetchUserList = async (currentSocket?: Socket, silent = false) => {
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

      if (currentSocket) {
        formattedUsers.forEach((user) => {
          if (!joinedRoomsRef.current.has(user.roomId)) {
            currentSocket.emit("join_room", user.roomId);
            joinedRoomsRef.current.add(user.roomId);
          }
        });
      }

      setUsers((prev) => {
        const mergedList = formattedUsers.map((newUser) => {
          const existing = prev.find((u) => u._id === newUser._id);
          return existing
            ? { ...newUser, isOnline: existing.isOnline }
            : newUser;
        });
        return mergedList.sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
      });

      if (currentSocket) currentSocket.emit("get_online_users");
    } catch (e) {
      if (!silent) console.error("Failed to fetch users", e);
    }
  };

  const toggleAutoReply = async () => {
    try {
      const newStatus = !isAutoReplyEnabled;

      // 🔥 FIX: Direct fetch బదులు మన 'api' ఇన్స్టెన్స్ వాడాలి
      // దీనివల్ల credentials మరియు baseURL ఆటోమేటిక్‌గా సెట్ అవుతాయి
      const response = await api.put("/admin/auth/toggle-ai", {
        status: newStatus,
      });

      // Axios లో డేటా response.data లో ఉంటుంది
      if (response.data.success) {
        setIsAutoReplyEnabled(newStatus);
        toast.success(`AI Auto-Reply Turned ${newStatus ? "ON 🟢" : "OFF 🔴"}`);
      }
    } catch (error) {
      console.error("Toggle AI Error:", error);
      toast.error("Failed to update AI status. Please try again.");
    }
  };

  // --- 2. Handle User Select (UPDATED) ---
  const handleUserSelect = async (user: ChatUser) => {
    setMessages([]); // Clear previous messages
    setActiveUser(user);
    activeUserRef.current = user;
    setIsSearching(false);

    // 🔥 START LOADING
    setIsLoadingMessages(true);

    if (isMobileView) setShowChatOnMobile(true);
    socket?.emit("join_room", user.roomId);
    socket?.emit("check_online_status", { userId: user._id });

    try {
      const res = await ChatService.getMessages(user.roomId);
      const history = res.data?.data?.messages || [];

      // Sort: Oldest First (Top) -> Newest Last (Bottom)
      const sortedMessages = history.sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      if (activeUserRef.current?._id === user._id) {
        setMessages(sortedMessages);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 50);
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u)),
      );

      if (history.length > 0) await ChatService.markAsRead(user.roomId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      // 🔥 STOP LOADING (With delay for smoothness)
      setTimeout(() => setIsLoadingMessages(false), 300);
    }
  };

  // --- 4. Send Message ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !activeUser || !socket) return;

    try {
      if (sentAudioRef.current) {
        sentAudioRef.current.currentTime = 0;
        sentAudioRef.current.play();
      }
    } catch (error) {}

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
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
    setShowQuickReplies(false);

    socket.emit("stop_typing", { roomId: activeUser.roomId });
    socket.emit("send_message", payload);

    // Sidebar update
    setUsers((prev) => {
      const updated = prev.map((u) =>
        u._id === activeUser._id
          ? {
              ...u,
              lastMessage: payload.text,
              lastMessageTime: new Date().toISOString(),
            }
          : u,
      );
      return updated.sort(
        (a, b) =>
          new Date(b.lastMessageTime || 0).getTime() -
          new Date(a.lastMessageTime || 0).getTime(),
      );
    });
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
      )
        finalType = "audio";

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
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );

      socket.emit("send_message", payload);

      setUsers((prev) => {
        const updated = prev.map((u) =>
          u._id === activeUser._id
            ? {
                ...u,
                lastMessage: `Sent a ${finalType}`,
                lastMessageTime: new Date().toISOString(),
              }
            : u,
        );
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        );
      });
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Voice Recording ---
  const streamRef = useRef<MediaStream | null>(null);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([audioBlob], `voice_note_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        uploadAndSendRecordedFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const uploadAndSendRecordedFile = async (file: File) => {
    setSelectedFile(file);
    await handleFileUpload();
    setIsRecording(false);
  };
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // --- UI Handlers ---
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
    if (e.dataTransfer.files.length > 0)
      setSelectedFile(e.dataTransfer.files[0]);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 🔥 REAL LAYOUT SKELETON (Fixes CLS for Chat Page)
  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col md:flex-row gap-4">
        {/* --- LEFT SIDEBAR SKELETON --- */}
        <div
          className={`hidden md:flex md:w-[350px] lg:w-[400px] flex-col ${glassPanel} rounded-3xl h-full border-r-0 overflow-hidden`}
        >
          {/* Header Skeleton */}
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-32 rounded-lg mb-2" /> {/* Title */}
              <Skeleton className="h-3 w-24 rounded-lg" /> {/* Subtitle */}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-2xl" /> {/* Bot Toggle */}
              <Skeleton className="h-10 w-10 rounded-2xl" /> {/* Menu */}
            </div>
          </div>

          {/* Search Skeleton */}
          <div className="px-5 py-4">
            <Skeleton className="h-12 w-full rounded-[1.25rem]" />
          </div>

          {/* Users List Skeleton */}
          <div className="flex-1 overflow-hidden px-2 pb-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-transparent"
              >
                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />{" "}
                {/* Avatar */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 rounded" /> {/* Name */}
                    <Skeleton className="h-3 w-10 rounded" /> {/* Time */}
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32 rounded" /> {/* Message */}
                    {i === 0 && (
                      <Skeleton className="h-5 w-5 rounded-full" />
                    )}{" "}
                    {/* Badge */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT CHAT WINDOW SKELETON --- */}
        <div
          className={`flex-1 flex flex-col ${glassPanel} dark:bg-[#0a0a0a] rounded-2xl h-full overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-[#111]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded" /> {/* Name */}
                <Skeleton className="h-3 w-16 rounded" /> {/* Status */}
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-5 w-5 rounded" /> {/* Phone */}
              <Skeleton className="h-5 w-5 rounded" /> {/* Video */}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-6 overflow-hidden relative">
            {/* Left Message */}
            <div className="flex justify-start">
              <Skeleton className="h-10 w-48 rounded-2xl rounded-tl-none" />
            </div>

            {/* Right Message */}
            <div className="flex justify-end">
              <Skeleton className="h-16 w-64 rounded-2xl rounded-tr-none" />
            </div>

            {/* Left Message */}
            <div className="flex justify-start">
              <Skeleton className="h-24 w-56 rounded-2xl rounded-tl-none" />
            </div>

            {/* Right Message */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-40 rounded-2xl rounded-tr-none" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />{" "}
              {/* Smiley */}
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />{" "}
              {/* Clip */}
              <Skeleton className="h-12 flex-1 rounded-xl" /> {/* Input */}
              <Skeleton className="h-11 w-11 rounded-full shrink-0" />{" "}
              {/* Mic/Send */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col md:flex-row gap-4">
      {/* --- LEFT SIDEBAR: USERS LIST --- */}
      {/* <AnimatePresence mode="popLayout">
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
      </AnimatePresence> */}

      <AnimatePresence mode="popLayout">
        {(!isMobileView || !showChatOnMobile) && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`flex-1 md:flex-none md:w-[350px] lg:w-[400px] flex flex-col ${glassPanel} rounded-3xl h-full overflow-hidden border-r-0`}
          >
            {/* --- HEADER SECTION --- */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Messages
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {filteredUsers.length} Active Conversations
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAutoReply}
                  className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                    isAutoReplyEnabled
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                  }`}
                  title={
                    isAutoReplyEnabled
                      ? "AI Auto-Reply is ON"
                      : "AI Auto-Reply is OFF"
                  }
                >
                  <Bot size={20} strokeWidth={2.5} />
                </motion.button>
                <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl text-gray-400 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="px-5 py-4">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-[1.25rem] shadow-inner ${glassInput} group focus-within:ring-2 focus-within:ring-blue-500/20`}
              >
                <Search
                  size={18}
                  className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder-gray-400 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* --- USERS LIST --- */}
            <div
              className={`flex-1 overflow-y-auto px-2 pb-4 ${customScrollbar}`}
            >
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => {
                  const isActive = activeUser?._id === user._id;

                  return (
                    <motion.div
                      layout
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserSelect(user)}
                      className={`relative flex items-center gap-4 p-4 mb-1 rounded-[1.5rem] cursor-pointer transition-all duration-300 group
                ${
                  isActive
                    ? "bg-blue-600 shadow-lg shadow-blue-600/20 active-user"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
                    >
                      {/* AVATAR WRAPPER */}
                      <div className="relative shrink-0">
                        <div
                          className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105 ${
                            isActive
                              ? "bg-white/20"
                              : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                          }`}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              className="h-full w-full object-cover"
                              alt={user.name}
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* ONLINE STATUS RING */}
                        {user.isOnline && (
                          <span
                            className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 flex items-center justify-center ${
                              isActive
                                ? "border-blue-600 bg-emerald-400"
                                : "border-white dark:border-[#121212] bg-emerald-500"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></span>
                          </span>
                        )}
                      </div>

                      {/* CONTENT WRAPPER */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3
                            className={`font-bold truncate ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}
                          >
                            {user.name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold ${isActive ? "text-blue-100" : "text-gray-400"}`}
                          >
                            {user.lastMessageTime
                              ? format(new Date(user.lastMessageTime), "HH:mm")
                              : ""}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          {/* 🔥 TYPING INDICATOR LOGIC */}
                          {user.isTyping ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                <span
                                  className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s] ${isActive ? "bg-white" : "bg-blue-500"}`}
                                ></span>
                                <span
                                  className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s] ${isActive ? "bg-white" : "bg-blue-500"}`}
                                ></span>
                                <span
                                  className={`w-1 h-1 rounded-full animate-bounce ${isActive ? "bg-white" : "bg-blue-500"}`}
                                ></span>
                              </div>
                              <span
                                className={`text-xs font-bold italic animate-pulse ${isActive ? "text-blue-100" : "text-blue-500"}`}
                              >
                                typing...
                              </span>
                            </div>
                          ) : (
                            <p
                              className={`text-sm truncate w-[85%] ${
                                isActive
                                  ? "text-blue-50/80"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {user.lastMessage || "Start a new chat"}
                            </p>
                          )}

                          {/* UNREAD BADGE */}
                          {user.unreadCount &&
                          user.unreadCount > 0 &&
                          !user.isTyping ? (
                            <motion.span
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              className={`h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                                isActive
                                  ? "bg-white text-blue-600"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {user.unreadCount}
                            </motion.span>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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

                {/* Messages Area */}
                <div
                  className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0a0a0a] relative ${customScrollbar}`}
                >
                  {/* 🔥 LOADING ANIMATION HERE */}
                  {isLoadingMessages ? (
                    <div className="flex-1 h-full flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-2">
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "easeInOut",
                          }}
                          className="w-3 h-3 bg-blue-500 rounded-full"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.2,
                            ease: "easeInOut",
                          }}
                          className="w-3 h-3 bg-purple-500 rounded-full"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.4,
                            ease: "easeInOut",
                          }}
                          className="w-3 h-3 bg-pink-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-400 animate-pulse tracking-wider">
                        Loading Conversation...
                      </p>
                    </div>
                  ) : (
                    <>
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
                                  ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-900 rounded-tl-none dark:bg-[#1a1a1a] dark:text-gray-100 dark:border-white/5"}`}
                            >
                              {msg.messageType === "image" && msg.fileUrl && (
                                <div className="relative group/image">
                                  <img
                                    src={msg.fileUrl}
                                    alt="attachment"
                                    className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() =>
                                      msg.fileUrl &&
                                      setPreviewImage(msg.fileUrl)
                                    }
                                  />
                                  <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
                                    <Maximize2
                                      size={14}
                                      className="text-white"
                                    />
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
                                    <source src={msg.fileUrl} />
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
                    </>
                  )}
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
