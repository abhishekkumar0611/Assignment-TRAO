"use client";

import { useState } from "react";

export default function Flashcard({
  card,
  onConfidence,
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 shadow-sm">
      <div className="min-h-[280px]">
        <p className="text-xs font-medium uppercase text-indigo-600">
          Question
        </p>

        <h2 className="mt-4 text-2xl font-bold leading-relaxed">
          {card.front}
        </h2>

        {revealed && (
          <div className="mt-8 border-t pt-6">
            <p className="text-xs font-medium uppercase text-slate-400">
              Answer
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              {card.back}
            </p>
          </div>
        )}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white"
        >
          Reveal Answer
        </button>
      ) : (
        <div>
          <p className="mb-3 text-center text-sm text-slate-500">
            How well did you know this?
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onConfidence("low")}
              className="rounded-lg border border-red-200 px-3 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              Didn't know
            </button>

            <button
              onClick={() => onConfidence("medium")}
              className="rounded-lg border border-yellow-200 px-3 py-3 text-sm text-yellow-700 hover:bg-yellow-50"
            >
              Almost
            </button>

            <button
              onClick={() => onConfidence("high")}
              className="rounded-lg border border-green-200 px-3 py-3 text-sm text-green-700 hover:bg-green-50"
            >
              Knew it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}