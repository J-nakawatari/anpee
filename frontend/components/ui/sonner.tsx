"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "white",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
