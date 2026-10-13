"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App-wide toast host. Kept minimal — SkillProof uses toasts for copy/save
 * confirmations and non-blocking errors.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0e2c5c",
          border: "1px solid rgba(147,180,229,0.25)",
          color: "#ffffff",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
