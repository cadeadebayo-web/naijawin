"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  user_id: string | null;
  quantity: number;
  amount: number;
  payment_method: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_status: string | null;
  created_at: string | null;
  paid_at: string | null;
  competition_id: string | null;
};

type Entry = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  ticket_number: string;
  status: string | null;
  created_at: string | null;
};

type Competition = {
  id: string;
  slug: string;
  title: string;
  category: string;
  draw_date: string | null;
};

function formatPrice(amount: number) {
  if (amount === 0) {
    return "Free";
  }

  return `₦${amount.toLocaleString()}`;
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

function formatDateTime(dateValue: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPaymentMethod(method: string | null) {
  if (!method) {
    return "Not selected";
  }

  if (method === "card") {
    return "Card Payment";
  }

  if (method === "transfer") {
    return "Bank Transfer";
  }

  if (method === "ussd") {
    return "USSD";
  }

  return method;
}

function formatPaymentProvider(provider: string | null) {
  if (!provider) {
    return "Not available";
  }

  if (provider === "paystack") {
    return "Paystack";
  }

  if (provider === "manual-transfer") {
    return "Manual Bank Transfer";
  }

  return provider;
}

export default function MyEntriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userEmail, setUserEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadMyEntries() {
      setIsLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        setIsLoading(false);
        return;
      }

      if (!user) {
        setOrders([]);
        setEntries([]);
        setCompetitions([]);
        setUserEmail("");
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email || "");

      const { data: orderData, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, user_id, quantity, amount, payment_method, payment_provider, payment_reference, payment_status, created_at, paid_at, competition_id"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        setErrorMessage(ordersError.message);
        setIsLoading(false);
        return;
      }

      const { data: entryData, error: entriesError } = await supabase
        .from("entries")
        .select("id, user_id, order_id, ticket_number, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (entriesError) {
        setErrorMessage(entriesError.message);
        setIsLoading(false);
        return;
      }

      const { data: competitionData, error: competitionsError } = await supabase
        .from("competitions")
        .select("id, slug, title, category, draw_date");

      if (competitionsError) {
        setErrorMessage(competitionsError.message);
        setIsLoading(false);
        return;
      }

      setOrders((orderData || []) as Order[]);
      setEntries((entryData || []) as Entry[]);
      setCompetitions((competitionData || []) as Competition[]);
      setIsLoading(false);
    }

    loadMyEntries();
  }, []);

  const paidOrders = orders.filter((order) => order.payment_status === "paid");

  const pendingOrders = orders.filter(
    (order) => order.payment_status === "pending"
  );

  const totalTickets = entries.length;

  const totalPaidAmount = paidOrders.reduce(
    (total, order) => total + order.amount,
    0
  );

  function getCompetition(competitionId: string | null) {
    return competitions.find((competition) => competition.id === competitionId);
  }

  function getOrderTickets(orderId: string) {
    return entries.filter((entry) => entry.order_id === orderId);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Loading your entries...
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we load your account entries.
          </p>
        </section>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-black text-[#D6A84F]">User Dashboard</p>

            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Login required.
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-white/75">
              Please login to view your orders, entries and ticket numbers.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-[#D6A84F] px-8 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full border border-white/30 px-8 py-4 text-center font-black text-white transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">User Dashboard</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            My Entries
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            View your competition orders, ticket numbers, payment status and
            upcoming draw dates.
          </p>

          <p className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#D6A84F]">
            Logged in as {userEmail}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        {errorMessage && (
          <div className="mb-8 rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-bold text-gray-500">Total Orders</p>
            <p className="mt-2 text-4xl font-black text-[#052E24]">
              {orders.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-bold text-gray-500">Paid Orders</p>
            <p className="mt-2 text-4xl font-black text-[#052E24]">
              {paidOrders.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-bold text-gray-500">Pending Payments</p>
            <p className="mt-2 text-4xl font-black text-[#052E24]">
              {pendingOrders.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-bold text-gray-500">Tickets Generated</p>
            <p className="mt-2 text-4xl font-black text-[#052E24]">
              {totalTickets}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-bold text-gray-500">Paid Amount</p>
            <p className="mt-2 text-3xl font-black text-[#052E24]">
              {formatPrice(totalPaidAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-black text-[#052E24]">
                Entry History
              </h2>

              <p className="mt-2 text-gray-600">
                Paid Paystack orders show ticket numbers automatically after
                payment verification.
              </p>
            </div>

            <Link
              href="/competitions"
              className="rounded-full bg-[#D6A84F] px-6 py-3 text-center font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              Enter More Competitions
            </Link>
          </div>

          <div className="mt-8 space-y-5">
            {orders.length === 0 ? (
              <div className="rounded-3xl bg-[#FAF7EF] p-8 text-center">
                <h3 className="text-2xl font-black text-[#052E24]">
                  No entries yet.
                </h3>

                <p className="mt-3 text-gray-600">
                  When you enter a competition while logged in, your order and
                  tickets will appear here.
                </p>

                <Link
                  href="/competitions"
                  className="mt-6 inline-flex rounded-full bg-[#052E24] px-6 py-3 font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                >
                  Browse Competitions
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const competition = getCompetition(order.competition_id);
                const tickets = getOrderTickets(order.id);
                const isPaid = order.payment_status === "paid";
                const isPaystack = order.payment_provider === "paystack";

                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-gray-100 bg-[#FAF7EF] p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]">
                            Order {order.id.slice(0, 8)}
                          </p>

                          <p
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              isPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </p>

                          <p
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              isPaystack
                                ? "bg-blue-100 text-blue-700"
                                : "bg-white text-[#052E24]"
                            }`}
                          >
                            {formatPaymentProvider(order.payment_provider)}
                          </p>
                        </div>

                        <h3 className="mt-4 text-2xl font-black text-[#052E24]">
                          {competition?.title || "Competition not found"}
                        </h3>

                        <div className="mt-5 grid gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="font-bold text-gray-500">Amount</p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {formatPrice(order.amount)}
                            </p>
                          </div>

                          <div>
                            <p className="font-bold text-gray-500">Quantity</p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {order.quantity}
                            </p>
                          </div>

                          <div>
                            <p className="font-bold text-gray-500">
                              Payment Method
                            </p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {formatPaymentMethod(order.payment_method)}
                            </p>
                          </div>

                          <div>
                            <p className="font-bold text-gray-500">Draw Date</p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {formatDate(competition?.draw_date || null)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                          <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="font-bold text-gray-500">
                              Order Date
                            </p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {formatDateTime(order.created_at)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="font-bold text-gray-500">Paid Date</p>
                            <p className="mt-1 font-black text-[#052E24]">
                              {formatDateTime(order.paid_at)}
                            </p>
                          </div>
                        </div>

                        {order.payment_reference && (
                          <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm">
                            <p className="font-bold text-gray-500">
                              Payment Reference
                            </p>
                            <p className="mt-1 break-all font-black text-[#052E24]">
                              {order.payment_reference}
                            </p>
                          </div>
                        )}

                        <div className="mt-5">
                          <p className="font-bold text-gray-500">Tickets</p>

                          {tickets.length === 0 ? (
                            <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-600">
                              {isPaid
                                ? "Payment is paid, but ticket numbers are not available yet. Please contact support if this does not update shortly."
                                : "Tickets will appear here after payment is confirmed."}
                            </p>
                          ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tickets.map((ticket) => (
                                <span
                                  key={ticket.id}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]"
                                >
                                  {ticket.ticket_number}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3">
                        {competition && (
                          <Link
                            href={`/competitions/${competition.slug}`}
                            className="rounded-full bg-[#052E24] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                          >
                            View Competition
                          </Link>
                        )}

                        {!isPaid && (
                          <Link
                            href={
                              competition
                                ? `/checkout?competition=${competition.slug}&quantity=${order.quantity}`
                                : "/competitions"
                            }
                            className="rounded-full bg-[#D6A84F] px-5 py-3 text-center text-sm font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                          >
                            Complete Payment
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-[#052E24] p-6 text-white shadow-lg md:p-8">
          <h2 className="text-2xl font-black text-[#D6A84F]">
            Dashboard Note
          </h2>

          <p className="mt-3 leading-7 text-white/75">
            This page shows only the orders linked to your logged-in account.
            Paystack payments should appear as paid after payment verification,
            with ticket numbers generated automatically.
          </p>
        </div>
      </section>
    </main>
  );
}