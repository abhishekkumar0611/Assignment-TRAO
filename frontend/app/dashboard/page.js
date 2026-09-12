"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import KitCard from "@/components/KitCard";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadKits() {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/kits");

      setKits(data.kits || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKits();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Your interview kits
            </h1>

            <p className="mt-2 text-slate-500">
              Build targeted preparation for every role.
            </p>
          </div>

          <Link
            href="/kits/new"
            className="rounded-lg bg-indigo-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Create New Kit
          </Link>
        </div>

        <div className="mt-8">
          {loading && <Loading message="Loading your kits..." />}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={loadKits}
            />
          )}

          {!loading && !error && kits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="text-xl font-semibold">
                No kits yet
              </h2>

              <p className="mt-2 text-slate-500">
                Create your first interview preparation kit.
              </p>

              <Link
                href="/kits/new"
                className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
              >
                Create First Kit
              </Link>
            </div>
          )}

          {!loading && !error && kits.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {kits.map((kit) => (
                <KitCard key={kit._id} kit={kit} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}