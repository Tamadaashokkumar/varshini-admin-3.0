"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  Send,
  Paperclip,
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";

export default function ChatComponent({
  currentUserId,
  otherUserId,
  otherUserModel = "Admin",
  otherUserName = "User",
  token,
  apiUrl = "http://localhost:5000",
  isDarkMode, // 🔥 Parent నుండి వస్తుంది
}) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const roomId = [currentUserId, otherUserId].sort().join("_");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping, selectedFile]);

  // --- SOCKET LOGIC ---
  useEffect(() => {
    if (!token || !currentUserId || !otherUserId) return;
    const socketUrl = apiUrl.replace("/api", "");
    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", { roomId });
      fetchChatHistory();
    });

    newSocket.on("new_message", (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        if (data.message.senderId !== currentUserId) {
          newSocket.emit("mark_read", { messageId: data.message._id, roomId });
        }
      }
    });

    newSocket.on("typing", (data) => {
      if (data.userId !== currentUserId && data.roomId === roomId)
        setOtherUserTyping(true);
    });

    newSocket.on("stop_typing", (data) => {
      if (data.userId !== currentUserId && data.roomId === roomId)
        setOtherUserTyping(false);
    });

    newSocket.on("message_read", (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId ? { ...msg, isRead: true } : msg,
          ),
        );
      }
    });

    return () => {
      newSocket.off("new_message");
      newSocket.emit("leave_room", { roomId });
      newSocket.disconnect();
    };
  }, [currentUserId, otherUserId, token, roomId, apiUrl]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/chat/history/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const historyData = res.data.data?.messages || [];
        setMessages(Array.isArray(historyData) ? historyData : []);
      }
    } catch (error) {
      setMessages([]);
    }
  };

  const uploadAndSendFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await axios.post(`${apiUrl}/api/chat/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        const { fileUrl, fileType, fileName, fileSize } = res.data.data;
        socket?.emit("send_message", {
          roomId,
          receiverId: otherUserId,
          receiverModel: otherUserModel,
          text: inputText || "",
          messageType: fileType,
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: fileSize,
          tempId: Date.now(),
        });
        setSelectedFile(null);
        setInputText("");
      }
    } catch (error) {
      alert("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = () => {
    if (selectedFile) {
      uploadAndSendFile();
      return;
    }
    if (!inputText.trim()) return;
    socket?.emit("send_message", {
      roomId,
      receiverId: otherUserId,
      receiverModel: otherUserModel,
      text: inputText,
      messageType: "text",
      tempId: Date.now(),
    });
    setInputText("");
    socket?.emit("stop_typing", { roomId });
  };

  const handleTyping = () => {
    socket?.emit("typing", { roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop_typing", { roomId });
    }, 2000);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMessageFromMe = (msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return senderId === currentUserId;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==============================
  // UI RENDER
  // ==============================
  return (
    <div
      className={`flex flex-col h-full relative transition-colors duration-300 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* HEADER */}
      <div
        className={`h-[72px] flex items-center justify-between px-6 shrink-0 transition-colors duration-300 ${
          isDarkMode
            ? "bg-slate-900 border-b border-slate-800"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              isDarkMode ? "bg-slate-700 text-white" : "bg-[#0f172a] text-white"
            }`}
          >
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2
              className={`font-bold text-base ${isDarkMode ? "text-white" : "text-[#0f172a]"}`}
            >
              {otherUserName}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p
                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
              >
                Active now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
      >
        {Array.isArray(messages) &&
          messages.map((msg, index) => {
            const isMe = isMessageFromMe(msg);
            return (
              <div
                key={msg._id || index}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-5 py-3 text-[15px] leading-relaxed relative shadow-sm ${
                      isMe
                        ? "bg-[#0f172a] text-white rounded-2xl rounded-tr-sm"
                        : isDarkMode
                          ? "bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm"
                          : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {(msg.messageType === "image" ||
                      msg.messageType === "video") &&
                      msg.fileUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          {msg.messageType === "image" ? (
                            <img
                              src={msg.fileUrl}
                              alt="media"
                              className="max-w-full h-auto cursor-pointer"
                              onClick={() => window.open(msg.fileUrl, "_blank")}
                            />
                          ) : (
                            <video
                              src={msg.fileUrl}
                              controls
                              className="max-w-full h-auto"
                            />
                          )}
                        </div>
                      )}
                    {msg.text && (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <div
                    className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}
                  >
                    {formatTime(msg.createdAt)}
                    {isMe &&
                      (msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        {otherUserTyping && (
          <div className="text-xs text-gray-400 ml-4">typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div
        className={`p-6 shrink-0 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
      >
        {selectedFile && (
          <div
            className={`flex items-center gap-3 p-2 rounded-lg mb-2 border w-fit ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"}`}
          >
            <span
              className={`text-xs font-medium truncate max-w-[200px] ${isDarkMode ? "text-white" : "text-gray-600"}`}
            >
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="bg-gray-200 rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-colors ${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={uploading}
              className={`w-full rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border transition-all ${
                isDarkMode
                  ? "bg-slate-800 text-white placeholder-slate-500 border-slate-700 focus:bg-slate-800"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 border-transparent focus:bg-white focus:border-gray-200"
              }`}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={(!inputText.trim() && !selectedFile) || uploading}
            className={`p-3 rounded-xl shadow-md transition-all flex items-center justify-center ${(!inputText.trim() && !selectedFile) || uploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#0f172a] text-white hover:bg-[#1e293b] hover:scale-105"}`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
