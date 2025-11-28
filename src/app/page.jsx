"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCubes } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center gap-4 text-center">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faCubes} className="!h-8 !w-8 text-blue-600" />
        <p className="text-3xl font-bold">Clientrel</p>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold">Sign in to your account</h1>
      <p className="text-gray-600">The modern CRM for companies</p>
      <div className="w-full max-w-sm">
        <Button onClick={() => signIn("google")} variant="outline" className="w-full gap-3">
          <FontAwesomeIcon icon={faGoogle} />
          <span>Sign in with Google</span>
        </Button>
      </div>
    </div>
  );
}
