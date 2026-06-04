"use client";

import Link from "next/link";
import Image from "next/image";
import AdminGuard from "@/components/AdminGuard";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  is_featured: boolean | null;
  skill_question: string | null;
  correct_answer: string | null;
};

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/₦/g, "naira")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function EditCompetitionPage({ params }: PageProps) {
  const { slug: currentSlug } = use(params);

  const [competitionId, setCompetitionId] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [maxEntries, setMaxEntries] = useState("");
  const [entriesSold, setEntriesSold] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [description, setDescription] = useState("");
  const [skillQuestion, setSkillQuestion] = useState(
    "What is the capital city of Nigeria?"
  );
  const [correctAnswer, setCorrectAnswer] = useState("abuja");
  const [status, setStatus] = useState("draft");
  const [icon, setIcon] = useState("🎁");
  const [imageUrl, setImageUrl] = useState("/images/toyota-corolla.jpg");
  const [isFeatured, setIsFeatured] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCompetition() {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("competitions")
        .select(
          "id, slug, title, category, description, image_url, icon, ticket_price, max_entries, entries_sold, draw_date, status, is_featured, skill_question, correct_answer"
        )
        .eq("slug", currentSlug)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const competition = data as Competition;

      setCompetitionId(competition.id);
      setTitle(competition.title);
      setSlug(competition.slug);
      setCategory(competition.category);
      setTicketPrice(String(competition.ticket_price));
      setMaxEntries(String(competition.max_entries));
      setEntriesSold(String(competition.entries_sold));
      setDrawDate(competition.draw_date || "");
      setDescription(competition.description || "");
      setSkillQuestion(
        competition.skill_question || "What is the capital city of Nigeria?"
      );
      setCorrectAnswer(competition.correct_answer || "abuja");
      setStatus(competition.status || "draft");
      setIcon(competition.icon || "🎁");
      setImageUrl(competition.image_url || "/images/toyota-corolla.jpg");
      setIsFeatured(Boolean(competition.is_featured));

      setIsLoading(false);
    }

    loadCompetition();
  }, [currentSlug]);

  function handleTitleChange(value: string) {
    setTitle(value);
  }
  async function handleImageUpload(file: File | null) {
    setMessage("");
    setErrorMessage("");
  
    if (!file) {
      return;
    }
  
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file.");
      return;
    }
  
    const maxFileSize = 5 * 1024 * 1024;
  
    if (file.size > maxFileSize) {
      setErrorMessage("Image must be 5MB or smaller.");
      return;
    }
  
    setIsUploadingImage(true);
  
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExtension}`;
  
    const filePath = `competitions/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from("competition-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
  
    if (uploadError) {
      setIsUploadingImage(false);
      setErrorMessage(uploadError.message);
      return;
    }
  
    const { data } = supabase.storage
      .from("competition-images")
      .getPublicUrl(filePath);
  
    setImageUrl(data.publicUrl);
    setIsUploadingImage(false);
    setMessage("Image uploaded successfully.");
  }
  function validateForm() {
    if (!competitionId) {
      return "Competition record was not loaded properly.";
    }

    if (!title.trim()) {
      return "Competition title is required.";
    }

    if (!slug.trim()) {
      return "Slug is required.";
    }

    if (!category.trim()) {
      return "Category is required.";
    }

    if (!ticketPrice.trim()) {
      return "Ticket price is required. Use 0 for free competitions.";
    }

    if (!maxEntries.trim()) {
      return "Maximum entries is required.";
    }

    if (!entriesSold.trim()) {
      return "Entries sold is required. Use 0 if no entries yet.";
    }

    if (!drawDate.trim()) {
      return "Draw date is required.";
    }

    if (!description.trim()) {
      return "Description is required.";
    }

    if (!skillQuestion.trim()) {
      return "Skill question is required.";
    }

    if (!correctAnswer.trim()) {
      return "Correct answer is required.";
    }

    if (Number(entriesSold) > Number(maxEntries)) {
      return "Entries sold cannot be greater than maximum entries.";
    }

    return "";
  }

  async function handleUpdateCompetition() {
    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("competitions")
      .update({
        slug: slug.trim(),
        title: title.trim(),
        category,
        description: description.trim(),
        image_url: imageUrl.trim(),
        icon: icon.trim() || "🎁",
        ticket_price: Number(ticketPrice),
        max_entries: Number(maxEntries),
        entries_sold: Number(entriesSold),
        draw_date: drawDate,
        status,
        is_featured: isFeatured,
        skill_question: skillQuestion.trim(),
        correct_answer: correctAnswer.trim().toLowerCase(),
      })
      .eq("id", competitionId);

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Competition updated successfully.");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Loading competition...
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we load the competition from Supabase.
          </p>
        </section>
      </main>
    );
  }

  if (errorMessage && !competitionId) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Competition not found
          </h1>

          <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {errorMessage}
          </p>

          <Link
            href="/admin"
            className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            Back to Admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#D6A84F] transition hover:bg-white hover:text-[#052E24]"
          >
            ← Back to Admin
          </Link>

          <p className="font-black text-[#D6A84F]">Edit Competition</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Update competition details.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            This page updates an existing competition directly in Supabase.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
          {message && (
            <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <form className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-black text-[#052E24]"
              >
                Competition Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="slug"
                className="block text-sm font-black text-[#052E24]"
              >
                Page Slug
              </label>

              <div className="mt-2 flex flex-col gap-3 md:flex-row">
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(createSlug(event.target.value))}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
                />

                <button
                  type="button"
                  onClick={() => setSlug(createSlug(title))}
                  className="rounded-2xl bg-[#052E24] px-5 py-4 text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                >
                  Regenerate
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Public page: /competitions/{slug || "your-slug"}
              </p>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-black text-[#052E24]"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#D6A84F]"
              >
                <option value="">Select category</option>
                <option value="Cars">Cars</option>
                <option value="Cash">Cash</option>
                <option value="Gadgets">Gadgets</option>
                <option value="Homes & Land">Homes & Land</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Business">Business Support</option>
                <option value="Free Entry">Free Entry</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ticketPrice"
                className="block text-sm font-black text-[#052E24]"
              >
                Ticket Price
              </label>

              <input
                id="ticketPrice"
                type="number"
                value={ticketPrice}
                onChange={(event) => setTicketPrice(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="maxEntries"
                className="block text-sm font-black text-[#052E24]"
              >
                Maximum Entries
              </label>

              <input
                id="maxEntries"
                type="number"
                value={maxEntries}
                onChange={(event) => setMaxEntries(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="entriesSold"
                className="block text-sm font-black text-[#052E24]"
              >
                Entries Sold
              </label>

              <input
                id="entriesSold"
                type="number"
                value={entriesSold}
                onChange={(event) => setEntriesSold(event.target.value)}
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
                onChange={(event) => setDrawDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="icon"
                className="block text-sm font-black text-[#052E24]"
              >
                Icon
              </label>

              <input
                id="icon"
                type="text"
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="Example: 🚗"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
  <label
    htmlFor="imageUpload"
    className="block text-sm font-black text-[#052E24]"
  >
    Upload New Competition Image
  </label>

  <input
    id="imageUpload"
    type="file"
    accept="image/*"
    onChange={(event) =>
      handleImageUpload(event.target.files ? event.target.files[0] : null)
    }
    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#D6A84F]"
  />

  <p className="mt-2 text-sm text-gray-500">
    Upload JPG, PNG or WebP image. Maximum size: 5MB.
  </p>

  {isUploadingImage && (
    <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
      Uploading image...
    </div>
  )}

  <label
    htmlFor="imageUrl"
    className="mt-5 block text-sm font-black text-[#052E24]"
  >
    Image URL
  </label>

  <input
    id="imageUrl"
    type="text"
    value={imageUrl}
    onChange={(event) => setImageUrl(event.target.value)}
    placeholder="/images/toyota-corolla.jpg"
    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
  />

  <p className="mt-2 text-sm text-gray-500">
    You can still manually use /images/example.jpg or a Supabase image URL.
  </p>

  {imageUrl.trim() && (
    <div className="mt-4 overflow-hidden rounded-3xl border border-gray-100 bg-[#FAF7EF]">
      <div className="relative h-56">
        <Image
          src={imageUrl.trim()}
          alt="Competition preview"
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

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-black text-[#052E24]"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="skillQuestion"
                className="block text-sm font-black text-[#052E24]"
              >
                Skill Question
              </label>

              <input
                id="skillQuestion"
                type="text"
                value={skillQuestion}
                onChange={(event) => setSkillQuestion(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="correctAnswer"
                className="block text-sm font-black text-[#052E24]"
              >
                Correct Answer
              </label>

              <input
                id="correctAnswer"
                type="text"
                value={correctAnswer}
                onChange={(event) => setCorrectAnswer(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-black text-[#052E24]"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#D6A84F]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#FAF7EF] p-4">
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                className="h-5 w-5"
              />

              <label
                htmlFor="isFeatured"
                className="font-black text-[#052E24]"
              >
                Mark as featured competition
              </label>
            </div>
          </form>

          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <button
              type="button"
              onClick={handleUpdateCompetition}
              disabled={isSaving || isUploadingImage}
              className="rounded-full bg-[#D6A84F] px-8 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingImage
  ? "Uploading Image..."
  : isSaving
  ? "Saving..."
  : "Update Competition"}
            </button>

            <Link
              href="/admin"
              className="rounded-full border border-[#052E24] px-8 py-4 text-center font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              Cancel
            </Link>

            <Link
              href={`/competitions/${slug}`}
              className="rounded-full border border-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] transition hover:bg-[#D6A84F]"
            >
              View Public Page
            </Link>
          </div>

          <p className="mt-6 text-sm leading-6 text-gray-500">
            This page updates the Supabase competition record. If you change the
            slug, the public URL will also change.
          </p>
        </div>
      </section>
      </main>
  </AdminGuard>
  );
}