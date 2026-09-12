"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import DayCard from "@/components/DayCard";
import { apiFetch } from "@/lib/api";

export default function SchedulePage() {
  const { id } = useParams();

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = await apiFetch(`/api/kits/${id}`);

        setDays(
          data.kit?.schedule?.days ||
            data.data?.schedule?.days ||
            []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSchedule();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading preparation schedule..." />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm font-medium text-indigo-600">
          Preparation Plan
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Your Schedule
        </h1>

        <p className="mt-2 text-slate-500">
          Follow the plan generated for your interview preparation.
        </p>

        <div className="mt-8 space-y-5">
          {days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
            />
          ))}
        </div>
      </section>
    </main>
  );
}