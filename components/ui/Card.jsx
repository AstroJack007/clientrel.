"use client";
import React from "react";

export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={["px-6 pt-5 pb-3 border-b border-gray-100", className]
      .filter(Boolean)
      .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return (
    <div className={["px-6 py-5", className].filter(Boolean).join(" ")}>{children}</div>
  );
}

export function CardFooter({ className = "", children }) {
  return (
    <div className={["px-6 pt-3 pb-5 border-t border-gray-100", className]
      .filter(Boolean)
      .join(" ")}
    >
      {children}
    </div>
  );
}
