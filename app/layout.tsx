import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
//import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen transition-colors duration-300
        text-zinc-900 dark:text-zinc-50 
        bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:to-zinc-950"
      >
        {/* ⭐ Wrap with ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
