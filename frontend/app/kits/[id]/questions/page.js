"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import QuestionCard from "@/components/QuestionCard";
import QuestionEditor from "@/components/QuestionEditor";
import { apiFetch } from "@/lib/api";

export default function QuestionsPage() {
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadKit() {
    try {
      setLoading(true);

      const data = await apiFetch(`/api/kits/${id}`);

      setQuestions(
        data.kit?.questions ||
          data.data?.questions ||
          []
      );
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

  async function saveQuestions(nextQuestions) {
    try {
      setSaving(true);
      setError("");

      await apiFetch(`/api/kits/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          questions: nextQuestions,
        }),
      });

      setQuestions(nextQuestions);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(questionId) {
    const nextQuestions = questions.filter(
      (question) => question.id !== questionId
    );

    saveQuestions(nextQuestions);
  }

  function handleMove(questionId, direction) {
    const currentIndex = questions.findIndex(
      (question) => question.id === questionId
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      nextIndex < 0 ||
      nextIndex >= questions.length
    ) {
      return;
    }

    const updated = [...questions];

    [
      updated[currentIndex],
      updated[nextIndex],
    ] = [
      updated[nextIndex],
      updated[currentIndex],
    ];

    saveQuestions(updated);
  }

  function handlePin(questionId) {
    const updated = questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            pinned: !question.pinned,
            edited: true,
          }
        : question
    );

    saveQuestions(updated);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading questions..." />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Interview Kit
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Question Bank
            </h1>

            <p className="mt-2 text-slate-500">
              Edit, reorder, pin or remove questions.
            </p>
          </div>

          <button
            onClick={() => {
              const newQuestion = {
                id: `manual-${Date.now()}`,
                requirement_ids: [],
                category: "technical",
                prompt: "",
                answer_outline: "",
                difficulty: 1,
                source: "manual",
                edited: true,
                pinned: false,
              };

              setEditing(newQuestion);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            + Add Question
          </button>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {saving && (
          <p className="mt-4 text-sm text-slate-500">
            Saving changes...
          </p>
        )}

        <div className="mt-8 space-y-5">
          {editing && (
            <QuestionEditor
              question={editing}
              onSave={(updatedQuestion) => {
                const exists = questions.some(
                  (question) =>
                    question.id === updatedQuestion.id
                );

                const nextQuestions = exists
                  ? questions.map((question) =>
                      question.id === updatedQuestion.id
                        ? updatedQuestion
                        : question
                    )
                  : [
                      ...questions,
                      updatedQuestion,
                    ];

                saveQuestions(nextQuestions);
              }}
              onCancel={() => setEditing(null)}
            />
          )}

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onEdit={setEditing}
              onDelete={handleDelete}
              onMoveUp={(questionId) =>
                handleMove(questionId, "up")
              }
              onMoveDown={(questionId) =>
                handleMove(questionId, "down")
              }
              onPin={handlePin}
            />
          ))}
        </div>
      </section>
    </main>
  );
}