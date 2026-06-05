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
  const featuredSoldPercentage = featuredCompetition
    ? calculateSoldPercentage(
        featuredCompetition.entries_sold,
        featuredCompetition.max_entries
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="relative overflow-hidden bg-[#052E24] text-white">
        <div className="absolute inset-0 opacity-95">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#D6A84F]/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#D6A84F]/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-[1.02fr_0.98fr] md:py-24">
          <div className="relative z-10 order-2 md:order-1">
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-[#D6A84F] backdrop-blur">
              Nigeria&apos;s premium prize competition platform
            </p>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
              Win Cars, Cash, Gadgets & Life-Changing Prizes.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Enter exciting competitions from as little as ₦300. Secure local
              payments, transparent draws, verified winners and Nigeria-wide
              participation.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/competitions"
                className="rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] shadow-[0_16px_35px_rgba(214,168,79,0.24)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Browse Competitions
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-full border border-white/30 bg-white/5 px-8 py-4 text-center font-black text-white transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
              >
                How It Works
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-black text-[#D6A84F]">Secure</p>
                <p className="text-white/70">Payments</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-black text-[#D6A84F]">Verified</p>
                <p className="text-white/70">Winners</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-black text-[#D6A84F]">Live</p>
                <p className="text-white/70">Draws</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-black text-[#D6A84F]">Nigeria</p>
                <p className="text-white/70">Wide</p>
              </div>
            </div>
          </div>

          {featuredCompetition ? (
            <div className="relative z-10 order-1 rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-sm md:order-2">
              <div className="relative min-h-[470px] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#063629_0%,#052E24_58%,#0A4535_100%)] p-5 md:min-h-[510px] md:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(214,168,79,0.42),transparent_27%),radial-gradient(circle_at_60%_74%,rgba(255,255,255,0.12),transparent_30%)]" />
                <div className="naijawin-glow absolute -right-12 top-10 h-72 w-72 rounded-full bg-[#D6A84F]/22 blur-3xl" />
                <div className="absolute right-8 top-12 h-28 w-28 rounded-full border border-dashed border-[#D6A84F]/35" />
                <div className="naijawin-pop-1 absolute right-24 top-12 text-5xl text-[#D6A84F] drop-shadow-lg">
                  ✦
                </div>
                <div className="naijawin-pop-2 absolute right-12 top-28 h-7 w-7 rounded-full bg-[#D6A84F] shadow-lg" />
                <div className="naijawin-speed-line absolute left-8 top-28 h-4 w-20 rotate-[-18deg] rounded-full bg-white/20" />
                <div className="naijawin-speed-line absolute left-16 top-40 h-3 w-28 rotate-[-12deg] rounded-full bg-[#D6A84F]/35" />

                <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
                  <div className="rounded-full bg-[#D6A84F] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#052E24] shadow-lg">
                    Featured Competition
                  </div>

                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                    {featuredSoldPercentage}% Sold
                  </div>
                </div>

                <div className="absolute inset-x-5 bottom-5 top-20 z-20 overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#052E24]/25 shadow-[0_28px_90px_rgba(0,0,0,0.3)] md:inset-x-6 md:bottom-6 md:top-20">
                  <div className="naijawin-feature-car-panel absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_46%,rgba(255,255,255,0.18),transparent_33%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent)]" />
                    <div className="absolute left-5 top-5 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                      Prize Reveal
                    </div>
                    <div className="absolute bottom-5 left-5 rounded-2xl bg-[#D6A84F] px-5 py-3 text-[#052E24] shadow-xl">
                      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-75">
                        From
                      </p>
                      <p className="text-2xl font-black">
                        {formatPrice(featuredCompetition.ticket_price)}
                      </p>
                    </div>

                    <div className="naijawin-car-splash absolute inset-x-[-18%] bottom-8 top-5 md:inset-x-[-22%] md:bottom-2 md:top-0">
                      <Image
                        src={
                          featuredCompetition.image_url ||
                          "/images/toyota-corolla.png"
                        }
                        alt={featuredCompetition.title}
                        fill
                        priority
                        className="object-contain object-center drop-shadow-[0_34px_52px_rgba(0,0,0,0.58)]"
                      />
                    </div>
                  </div>

                  <div className="naijawin-feature-info-panel absolute inset-0 flex items-center justify-center p-4 md:p-6">
                    <div className="h-full w-full rounded-[1.45rem] border border-white/50 bg-white/95 p-5 text-[#052E24] shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex rounded-full bg-[#052E24]/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#052E24]">
                          {featuredCompetition.category}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#D6A84F]/15 px-3 py-1 text-xs font-black text-[#052E24]">
                          <span>{featuredCompetition.icon || "🎁"}</span>
                          <span>{formatPrice(featuredCompetition.ticket_price)}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-black leading-tight text-[#052E24] md:text-[1.8rem]">
                        {featuredCompetition.title}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-gray-600 md:text-sm md:leading-6">
                        Transparent draw, verified winner announcement and secure
                        local payment options.
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl bg-[#FAF7EF] p-3">
                          <p className="text-gray-500">Draw Date</p>
                          <p className="mt-1 font-black text-[#052E24]">
                            {formatShortDate(featuredCompetition.draw_date)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FAF7EF] p-3">
                          <p className="text-gray-500">Max Entries</p>
                          <p className="mt-1 font-black text-[#052E24]">
                            {featuredCompetition.max_entries.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs text-gray-600">
                          <span>Entries sold</span>
                          <span className="font-black text-[#052E24]">
                            {featuredSoldPercentage}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E2D4]">
                          <div
                            className="h-full rounded-full bg-[#D6A84F]"
                            style={{
                              width: `${featuredSoldPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/competitions/${featuredCompetition.slug}`}
                        className="mt-4 block rounded-full bg-[#052E24] px-6 py-3 text-center text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                      >
                        Enter Competition
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-1 rounded-[2rem] bg-white p-8 text-[#052E24] shadow-2xl md:order-2">
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
                      src={competition.image_url || "/images/toyota-corolla.png"}
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