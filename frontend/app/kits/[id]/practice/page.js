"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Flashcard from "@/components/FlashCard";
import { apiFetch } from "@/lib/api";

export default function PracticePage() {
  const { id } = useParams();

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKit() {
      try {
        const data = await apiFetch(`/api/kits/${id}`);

        setCards(
          data.kit?.flashcards ||
            data.data?.flashcards ||
            []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadKit();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Preparing practice..." />
      </>
    );
  }

  if (!cards.length) {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">
            Nothing to practice yet
          </h1>

          <p className="mt-2 text-slate-500">
            Generate some flashcards first.
          </p>
        </main>
      </>
    );
  }

  const card = cards[index];

  function nextCard() {
    if (index < cards.length - 1) {
      setIndex((previous) => previous + 1);
    } else {
      setIndex(0);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-indigo-600">
            Practice Mode
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Test your knowledge
          </h1>

          <p className="mt-2 text-slate-500">
            Card {index + 1} of {cards.length}
          </p>
        </div>

        <Flashcard
          key={card.id}
          card={card}
          onConfidence={nextCard}
        />
      </section>
    </main>
  );
}