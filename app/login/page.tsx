// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Lock, Mail, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { AdminAuthService } from "@/lib/api";
// import { toast } from "sonner";
// import Image from "next/image";

// export default function LoginPage() {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // ✅ API Call
//       await AdminAuthService.login(formData);

//       // ✅ Success Message
//       toast.success("Access Granted. Welcome Administrator.");

//       // 🔥 FIX: router.push తీసేసి window.location.href వాడండి.
//       // ఇది బ్రౌజర్ ని రీఫ్రెష్ చేసి కుకీలను సర్వర్ కి పంపుతుంది (Middleware Check కోసం)
//       window.location.href = "/dashboard";
//     } catch (error: any) {
//       console.error("Login error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           "Authentication failed. Verify credentials.",
//       );
//       setIsLoading(false); // Error వస్తేనే లోడింగ్ ఆపాలి (Success అయితే రీడైరెక్ట్ అవుతుంది)
//     }
//   };

//   return (
//     <div
//       // ✨ UPDATE: జస్టిఫై కంటెంట్ మరియు ప్యాడింగ్ కొద్దిగా సర్దుబాటు చేశాను
//       className="relative flex min-h-screen w-full items-center justify-center p-4 lg:justify-end lg:p-8 bg-cover bg-center bg-no-repeat font-sans selection:bg-blue-500/30"
//       style={{
//         // 🖼️ ఇక్కడ మీ బ్యాక్‌గ్రౌండ్ ఇమేజ్ URL ఇచ్చుకోండి
//         backgroundImage: 'url("/login-Page.png")',
//       }}
//     >
//       {/* 🌌 ✨ UPDATE: Dark Overlay - మరింత ప్రీమియం లుక్ కోసం గ్రేడియంట్ మరియు ఎక్కువ బ్లర్ వాడాను */}
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-gray-900/70 to-black/60 "></div>

//       {/* Login Container - Mobile లో Center, Desktop లో Right Side */}
//       <motion.div
//         initial={{ opacity: 0, x: 50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//         // ✨ UPDATE: మార్జిన్ మరియు మాక్స్-విడ్త్ కొద్దిగా పెంచాను, తద్వారా కార్డ్ మరీ ఇరుకుగా ఉండదు
//         className="relative z-10 w-full max-w-[480px] lg:mr-8 xl:mr-24"
//       >
//         {/* ✨ UPDATE: Glass Card - మరింత పారదర్శకంగా, షార్ప్ బోర్డర్ మరియు డీప్ షాడోతో అప్‌డేట్ చేశాను */}
//         <div className="group relative overflow-hidden rounded-3xl border border-white/[0.15] bg-transparent p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl ring-1 ring-white/5 transition-all duration-500 hover:border-white/30 hover:shadow-blue-500/20">
//           {/* Subtle Top Gradient Line */}
//           <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-70"></div>

//           {/* Header */}
//           <div className="mb-10 text-center">
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{
//                 type: "spring",
//                 stiffness: 200,
//                 damping: 15,
//                 delay: 0.1,
//               }}
//               // లోగో బాగా కనిపించడానికి బ్యాక్‌గ్రౌండ్ రంగును వైట్/ట్రాన్స్పరెంట్ గా మార్చాను
//               className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-2 shadow-lg shadow-black/20 ring-1 ring-white/10"
//             >
//               {/* 🖼️ ఇక్కడే మీ లోగో వస్తుంది */}
//               <Image
//                 src="/hyundai-logo.png" // 👈 public ఫోల్డర్ లో ఉన్న మీ లోగో పేరు ఇక్కడ ఇవ్వాలి
//                 alt="Hyundai Logo"
//                 width={70}
//                 height={70}
//                 className="object-contain drop-shadow-md"
//                 priority // లోగో ఫాస్ట్ గా లోడ్ అవ్వడానికి
//               />
//             </motion.div>
//             <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
//               Admin Portal
//             </h1>
//             <p className="mt-3 text-sm font-medium text-gray-300">
//               Secure access for Hyundai Spares Management
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div className="space-y-2">
//               <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
//                 Email / ID
//               </label>
//               <div className="relative group">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-blue-400">
//                   <Mail className="h-5 w-5" />
//                 </div>
//                 <input
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   // ✨ UPDATE: ఇన్పుట్ బ్యాక్‌గ్రౌండ్ కొద్దిగా డార్క్ చేశాను కాంట్రాస్ట్ కోసం
//                   className="block w-full rounded-xl border border-white/10 bg-black/50 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:bg-black/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                   placeholder="admin@hyundai.com"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="space-y-2">
//               <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1">
//                 Password
//               </label>
//               <div className="relative group">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-blue-400">
//                   <Lock className="h-5 w-5" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   required
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   // ✨ UPDATE: ఇన్పుట్ బ్యాక్‌గ్రౌండ్ కొద్దిగా డార్క్ చేశాను కాంట్రాస్ట్ కోసం
//                   className="block w-full rounded-xl border border-white/10 bg-black/50 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:bg-black/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                   placeholder="••••••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Action Button */}
//             <div className="pt-2">
//               <Button
//                 type="submit"
//                 variant="primary"
//                 size="lg"
//                 // ✨ UPDATE: బటన్ షాడో మరియు గ్రేడియంట్ కొద్దిగా మెరుగుపరిచాను
//                 className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] border border-blue-500/20"
//                 isLoading={isLoading}
//               >
//                 <span className="relative flex items-center justify-center gap-2">
//                   {!isLoading && (
//                     <Zap className="h-4 w-4" fill="currentColor" />
//                   )}
//                   Sign In to Dashboard
//                 </span>
//               </Button>
//             </div>
//           </form>

//           {/* Footer Info */}
//           <div className="mt-8 border-t border-white/10 pt-6 text-center">
//             <p className="text-xs text-gray-400">
//               Varshini Hyundai Spares &copy; 2025.
//               <span className="block mt-1 text-gray-500 font-medium">
//                 Restricted Access System
//               </span>
//             </p>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { AdminAuthService } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ API Call
      await AdminAuthService.login(formData);

      // ✅ Success Message
      toast.success("Access Granted. Welcome Administrator.");

      // 🔥 FIX: router.push తీసేసి window.location.href వాడండి.
      // ఇది బ్రౌజర్ ని రీఫ్రెష్ చేసి కుకీలను సర్వర్ కి పంపుతుంది (Middleware Check కోసం)
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Authentication failed. Verify credentials.",
      );
      setIsLoading(false); // Error వస్తేనే లోడింగ్ ఆపాలి (Success అయితే రీడైరెక్ట్ అవుతుంది)
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 lg:justify-end lg:p-8 bg-cover bg-center bg-no-repeat font-sans selection:bg-blue-500/30"
      style={{
        // 🖼️ మీ బ్యాక్‌గ్రౌండ్ ఇమేజ్ URL
        backgroundImage: 'url("/login-Page.png")',
      }}
    >
      {/* 🌌 UPDATE: Dark Overlay - బ్లర్ పూర్తిగా తీసేసాను. కేవలం ఇమేజ్ మీద డార్క్ షేడ్ మాత్రమే ఉంటుంది, కాబట్టి ఇమేజ్ 100% క్లారిటీగా కనిపిస్తుంది. */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80"></div>

      {/* Login Container */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px] lg:mr-8 xl:mr-24"
      >
        {/* ✨ UPDATE: Perfect Glass Card - bg-white/5 మరియు backdrop-blur-md వాడాను. ఇది అచ్చం పారదర్శకమైన అద్దంలా కనిపిస్తుంది. */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md ring-1 ring-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-blue-500/20">
          {/* Subtle Top Gradient Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-70"></div>

          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-sm"
            >
              {/* 🖼️ లోగో */}
              <Image
                src="/hyundai-logo.png"
                alt="Hyundai Logo"
                width={70}
                height={70}
                className="object-contain drop-shadow-md"
                priority
              />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
              Admin Portal
            </h1>
            <p className="mt-3 text-sm font-medium text-gray-300 drop-shadow-sm">
              Secure access for Hyundai Spares Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1 drop-shadow-sm">
                Email / ID
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-blue-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  // ✨ UPDATE: ఇన్‌పుట్ బాక్స్‌లను కూడా గ్లాస్ లాగా (bg-black/20) మార్చాను
                  className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-400 transition-all duration-300 focus:border-blue-500/50 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                  placeholder="admin@hyundai.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 ml-1 drop-shadow-sm">
                Password
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-blue-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  // ✨ UPDATE: ఇన్‌పుట్ బాక్స్‌లను కూడా గ్లాస్ లాగా (bg-black/20) మార్చాను
                  className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-400 transition-all duration-300 focus:border-blue-500/50 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] border border-blue-500/20"
                isLoading={isLoading}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {!isLoading && (
                    <Zap className="h-4 w-4" fill="currentColor" />
                  )}
                  Sign In to Dashboard
                </span>
              </Button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-300 drop-shadow-sm">
              Varshini Hyundai Spares &copy; 2025.
              <span className="block mt-1 text-gray-400 font-medium">
                Restricted Access System
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
