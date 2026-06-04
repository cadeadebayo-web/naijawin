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

  return Math.round((entriesSold / maxEntries) * 100);
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

  if (error) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-16 text-white">
          <div className="mx-auto max-w-7xl">
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
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Current Competitions</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Choose a prize and enter securely from anywhere in Nigeria.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Browse live competitions for cars, cash, gadgets, lifestyle rewards,
            business support and free-entry opportunities.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        {!competitions || competitions.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-3xl font-black text-[#052E24]">
              No active competitions yet.
            </h2>

            <p className="mt-3 text-gray-600">
              Active competitions from Supabase will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {(competitions as Competition[]).map((competition) => {
              const soldPercentage = calculateSoldPercentage(
                competition.entries_sold,
                competition.max_entries
              );

              const imageUrl =
                competition.image_url || "/images/toyota-corolla.jpg";

              const icon = competition.icon || "🎁";

              return (
                <article
                  key={competition.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-60 overflow-hidden bg-[#052E24]">
                    <Image
                      src={imageUrl}
                      alt={competition.title}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#052E24]">
                      {competition.category}
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D6A84F] text-3xl">
                        {icon}
                      </div>

                      <p className="text-2xl font-black leading-tight">
                        {formatPrice(competition.ticket_price)} per entry
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="mb-3 inline-flex rounded-full bg-[#FAF7EF] px-3 py-1 text-xs font-black text-[#052E24]">
                      {competition.category}
                    </p>

                    <h2 className="text-2xl font-black leading-tight text-[#052E24]">
                      {competition.title}
                    </h2>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Ticket Price</p>
                        <p className="font-black">
                          {formatPrice(competition.ticket_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Draw Date</p>
                        <p className="font-black">
                          {formatDate(competition.draw_date)}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-gray-500">Entries</p>
                        <p className="font-black">
                          {competition.entries_sold.toLocaleString()} /{" "}
                          {competition.max_entries.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Sold</span>
                        <span className="font-bold">{soldPercentage}%</span>
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