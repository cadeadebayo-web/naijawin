"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_published: boolean | null;
  created_at: string | null;
};

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [isPublished, setIsPublished] = useState(true);

  const [editingFaqId, setEditingFaqId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  async function loadFAQs() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, sort_order, is_published, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setFaqs((data || []) as FAQ[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadFAQs();
  }, []);

  function validateForm() {
    if (!question.trim()) {
      return "Question is required.";
    }

    if (!answer.trim()) {
      return "Answer is required.";
    }

    if (!sortOrder.trim()) {
      return "Sort order is required.";
    }

    if (Number(sortOrder) < 1) {
      return "Sort order must be 1 or higher.";
    }

    return "";
  }

  function resetForm() {
    setQuestion("");
    setAnswer("");
    setSortOrder("1");
    setIsPublished(true);
    setEditingFaqId("");
  }

  function startEditingFAQ(faq: FAQ) {
    setMessage("");
    setErrorMessage("");

    setEditingFaqId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(String(faq.sort_order || 1));
    setIsPublished(Boolean(faq.is_published));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveFAQ() {
    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);

    if (editingFaqId) {
      const { error } = await supabase
        .from("faqs")
        .update({
          question: question.trim(),
          answer: answer.trim(),
          sort_order: Number(sortOrder),
          is_published: isPublished,
        })
        .eq("id", editingFaqId);

      setIsSaving(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("FAQ updated successfully.");
      resetForm();
      loadFAQs();
      return;
    }

    const { error } = await supabase.from("faqs").insert({
      question: question.trim(),
      answer: answer.trim(),
      sort_order: Number(sortOrder),
      is_published: isPublished,
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("FAQ added successfully.");
    resetForm();
    loadFAQs();
  }

  async function togglePublished(faq: FAQ) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("faqs")
      .update({
        is_published: !faq.is_published,
      })
      .eq("id", faq.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      faq.is_published
        ? "FAQ unpublished successfully."
        : "FAQ published successfully."
    );

    loadFAQs();
  }

  async function updateSortOrder(faq: FAQ, newSortOrder: number) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("faqs")
      .update({
        sort_order: newSortOrder,
      })
      .eq("id", faq.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("FAQ sort order updated successfully.");
    loadFAQs();
  }

  function deleteFAQ(faq: FAQ) {
    setMessage("");
    setErrorMessage("");
    setFaqToDelete(faq);
  }

  async function confirmDeleteFAQ() {
    if (!faqToDelete) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("faqs")
      .delete()
      .eq("id", faqToDelete.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("FAQ deleted successfully.");
    setFaqToDelete(null);

    if (editingFaqId === faqToDelete.id) {
      resetForm();
    }

    loadFAQs();
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

              <p className="font-black text-[#D6A84F]">FAQ Management</p>

              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                Manage website questions and answers.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-white/75">
                Add, edit, publish, unpublish, sort and safely delete FAQs.
              </p>
            </div>

            <Link
              href="/faq"
              className="rounded-full bg-[#D6A84F] px-6 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
            >
              View Public FAQ
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[420px_1fr]">
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl md:p-8">
            <h2 className="text-3xl font-black text-[#052E24]">
              {editingFaqId ? "Edit FAQ" : "Add FAQ"}
            </h2>

            <p className="mt-2 text-gray-600">
              {editingFaqId
                ? "Update the selected FAQ record."
                : "Create a new question and answer for the public FAQ page."}
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

            {editingFaqId && (
              <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
                You are editing an existing FAQ. Click Cancel Edit to return to
                add mode.
              </div>
            )}

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="question"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Question
                </label>

                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: How do I enter a competition?"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label
                  htmlFor="answer"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Answer
                </label>

                <textarea
                  id="answer"
                  rows={6}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Write a clear answer here."
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div>
                <label
                  htmlFor="sortOrder"
                  className="block text-sm font-black text-[#052E24]"
                >
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  placeholder="Example: 1"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Lower numbers appear first on the public FAQ page.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#FAF7EF] p-4">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                  className="h-5 w-5"
                />

                <label
                  htmlFor="isPublished"
                  className="font-black text-[#052E24]"
                >
                  Publish FAQ
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveFAQ}
                disabled={isSaving}
                className="w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving FAQ..."
                  : editingFaqId
                  ? "Update FAQ"
                  : "Add FAQ"}
              </button>

              {editingFaqId && (
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
              FAQ Records
            </h2>

            <p className="mt-2 text-gray-600">
              Manage FAQs saved in Supabase.
            </p>

            {isLoading ? (
              <div className="mt-8 rounded-3xl bg-[#FAF7EF] p-8 text-center">
                <h3 className="text-2xl font-black text-[#052E24]">
                  Loading FAQs...
                </h3>
              </div>
            ) : faqs.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-[#FAF7EF] p-8 text-center">
                <h3 className="text-2xl font-black text-[#052E24]">
                  No FAQs yet.
                </h3>

                <p className="mt-2 text-gray-600">
                  Added FAQs will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {faqs.map((faq) => (
                  <article
                    key={faq.id}
                    className={`rounded-3xl border p-5 ${
                      editingFaqId === faq.id
                        ? "border-[#D6A84F] bg-yellow-50"
                        : "border-gray-100 bg-[#FAF7EF]"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              faq.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {faq.is_published ? "Published" : "Draft"}
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]">
                            Sort: {faq.sort_order || 0}
                          </span>

                          {editingFaqId === faq.id && (
                            <span className="rounded-full bg-[#D6A84F] px-3 py-1 text-xs font-black text-[#052E24]">
                              Editing
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-2xl font-black text-[#052E24]">
                          {faq.question}
                        </h3>

                        <p className="mt-3 leading-7 text-gray-600">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingFAQ(faq)}
                          className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#D6A84F]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePublished(faq)}
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            faq.is_published
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                              : "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                          }`}
                        >
                          {faq.is_published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFAQ(faq)}
                          className="rounded-full bg-red-100 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>

                        <div className="rounded-2xl bg-white p-3">
                          <label
                            htmlFor={`sort-${faq.id}`}
                            className="block text-xs font-black text-gray-500"
                          >
                            Quick Sort
                          </label>

                          <input
                            id={`sort-${faq.id}`}
                            type="number"
                            defaultValue={faq.sort_order || 1}
                            onBlur={(event) =>
                              updateSortOrder(faq, Number(event.target.value))
                            }
                            className="mt-1 w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm font-black outline-none focus:border-[#D6A84F]"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        {faqToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-black text-[#052E24]">
                Delete FAQ?
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Are you sure you want to delete this FAQ?
              </p>

              <div className="mt-5 rounded-2xl bg-[#FAF7EF] p-4">
                <p className="font-black text-[#052E24]">
                  {faqToDelete.question}
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {faqToDelete.answer}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFaqToDelete(null)}
                  className="rounded-full border border-[#052E24] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteFAQ}
                  className="rounded-full bg-red-100 px-6 py-3 font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                >
                  Yes, Delete FAQ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminGuard>
  );
}