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

function getCuratedCompetitions(competitions: Competition[], limit: number) {
  const curated: Competition[] = [];
  const usedCategories = new Set<string>();

  competitions.forEach((competition) => {
    const categoryKey = competition.category.toLowerCase().trim();

    if (!usedCategories.has(categoryKey) && curated.length < limit) {
      curated.push(competition);
      usedCategories.add(categoryKey);
    }
  });

  competitions.forEach((competition) => {
    if (
      curated.length < limit &&
      !curated.some((item) => item.id === competition.id)
    ) {
      curated.push(competition);
    }
  });

  return curated.slice(0, limit);
}

function getPrizeEmoji(category: string, title: string) {
  const prizeText = `${category} ${title}`.toLowerCase();

  if (prizeText.includes("car") || prizeText.includes("toyota")) {
    return "🚗";
  }

  if (prizeText.includes("house") || prizeText.includes("home")) {
    return "🏠";
  }

  if (prizeText.includes("cash") || prizeText.includes("money")) {
    return "💰";
  }

  if (
    prizeText.includes("phone") ||
    prizeText.includes("iphone") ||
    prizeText.includes("gadget") ||
    prizeText.includes("electronics")
  ) {
    return "📱";
  }

  if (prizeText.includes("holiday") || prizeText.includes("travel")) {
    return "✈️";
  }

  return "🎁";
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

  const mobileHeroCandidateMap = new Map<string, Competition>();

  [
    ...activeCompetitions.filter((item) => item.is_featured).slice(0, 2),
    ...activeCompetitions.slice(-2),
    ...activeCompetitions,
  ].forEach((competition) => {
    mobileHeroCandidateMap.set(competition.id, competition);
  });

  const mobileHeroShowcaseBase = Array.from(
    mobileHeroCandidateMap.values()
  ).slice(0, 4);

  const mobileHeroShowcase = mobileHeroShowcaseBase.length
    ? Array.from(
        { length: 4 },
        (_, index) =>
          mobileHeroShowcaseBase[index % mobileHeroShowcaseBase.length]
      )
    : [];

  const mobileDiscoveryCompetitions = getCuratedCompetitions(
    activeCompetitions,
    4
  );

  const mobileTopPrizeCompetitions = getCuratedCompetitions(
    activeCompetitions.filter((competition) => competition.ticket_price >= 700),
    4
  );

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="relative overflow-hidden bg-[#052E24] text-white">
        <div className="absolute inset-0 opacity-95">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#D6A84F]/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#D6A84F]/10 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 pb-8 pt-6 md:hidden">
          {mobileHeroShowcase.length > 0 ? (
            <div className="naijawin-mobile-hero-card relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(155deg,#063729_0%,#052E24_48%,#0D4C39_100%)] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(214,168,79,0.44),transparent_28%),radial-gradient(circle_at_12%_86%,rgba(255,255,255,0.14),transparent_32%)]" />
              <div className="naijawin-mobile-light-streak absolute -left-20 top-10 h-16 w-[150%] -rotate-12 bg-white/10 blur-xl" />
              <div className="absolute -right-16 top-24 h-40 w-40 rounded-full bg-[#D6A84F]/25 blur-3xl" />
              <div className="absolute -bottom-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#D6A84F]/15 blur-3xl" />

              <div className="relative z-30 flex items-center justify-between gap-3">
                <div className="rounded-full bg-[#D6A84F] px-4 py-2 text-[10px] font-black uppercase tracking-[0.23em] text-[#052E24] shadow-[0_14px_34px_rgba(214,168,79,0.32)]">
                  Prize Showcase
                </div>

                <div className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">
                  Win Big Today
                </div>
              </div>


              <div className="relative z-10 mt-5 min-h-[465px] overflow-hidden rounded-[2rem] border border-[#D6A84F]/18 bg-[#052E24]/35 p-3 shadow-inner">
                {mobileHeroShowcase.map((competition, index) => {
                  const soldPercentage = calculateSoldPercentage(
                    competition.entries_sold,
                    competition.max_entries
                  );

                  return (
                    <article
                      key={`${competition.id}-${index}`}
                      className="naijawin-mobile-showcase-slide absolute inset-3 overflow-hidden rounded-[1.65rem] border border-white/15 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.24),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]"
                      style={{ animationDelay: `${index * 4}s` }}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#052E24] via-[#052E24]/88 to-transparent" />
                      <div className="absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full border border-dashed border-[#D6A84F]/28" />
                      <div className="naijawin-pop-1 absolute right-8 top-10 text-5xl text-[#D6A84F] drop-shadow-lg">
                        ✦
                      </div>
                      <div className="naijawin-pop-2 absolute left-8 top-16 h-6 w-6 rounded-full bg-[#D6A84F]/80 shadow-lg" />

                      <div className="relative z-20 flex items-center justify-between gap-3 p-4">
                        <span className="rounded-full bg-[#D6A84F] px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#052E24]">
                          {competition.category}
                        </span>

                        <span className="rounded-full bg-white/12 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                          {soldPercentage}% Sold
                        </span>
                      </div>

                      <div className="naijawin-car-splash absolute inset-x-[-11%] top-12 h-[255px]">
                        <Image
                          src={
                            competition.image_url ||
                            "/images/toyota-corolla.png"
                          }
                          alt={competition.title}
                          fill
                          priority={index === 0}
                          sizes="100vw"
                          className="object-contain object-center drop-shadow-[0_34px_54px_rgba(0,0,0,0.58)]"
                        />
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-30 rounded-[1.35rem] border border-white/14 bg-white/95 p-4 text-[#052E24] shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-2xl">
                            {getPrizeEmoji(competition.category, competition.title)}
                          </span>
                          <span className="rounded-full bg-[#D6A84F]/18 px-3 py-1 text-xs font-black">
                            {formatPrice(competition.ticket_price)}
                          </span>
                        </div>

                        <h2 className="line-clamp-2 text-xl font-black leading-tight text-[#052E24]">
                          {competition.title}
                        </h2>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-2xl bg-[#FAF7EF] px-3 py-2">
                            <p className="text-gray-500">Draw</p>
                            <p className="font-black text-[#052E24]">
                              {formatShortDate(competition.draw_date)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#FAF7EF] px-3 py-2">
                            <p className="text-gray-500">Entries</p>
                            <p className="font-black text-[#052E24]">
                              {competition.max_entries.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/competitions/${competition.slug}`}
                          className="naijawin-mobile-shimmer mt-3 block rounded-full px-5 py-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-[#052E24] shadow-[0_18px_42px_rgba(214,168,79,0.42)] transition active:scale-[0.98]"
                        >
                          Your Chance To Win
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="relative z-30 mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-2 py-3 backdrop-blur">
                  <p className="font-black text-[#D6A84F]">Secure</p>
                  <p className="mt-0.5 text-white/65">Payments</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-2 py-3 backdrop-blur">
                  <p className="font-black text-[#D6A84F]">Verified</p>
                  <p className="mt-0.5 text-white/65">Winners</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-2 py-3 backdrop-blur">
                  <p className="font-black text-[#D6A84F]">Live</p>
                  <p className="mt-0.5 text-white/65">Draws</p>
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

          <div className="mt-7">
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-[#D6A84F] backdrop-blur">
              Nigeria&apos;s premium prize competition platform
            </p>

            <h1 className="text-[2.6rem] font-black leading-[1.03] tracking-tight text-white">
              Win Cars, Cash, Homes & Dream Prizes.
            </h1>

            <p className="mt-4 text-base leading-7 text-white/80">
              Explore multiple prize categories, enter securely, and follow
              transparent winner announcements.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/competitions"
                className="rounded-full bg-[#D6A84F] px-5 py-4 text-center text-sm font-black text-[#052E24] shadow-[0_16px_35px_rgba(214,168,79,0.24)] transition active:scale-[0.98]"
              >
                Browse Prizes
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-full border border-white/30 bg-white/5 px-5 py-4 text-center text-sm font-black text-white transition active:scale-[0.98]"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl items-center gap-10 px-5 py-10 md:grid md:grid-cols-[1.02fr_0.98fr] md:py-24">
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
            <div className="naijawin-mobile-prize-stage relative z-10 order-1 rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-sm md:order-2">
              <div className="relative min-h-[500px] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#063629_0%,#052E24_58%,#0A4535_100%)] p-5 md:min-h-[510px] md:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(214,168,79,0.42),transparent_27%),radial-gradient(circle_at_60%_74%,rgba(255,255,255,0.12),transparent_30%)]" />
                <div className="naijawin-glow absolute -right-12 top-10 h-72 w-72 rounded-full bg-[#D6A84F]/22 blur-3xl" />
                <div className="absolute right-8 top-10 h-24 w-24 rounded-full border border-dashed border-[#D6A84F]/35" />
                <div className="naijawin-pop-1 absolute right-24 top-10 text-5xl text-[#D6A84F] drop-shadow-lg">
                  ✦
                </div>
                <div className="naijawin-pop-2 absolute right-12 top-24 h-7 w-7 rounded-full bg-[#D6A84F] shadow-lg" />
                <div className="naijawin-speed-line absolute left-8 top-24 h-4 w-20 rotate-[-18deg] rounded-full bg-white/20" />
                <div className="naijawin-speed-line absolute left-16 top-[8.5rem] h-3 w-28 rotate-[-12deg] rounded-full bg-[#D6A84F]/35" />

                <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
                  <div className="rounded-full bg-[#D6A84F] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#052E24] shadow-lg">
                    Featured Competition
                  </div>

                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                    {featuredSoldPercentage}% Sold
                  </div>
                </div>

                <div className="absolute inset-x-4 bottom-4 top-[4.75rem] z-20 overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#052E24]/25 shadow-[0_28px_90px_rgba(0,0,0,0.3)] md:inset-x-6 md:bottom-6 md:top-20">
                  <div className="naijawin-feature-car-panel absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_46%,rgba(255,255,255,0.18),transparent_33%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#052E24] via-[#052E24]/88 to-transparent md:hidden" />
                    <div className="absolute bottom-16 left-1/2 z-10 h-20 w-[78%] -translate-x-1/2 rounded-full bg-[#D6A84F]/18 blur-2xl md:hidden" />
                    <div className="absolute left-6 top-24 z-10 h-3 w-20 -rotate-12 rounded-full bg-white/18 md:hidden" />
                    <div className="absolute right-8 top-28 z-10 h-4 w-16 rotate-12 rounded-full bg-[#D6A84F]/30 md:hidden" />
                    <div className="hidden rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur md:absolute md:left-5 md:top-5 md:block">
                      Prize Reveal
                    </div>
                    <div className="hidden rounded-2xl bg-[#D6A84F] px-5 py-3 text-[#052E24] shadow-xl md:absolute md:bottom-5 md:left-5 md:block">
                      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-75">
                        From
                      </p>
                      <p className="text-2xl font-black">
                        {formatPrice(featuredCompetition.ticket_price)}
                      </p>
                    </div>

                    <div className="naijawin-car-splash absolute inset-x-[-18%] bottom-20 top-20 z-20 md:inset-x-[-22%] md:bottom-2 md:top-0">
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

                    <div className="absolute bottom-4 left-4 right-4 z-40 md:hidden">
                      <div className="naijawin-chance-pulse mx-auto flex max-w-[310px] items-center justify-center rounded-full bg-[#D6A84F] px-5 py-3 text-center text-[11px] font-black uppercase tracking-[0.24em] text-[#052E24] shadow-[0_18px_42px_rgba(214,168,79,0.42)]">
                        Your Chance To Win
                      </div>
                      <div className="mx-auto mt-2 h-1.5 max-w-[180px] overflow-hidden rounded-full bg-white/12">
                        <div className="h-full w-2/3 rounded-full bg-[#D6A84F]" />
                      </div>
                    </div>
                  </div>

                  <div className="naijawin-feature-info-panel absolute inset-0 flex items-center justify-center p-3 md:p-6">
                    <div className="flex h-full w-full flex-col justify-between rounded-[1.45rem] border border-white/50 bg-white/95 p-4 text-[#052E24] shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl md:block md:p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex rounded-full bg-[#052E24]/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#052E24]">
                          {featuredCompetition.category}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#D6A84F]/15 px-3 py-1 text-xs font-black text-[#052E24]">
                          <span>{featuredCompetition.icon || "🎁"}</span>
                          <span>{formatPrice(featuredCompetition.ticket_price)}</span>
                        </div>
                      </div>

                      <h2 className="text-xl font-black leading-tight text-[#052E24] md:text-[1.8rem]">
                        {featuredCompetition.title}
                      </h2>

                      <p className="mt-1 text-[11px] leading-5 text-gray-600 md:mt-2 md:text-sm md:leading-6">
                        Transparent draw, verified winner announcement and secure
                        local payment options.
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] md:mt-4 md:text-xs">
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

                      <div className="mt-3 md:mt-4">
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
                        className="mt-3 block rounded-full bg-[#052E24] px-5 py-2.5 text-center text-xs font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24] md:mt-4 md:px-6 md:py-3 md:text-sm"
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

      <section className="bg-[#FAF7EF] px-4 py-10 md:hidden">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-black text-[#D6A84F]">Enter Now & Win</p>
            <h2 className="mt-1 text-3xl font-black leading-tight text-[#052E24]">
              Win Life-Changing Prizes
            </h2>
          </div>

          <Link
            href="/competitions"
            className="shrink-0 rounded-full bg-[#052E24] px-4 py-2 text-xs font-black text-white"
          >
            View All
          </Link>
        </div>

        {competitionsError && (
          <div className="rounded-3xl bg-red-50 p-5 text-sm font-bold text-red-700">
            {competitionsError.message}
          </div>
        )}

        {!competitionsError && mobileDiscoveryCompetitions.length > 0 && (
          <div className="grid gap-4">
            {mobileDiscoveryCompetitions.map((competition) => {
              const soldPercentage = calculateSoldPercentage(
                competition.entries_sold,
                competition.max_entries
              );

              return (
                <article
                  key={competition.id}
                  className="overflow-hidden rounded-[1.8rem] border border-white bg-white shadow-[0_18px_45px_rgba(5,46,36,0.12)]"
                >
                  <div className="relative h-48 overflow-hidden bg-[#052E24]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(214,168,79,0.28),transparent_32%)]" />
                    <Image
                      src={competition.image_url || "/images/toyota-corolla.png"}
                      alt={competition.title}
                      fill
                      sizes="100vw"
                      className="object-contain object-center p-3 drop-shadow-[0_22px_38px_rgba(0,0,0,0.34)]"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-[#D6A84F] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#052E24]">
                      {competition.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-2xl">
                        {getPrizeEmoji(competition.category, competition.title)}
                      </span>
                      <span className="rounded-full bg-[#FAF7EF] px-3 py-1.5 text-xs font-black text-[#052E24]">
                        {formatPrice(competition.ticket_price)} per entry
                      </span>
                    </div>

                    <h3 className="text-xl font-black leading-tight text-[#052E24]">
                      {competition.title}
                    </h3>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs text-gray-500">
                        <span>Sold</span>
                        <span className="font-black text-[#052E24]">
                          {soldPercentage}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E2D4]">
                        <div
                          className="h-full rounded-full bg-[#D6A84F]"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/competitions/${competition.slug}`}
                      className="mt-5 block rounded-full bg-[#052E24] px-5 py-3.5 text-center text-sm font-black text-white transition active:scale-[0.98]"
                    >
                      Enter Competition
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white px-4 py-10 md:hidden">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-black text-[#D6A84F]">Curated High-Value Picks</p>
            <h2 className="mt-1 text-3xl font-black leading-tight text-[#052E24]">
              Browse Top Prizes
            </h2>
          </div>

          <Link
            href="/competitions"
            className="shrink-0 rounded-full border border-[#052E24]/15 px-4 py-2 text-xs font-black text-[#052E24]"
          >
            View All
          </Link>
        </div>

        {!competitionsError && mobileTopPrizeCompetitions.length === 0 && (
          <div className="rounded-3xl bg-[#FAF7EF] p-6 text-center">
            <h3 className="text-2xl font-black text-[#052E24]">
              Top prizes coming soon.
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Competitions from ₦700 and above will appear here.
            </p>
          </div>
        )}

        {!competitionsError && mobileTopPrizeCompetitions.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mobileTopPrizeCompetitions.map((competition) => (
              <article
                key={competition.id}
                className="min-w-[78%] overflow-hidden rounded-[1.75rem] bg-[#052E24] text-white shadow-[0_18px_42px_rgba(5,46,36,0.22)]"
              >
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(214,168,79,0.34),transparent_35%)]" />
                  <Image
                    src={competition.image_url || "/images/toyota-corolla.png"}
                    alt={competition.title}
                    fill
                    sizes="80vw"
                    className="object-contain object-center p-3 drop-shadow-[0_20px_35px_rgba(0,0,0,0.42)] transition duration-300"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[#D6A84F] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#052E24]">
                    Top Prize
                  </div>
                </div>

                <div className="p-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#D6A84F]">
                    {competition.category}
                  </p>
                  <h3 className="line-clamp-2 text-xl font-black leading-tight">
                    {competition.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black">
                      {formatPrice(competition.ticket_price)}
                    </span>
                    <Link
                      href={`/competitions/${competition.slug}`}
                      className="rounded-full bg-[#D6A84F] px-4 py-2 text-xs font-black text-[#052E24] transition active:scale-[0.98]"
                    >
                      Enter
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        id="competitions"
        className="mx-auto hidden max-w-7xl px-5 py-16 md:block md:py-20"
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