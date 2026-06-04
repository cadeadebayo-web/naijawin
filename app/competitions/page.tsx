import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Competition = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url: string | null;
  icon: string | null;
  ticket_price: number;
  max_entries: number;
  entries_sold: number;
  draw_date: string | null;
  status: string | null;
  is_featured: boolean | null;
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

function calculateSoldPercentage(entriesSold: number, maxEntries: number) {
  if (!maxEntries || maxEntries <= 0) {
    return 0;
  }

  return Math.min(Math.round((entriesSold / maxEntries) * 100), 100);
}

function calculateRemaining(entriesSold: number, maxEntries: number) {
  return Math.max(maxEntries - entriesSold, 0);
}

export default async function CompetitionsPage() {
  const { data: competitions, error } = await supabase
    .from("competitions")
    .select(
      "id, slug, title, category, image_url, icon, ticket_price, max_entries, entries_sold, draw_date, status, is_featured"
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  const liveCompetitions = (competitions || []) as Competition[];

  if (error) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="relative overflow-hidden bg-[#052E24] px-5 py-16 text-white md:py-20">
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#D6A84F]/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <p className="font-black text-[#D6A84F]">Current Competitions</p>

            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              We could not load competitions.
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-white/75">
              Please check your Supabase connection and table permissions.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {error.message}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7EF] text-[#111827]">
      <section className="relative overflow-hidden bg-[#052E24] px-5 py-16 text-white md:py-24">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#D6A84F]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#D6A84F]/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 font-black text-[#D6A84F] backdrop-blur">
            Current Competitions
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-7xl">
            Choose a prize and enter securely from anywhere in Nigeria.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Browse live competitions for cars, cash, gadgets, lifestyle rewards,
            business support and free-entry opportunities.
          </p>

          <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              [liveCompetitions.length.toLocaleString(), "Live prizes"],
              ["Paystack", "Secure payments"],
              ["Instant", "Ticket tracking"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
              >
                <p className="text-3xl font-black text-[#D6A84F]">{value}</p>
                <p className="mt-1 text-sm font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        {!liveCompetitions || liveCompetitions.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              No active competitions yet.
            </h2>

            <p className="mt-3 text-gray-600">
              Active competitions from Supabase will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {liveCompetitions.map((competition) => {
              const soldPercentage = calculateSoldPercentage(
                competition.entries_sold,
                competition.max_entries
              );
              const remainingEntries = calculateRemaining(
                competition.entries_sold,
                competition.max_entries
              );
              const imageUrl =
                competition.image_url || "/images/toyota-corolla.png";
              const icon = competition.icon || "🎁";

              return (
                <article
                  key={competition.id}
                  className="group overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative h-72 overflow-hidden bg-[#052E24]">
                    <Image
                      src={imageUrl}
                      alt={competition.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#052E24] shadow-lg">
                        {competition.category}
                      </span>

                      {competition.is_featured && (
                        <span className="rounded-full bg-[#D6A84F] px-3 py-1 text-xs font-black text-[#052E24] shadow-lg">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute right-5 top-5 rounded-full bg-[#D6A84F] px-4 py-2 text-sm font-black text-[#052E24] shadow-lg">
                      {formatPrice(competition.ticket_price)}
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6A84F] text-3xl shadow-xl">
                        {icon}
                      </div>

                      <h2 className="text-3xl font-black leading-tight">
                        {competition.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Ticket Price</p>
                        <p className="font-black text-[#052E24]">
                          {formatPrice(competition.ticket_price)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Draw Date</p>
                        <p className="font-black text-[#052E24]">
                          {formatDate(competition.draw_date)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Sold</p>
                        <p className="font-black text-[#052E24]">
                          {competition.entries_sold.toLocaleString()} /{" "}
                          {competition.max_entries.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Remaining</p>
                        <p className="font-black text-[#052E24]">
                          {remainingEntries.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold text-[#052E24]">
                        <span>Progress</span>
                        <span>{soldPercentage}% sold</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#D6A84F]"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/competitions/${competition.slug}`}
                      className="mt-6 block rounded-full bg-[#052E24] px-6 py-3 text-center font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                    >
                      View Competition
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
