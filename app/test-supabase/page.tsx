import { supabase } from "@/lib/supabase";

export default async function TestSupabasePage() {
  const { data, error } = await supabase
    .from("competitions")
    .select("id, title, slug, category, ticket_price, status")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-5 py-16 text-[#111827]">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black text-[#052E24]">
          Supabase Connection Test
        </h1>

        {error && (
          <pre className="mt-6 overflow-auto rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {error.message}
          </pre>
        )}

        {!error && (
          <div className="mt-6 space-y-4">
            {data?.map((competition) => (
              <div
                key={competition.id}
                className="rounded-2xl bg-[#FAF7EF] p-5"
              >
                <p className="text-xl font-black text-[#052E24]">
                  {competition.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {competition.category} — {competition.slug} — ₦
                  {competition.ticket_price}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}