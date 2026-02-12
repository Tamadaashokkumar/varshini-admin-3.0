// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   User,
//   Lock,
//   Save,
//   Eye,
//   EyeOff,
//   Camera,
//   Bell,
//   Shield,
//   LogOut,
//   Mail,
//   Smartphone,
//   Loader2,
// } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { AdminAuthService } from "@/lib/api";
// import { toast } from "sonner";

// // --- Types ---
// type TabType = "profile" | "security" | "notifications";

// interface ProfileData {
//   name: string;
//   email: string;
//   phone: string;
//   bio: string;
//   avatar?: string;
//   role?: string;
// }

// interface NotificationSettings {
//   emailAlerts: boolean;
//   securityAlerts: boolean;
//   marketingEmails: boolean;
// }

// export default function SettingsPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<TabType>("profile");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPageLoading, setIsPageLoading] = useState(true);

//   // Profile State
//   const [profileData, setProfileData] = useState<ProfileData>({
//     name: "",
//     email: "",
//     phone: "",
//     bio: "",
//     role: "", // Added role to state
//   });

//   // Avatar State
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);

//   // Password State
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // Notifications State
//   const [notifications, setNotifications] = useState<NotificationSettings>({
//     emailAlerts: true,
//     securityAlerts: true,
//     marketingEmails: false,
//   });

//   // 1. Fetch Profile on Load
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await AdminAuthService.getProfile();

//         // ✅ FIX: Handling Nested API Response Structure
//         // Axios gives 'response.data'. Your API has 'data.data' inside that.
//         const rootData = response.data;

//         // Checking if data is nested as { data: { data: { user... } } }
//         const userProfile = rootData?.data?.data || rootData?.data || {};

//         setProfileData({
//           name: userProfile.name || "",
//           email: userProfile.email || "",
//           phone: userProfile.phone || "",
//           bio: userProfile.bio || "",
//           role: userProfile.role || "ADMIN",
//         });

//         // Update Avatar Preview
//         if (userProfile.avatar) {
//           setAvatarPreview(userProfile.avatar);
//         }

//         // Update Notifications State if exists
//         if (userProfile.notifications) {
//           setNotifications((prev) => ({
//             ...prev,
//             ...userProfile.notifications,
//           }));
//         }
//       } catch (error: any) {
//         console.error("Profile fetch error:", error);
//         toast.error("Failed to load profile data");
//       } finally {
//         setIsPageLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   // 2. Handle Image Selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Image size must be less than 5MB");
//         return;
//       }
//       setAvatarFile(file);

//       // Create local preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // 3. Handle Profile Update (Multipart/FormData)
//   // 3. Handle Profile Update (Updated Logic)
//   const handleProfileUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("name", profileData.name);
//       formData.append("phone", profileData.phone || "");
//       formData.append("bio", profileData.bio || "");

//       if (avatarFile) {
//         formData.append("avatar", avatarFile);
//       }

//       const response = await AdminAuthService.updateProfile(formData);

//       const responseRoot = response.data;
//       // Data Path: response.data.data.admin
//       const updatedAdmin = responseRoot?.data?.admin || responseRoot?.data;

//       if (updatedAdmin) {
//         // Update Form State
//         setProfileData((prev) => ({
//           ...prev,
//           name: updatedAdmin.name,
//           phone: updatedAdmin.phone,
//           bio: updatedAdmin.bio,
//           avatar: updatedAdmin.avatar,
//           role: updatedAdmin.role,
//         }));

//         // ✅ FIX 2: Force Update Preview
//         if (updatedAdmin.avatar) {
//           // బ్రౌజర్ క్యాచీని క్లియర్ చేయడానికి చివరన టైమ్ స్టాంప్ యాడ్ చేస్తున్నాం
//           setAvatarPreview(`${updatedAdmin.avatar}?t=${new Date().getTime()}`);
//         }

//         // Update Notifications if changed
//         if (updatedAdmin.notifications) {
//           setNotifications(updatedAdmin.notifications);
//         }
//       }

//       toast.success("Profile updated successfully!");
//       setAvatarFile(null);

//       // ✅ Optional: పేజీని రీఫ్రెష్ చేస్తే పర్ఫెక్ట్ గా కొత్త డేటా వస్తుంది (కావాలంటే అన్‌కామెంట్ చేయండి)
//       // router.refresh();
//     } catch (error: any) {
//       console.error("Profile update error:", error);
//       const errorMsg =
//         error.response?.data?.message || "Failed to update profile";
//       toast.error(errorMsg);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // 4. Handle Notification Update (JSON)
//   const handleSaveNotifications = async () => {
//     setIsLoading(true);
//     try {
//       await AdminAuthService.updateProfile({
//         notifications: notifications,
//       });
//       toast.success("Notification preferences saved!");
//     } catch (error: any) {
//       console.error("Notification update error:", error);
//       toast.error("Failed to save preferences");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 5. Handle Password Change
//   const handlePasswordChange = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast.error("New passwords do not match");
//       return;
//     }

//     if (passwordData.newPassword.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await AdminAuthService.changePassword({
//         currentPassword: passwordData.currentPassword,
//         newPassword: passwordData.newPassword,
//       });

//       toast.success("Password changed! Please login again.");
//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });

//       // Optional: Logout logic here
//     } catch (error: any) {
//       console.error("Password change error:", error);
//       toast.error(error.response?.data?.message || "Failed to change password");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 6. Logout All Devices
//   const handleLogoutAllDevices = async () => {
//     if (!confirm("Are you sure? You will be logged out of this device too."))
//       return;

//     try {
//       await AdminAuthService.logoutAllDevices();
//       toast.success("Logged out of all sessions");
//       localStorage.removeItem("token");
//       router.push("/login");
//     } catch (error: any) {
//       toast.error("Failed to logout other sessions");
//     }
//   };

//   if (isPageLoading) {
//     return (
//       <div className="flex h-96 items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto pb-20">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-white">Settings</h1>
//         <p className="mt-1 text-gray-400">
//           Manage your profile, security, and notification preferences
//         </p>
//       </motion.div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Sidebar Navigation */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.1 }}
//           className="lg:col-span-3 space-y-2"
//         >
//           <div className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm sticky top-6">
//             {[
//               { id: "profile", icon: User, label: "My Profile" },
//               { id: "security", icon: Shield, label: "Security" },
//               { id: "notifications", icon: Bell, label: "Notifications" },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as TabType)}
//                 className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
//                   activeTab === tab.id
//                     ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
//                     : "text-gray-400 hover:text-white hover:bg-white/5"
//                 }`}
//               >
//                 <tab.icon className="h-4 w-4" />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </motion.div>

//         {/* Main Content Area */}
//         <div className="lg:col-span-9">
//           <AnimatePresence mode="wait">
//             {/* --- PROFILE TAB --- */}
//             {activeTab === "profile" && (
//               <motion.div
//                 key="profile"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="space-y-6"
//               >
//                 {/* Profile Header & Avatar Upload */}
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm relative overflow-hidden">
//                   <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
//                   <div className="relative pt-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
//                     <div className="relative group">
//                       <div className="h-24 w-24 rounded-full border-4 border-[#0f1115] bg-gray-800 overflow-hidden relative">
//                         {avatarPreview ? (
//                           <img
//                             src={avatarPreview}
//                             alt="Profile"
//                             className="h-full w-full object-cover"
//                           />
//                         ) : (
//                           <div className="h-full w-full flex items-center justify-center bg-blue-500/20 text-blue-400 text-3xl font-bold">
//                             {profileData.name?.charAt(0)?.toUpperCase() || "A"}
//                           </div>
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors z-10"
//                       >
//                         <Camera className="h-4 w-4" />
//                       </button>
//                       <input
//                         type="file"
//                         ref={fileInputRef}
//                         className="hidden"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                       />
//                     </div>
//                     <div className="text-center sm:text-left flex-1 pb-2">
//                       <h2 className="text-2xl font-bold text-white">
//                         {profileData.name || "Loading..."}
//                       </h2>
//                       <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-gray-400 text-sm">
//                         <span className="flex items-center gap-1">
//                           <Shield className="h-3 w-3 text-blue-400" />
//                           {(profileData.role || "ADMIN").toUpperCase()}
//                         </span>
//                         <span>•</span>
//                         <span>{profileData.email}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Profile Form */}
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
//                   <h3 className="mb-6 text-xl font-semibold text-white">
//                     Profile Details
//                   </h3>
//                   <form onSubmit={handleProfileUpdate} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-300">
//                           Full Name
//                         </label>
//                         <div className="relative">
//                           <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
//                           <input
//                             type="text"
//                             required
//                             value={profileData.name}
//                             onChange={(e) =>
//                               setProfileData({
//                                 ...profileData,
//                                 name: e.target.value,
//                               })
//                             }
//                             className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-300">
//                           Email Address
//                         </label>
//                         <div className="relative">
//                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
//                           <input
//                             type="email"
//                             required
//                             disabled
//                             value={profileData.email}
//                             className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-gray-400 cursor-not-allowed placeholder-gray-500"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-300">
//                           Phone Number
//                         </label>
//                         <div className="relative">
//                           <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
//                           <input
//                             type="tel"
//                             value={profileData.phone}
//                             onChange={(e) =>
//                               setProfileData({
//                                 ...profileData,
//                                 phone: e.target.value,
//                               })
//                             }
//                             className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-gray-300">
//                         Bio
//                       </label>
//                       <textarea
//                         rows={3}
//                         value={profileData.bio}
//                         onChange={(e) =>
//                           setProfileData({
//                             ...profileData,
//                             bio: e.target.value,
//                           })
//                         }
//                         className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                         placeholder="Tell us a little about yourself..."
//                       />
//                     </div>

//                     <div className="flex justify-end pt-4">
//                       <Button
//                         type="submit"
//                         variant="primary"
//                         size="lg"
//                         isLoading={isLoading}
//                       >
//                         <Save className="h-4 w-4" />
//                         Save Changes
//                       </Button>
//                     </div>
//                   </form>
//                 </div>
//               </motion.div>
//             )}

//             {/* --- SECURITY TAB --- */}
//             {activeTab === "security" && (
//               <motion.div
//                 key="security"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="space-y-6"
//               >
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
//                   <h2 className="mb-6 text-xl font-semibold text-white">
//                     Change Password
//                   </h2>
//                   <form onSubmit={handlePasswordChange} className="space-y-6">
//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-gray-300">
//                         Current Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showCurrentPassword ? "text" : "password"}
//                           required
//                           value={passwordData.currentPassword}
//                           onChange={(e) =>
//                             setPasswordData({
//                               ...passwordData,
//                               currentPassword: e.target.value,
//                             })
//                           }
//                           className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                         />
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setShowCurrentPassword(!showCurrentPassword)
//                           }
//                           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                         >
//                           {showCurrentPassword ? (
//                             <EyeOff className="h-5 w-5" />
//                           ) : (
//                             <Eye className="h-5 w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-300">
//                           New Password
//                         </label>
//                         <div className="relative">
//                           <input
//                             type={showNewPassword ? "text" : "password"}
//                             required
//                             minLength={6}
//                             value={passwordData.newPassword}
//                             onChange={(e) =>
//                               setPasswordData({
//                                 ...passwordData,
//                                 newPassword: e.target.value,
//                               })
//                             }
//                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowNewPassword(!showNewPassword)}
//                             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                           >
//                             {showNewPassword ? (
//                               <EyeOff className="h-5 w-5" />
//                             ) : (
//                               <Eye className="h-5 w-5" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-300">
//                           Confirm Password
//                         </label>
//                         <div className="relative">
//                           <input
//                             type={showConfirmPassword ? "text" : "password"}
//                             required
//                             minLength={6}
//                             value={passwordData.confirmPassword}
//                             onChange={(e) =>
//                               setPasswordData({
//                                 ...passwordData,
//                                 confirmPassword: e.target.value,
//                               })
//                             }
//                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                           />
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setShowConfirmPassword(!showConfirmPassword)
//                             }
//                             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                           >
//                             {showConfirmPassword ? (
//                               <EyeOff className="h-5 w-5" />
//                             ) : (
//                               <Eye className="h-5 w-5" />
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex justify-end">
//                       <Button
//                         type="submit"
//                         variant="primary"
//                         size="lg"
//                         isLoading={isLoading}
//                       >
//                         <Lock className="h-4 w-4" />
//                         Change Password
//                       </Button>
//                     </div>
//                   </form>
//                 </div>

//                 <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-sm">
//                   <h3 className="text-lg font-semibold text-white mb-4">
//                     Device Sessions
//                   </h3>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-300 font-medium">
//                         Log out of all devices
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         This will terminate sessions on all other devices.
//                       </p>
//                     </div>
//                     <Button
//                       onClick={handleLogoutAllDevices}
//                       variant="outline"
//                       className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
//                     >
//                       <LogOut className="h-4 w-4 mr-2" />
//                       Log Out All
//                     </Button>
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             {/* --- NOTIFICATIONS TAB --- */}
//             {activeTab === "notifications" && (
//               <motion.div
//                 key="notifications"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm"
//               >
//                 <h2 className="mb-6 text-xl font-semibold text-white">
//                   Notification Preferences
//                 </h2>
//                 <div className="space-y-6">
//                   {Object.entries(notifications).map(([key, value]) => (
//                     <div
//                       key={key}
//                       className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
//                     >
//                       <div>
//                         <p className="font-medium text-white capitalize">
//                           {key.replace(/([A-Z])/g, " $1").trim()}
//                         </p>
//                         <p className="text-sm text-gray-400 mt-1">
//                           Receive notifications for{" "}
//                           {key.replace(/([A-Z])/g, " $1").toLowerCase()}.
//                         </p>
//                       </div>
//                       <button
//                         onClick={() =>
//                           setNotifications((prev) => ({
//                             ...prev,
//                             [key]: !value,
//                           }))
//                         }
//                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                           value ? "bg-blue-500" : "bg-gray-700"
//                         }`}
//                       >
//                         <span
//                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                             value ? "translate-x-6" : "translate-x-1"
//                           }`}
//                         />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-8 flex justify-end">
//                   <Button
//                     onClick={handleSaveNotifications}
//                     variant="primary"
//                     isLoading={isLoading}
//                   >
//                     <Save className="h-4 w-4" />
//                     Save Preferences
//                   </Button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  Camera,
  Bell,
  Shield,
  LogOut,
  Mail,
  Smartphone,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { AdminAuthService } from "@/lib/api";
import { toast } from "sonner";

// --- Types ---
type TabType = "profile" | "security" | "notifications";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar?: string;
  role?: string;
}

interface NotificationSettings {
  emailAlerts: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Profile State
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    role: "",
  });

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  // 1. Fetch Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await AdminAuthService.getProfile();
        const rootData = response.data;
        const userProfile = rootData?.data?.data || rootData?.data || {};

        setProfileData({
          name: userProfile.name || "",
          email: userProfile.email || "",
          phone: userProfile.phone || "",
          bio: userProfile.bio || "",
          role: userProfile.role || "ADMIN",
        });

        if (userProfile.avatar) {
          setAvatarPreview(userProfile.avatar);
        }

        if (userProfile.notifications) {
          setNotifications((prev) => ({
            ...prev,
            ...userProfile.notifications,
          }));
        }
      } catch (error: any) {
        console.error("Profile fetch error:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("phone", profileData.phone || "");
      formData.append("bio", profileData.bio || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await AdminAuthService.updateProfile(formData);
      const responseRoot = response.data;
      const updatedAdmin = responseRoot?.data?.admin || responseRoot?.data;

      if (updatedAdmin) {
        setProfileData((prev) => ({
          ...prev,
          name: updatedAdmin.name,
          phone: updatedAdmin.phone,
          bio: updatedAdmin.bio,
          avatar: updatedAdmin.avatar,
          role: updatedAdmin.role,
        }));

        if (updatedAdmin.avatar) {
          setAvatarPreview(`${updatedAdmin.avatar}?t=${new Date().getTime()}`);
        }

        if (updatedAdmin.notifications) {
          setNotifications(updatedAdmin.notifications);
        }
      }

      toast.success("Profile updated successfully!");
      setAvatarFile(null);
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Notification Update
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await AdminAuthService.updateProfile({
        notifications: notifications,
      });
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      console.error("Notification update error:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await AdminAuthService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed! Please login again.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Logout All Devices
  const handleLogoutAllDevices = async () => {
    if (!confirm("Are you sure? You will be logged out of this device too."))
      return;

    try {
      await AdminAuthService.logoutAllDevices();
      toast.success("Logged out of all sessions");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error: any) {
      toast.error("Failed to logout other sessions");
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // --- STYLES CONFIGURATION ---
  // Backgrounds: White in Light Mode, Semi-transparent Dark in Dark Mode
  const cardStyles =
    "rounded-2xl border p-6 sm:p-8 backdrop-blur-sm transition-colors duration-300 border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]";

  // Inputs: Clean White in Light Mode, Dark in Dark Mode
  const inputStyles =
    "w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-zinc-500 dark:focus:bg-white/10";

  // Labels: Dark Grey in Light Mode, Light Grey in Dark Mode
  const labelStyles =
    "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Manage your profile, security, and notification preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {/* Sidebar Card */}
          <div className="sticky top-6 space-y-1 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
            {[
              { id: "profile", icon: User, label: "My Profile" },
              { id: "security", icon: Shield, label: "Security" },
              { id: "notifications", icon: Bell, label: "Notifications" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <tab.icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {/* --- PROFILE TAB --- */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:backdrop-blur-sm">
                  {/* Decorative Gradient - Same in both modes as it has overlay text */}
                  <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

                  <div className="relative px-8 pb-8 pt-16">
                    <div className="flex flex-col items-end gap-6 sm:flex-row">
                      {/* Avatar Group */}
                      <div className="relative group">
                        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-xl dark:border-[#0f1115] dark:bg-zinc-800">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-500/20 text-4xl font-bold text-blue-500 dark:text-blue-400">
                              {profileData.name?.charAt(0)?.toUpperCase() ||
                                "A"}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 z-10 rounded-full bg-blue-600 p-2 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>

                      {/* Text Info */}
                      <div className="flex-1 text-center sm:mb-2 sm:text-left">
                        {/* Fixed Text Colors for Light Mode */}
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {profileData.name || "Loading..."}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 sm:justify-start">
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            <Shield className="h-3 w-3" />
                            {(profileData.role || "ADMIN").toUpperCase()}
                          </span>
                          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">
                            •
                          </span>
                          <span>{profileData.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Form Card */}
                <div className={cardStyles}>
                  <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-white">
                    Profile Details
                  </h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className={labelStyles}>Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                          <input
                            type="text"
                            required
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                            className={`${inputStyles} pl-11`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelStyles}>Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                          <input
                            type="email"
                            required
                            disabled
                            value={profileData.email}
                            className={`${inputStyles} pl-11 bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400`}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelStyles}>Phone Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className={`${inputStyles} pl-11`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelStyles}>Bio</label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className={inputStyles}
                        placeholder="Tell us a little about yourself..."
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className={cardStyles}>
                  <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-white">
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className={labelStyles}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className={`${inputStyles} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className={labelStyles}>New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className={`${inputStyles} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelStyles}>Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className={`${inputStyles} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-500/20 dark:bg-red-500/5 dark:backdrop-blur-sm">
                  <h3 className="mb-4 text-lg font-semibold text-red-700 dark:text-white">
                    Device Sessions
                  </h3>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-red-600 dark:text-gray-300">
                        Log out of all devices
                      </p>
                      <p className="mt-1 text-sm text-red-500/80 dark:text-gray-500">
                        This will terminate sessions on all other devices
                        immediately.
                      </p>
                    </div>
                    <Button
                      onClick={handleLogoutAllDevices}
                      variant="outline"
                      className="border-red-300 bg-white text-red-600 hover:bg-red-50 dark:bg-transparent dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out All
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cardStyles}
              >
                <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-white">
                  Notification Preferences
                </h2>
                <div className="space-y-2 divide-y divide-zinc-100 dark:divide-white/5">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium capitalize text-zinc-900 dark:text-white">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">
                          Receive notifications for{" "}
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [key]: !value,
                          }))
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          value ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSaveNotifications}
                    variant="primary"
                    isLoading={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
