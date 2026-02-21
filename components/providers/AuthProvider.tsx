// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { AdminAuthService } from "@/lib/api"; // మీ API ఫైల్ పాత్ సరిగ్గా ఉందో లేదో చూసుకోండి
// import { useRouter, usePathname } from "next/navigation";

// // Auth Context Type Definition
// interface AuthContextType {
//   user: any;
//   loading: boolean;
//   login: (userData: any) => void;
//   logout: () => Promise<void>; // Async function
// }

// // Create Context with default values
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   login: () => {},
//   logout: async () => {},
// });

// // Custom Hook to use Auth Context
// export const useAuth = () => useContext(AuthContext);

// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     let isMounted = true; // మెమరీ లీక్స్ రాకుండా ఉండటానికి

//     const initAuth = async () => {
//       try {
//         // లాగిన్ పేజీలో ఉంటే API కాల్ చేయాల్సిన పని లేదు, లోడింగ్ ఆపేసి రిటర్న్ అవ్వాలి
//         if (pathname === "/login") {
//           if (isMounted) setLoading(false);
//           return;
//         }

//         // 🔥 Get Profile Call
//         // ఇక్కడ 401 వస్తే, api.ts లోని Interceptor ఆటోమేటిక్ గా రిఫ్రెష్ చేసి మళ్ళీ డేటా తెస్తుంది.
//         const res = await AdminAuthService.getProfile();

//         if (isMounted) {
//           // API Response Structure బట్టి data.data లేదా data వాడండి
//           setUser(res.data.data || res.data);
//         }
//       } catch (error) {
//         console.log("Session expired or invalid");

//         if (isMounted) {
//           setUser(null);
//           // డాష్‌బోర్డ్ (Protected Route) లో ఉంటేనే లాగిన్ కి పంపు
//           if (pathname.startsWith("/dashboard")) {
//             router.replace("/login");
//           }
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     // User data లేనప్పుడు మాత్రమే చెక్ చేయి (Duplicate calls నివారణ)
//     if (!user) {
//       initAuth();
//     } else {
//       setLoading(false);
//     }

//     // Cleanup function
//     return () => {
//       isMounted = false;
//     };
//   }, []); // Empty dependency array -> Mount అయినప్పుడు ఒక్కసారే రన్ అవుతుంది

//   // Login Handler
//   const login = (userData: any) => {
//     setUser(userData);
//     router.push("/dashboard");
//   };

//   // Logout Handler
//   const logout = async () => {
//     try {
//       await AdminAuthService.logout();
//     } catch (e) {
//       console.error("Logout failed:", e);
//     }
//     setUser(null);
//     router.replace("/login");
//   };

//   // 🔥 MAIN RENDER
//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {loading ? (
//         // ✨ NEW ANIMATED LOADING SCREEN FOR VARSHINI HYUNDAI ✨
//         <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] dark:from-gray-900 dark:to-black transition-all duration-500">
//           <div className="relative flex flex-col items-center p-10">
//             {/* Background Glow Effect (Optional - appears behind text) */}
//             <div className="absolute -inset-10 blur-[80px] bg-blue-600/20 dark:bg-blue-500/30 rounded-full animate-pulse hidden md:block z-0"></div>

//             {/* Main Brand Text with Gradient and Bounce Animation */}
//             <h1 className="relative z-10 text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 dark:from-blue-400 dark:via-blue-100 dark:to-blue-400 animate-[bounce_3s_ease-in-out_infinite]">
//               VARSHINI HYUNDAI
//             </h1>

//             {/* Subtitle and Small Spinner below */}
//             <div className="mt-8 flex items-center gap-3 relative z-10">
//               <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent dark:border-blue-400"></div>
//               <p className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-[0.2em] animate-pulse">
//                 Starting Engine...
//               </p>
//             </div>
//           </div>
//         </div>
//       ) : (
//         // Main App Content
//         children
//       )}
//     </AuthContext.Provider>
//   );
// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AdminAuthService } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // లాగిన్ పేజీలో ఉంటే ప్రొఫైల్ API కాల్ అవసరం లేదు
        if (pathname === "/login") {
          if (isMounted) setLoading(false);
          return;
        }

        // 🔥 FIX: లోడింగ్ స్టార్ట్ చేసి బ్యాకెండ్ నుండి ప్రొఫైల్ తెచ్చుకుంటున్నాం
        if (isMounted) setLoading(true);
        const res = await AdminAuthService.getProfile();

        if (isMounted) {
          setUser(res.data?.data || res.data);
        }
      } catch (error: any) {
        // కచ్చితంగా 401 ఎర్రర్ వస్తేనే లాగౌట్ చెయ్యాలి
        if (error.response?.status === 401) {
          console.log("🔒 Session expired. Redirecting to login.");
          if (isMounted) {
            setUser(null);
            if (pathname !== "/login") {
              router.replace("/login");
            }
          }
        } else {
          console.warn("⚠️ API Error while fetching profile:", error.message);
        }
      } finally {
        // ఏది జరిగినా లోడింగ్ ఆపేయాలి
        if (isMounted) setLoading(false);
      }
    };

    // 🔥 FIX: isInitialized లాజిక్ తీసేశాం, దీనివల్లే స్టక్ అవుతుంది.
    // యూజర్ డేటా లేకపోతే కచ్చితంగా API కాల్ చేయాలి
    if (!user) {
      initAuth();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [pathname]); // పేజీ (URL) మారినప్పుడల్లా ఈ లాజిక్ రన్ అవుతుంది

  // Login Handler
  const login = (userData: any) => {
    setUser(userData);
    router.push("/dashboard");
  };

  // Logout Handler
  const logout = async () => {
    try {
      await AdminAuthService.logout();
    } catch (e) {
      console.error("Logout API failed:", e);
    } finally {
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? (
        // ✨ ANIMATED LOADING SCREEN ✨
        <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-[#050B14] transition-all duration-500">
          <div className="relative flex flex-col items-center p-10">
            {/* Background Glow Effect */}
            <div className="absolute -inset-10 blur-[80px] bg-blue-600/20 rounded-full animate-pulse hidden md:block z-0"></div>

            {/* Main Brand Text */}
            <h1 className="relative z-10 text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-100 to-blue-400 animate-[bounce_3s_ease-in-out_infinite]">
              VARSHINI HYUNDAI
            </h1>

            {/* Spinner */}
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              <p className="text-sm font-bold text-blue-300 uppercase tracking-[0.2em] animate-pulse">
                Checking Session...
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Main App Content
        children
      )}
    </AuthContext.Provider>
  );
}
