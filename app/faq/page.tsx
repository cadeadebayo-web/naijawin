import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_published: boolean | null;
};

export default async function FAQPage() {
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_published")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Help Centre</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Frequently asked questions.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Clear answers about competitions, payments, entries and winners.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        {error && (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {error.message}
          </div>
        )}

        {!error && (!faqs || faqs.length === 0) && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              No FAQs published yet.
            </h2>

            <p className="mt-3 text-gray-600">
              Published FAQs from Supabase will appear here.
            </p>

            <Link
              href="/competitions"
              className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              View Competitions
            </Link>
          </div>
        )}

        {!error && faqs && faqs.length > 0 && (
          <div className="space-y-4">
            {(faqs as FAQ[]).map((faq) => (
              <article
                key={faq.id}
                className="rounded-3xl bg-white p-6 shadow-lg"
              >
                <h2 className="text-xl font-black text-[#052E24]">
                  {faq.question}
                </h2>

                <p className="mt-3 leading-7 text-gray-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}