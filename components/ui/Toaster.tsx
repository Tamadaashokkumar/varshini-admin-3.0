"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors // ⭐ IDI ADD CHEYANDI (Green/Red colors kosam)
      theme="dark" // ⭐ Theme dark set cheste better
      toastOptions={{
        style: {
          background: "rgba(24, 24, 27, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          // color: '#fff', // richColors vaadithe idi avasaram ledu
          backdropFilter: "blur(12px)",
        },
        className: "glass-effect",
      }}
      closeButton
    />
  );
}
