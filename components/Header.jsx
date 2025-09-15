"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCubes,
  faBars,
  faXmark,
  faRightFromBracket,
  faRightToBracket,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Home" },
    { href: "/campaigns/create", label: "Create" },
    { href: "/campaigns/history", label: "History" },
  ];

  const isActive = (href) => (pathname === href ? "text-blue-600" : "text-gray-700 hover:text-gray-900");

  return (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCubes} className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold tracking-tight">Xeno</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium px-1 py-1 rounded-md ${isActive(item.href)}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {status === "authenticated" ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FontAwesomeIcon icon={faCircleUser} className="h-5 w-5 text-gray-500" />
                  <span className="max-w-[180px] truncate">{session?.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faRightToBracket} />
                Sign in
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon icon={open ? faXmark : faBars} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <nav className="flex flex-col gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-2 py-2 text-sm font-medium ${isActive(item.href)}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-gray-200 pt-3">
              {status === "authenticated" ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    signIn("google");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
