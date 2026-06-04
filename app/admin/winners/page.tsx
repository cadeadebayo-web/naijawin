"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type Competition = {
  id: string;
  title: string;
  slug: string;
};

type Winner = {
  id: string;
  competition_id: string | null;
  winner_name: string;
  location: string | null;
  prize: string;
  image_url: string | null;
  published: boolean | null;
  draw_date: string | null;
  created_at: string | null;
};

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

export default function AdminWinnersPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const [competitionId, setCompetitionId] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [location, setLocation] = useState("");
  const [prize, setPrize] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [published, setPublished] = useState(true);

  const [editingWinnerId, setEditingWinnerId] = useState("");
  const [winnerToDelete, setWinnerToDelete] = useState<Winner | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    setIsLoading(true);
    setErrorMessage("");

    const { data: competitionData, error: competitionError } = await supabase
      .from("competitions")
      .select("id, title, slug")
      .order("created_at", { ascending: false });

    if (competitionError) {
      setErrorMessage(competitionError.message);
      setIsLoading(false);
      return;
    }

    const { data: winnerData, error: winnerError } = await supabase
      .from("winners")
      .select(
        "id, competition_id, winner_name, location, prize, image_url, published, draw_date, created_at"
      )
      .order("created_at", { ascending: false });

    if (winnerError) {
      setErrorMessage(winnerError.message);
      setIsLoading(false);
      return;
    }

    setCompetitions((competitionData || []) as Competition[]);
    setWinners((winnerData || []) as Winner[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function validateForm() {
    if (!winnerName.trim()) {
      return "Winner name is required.";
    }
  
    if (!location.trim()) {
      return "Winner location is required.";
    }
  
    if (!prize.trim()) {
      return "Prize is required.";
    }
  
    if (!drawDate.trim()) {
      return "Draw date is required.";
    }
  
    const selectedDate = new Date(drawDate);
    const today = new Date();
  
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    if (selectedDate > today) {
      return "Draw date cannot be in the future.";
    }
  
    return "";
  }

  function resetForm() {
    setCompetitionId("");
    setWinnerName("");
    setLocation("");
    setPrize("");
    setImageUrl("");
    setDrawDate("");
    setPublished(true);
    setEditingWinnerId("");
  }

  function startEditingWinner(winner: Winner) {
    setMessage("");
    setErrorMessage("");

    setEditingWinnerId(winner.id);
    setCompetitionId(winner.competition_id || "");
    setWinnerName(winner.winner_name);
    setLocation(winner.location || "");
    setPrize(winner.prize);
    setImageUrl(winner.image_url || "");
    setDrawDate(winner.draw_date || "");
    setPublished(Boolean(winner.published));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveWinner() {
    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);

    if (editingWinnerId) {
      const { error } = await supabase
        .from("winners")
        .update({
          competition_id: competitionId || null,
          winner_name: winnerName.trim(),
          location: location.trim(),
          prize: prize.trim(),
          image_url: imageUrl.trim() || null,
          published,
          draw_date: drawDate,
        })
        .eq("id", editingWinnerId);

      setIsSaving(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Winner updated successfully.");
      resetForm();
      loadData();
      return;
    }

    const { error } = await supabase.from("winners").insert({
      competition_id: competitionId || null,
      winner_name: winnerName.trim(),
      location: location.trim(),
      prize: prize.trim(),
      image_url: imageUrl.trim() || null,
      published,
      draw_date: drawDate,
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Winner added successfully.");
    resetForm();
    loadData();
  }

  async function togglePublished(winner: Winner) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("winners")
      .update({
        published: !winner.published,
      })
      .eq("id", winner.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      winner.published
        ? "Winner unpublished successfully."
        : "Winner published successfully."
    );

    loadData();
  }

  function deleteWinner(winner: Winner) {
    setMessage("");
    setErrorMessage("");
    setWinnerToDelete(winner);
  }

  async function confirmDeleteWinner() {
    if (!winnerToDelete) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("winners")
      .delete()
      .eq("id", winnerToDelete.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Winner deleted successfully.");

    if (editingWinnerId === winnerToDelete.id) {
      resetForm();
    }

    setWinnerToDelete(null);
    loadData();
  }

  function getCompetitionTitle(competitionIdValue: string | null) {
    if (!competitionIdValue) {
      return "No competition linked";
    }

    return (
      competitions.find((competition) => competition.id === competitionIdValue)
        ?.title || "Competition not found"
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Link
                href="/admin"
                className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#D6A84F] transition hover:bg-white hover:text-[#052E24]"
              >
                ← Back to Admin
              </Link>

              <p className="font-black text-[#D6A84F]">Winners Management</p>

              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                Add and publish verified winners.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-white/75">
                Add, edit, publish, unpublish and safely delete winner records.
              </p>
            </div>

            <Link
              href="/winners"
              className="rounded-full bg-[#D6A84F] px-6 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
            >
              View Public Winners
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[420px_1fr]">
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl md:p-8">
            <h2 className="text-3xl font-black text-[#052E24]">
              {editingWinnerId ? "Edit Winner" : "Add Winner"}
            </h2>

            <p className="mt-2 text-gray-600">
              {editingWinnerId
                ? "Update the selected winner record."
                : "Add a winner after a completed competition draw."}
            </p>

            {message && (
              <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            {editingWinnerId && (
              <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
                You are editing an existing winner. Click Cancel Edit to return
                to add mode.
              </div>
            )}

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="competition"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Competition
                </label>

                <select
                  id="competition"
                  value={competitionId}
                  onChange={(event) => setCompetitionId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#D6A84F]"
                >
                  <option value="">No competition linked</option>
                  {competitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="winnerName"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Winner Name
                </label>

                <input
                  id="winnerName"
                  type="text"
                  value={winnerName}
                  onChange={(event) => setWinnerName(event.target.value)}
                  placeholder="Example: Adebayo T."
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Example: Lagos"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label
                  htmlFor="prize"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Prize Won
                </label>

                <input
                  id="prize"
                  type="text"
                  value={prize}
                  onChange={(event) => setPrize(event.target.value)}
                  placeholder="Example: ₦1,000,000 Cash"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label
                  htmlFor="drawDate"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Draw Date
                </label>

                <input
  id="drawDate"
  type="date"
  value={drawDate}
  max={new Date().toISOString().split("T")[0]}
  onChange={(event) => setDrawDate(event.target.value)}
  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
/>
              </div>

              <div>
  <label
    htmlFor="imageUrl"
    className="block text-sm font-black text-[#052E24]"
  >
    Winner Image URL
  </label>

  <input
    id="imageUrl"
    type="text"
    value={imageUrl}
    onChange={(event) => setImageUrl(event.target.value)}
    placeholder="/images/winner.jpg"
    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
  />

  <p className="mt-2 text-sm text-gray-500">
    Optional for now. Use an image path inside public/images.
  </p>

  {imageUrl.trim() && (
    <div className="mt-4 overflow-hidden rounded-3xl border border-gray-100 bg-[#FAF7EF]">
      <div className="relative h-56">
        <Image
          src={imageUrl.trim()}
          alt="Winner preview"
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <p className="text-sm font-bold text-gray-500">Image preview</p>
        <p className="mt-1 break-all text-sm font-black text-[#052E24]">
          {imageUrl.trim()}
        </p>
      </div>
    </div>
  )}
</div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#FAF7EF] p-4">
                <input
                  id="published"
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="h-5 w-5"
                />

                <label
                  htmlFor="published"
                  className="font-black text-[#052E24]"
                >
                  Publish winner
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveWinner}
                disabled={isSaving}
                className="w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving Winner..."
                  : editingWinnerId
                  ? "Update Winner"
                  : "Add Winner"}
              </button>

              {editingWinnerId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-full border border-[#052E24] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </aside>

          <section className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
            <h2 className="text-3xl font-black text-[#052E24]">
              Winner Records
            </h2>

            <p className="mt-2 text-gray-600">
              Manage winners saved in Supabase.
            </p>

            {isLoading ? (
              <div className="mt-8 rounded-3xl bg-[#FAF7EF] p-8 text-center">
                <h3 className="text-2xl font-black text-[#052E24]">
                  Loading winners...
                </h3>
              </div>
            ) : winners.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-[#FAF7EF] p-8 text-center">
                <h3 className="text-2xl font-black text-[#052E24]">
                  No winners yet.
                </h3>

                <p className="mt-2 text-gray-600">
                  Added winners will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {winners.map((winner) => (
                  <article
                    key={winner.id}
                    className={`rounded-3xl border p-5 ${
                      editingWinnerId === winner.id
                        ? "border-[#D6A84F] bg-yellow-50"
                        : "border-gray-100 bg-[#FAF7EF]"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                      {winner.image_url && (
  <div className="mb-5 overflow-hidden rounded-3xl bg-[#052E24]">
    <div className="relative h-56">
      <Image
        src={winner.image_url}
        alt={winner.winner_name}
        fill
        className="object-cover"
      />
    </div>
  </div>
)}                        
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              winner.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {winner.published ? "Published" : "Draft"}
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]">
                            {formatDate(winner.draw_date)}
                          </span>

                          {editingWinnerId === winner.id && (
                            <span className="rounded-full bg-[#D6A84F] px-3 py-1 text-xs font-black text-[#052E24]">
                              Editing
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-2xl font-black text-[#052E24]">
                          {winner.winner_name}
                        </h3>

                        <p className="mt-1 text-gray-600">
                          {winner.location || "Nigeria"}
                        </p>

                        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-black text-[#052E24]">
                          Won {winner.prize}
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                          Competition:{" "}
                          <span className="font-bold text-[#052E24]">
                            {getCompetitionTitle(winner.competition_id)}
                          </span>
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingWinner(winner)}
                          className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#D6A84F]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePublished(winner)}
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            winner.published
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                              : "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                          }`}
                        >
                          {winner.published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteWinner(winner)}
                          className="rounded-full bg-red-100 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        {winnerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-black text-[#052E24]">
                Delete Winner?
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Are you sure you want to delete this winner?
              </p>

              <div className="mt-5 rounded-2xl bg-[#FAF7EF] p-4">
                <p className="font-black text-[#052E24]">
                  {winnerToDelete.winner_name}
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Won {winnerToDelete.prize}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setWinnerToDelete(null)}
                  className="rounded-full border border-[#052E24] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteWinner}
                  className="rounded-full bg-red-100 px-6 py-3 font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                >
                  Yes, Delete Winner
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminGuard>
  );
}