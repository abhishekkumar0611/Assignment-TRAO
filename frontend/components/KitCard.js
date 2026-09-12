import Link from "next/link";

export default function KitCard({ kit }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            {kit.source?.company || "Company"}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {kit.role?.title || "Interview Preparation"}
          </h3>
        </div>

        {kit.status && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {kit.status}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Requirements
          </p>

          <p className="mt-1 text-lg font-semibold">
            {kit.role?.requirements?.length || 0}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Questions
          </p>

          <p className="mt-1 text-lg font-semibold">
            {kit.questions?.length || 0}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Cards
          </p>

          <p className="mt-1 text-lg font-semibold">
            {kit.flashcards?.length || 0}
          </p>
        </div>
      </div>

      <Link
        href={`/kits/${kit._id}`}
        className="mt-6 block rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
      >
        Open Kit
      </Link>
    </article>
  );
}