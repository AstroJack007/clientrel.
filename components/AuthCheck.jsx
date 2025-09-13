"use client";
import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthCheck = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to NextAuth's built-in sign-in page
      // Prefer signIn() to avoid hard-coding a /signin route that may not exist
      signIn();
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading session....</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return children;
  }

  // While redirecting unauthenticated users, render nothing
  return null;
};

export default AuthCheck;