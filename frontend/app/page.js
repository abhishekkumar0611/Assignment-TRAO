import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            InterviewKit
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-900"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6">
        <div className="max-w-4xl">
          <div className="mb-6 inline-block rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            AI Interview Preparation
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Turn any job description into an
            <span className="text-indigo-400"> interview plan.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Research the company, identify role requirements, generate
            targeted interview questions, create flashcards and follow a
            personalised preparation schedule.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-700"
            >
              Create Free Kit
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-6 py-3 font-medium hover:bg-slate-900"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}