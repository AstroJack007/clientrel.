"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCubes } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "../../components/Header";
export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/campaigns/create");
    }
  }, [status, router]);
  if (status === "loading" || status === "authenticated") {
    return (
      <div>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          Loading...
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
      <Header/>
      <div className="flex items-center justify-between gap-4">
        <FontAwesomeIcon icon={faCubes} className="!h-10 !w-10" />
        <p className="text-3xl font-bold">Xeno</p>
      </div>

      <div className="text-4xl font-bold text-gray-900">
        Sign in to your account
      </div>
      <p className="text-gray-600"> The modern CRM for companies</p>
      <div>
        <button
          onClick={() => signIn("google")}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FontAwesomeIcon icon={faGoogle} />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
