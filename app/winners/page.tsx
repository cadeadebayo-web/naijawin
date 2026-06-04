import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Winner = {
  id: string;
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

export default async function WinnersPage() {
    const { data: winners, error } = await supabase
    .from("winners")
    .select(
      "id, winner_name, location, prize, image_url, published, draw_date, created_at"
    )
    .eq("published", true)
    .order("draw_date", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Verified Winners</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Real winners from across Nigeria.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Winner results are published here after completed draws.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        {error && (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {error.message}
          </div>
        )}

        {!error && (!winners || winners.length === 0) && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              No winners published yet.
            </h2>

            <p className="mt-3 text-gray-600">
              Published winners from Supabase will appear here after draws are
              completed.
            </p>

            <Link
              href="/competitions"
              className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              View Competitions
            </Link>
          </div>
        )}

        {!error && winners && winners.length > 0 && (
          <div className="grid gap-6 md:grid-cols-4">
            {(winners as Winner[]).map((winner) => (
              <article
                key={winner.id}
                className="overflow-hidden rounded-3xl bg-white text-center shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="bg-[#052E24] p-8 text-white">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#D6A84F] text-3xl font-black text-[#052E24] shadow-xl">
                    {winner.winner_name.charAt(0)}
                  </div>

                  <p className="mt-5 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-[#D6A84F]">
                    Verified Winner
                  </p>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-black text-[#052E24]">
                    {winner.winner_name}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {winner.location || "Nigeria"}
                  </p>

                  <p className="mt-4 rounded-2xl bg-[#FAF7EF] px-4 py-3 font-bold text-[#052E24]">
                    Won {winner.prize}
                  </p>

                  <p className="mt-4 text-sm font-bold text-gray-500">
                    Draw Date: {formatDate(winner.draw_date)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}