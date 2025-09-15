"use client";

import { useMemo, useState, useRef } from "react";
import AuthCheck from "../../../../../components/AuthCheck";
import Card, { CardBody } from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Spinner from "../../../../../components/ui/Spinner";
import { useRouter, useSearchParams } from "next/navigation";

export default function LaunchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  const audienceSize = useMemo(() => {
    return searchParams.get("audienceSize");
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

  const logic = useMemo(() => {
    return searchParams.get("logic") || 'AND';
  }, [searchParams]);

  const connectors = useMemo(() => {
    const raw = searchParams.get("connectors");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [searchParams]);

  const onCancel = () => router.back();

  const onConfirm = async () => {
    if (submissionLock.current) return;
    submissionLock.current = true;

    if (!rules || !message.trim()) {
        submissionLock.current = false;
        return;
    };
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns/Createcampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, message, logic, connectors }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to launch campaign");
      }
      router.replace("/campaigns/history");
    } catch (err) {
      alert(err.message || String(err));
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <AuthCheck>
      <div className="flex min-h-screen items-center justify-center bg-black/30 p-4">
        <Card className="w-full max-w-md">
          <CardBody>
            <div className="text-center">
              <h2 className="text-xl font-bold">Launch a New Campaign</h2>
              <p className="text-gray-600 mt-1">
                Audience: <span className="font-semibold">{audienceSize}</span> customers
              </p>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your campaign message here..."
              className="w-full mt-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="mt-5 flex justify-between gap-3">
              <Button onClick={onCancel} variant="outline" className="flex-1" disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={!message.trim() || !rules || submitting} className="flex-1">
                {submitting ? (
                  <span className="inline-flex items-center gap-2"><Spinner size={16} /> Launching...</span>
                ) : (
                  "Confirm & Launch"
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AuthCheck>
  );
}