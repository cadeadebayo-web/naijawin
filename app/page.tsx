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

type Winner = {
  id: string;
  winner_name: string;
  location: string | null;
  prize: string;
  published: boolean | null;
  draw_date: string | null;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_published: boolean | null;
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

export default async function Home() {
  const { data: competitions, error: competitionsError } = await supabase
    .from("competitions")
    .select(
      "id, slug, title, category, image_url, icon, ticket_price, max_entries, entries_sold, draw_date, status, is_featured"
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  const { data: winners, error: winnersError } = await supabase
    .from("winners")
    .select("id, winner_name, location, prize, published, draw_date")
    .eq("published", true)
    .order("draw_date", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(3);

  const { data: faqs, error: faqsError } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_published")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(4);

  const activeCompetitions = (competitions || []) as Competition[];

  const featuredCompetition =
    activeCompetitions.find((item) => item.is_featured) ||
    activeCompetitions[0];

  const homepageCompetitions = activeCompetitions.slice(0, 3);
  const homepageWinners = (winners || []) as Winner[];
  const homepageFaqs = (faqs || []) as FAQ[];

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#D6A84F]">
              Nigeria&apos;s premium prize competition platform
            </p>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
              Win Cars, Cash, Gadgets & Life-Changing Prizes in Nigeria.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Enter exciting competitions from as little as ₦300. Secure local
              payments, transparent draws, verified winners and Nigeria-wide
              participation.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/competitions"
                className="rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
              >
                Browse Competitions
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-full border border-white/30 px-8 py-4 text-center font-black text-white transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
              >
                How It Works
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-black text-[#D6A84F]">Secure</p>
                <p className="text-white/70">Payments</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-black text-[#D6A84F]">Verified</p>
                <p className="text-white/70">Winners</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-black text-[#D6A84F]">Live</p>
                <p className="text-white/70">Draws</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-black text-[#D6A84F]">Nigeria</p>
                <p className="text-white/70">Wide</p>
              </div>
            </div>
          </div>

          {featuredCompetition ? (
            <div className="rounded-[2rem] bg-white p-4 shadow-2xl">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-[#052E24]">
                <Image
                  src={
                    featuredCompetition.image_url ||
                    "/images/toyota-corolla.jpg"
                  }
                  alt={featuredCompetition.title}
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

                <div className="absolute left-5 top-5 rounded-full bg-[#D6A84F] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#052E24]">
                  Featured Competition
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D6A84F] text-4xl shadow-xl">
                    {featuredCompetition.icon || "🎁"}
                  </div>

                  <h2 className="text-3xl font-black leading-tight md:text-4xl">
                    {featuredCompetition.title}
                  </h2>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-xs text-white/60">Ticket Price</p>
                      <p className="text-xl font-black text-[#D6A84F]">
                        {formatPrice(featuredCompetition.ticket_price)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-xs text-white/60">Draw Date</p>
                      <p className="text-xl font-black text-[#D6A84F]">
                        {formatShortDate(featuredCompetition.draw_date)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-xs text-white/60">Entries Sold</p>
                      <p className="text-xl font-black text-[#D6A84F]">
                        {calculateSoldPercentage(
                          featuredCompetition.entries_sold,
                          featuredCompetition.max_entries
                        )}
                        %
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-xs text-white/60">Max Entries</p>
                      <p className="text-xl font-black text-[#D6A84F]">
                        {featuredCompetition.max_entries.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#D6A84F]"
                      style={{
                        width: `${calculateSoldPercentage(
                          featuredCompetition.entries_sold,
                          featuredCompetition.max_entries
                        )}%`,
                      }}
                    />
                  </div>

                  <Link
                    href={`/competitions/${featuredCompetition.slug}`}
                    className="mt-8 block rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
                  >
                    Enter Competition
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white p-8 text-[#052E24] shadow-2xl">
              <h2 className="text-3xl font-black">
                No active competitions yet.
              </h2>

              <p className="mt-4 text-gray-600">
                Add active competitions in Supabase and they will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        id="competitions"
        className="mx-auto max-w-7xl px-5 py-16 md:py-20"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black text-[#D6A84F]">Current Competitions</p>

            <h2 className="mt-2 text-4xl font-black text-[#052E24]">
              Choose Your Prize
            </h2>
          </div>

          <Link
            href="/competitions"
            className="font-black text-[#052E24] underline underline-offset-4"
          >
            View all competitions
          </Link>
        </div>

        {competitionsError && (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {competitionsError.message}
          </div>
        )}

        {!competitionsError && homepageCompetitions.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h3 className="text-3xl font-black text-[#052E24]">
              No competitions available yet.
            </h3>

            <p className="mt-3 text-gray-600">
              Active competitions from Supabase will appear here.
            </p>
          </div>
        )}

        {!competitionsError && homepageCompetitions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {homepageCompetitions.map((competition) => {
              const soldPercentage = calculateSoldPercentage(
                competition.entries_sold,
                competition.max_entries
              );

              return (
                <article
                  key={competition.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden bg-[#052E24]">
                    <Image
                      src={competition.image_url || "/images/toyota-corolla.jpg"}
                      alt={competition.title}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#052E24]">
                      {competition.category}
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D6A84F] text-2xl">
                        {competition.icon || "🎁"}
                      </div>

                      <p className="text-xl font-black leading-tight">
                        {formatPrice(competition.ticket_price)} per entry
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="mb-3 inline-flex rounded-full bg-[#FAF7EF] px-3 py-1 text-xs font-black text-[#052E24]">
                      {competition.category}
                    </p>

                    <h3 className="text-2xl font-black leading-tight text-[#052E24]">
                      {competition.title}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">From</p>

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
                      Enter Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="how-it-works" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-black text-[#D6A84F]">Simple Process</p>

            <h2 className="mt-2 text-4xl font-black text-[#052E24]">
              How It Works
            </h2>

            <p className="mt-4 text-gray-600">
              We keep everything simple, transparent and easy to follow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              "Choose a competition",
              "Select your tickets",
              "Pay securely",
              "Watch the live draw",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-gray-100 bg-[#FAF7EF] p-6 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#052E24] text-xl font-black text-[#D6A84F]">
                  {index + 1}
                </div>

                <h3 className="text-xl font-black text-[#052E24]">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="winners" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-10 text-center">
          <p className="font-black text-[#D6A84F]">
            Real People. Real Prizes.
          </p>

          <h2 className="mt-2 text-4xl font-black text-[#052E24]">
            Recent Winners
          </h2>
        </div>

        {winnersError && (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {winnersError.message}
          </div>
        )}

        {!winnersError && homepageWinners.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h3 className="text-3xl font-black text-[#052E24]">
              No winners published yet.
            </h3>

            <p className="mt-3 text-gray-600">
              Published winners from Supabase will appear here.
            </p>
          </div>
        )}

        {!winnersError && homepageWinners.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {homepageWinners.map((winner) => (
              <article
                key={winner.id}
                className="rounded-3xl bg-white p-6 text-center shadow-lg"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#052E24] text-2xl font-black text-[#D6A84F]">
                  {winner.winner_name.charAt(0)}
                </div>

                <h3 className="text-xl font-black text-[#052E24]">
                  {winner.winner_name}
                </h3>

                <p className="mt-1 text-gray-500">
                  {winner.location || "Nigeria"}
                </p>

                <p className="mt-4 rounded-full bg-[#FAF7EF] px-4 py-2 font-bold text-[#052E24]">
                  Won {winner.prize}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/winners"
            className="inline-flex rounded-full bg-[#052E24] px-6 py-3 font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
          >
            View All Winners
          </Link>
        </div>
      </section>

      <section id="faq" className="bg-[#052E24] py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="mb-10 text-center">
            <p className="font-black text-[#D6A84F]">Questions</p>

            <h2 className="mt-2 text-4xl font-black">
              Frequently Asked Questions
            </h2>
          </div>

          {faqsError && (
            <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
              {faqsError.message}
            </div>
          )}

          {!faqsError && homepageFaqs.length === 0 && (
            <div className="rounded-3xl bg-white/10 p-6 text-center">
              <h3 className="text-2xl font-black text-[#D6A84F]">
                No FAQs published yet.
              </h3>

              <p className="mt-3 text-white/75">
                Published FAQs from Supabase will appear here.
              </p>
            </div>
          )}

          {!faqsError && homepageFaqs.length > 0 && (
            <div className="space-y-4">
              {homepageFaqs.map((faq) => (
                <div key={faq.id} className="rounded-3xl bg-white/10 p-6">
                  <h3 className="text-lg font-black text-[#D6A84F]">
                    {faq.question}
                  </h3>

                  <p className="mt-2 text-white/75">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/faq"
              className="inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-white"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#D6A84F] px-5 py-16 text-center text-[#052E24]">
        <h2 className="text-4xl font-black">
          Your next big win could start today.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg">
          Browse current competitions, choose your prize and enter securely in
          minutes.
        </p>

        <Link
          href="/competitions"
          className="mt-8 inline-flex rounded-full bg-[#052E24] px-8 py-4 font-black text-white transition hover:bg-white hover:text-[#052E24]"
        >
          Start Now
        </Link>
      </section>
    </main>
  );
}