"use client";
import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#3d250c",
          fontSize: "14px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        },
        success: { iconTheme: { primary: "#c8831e", secondary: "#fff" } },
      }}
    />
  );
}
