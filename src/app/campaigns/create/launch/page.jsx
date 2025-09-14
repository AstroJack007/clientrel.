"use client";

import { useMemo, useState } from "react";
import AuthCheck from "../../../../../components/AuthCheck";
import { useRouter, useSearchParams } from "next/navigation";

export default function LaunchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const audienceSize = useMemo(() => {
    
    const val = searchParams.get("audienceSize");
   return val;
  }, [searchParams]);
  
  const rules = useMemo(() => {
    const raw = searchParams.get("rules");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [searchParams]);

  const onCancel = () => router.back();

  const onConfirm = async () => {
    if (!rules || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns/Createcampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, message, audience:audienceSize }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to launch campaign");
      }
     
      router.replace("/campaigns/history");
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCheck>
      <div className="flex min-h-screen items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold">Launch a New Campaign</h2>
          <p className="text-gray-600 mt-1">
            Audience: <span className="font-semibold">{audienceSize}</span> customers
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your campaign message here..."
            className="w-full mt-4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />

          <div className="mt-5 flex justify-between gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={!message.trim() || !rules || submitting}
              className={`flex-1 py-2 rounded-xl text-white font-semibold transition ${
                message.trim() && rules && !submitting
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              {submitting ? "Launching..." : "Confirm & Launch"}
            </button>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
