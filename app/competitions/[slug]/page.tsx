"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { paymentOptions } from "@/lib/sample-data";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Competition = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  ticket_price: number;
  max_entries: number;
  entries_sold: number;
  draw_date: string | null;
  status: string | null;
  skill_question: string | null;
  correct_answer: string | null;
};

function formatPrice(ticketPrice: number) {
  if (ticketPrice === 0) {
    return "Free";
  }

  return `₦${ticketPrice.toLocaleString()}`;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Date TBC";
  }

  return new Date(dateValue).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateValue: string | null) {
  if (!dateValue) {
    return "TBC";
  }

  return new Date(dateValue).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
  });
}

function calculateSoldPercentage(entriesSold: number, maxEntries: number) {
  if (!maxEntries || maxEntries <= 0) {
    return 0;
  }

  return Math.round((entriesSold / maxEntries) * 100);
}

export default function CompetitionDetailsPage({ params }: PageProps) {
  const { slug } = use(params);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCompetition() {
      setIsLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("competitions")
        .select(
          "id, slug, title, category, description, image_url, icon, ticket_price, max_entries, entries_sold, draw_date, status, skill_question, correct_answer"
        )
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (error) {
        setLoadError(error.message);
        setCompetition(null);
      } else {
        const loadedCompetition = data as Competition;
        setCompetition(loadedCompetition);

        const remaining = Math.max(
          loadedCompetition.max_entries - loadedCompetition.entries_sold,
          0
        );

        setQuantity(remaining > 0 ? 1 : 0);
      }

      setIsLoading(false);
    }

    loadCompetition();
  }, [slug]);

  const remainingEntries = competition
    ? Math.max(competition.max_entries - competition.entries_sold, 0)
    : 0;

  const safeQuantity =
    remainingEntries > 0 ? Math.min(quantity, remainingEntries) : 0;

  const totalAmount = useMemo(() => {
    if (!competition) {
      return 0;
    }

    return competition.ticket_price * safeQuantity;
  }, [competition, safeQuantity]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Loading competition...
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we load the competition details from Supabase.
          </p>
        </section>
      </main>
    );
  }

  if (loadError || !competition) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Competition not found
          </h1>

          <p className="mt-3 text-gray-600">
            We could not find this competition. It may be inactive or missing
            from Supabase.
          </p>

          {loadError && (
            <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {loadError}
            </p>
          )}

          <Link
            href="/competitions"
            className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            Back to Competitions
          </Link>
        </section>
      </main>
    );
  }

  const soldPercentage = calculateSoldPercentage(
    competition.entries_sold,
    competition.max_entries
  );

  const checkoutUrl = `/checkout?competition=${competition.slug}&quantity=${safeQuantity}`;

  const imageUrl = competition.image_url || "/images/toyota-corolla.jpg";
  const icon = competition.icon || "🎁";
  const correctAnswer = competition.correct_answer || "abuja";
  const skillQuestion =
    competition.skill_question || "What is the capital city of Nigeria?";

  function increaseQuantity() {
    if (remainingEntries <= 0) {
      setErrorMessage("This competition is sold out.");
      return;
    }

    setQuantity((currentQuantity) => {
      if (currentQuantity >= remainingEntries) {
        setErrorMessage(
          `Only ${remainingEntries} ticket${
            remainingEntries === 1 ? "" : "s"
          } remaining for this competition.`
        );

        return currentQuantity;
      }

      setErrorMessage("");
      return currentQuantity + 1;
    });
  }

  function decreaseQuantity() {
    setQuantity((currentQuantity) => {
      if (currentQuantity <= 1) {
        return 1;
      }

      return currentQuantity - 1;
    });

    setErrorMessage("");
  }

  function validateAnswer() {
    if (remainingEntries <= 0) {
      setErrorMessage("This competition is sold out.");
      return false;
    }

    if (safeQuantity < 1) {
      setErrorMessage("Please select at least 1 ticket.");
      return false;
    }

    if (safeQuantity > remainingEntries) {
      setErrorMessage(
        `Only ${remainingEntries} ticket${
          remainingEntries === 1 ? "" : "s"
        } remaining for this competition.`
      );
      return false;
    }

    if (!answer) {
      setErrorMessage("Please select an answer before continuing.");
      return false;
    }

    if (answer !== correctAnswer) {
      setErrorMessage("Incorrect answer. Please select the correct answer.");
      return false;
    }

    setErrorMessage("");
    return true;
  }

  function handleContinue(event: React.MouseEvent<HTMLAnchorElement>) {
    const isValid = validateAnswer();

    if (!isValid) {
      event.preventDefault();
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7EF] pb-24 text-[#111827] lg:pb-0">
      <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Link
              href="/competitions"
              className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#D6A84F] transition hover:bg-white hover:text-[#052E24]"
            >
              ← Back to Competitions
            </Link>

            <p className="font-black text-[#D6A84F]">
              {competition.category}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              {competition.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              {competition.description ||
                "Enter this competition for a chance to win the advertised prize."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/60">Ticket Price</p>
                <p className="text-2xl font-black text-[#D6A84F]">
                  {formatPrice(competition.ticket_price)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/60">Draw Date</p>
                <p className="text-2xl font-black text-[#D6A84F]">
                  {formatShortDate(competition.draw_date)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/60">Remaining</p>
                <p className="text-2xl font-black text-[#D6A84F]">
                  {remainingEntries.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-4 shadow-2xl">
            <div className="relative min-h-[380px] overflow-hidden rounded-[1.5rem] bg-[#052E24]">
              <Image
                src={imageUrl}
                alt={competition.title}
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

              <div className="absolute left-8 top-8 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#052E24]">
                {competition.category} Prize
              </div>

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#D6A84F] text-5xl shadow-2xl">
                  {icon}
                </div>

                <h2 className="text-4xl font-black leading-tight md:text-5xl">
                  {competition.title}
                </h2>

                <p className="mt-5 inline-flex rounded-full bg-[#D6A84F] px-5 py-2 text-sm font-black text-[#052E24]">
                  {formatPrice(competition.ticket_price)} per entry
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <article className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              Prize Details
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              This competition gives users the opportunity to enter for a major
              prize package. The winner will receive the advertised prize,
              subject to the final competition terms and verification process.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                `${competition.category} prize package`,
                "Secure local payment options",
                "Transparent winner announcement",
                "Nigeria-wide participation",
              ].map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl bg-[#FAF7EF] p-4 font-bold text-[#052E24]"
                >
                  ✓ {highlight}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              Competition Progress
            </h2>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold text-[#052E24]">
                <span>
                  {competition.entries_sold.toLocaleString()} entries sold
                </span>

                <span>
                  {competition.max_entries.toLocaleString()} maximum entries
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#D6A84F]"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-sm font-bold text-[#052E24]">
                {remainingEntries.toLocaleString()} ticket
                {remainingEntries === 1 ? "" : "s"} remaining
              </p>
            </div>
          </article>

          <article className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              Payment Options
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              For Nigeria, the checkout will support simple local payment
              methods. Users will be able to choose card payment, bank transfer
              or USSD before completing their entry.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {paymentOptions.map((option) => (
                <div
                  key={option.title}
                  className="rounded-2xl border border-gray-100 bg-[#FAF7EF] p-5"
                >
                  <h3 className="font-black text-[#052E24]">{option.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {option.text}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl lg:sticky lg:top-24">
          <h2 className="text-2xl font-black text-[#052E24]">
            Enter Competition
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Select your ticket quantity and answer the competition question.
          </p>

          <div className="mt-6 rounded-2xl bg-[#FAF7EF] p-5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#052E24]">Ticket Price</span>

              <span className="font-black text-[#052E24]">
                {formatPrice(competition.ticket_price)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-[#052E24]">Quantity</span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || remainingEntries <= 0}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-[#052E24] shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>

                <span className="w-8 text-center text-xl font-black text-[#052E24]">
                  {safeQuantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= remainingEntries || remainingEntries <= 0}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#052E24] text-xl font-black text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm font-bold text-gray-600">
              Available: {remainingEntries.toLocaleString()} ticket
              {remainingEntries === 1 ? "" : "s"}
            </p>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#052E24]">Total</span>

                <span className="text-2xl font-black text-[#052E24]">
                  {totalAmount === 0
                    ? "Free"
                    : `₦${totalAmount.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="answer"
              className="block text-sm font-black text-[#052E24]"
            >
              Skill Question
            </label>

            <p className="mt-2 text-sm text-gray-600">{skillQuestion}</p>

            <select
              id="answer"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setErrorMessage("");
              }}
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 font-bold outline-none focus:border-[#D6A84F]"
            >
              <option value="">Select your answer</option>
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
              <option value="kano">Kano</option>
            </select>

            {errorMessage && (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </p>
            )}
          </div>

          {remainingEntries > 0 ? (
            <Link
              href={checkoutUrl}
              onClick={handleContinue}
              className="mt-6 block w-full rounded-full bg-[#D6A84F] px-6 py-4 text-center font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              Continue to Payment
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 block w-full rounded-full bg-gray-300 px-6 py-4 text-center font-black text-gray-600"
            >
              Sold Out
            </button>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Payment is not active yet. In the next stages, this button will
            create an order and take the user to checkout.
          </p>
        </aside>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 shadow-2xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-500">
              {competition.title}
            </p>

            <p className="text-lg font-black text-[#052E24]">
              {totalAmount === 0
                ? "Free Entry"
                : `Total: ₦${totalAmount.toLocaleString()}`}
            </p>

            {errorMessage && (
              <p className="mt-1 truncate text-xs font-bold text-red-600">
                {errorMessage}
              </p>
            )}
          </div>

          {remainingEntries > 0 ? (
            <Link
              href={checkoutUrl}
              onClick={handleContinue}
              className="shrink-0 rounded-full bg-[#D6A84F] px-5 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              Continue
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="shrink-0 rounded-full bg-gray-300 px-5 py-3 text-sm font-black text-gray-600"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </main>
  );
}