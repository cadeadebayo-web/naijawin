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

  return Math.min(Math.round((entriesSold / maxEntries) * 100), 100);
}

function calculateRemaining(entriesSold: number, maxEntries: number) {
  return Math.max(maxEntries - entriesSold, 0);
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
  const secondaryCompetition = activeCompetitions.find(
    (item) => item.id !== featuredCompetition?.id
  );
  const homepageCompetitions = activeCompetitions.slice(0, 3);
  const homepageWinners = (winners || []) as Winner[];
  const homepageFaqs = (faqs || []) as FAQ[];
  const totalActiveEntries = activeCompetitions.reduce(
    (total, item) => total + item.entries_sold,
    0
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7EF] text-[#111827]">
      <section className="relative isolate overflow-hidden bg-[#052E24] text-white">
        <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-[#D6A84F]/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#D6A84F]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,168,79,0.20),transparent_34%),linear-gradient(135deg,rgba(5,46,36,0.96),rgba(3,26,21,1))]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF7EF] to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-24">
          <div>
            <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-[#D6A84F] shadow-2xl backdrop-blur">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#D6A84F] shadow-[0_0_18px_rgba(214,168,79,0.9)]" />
              Nigeria&apos;s premium prize competition platform
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Big prizes.
              <span className="block text-[#D6A84F]">Clear draws.</span>
              Real winners.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              Enter exciting Nigerian prize competitions for cars, cash,
              gadgets and lifestyle rewards. Pay securely, track your tickets
              and follow transparent winner announcements.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/competitions"
                className="group rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] shadow-[0_18px_40px_rgba(214,168,79,0.28)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Browse Competitions
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-full border border-white/25 bg-white/10 px-8 py-4 text-center font-black text-white backdrop-blur transition hover:border-[#D6A84F] hover:bg-white hover:text-[#052E24]"
              >
                How It Works
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Paystack", "Secure checkout"],
                ["Verified", "Winners"],
                ["Live", "Draw updates"],
                ["Nigeria", "Wide entry"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
                >
                  <p className="font-black text-[#D6A84F]">{title}</p>
                  <p className="mt-1 text-white/70">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {featuredCompetition ? (
            <div className="relative">
              <div className="absolute -left-6 top-8 z-10 hidden rotate-[-7deg] rounded-3xl border border-white/15 bg-white/15 px-5 py-4 shadow-2xl backdrop-blur md:block">
                <p className="text-xs font-bold text-white/70">Tickets sold</p>
                <p className="text-3xl font-black text-[#D6A84F]">
                  {calculateSoldPercentage(
                    featuredCompetition.entries_sold,
                    featuredCompetition.max_entries
                  )}
                  %
                </p>
              </div>

              <div className="absolute -right-4 bottom-10 z-10 hidden rounded-3xl border border-white/15 bg-white/15 px-5 py-4 shadow-2xl backdrop-blur md:block">
                <p className="text-xs font-bold text-white/70">From</p>
                <p className="text-2xl font-black text-[#D6A84F]">
                  {formatPrice(featuredCompetition.ticket_price)}
                </p>
              </div>

              <div className="rounded-[2.25rem] border border-white/20 bg-white/15 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
                <div className="relative min-h-[540px] overflow-hidden rounded-[1.75rem] bg-[#052E24]">
                  <Image
                    src={
                      featuredCompetition.image_url ||
                      "/images/toyota-corolla.png"
                    }
                    alt={featuredCompetition.title}
                    fill
                    priority
                    className="object-cover scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/5" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#052E24]/80 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#D6A84F] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#052E24] shadow-xl">
                      Featured
                    </span>
                    <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#052E24] shadow-xl">
                      {featuredCompetition.category}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D6A84F] text-4xl shadow-2xl">
                      {featuredCompetition.icon || "🎁"}
                    </div>

                    <h2 className="max-w-xl text-3xl font-black leading-tight md:text-5xl">
                      {featuredCompetition.title}
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {[
                        [
                          "Ticket Price",
                          formatPrice(featuredCompetition.ticket_price),
                        ],
                        [
                          "Draw Date",
                          formatShortDate(featuredCompetition.draw_date),
                        ],
                        [
                          "Remaining",
                          calculateRemaining(
                            featuredCompetition.entries_sold,
                            featuredCompetition.max_entries
                          ).toLocaleString(),
                        ],
                        [
                          "Max Entries",
                          featuredCompetition.max_entries.toLocaleString(),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-white/15 p-4 backdrop-blur"
                        >
                          <p className="text-xs font-bold text-white/60">
                            {label}
                          </p>
                          <p className="mt-1 text-xl font-black text-[#D6A84F]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-xs font-bold text-white/75">
                        <span>Competition progress</span>
                        <span>
                          {calculateSoldPercentage(
                            featuredCompetition.entries_sold,
                            featuredCompetition.max_entries
                          )}
                          % sold
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-[#D6A84F] shadow-[0_0_24px_rgba(214,168,79,0.65)]"
                          style={{
                            width: `${calculateSoldPercentage(
                              featuredCompetition.entries_sold,
                              featuredCompetition.max_entries
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/competitions/${featuredCompetition.slug}`}
                      className="mt-8 block rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] shadow-xl transition hover:bg-white"
                    >
                      Enter Featured Competition
                    </Link>
                  </div>
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

      <section className="relative -mt-12 z-10 mx-auto max-w-7xl px-5">
        <div className="grid gap-4 rounded-[2rem] border border-white bg-white/90 p-5 shadow-2xl backdrop-blur md:grid-cols-4">
          {[
            [activeCompetitions.length.toLocaleString(), "Live competitions"],
            [totalActiveEntries.toLocaleString(), "Entries placed"],
            [homepageWinners.length.toLocaleString(), "Published winners"],
            ["24/7", "Online entry"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl bg-[#FAF7EF] p-5">
              <p className="text-3xl font-black text-[#052E24]">{value}</p>
              <p className="mt-1 text-sm font-bold text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="competitions"
        className="mx-auto max-w-7xl px-5 py-16 md:py-24"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black text-[#D6A84F]">Current Competitions</p>

            <h2 className="mt-2 text-4xl font-black tracking-tight text-[#052E24] md:text-5xl">
              Choose Your Prize
            </h2>
            <p className="mt-3 max-w-2xl text-gray-600">
              Premium prize cards, clear entry costs and visible progress so
              users know exactly what they are entering.
            </p>
          </div>

          <Link
            href="/competitions"
            className="inline-flex rounded-full bg-[#052E24] px-6 py-3 font-black text-white shadow-lg transition hover:bg-[#D6A84F] hover:text-[#052E24]"
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
                  className="group overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative h-64 overflow-hidden bg-[#052E24]">
                    <Image
                      src={competition.image_url || "/images/toyota-corolla.png"}
                      alt={competition.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#052E24] shadow-lg">
                      {competition.category}
                    </div>

                    <div className="absolute right-5 top-5 rounded-full bg-[#D6A84F] px-3 py-1 text-xs font-black text-[#052E24] shadow-lg">
                      {formatPrice(competition.ticket_price)}
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6A84F] text-2xl shadow-xl">
                        {competition.icon || "🎁"}
                      </div>

                      <p className="text-xl font-black leading-tight">
                        {formatPrice(competition.ticket_price)} per entry
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-black leading-tight text-[#052E24]">
                      {competition.title}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Draw Date</p>
                        <p className="font-black text-[#052E24]">
                          {formatDate(competition.draw_date)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#FAF7EF] p-4">
                        <p className="text-gray-500">Remaining</p>
                        <p className="font-black text-[#052E24]">
                          {calculateRemaining(
                            competition.entries_sold,
                            competition.max_entries
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold text-[#052E24]">
                        <span>Sold</span>
                        <span>{soldPercentage}%</span>
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

      <section id="how-it-works" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-black text-[#D6A84F]">Simple Process</p>

            <h2 className="mt-2 text-4xl font-black text-[#052E24] md:text-5xl">
              Enter in minutes
            </h2>

            <p className="mt-4 text-gray-600">
              The experience is designed to be simple, secure and easy to
              follow on mobile or desktop.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["Choose", "Pick a live competition and review the prize."],
              ["Answer", "Answer the skill question and select tickets."],
              ["Pay", "Use Paystack or manual transfer options."],
              ["Track", "See tickets and payment status in My Entries."],
            ].map(([step, text], index) => (
              <div
                key={step}
                className="rounded-[2rem] border border-gray-100 bg-[#FAF7EF] p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#052E24] text-xl font-black text-[#D6A84F] shadow-lg">
                  {index + 1}
                </div>

                <h3 className="text-xl font-black text-[#052E24]">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="winners" className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="mb-10 text-center">
          <p className="font-black text-[#D6A84F]">
            Real People. Real Prizes.
          </p>

          <h2 className="mt-2 text-4xl font-black text-[#052E24] md:text-5xl">
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
                className="rounded-[2rem] bg-white p-6 text-center shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#052E24] text-3xl font-black text-[#D6A84F] shadow-lg">
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

      <section id="faq" className="relative overflow-hidden bg-[#052E24] py-16 text-white md:py-24">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#D6A84F]/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5">
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
                <div
                  key={faq.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur"
                >
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
        <div className="mx-auto max-w-4xl">
          <p className="font-black uppercase tracking-[0.3em] text-[#052E24]/70">
            Ready to play?
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Your next big win could start today.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Browse current competitions, choose your prize and enter securely in
            minutes.
          </p>

          <Link
            href="/competitions"
            className="mt-8 inline-flex rounded-full bg-[#052E24] px-8 py-4 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-[#052E24]"
          >
            Start Now
          </Link>
        </div>
      </section>
    </main>
  );
}
