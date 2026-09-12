"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

const stages = [
  "Preparing job description",
  "Extracting requirements",
  "Researching company",
  "Researching interview process",
  "Generating questions",
  "Checking requirement coverage",
  "Generating flashcards",
  "Creating preparation schedule",
];

export default function NewKitPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    companyUrl: "",
    jd: "",
    days: 5,
  });

  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/kits", {
        method: "POST",
        body: JSON.stringify({
          company_url: form.companyUrl,
          jd: form.jd,
          days: Number(form.days),
        }),
      });

      const kit = data.kit || data.data;

      if (!kit?._id) {
        throw new Error("Kit was generated but no kit ID was returned.");
      }

      router.push(`/kits/${kit._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold">
              Building your interview kit
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please keep this page open while the preparation kit is
              generated.
            </p>

            <div className="mt-8 space-y-5">
              {stages.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      index <= stage
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index < stage ? "✓" : index + 1}
                  </div>

                  <span
                    className={
                      index <= stage
                        ? "font-medium text-slate-900"
                        : "text-slate-400"
                    }
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((stage + 1) / stages.length) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            New Interview Kit
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Prepare for your next interview
          </h1>

          <p className="mt-2 text-slate-500">
            Add the job description and company website to create a
            personalised preparation kit.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-medium">
                Kit generation failed
              </p>

              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                className="mt-3 font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

          <div>
            <label
              htmlFor="companyUrl"
              className="mb-2 block text-sm font-medium"
            >
              Company website
            </label>

            <input
              id="companyUrl"
              name="companyUrl"
              type="url"
              required
              value={form.companyUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              We'll use public company information to personalise the kit.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="jd"
              className="mb-2 block text-sm font-medium"
            >
              Job description
            </label>

            <textarea
              id="jd"
              name="jd"
              required
              rows={16}
              value={form.jd}
              onChange={handleChange}
              placeholder="Paste the complete job description here..."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Include responsibilities, requirements and qualifications
              whenever possible.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="days"
              className="mb-2 block text-sm font-medium"
            >
              Preparation days
            </label>

            <input
              id="days"
              name="days"
              type="number"
              min="1"
              max="30"
              required
              value={form.days}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              The generated schedule will contain exactly this number of
              days.
            </p>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Generate Interview Kit
          </button>
        </form>
      </section>
    </main>
  );
}