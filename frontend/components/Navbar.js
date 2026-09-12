"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-slate-900"
        >
          InterviewKit
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Dashboard
          </Link>

          <Link
            href="/kits/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Kit
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}