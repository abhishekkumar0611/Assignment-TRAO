"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Flashcard from "@components/Flashcard";
import { apiFetch } from "@/lib/api";

export default function FlashcardsPage() {
  const { id } = useParams();

  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [covered, setCovered] = useState({});

  useEffect(() => {
    async function loadCards() {
      try {
        const data = await apiFetch(`/api/kits/${id}`);

        setCards(
          data.kit?.flashcards ||
            data.data?.flashcards ||
            []
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (id) {
      loadCards();
    }
  }, [id]);

  if (!cards.length) {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">
            No flashcards available
          </h1>

          <p className="mt-2 text-slate-500">
            Generate a kit with questions first.
          </p>
        </main>
      </>
    );
  }

  const card = cards[current];

  function handleConfidence(level) {
    setCovered((previous) => ({
      ...previous,
      [card.id]: level,
    }));

    if (current < cards.length - 1) {
      setCurrent((previous) => previous + 1);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            Practice
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Flashcards
          </h1>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Card {current + 1} of {cards.length}
            </span>

            <span>
              Covered: {Object.keys(covered).length}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{
                width: `${
                  ((current + 1) / cards.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <Flashcard
          card={card}
          onConfidence={handleConfidence}
        />
      </section>
    </main>
  );
}