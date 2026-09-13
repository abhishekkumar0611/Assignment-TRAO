"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { apiFetch } from "@/lib/api";

export default function KitPage() {
  const params = useParams();
  const id = params.id;

  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadKit() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(`/api/kits/${id}`);

      setKit(data.kit || data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadKit();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading interview kit..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 py-10">
          <ErrorMessage
            message={error}
            onRetry={loadKit}
          />
        </main>
      </>
    );
  }

  if (!kit) {
    return null;
  }

  const requirements = kit.role?.requirements || [];
  const questions = kit.questions || [];
  const flashcards = kit.flashcards || [];
  const days = kit.schedule?.days || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="rounded-2xl bg-slate-950 p-8 text-white">
          <p className="text-sm text-indigo-300">
            {kit.source?.company || "Company"}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {kit.role?.title || "Interview Preparation"}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Your personalised interview preparation kit.
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Requirements"
            value={requirements.length}
          />

          <StatCard
            label="Questions"
            value={questions.length}
          />

          <StatCard
            label="Flashcards"
            value={flashcards.length}
          />

          <StatCard
            label="Preparation days"
            value={days.length}
          />
        </div>

        {/* Main Sections */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <NavigationCard
            href={`/kits/${id}/questions`}
            title="Question Bank"
            description="Review, edit, reorder and regenerate interview questions."
            count={questions.length}
          />

          <NavigationCard
            href={`/kits/${id}/flashcards`}
            title="Flashcards"
            description="Review important concepts and track your preparation."
            count={flashcards.length}
          />

          <NavigationCard
            href={`/kits/${id}/schedule`}
            title="Preparation Schedule"
            description="Follow your day-by-day interview preparation plan."
            count={days.length}
          />

          <NavigationCard
            href={`/kits/${id}/practice`}
            title="Practice"
            description="Practice your generated flashcards."
          />

        </div>

        {/* Requirements */}
        <section className="mt-10">

          <h2 className="text-2xl font-bold">
            Requirements
          </h2>

          <div className="mt-5 space-y-3">

            {requirements.map((requirement, index) => (
              <div
                key={requirement.id || index}
                className="rounded-xl border bg-white p-5"
              >

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <span className="text-xs font-medium uppercase text-indigo-600">
                      {requirement.kind || "Requirement"}
                    </span>

                    <p className="mt-1 font-medium">
                      {requirement.text}
                    </p>

                  </div>

                  {requirement.priority && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                      {requirement.priority}
                    </span>
                  )}

                </div>

              </div>
            ))}

          </div>

        </section>

      </section>
    </main>
  );
}


/*
  Statistics Card
*/
function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}


/*
  Navigation Card
*/
function NavigationCard({
  href,
  title,
  description,
  count,
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
    >

      <div className="flex items-center justify-between">

        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {count !== undefined && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600">
            {count}
          </span>
        )}

      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </Link>
  );
}