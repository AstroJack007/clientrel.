"use client";
import React from "react";

export default function Button({
  as: Component = "button",
  className = "",
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  };
  const sizes = {
    sm: "text-sm px-2.5 py-1.5",
    md: "text-sm px-3.5 py-2",
    lg: "text-base px-4 py-2.5",
  };

  return (
    <Component
      className={[base, variants[variant] || variants.primary, sizes[size] || sizes.md, className]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
