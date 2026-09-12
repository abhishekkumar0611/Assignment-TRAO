export default function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPin,
}) {
  return (
    <article className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
            {index + 1}
          </span>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                {question.category}
              </span>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                Difficulty {question.difficulty}
              </span>

              {question.pinned && (
                <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                  Pinned
                </span>
              )}
            </div>

            <h3 className="mt-3 font-semibold text-slate-900">
              {question.prompt}
            </h3>

            {question.answer_outline && (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {question.answer_outline}
              </p>
            )}

            {question.requirement_ids?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {question.requirement_ids.map((id) => (
                  <span
                    key={id}
                    className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-600"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => onMoveUp(question.id)}
            aria-label="Move question up"
            className="rounded border px-2 py-1 text-sm hover:bg-slate-50"
          >
            ↑
          </button>

          <button
            onClick={() => onMoveDown(question.id)}
            aria-label="Move question down"
            className="rounded border px-2 py-1 text-sm hover:bg-slate-50"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
        <button
          onClick={() => onEdit(question)}
          className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
        >
          Edit
        </button>

        <button
          onClick={() => onPin(question.id)}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
        >
          {question.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          onClick={() => onDelete(question.id)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}