export default function DayCard({ day }) {
  return (
    <article className="rounded-xl border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm font-medium text-indigo-600">
            Day {day.day}
          </span>

          <h3 className="mt-1 text-xl font-semibold">
            {day.focus}
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
          {day.minutes} min
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {(day.question_ids || []).map(
          (questionId) => (
            <div
              key={questionId}
              className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
            >
              Question: {questionId}
            </div>
          )
        )}
      </div>
    </article>
  );
}