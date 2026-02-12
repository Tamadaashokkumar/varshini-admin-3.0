"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Search, ArrowLeft, Sun, Moon, LogOut } from "lucide-react";
import ChatComponent from "./ChatComponent";

export default function AdminChatComponent({
  adminId,
  token,
  apiUrl = "http://localhost:5000",
}) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- THEME LOAD ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("chat_theme");
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("chat_theme", newTheme ? "dark" : "light");
  };

  // --- SOCKET & DATA LOGIC ---
  useEffect(() => {
    if (!token) return;
    // URL FIX: /api ని తీసేయడం
    const socketUrl = apiUrl.replace("/api", "");
    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Admin Socket Connected");
      newSocket.emit("join_room", { roomId: "admins" });
      fetchUserList();
    });

    newSocket.on("new_message", (data) => {
      if (data.message.senderId !== adminId) {
        updateUserListOnMessage(data.message);
      }
    });

    return () => newSocket.disconnect();
  }, [token, adminId]);

  const fetchUserList = async () => {
    try {
      // 🔥 URL FIX: '/auth' తీసేశాను. మీ బ్యాకెండ్ రూట్ ని బట్టి ఇది ఉంటుంది.
      const res = await axios.get(`${apiUrl}/api/admin/auth/chat-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setFilteredUsers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserListOnMessage = (msg) => {
    setUsers((prev) => {
      const senderId = msg.senderId._id || msg.senderId;
      const index = prev.findIndex((u) => u._id === senderId);
      let updatedList = [...prev];

      if (index > -1) {
        const user = updatedList[index];
        updatedList.splice(index, 1);
        updatedList.unshift({
          ...user,
          lastMessage: msg.text,
          lastMessageTime: new Date(),
          unreadCount:
            user._id !== selectedUser?._id ? (user.unreadCount || 0) + 1 : 0,
        });
      } else {
        fetchUserList();
      }
      return updatedList;
    });
  };

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Reset unread locally
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u)),
    );
  };

  // ==============================
  // UI RENDER (Fixed Side-by-Side Layout)
  // ==============================
  return (
    <div
      className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}
    >
      {/* LEFT SIDEBAR (Users List)
        - Desktop: Fixed width (350px) and visible
        - Mobile: Full width if no user selected, Hidden if user selected
      */}
      <div
        className={`
          flex-col h-full border-r shrink-0 transition-all duration-300
          ${selectedUser ? "hidden md:flex" : "flex w-full"} 
          md:w-[350px] lg:w-[380px]
          ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white"}
        `}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-gray-100 bg-white"}`}
        >
          <h1 className="text-xl font-bold">Support</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className={`p-3 border-b ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}
        >
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-slate-800 text-white focus:ring-blue-500/50"
                  : "bg-gray-100 border border-transparent focus:bg-white focus:border-gray-200"
              }`}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center p-4 text-sm opacity-50">
              Loading conversations...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-4 text-sm opacity-50">
              No conversations found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedUser?._id === user._id
                    ? isDarkMode
                      ? "bg-slate-800 border-blue-500"
                      : "bg-blue-50 border-blue-500"
                    : `border-transparent ${isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-gray-50"}`
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isDarkMode
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      className="w-full h-full rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-semibold text-sm truncate ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                    >
                      {user.name}
                    </h3>
                    <span className="text-[10px] opacity-60">
                      {user.lastMessageTime
                        ? new Date(user.lastMessageTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs opacity-70 truncate w-[80%]">
                      {user.lastMessage || "New conversation"}
                    </p>
                    {user.unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CHAT WINDOW
        - Desktop: Always visible
        - Mobile: Visible ONLY if user selected
      */}
      <div
        className={`
          flex-1 flex-col h-full relative
          ${selectedUser ? "flex" : "hidden md:flex"}
          ${isDarkMode ? "bg-slate-950" : "bg-gray-100"}
        `}
      >
        {selectedUser ? (
          <div className="h-full flex flex-col w-full relative">
            {/* Mobile Back Button (Floating) */}
            <button
              onClick={() => setSelectedUser(null)}
              className={`md:hidden absolute top-4 left-4 z-50 p-2 rounded-full shadow-md ${
                isDarkMode
                  ? "bg-slate-800 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Main Chat Component - Passing Theme Props */}
            <ChatComponent
              key={selectedUser._id}
              currentUserId={adminId}
              otherUserId={selectedUser._id}
              otherUserModel="User"
              otherUserName={selectedUser.name}
              token={token}
              apiUrl={apiUrl}
              isDarkMode={isDarkMode} // 🔥 Passing Theme
            />
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-4 text-center opacity-60">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-slate-900" : "bg-white shadow-sm"}`}
            >
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-xl font-bold">Welcome to Support</h2>
            <p className="text-sm mt-2 max-w-xs">
              Select a conversation from the left sidebar to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
