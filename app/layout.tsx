// import type { Metadata } from "next";
// import "./globals.css";
// import { Toaster } from "@/components/ui/Toaster";
// import { ThemeProvider } from "@/components/providers/ThemeProvider";
// import AuthProvider from "@/components/providers/AuthProvider";

// export const metadata: Metadata = {
//   title: "Varshini Hyundai Spares - Admin Dashboard",
//   description: "Modern admin dashboard for Hyundai spare parts e-commerce",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className="dark" suppressHydrationWarning>
//       <body
//         className="antialiased min-h-screen transition-colors duration-300
//         text-zinc-900 dark:text-zinc-50
//         bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:to-zinc-950"
//       >
//         <AuthProvider>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             {children}
//             <Toaster />
//           </ThemeProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
// 1. Next.js నుండి ఫాంట్స్ ఇంపోర్ట్ చేస్తున్నాం
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";

// 2. Sora ఫాంట్ సెట్టింగ్స్ (Main Text కోసం)
const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora", // Tailwind కోసం వేరియబుల్
});

// 3. JetBrains Mono ఫాంట్ సెట్టింగ్స్ (Code/Numbers కోసం)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Varshini Hyundai Spares - Admin Dashboard",
  description: "Modern admin dashboard for Hyundai spare parts e-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        // 4. ఇక్కడ sora.className యాడ్ చేశాం. ఇప్పుడు మొత్తం వెబ్‌సైట్ Sora ఫాంట్ వాడుతుంది.
        className={`${sora.className} ${jetbrainsMono.variable} antialiased min-h-screen transition-colors duration-300
        text-zinc-900 dark:text-zinc-50 
        bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:to-zinc-950`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
