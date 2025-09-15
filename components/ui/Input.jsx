"use client";
import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
