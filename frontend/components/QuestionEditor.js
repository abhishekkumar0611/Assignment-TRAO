"use client";

import { useState } from "react";

export default function QuestionEditor({
  question,
  onSave,
  onCancel,
}) {
  const [prompt, setPrompt] = useState(
    question.prompt || ""
  );

  const [answer, setAnswer] = useState(
    question.answer_outline || ""
  );

  const [difficulty, setDifficulty] = useState(
    question.difficulty || 1
  );

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...question,
      prompt,
      answer_outline: answer,
      difficulty: Number(difficulty),
      edited: true,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-5"
    >
      <h3 className="font-semibold">
        Edit Question
      </h3>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium">
          Question
        </label>

        <textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          className="w-full rounded-lg border p-3 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium">
          Answer outline
        </label>

        <textarea
          rows={7}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full rounded-lg border p-3 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium">
          Difficulty
        </label>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border p-3"
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
        </select>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Save Changes
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}