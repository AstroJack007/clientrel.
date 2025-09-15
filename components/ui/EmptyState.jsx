"use client";
import React from "react";
import Button from "./Button";

export default function EmptyState({
  icon = null,
  title = "Nothing here yet",
  description = "",
  action,
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      {icon && <div className="mx-auto mb-3 h-10 w-10 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
