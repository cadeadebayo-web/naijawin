"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase";

type Competition = {
  id: string;
  slug: string;
  title: string;
  category: string;
  ticket_price: number;
  max_entries: number;
  entries_sold: number;
  draw_date: string | null;
  status: string | null;
};

type Order = {
  id: string;
  quantity: number;
  amount: number;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string | null;
  paid_at: string | null;
  competition_id: string | null;
  user_id: string | null;
  archived: boolean | null;
};

type Entry = {
  id: string;
  order_id: string | null;
  ticket_number: string;
};

type Winner = {
  id: string;
  winner_name: string;
  location: string | null;
  prize: string;
  published: boolean | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
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

function generateTicketNumber(index: number) {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const indexPart = String(index + 1).padStart(2, "0");

  return `NW-${randomPart}-${indexPart}`;
}

export default function AdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "paid"
  >("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showArchivedOrders, setShowArchivedOrders] = useState(false);

  async function loadAdminData() {
    setIsLoading(true);
    setErrorMessage("");

    const { data: competitionData, error: competitionsError } = await supabase
      .from("competitions")
      .select(
        "id, slug, title, category, ticket_price, max_entries, entries_sold, draw_date, status"
      )
      .order("created_at", { ascending: false });

    if (competitionsError) {
      setErrorMessage(`Competitions: ${competitionsError.message}`);
      setIsLoading(false);
      return;
    }

    const { data: orderData, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, quantity, amount, payment_method, payment_status, created_at, paid_at, competition_id, user_id, archived"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (ordersError) {
      setErrorMessage(`Orders: ${ordersError.message}`);
      setIsLoading(false);
      return;
    }

    const { data: entryData, error: entriesError } = await supabase
      .from("entries")
      .select("id, order_id, ticket_number")
      .order("created_at", { ascending: false });

    if (entriesError) {
      setErrorMessage(`Entries: ${entriesError.message}`);
      setIsLoading(false);
      return;
    }

    const { data: winnerData, error: winnersError } = await supabase
      .from("winners")
      .select("id, winner_name, location, prize, published")
      .order("created_at", { ascending: false })
      .limit(5);

    if (winnersError) {
      setErrorMessage(`Winners: ${winnersError.message}`);
      setIsLoading(false);
      return;
    }

    const { data: profileData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, state")
      .order("full_name", { ascending: true });

    if (profilesError) {
      setErrorMessage(`Profiles: ${profilesError.message}`);
      setIsLoading(false);
      return;
    }

    setCompetitions((competitionData || []) as Competition[]);
    setOrders((orderData || []) as Order[]);
    setEntries((entryData || []) as Entry[]);
    setWinners((winnerData || []) as Winner[]);
    setProfiles((profileData || []) as Profile[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function closeCompetition(competitionId: string) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("competitions")
      .update({ status: "closed" })
      .eq("id", competitionId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Competition closed successfully.");
    loadAdminData();
  }

  async function reopenCompetition(competitionId: string) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("competitions")
      .update({ status: "active" })
      .eq("id", competitionId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Competition reopened successfully.");
    loadAdminData();
  }

  async function archiveOrder(orderId: string) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ archived: true })
      .eq("id", orderId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Order archived successfully.");
    loadAdminData();
  }

  async function unarchiveOrder(orderId: string) {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ archived: false })
      .eq("id", orderId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Order restored successfully.");
    loadAdminData();
  }

  async function markOrderAsPaid(order: Order) {
    setMessage("");
    setErrorMessage("");

    if (order.payment_status === "paid") {
      setMessage("Order is already paid.");
      return;
    }

    if (!order.competition_id) {
      setErrorMessage("This order is not linked to a competition.");
      return;
    }

    if (!order.user_id) {
      setErrorMessage("This order is not linked to a user.");
      return;
    }

    const { data: competitionData, error: competitionError } = await supabase
      .from("competitions")
      .select("id, title, max_entries, entries_sold")
      .eq("id", order.competition_id)
      .single();

    if (competitionError) {
      setErrorMessage(competitionError.message);
      return;
    }

    if (!competitionData) {
      setErrorMessage("Competition not found.");
      return;
    }

    const remainingEntries = Math.max(
      competitionData.max_entries - competitionData.entries_sold,
      0
    );

    if (remainingEntries <= 0) {
      setErrorMessage("This competition is already sold out.");
      return;
    }

    if (order.quantity > remainingEntries) {
      setErrorMessage(
        `Only ${remainingEntries} ticket${
          remainingEntries === 1 ? "" : "s"
        } remaining for this competition. This order cannot be marked as paid.`
      );
      return;
    }

    const existingTickets = entries.filter(
      (entry) => entry.order_id === order.id
    );

    if (existingTickets.length === 0) {
      const ticketsToCreate = Array.from({ length: order.quantity }).map(
        (_, index) => ({
          user_id: order.user_id,
          competition_id: order.competition_id,
          order_id: order.id,
          ticket_number: generateTicketNumber(index),
          status: "confirmed",
        })
      );

      const { error: ticketError } = await supabase
        .from("entries")
        .insert(ticketsToCreate);

      if (ticketError) {
        setErrorMessage(ticketError.message);
        return;
      }
    }

    const newEntriesSold = competitionData.entries_sold + order.quantity;

    const { error: competitionUpdateError } = await supabase
      .from("competitions")
      .update({
        entries_sold: newEntriesSold,
      })
      .eq("id", order.competition_id);

    if (competitionUpdateError) {
      setErrorMessage(competitionUpdateError.message);
      return;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (orderError) {
      setErrorMessage(orderError.message);
      return;
    }

    setMessage(
      "Order marked as paid, tickets generated and entries sold updated."
    );
    loadAdminData();
  }

  const activeCompetitions = competitions.filter(
    (competition) => competition.status === "active"
  );

  const pendingOrders = orders.filter(
    (order) => order.payment_status === "pending"
  );

  const paidOrders = orders.filter((order) => order.payment_status === "paid");

  const recentRevenue = paidOrders.reduce(
    (total, order) => total + order.amount,
    0
  );

  function getCompetitionTitle(competitionId: string | null) {
    if (!competitionId) {
      return "Competition not linked";
    }

    return (
      competitions.find((competition) => competition.id === competitionId)
        ?.title || "Competition not found"
    );
  }

  function getCustomerProfile(userId: string | null) {
    if (!userId) {
      return null;
    }

    return profiles.find((profile) => profile.id === userId) || null;
  }

  const filteredOrders = orders.filter((order) => {
    const customer = getCustomerProfile(order.user_id);
    const competitionTitle = getCompetitionTitle(order.competition_id);

    const statusMatches =
      orderStatusFilter === "all" || order.payment_status === orderStatusFilter;

    const archiveMatches = showArchivedOrders
      ? order.archived === true
      : order.archived !== true;

    const searchText = [
      order.id,
      order.payment_status || "",
      order.payment_method || "",
      competitionTitle,
      customer?.full_name || "",
      customer?.email || "",
      customer?.phone || "",
      customer?.state || "",
    ]
      .join(" ")
      .toLowerCase();

    const searchMatches = searchText.includes(
      orderSearchQuery.trim().toLowerCase()
    );

    return statusMatches && archiveMatches && searchMatches;
  });

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-black text-[#D6A84F]">Admin Dashboard</p>

              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                Manage NaijaWin competitions, orders and winners.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-white/75">
                This admin dashboard now loads secure admin data after login.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/new-competition"
                className="rounded-full bg-[#D6A84F] px-6 py-4 text-center font-black text-[#052E24] transition hover:bg-white"
              >
                Add Competition
              </Link>

              <Link
                href="/admin/winners"
                className="rounded-full border border-white/30 px-6 py-4 text-center font-black text-white transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
              >
                Manage Winners
              </Link>

              <Link
                href="/admin/faqs"
                className="rounded-full border border-white/30 px-6 py-4 text-center font-black text-white transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
              >
                Manage FAQs
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          {message && (
            <div className="mb-8 rounded-3xl bg-green-50 p-6 font-bold text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 rounded-3xl bg-red-50 p-6 font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
              <h2 className="text-3xl font-black text-[#052E24]">
                Loading admin data...
              </h2>
              <p className="mt-3 text-gray-600">
                Please wait while Supabase loads competitions, orders and tickets.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-4">
                <article className="rounded-3xl bg-white p-6 shadow-lg">
                  <p className="text-sm font-bold text-gray-500">
                    Total Competitions
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#052E24]">
                    {competitions.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {activeCompetitions.length} active competitions
                  </p>
                </article>

                <article className="rounded-3xl bg-white p-6 shadow-lg">
                  <p className="text-sm font-bold text-gray-500">
                    Recent Orders
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#052E24]">
                    {orders.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {pendingOrders.length} pending payments
                  </p>
                </article>

                <article className="rounded-3xl bg-white p-6 shadow-lg">
                  <p className="text-sm font-bold text-gray-500">
                    Recent Revenue
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#052E24]">
                    {formatPrice(recentRevenue)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Paid orders loaded here
                  </p>
                </article>

                <article className="rounded-3xl bg-white p-6 shadow-lg">
                  <p className="text-sm font-bold text-gray-500">
                    Tickets Generated
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#052E24]">
                    {entries.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Entries currently in Supabase
                  </p>
                </article>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-3xl font-black text-[#052E24]">
                        Competitions
                      </h2>
                      <p className="mt-2 text-gray-600">
                        Live competition records from Supabase.
                      </p>
                    </div>

                    <Link
                      href="/competitions"
                      className="rounded-full bg-[#052E24] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                    >
                      View Public Page
                    </Link>
                  </div>

                  <div className="mt-8 space-y-5">
                    {competitions.map((competition) => {
                      const soldPercentage =
                        competition.max_entries > 0
                          ? Math.round(
                              (competition.entries_sold /
                                competition.max_entries) *
                                100
                            )
                          : 0;

                      return (
                        <article
                          key={competition.id}
                          className="rounded-3xl border border-gray-100 bg-[#FAF7EF] p-5"
                        >
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]">
                                  {competition.category}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${
                                    competition.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {competition.status || "draft"}
                                </span>
                              </div>

                              <h3 className="mt-4 text-xl font-black text-[#052E24]">
                                {competition.title}
                              </h3>

                              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                                <div>
                                  <p className="font-bold text-gray-500">Price</p>
                                  <p className="font-black text-[#052E24]">
                                    {formatPrice(competition.ticket_price)}
                                  </p>
                                </div>

                                <div>
                                  <p className="font-bold text-gray-500">Sold</p>
                                  <p className="font-black text-[#052E24]">
                                    {competition.entries_sold.toLocaleString()} /{" "}
                                    {competition.max_entries.toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <p className="font-bold text-gray-500">
                                    Progress
                                  </p>
                                  <p className="font-black text-[#052E24]">
                                    {soldPercentage}%
                                  </p>
                                </div>

                                <div>
                                  <p className="font-bold text-gray-500">
                                    Draw Date
                                  </p>
                                  <p className="font-black text-[#052E24]">
                                    {formatDate(competition.draw_date)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Link
                                href={`/admin/edit-competition/${competition.slug}`}
                                className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#052E24] transition hover:bg-[#D6A84F]"
                              >
                                Edit
                              </Link>

                              <Link
                                href={`/competitions/${competition.slug}`}
                                className="rounded-full bg-[#052E24] px-4 py-2 text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                              >
                                View
                              </Link>

                              {competition.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => closeCompetition(competition.id)}
                                  className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                                >
                                  Close
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    reopenCompetition(competition.id)
                                  }
                                  className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700 transition hover:bg-green-600 hover:text-white"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-8">
                  <article className="rounded-3xl bg-white p-6 shadow-xl md:p-8">
                    <h2 className="text-3xl font-black text-[#052E24]">
                      Recent Orders
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Search orders and filter pending or paid payments.
                    </p>

                    <div className="mt-6 space-y-4">
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(event) =>
                          setOrderSearchQuery(event.target.value)
                        }
                        placeholder="Search by customer, email, phone, competition or order ID..."
                        className="w-full rounded-2xl border border-gray-200 bg-[#FAF7EF] px-4 py-4 text-sm font-bold outline-none focus:border-[#D6A84F]"
                      />

                      <div className="grid gap-3 sm:grid-cols-4">
                        <button
                          type="button"
                          onClick={() => setOrderStatusFilter("all")}
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            orderStatusFilter === "all"
                              ? "bg-[#052E24] text-white"
                              : "bg-[#FAF7EF] text-[#052E24] hover:bg-[#D6A84F]"
                          }`}
                        >
                          All Orders
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderStatusFilter("pending")}
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            orderStatusFilter === "pending"
                              ? "bg-yellow-500 text-white"
                              : "bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                          }`}
                        >
                          Pending
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderStatusFilter("paid")}
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            orderStatusFilter === "paid"
                              ? "bg-green-600 text-white"
                              : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white"
                          }`}
                        >
                          Paid
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setShowArchivedOrders(!showArchivedOrders)
                          }
                          className={`rounded-full px-5 py-3 text-sm font-black transition ${
                            showArchivedOrders
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          {showArchivedOrders ? "Archived" : "Active"}
                        </button>
                      </div>

                      <p className="rounded-2xl bg-[#FAF7EF] px-4 py-3 text-sm font-bold text-gray-600">
                        Showing {filteredOrders.length} of {orders.length}{" "}
                        loaded orders
                      </p>

                      {filteredOrders.length === 0 ? (
                        <div className="rounded-2xl bg-[#FAF7EF] p-4 text-sm font-bold text-gray-600">
                          No matching orders found. Try changing the search text
                          or filter.
                        </div>
                      ) : (
                        filteredOrders.map((order) => {
                          const isPaid = order.payment_status === "paid";
                          const orderTickets = entries.filter(
                            (entry) => entry.order_id === order.id
                          );
                          const customer = getCustomerProfile(order.user_id);
                          const competitionTitle = getCompetitionTitle(
                            order.competition_id
                          );

                          return (
                            <div
                              key={order.id}
                              className="rounded-2xl bg-[#FAF7EF] p-4"
                            >
                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                  <p className="font-black text-[#052E24]">
                                    Order {order.id.slice(0, 8)}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-gray-600">
                                    {competitionTitle}
                                  </p>

                                  <p className="mt-2 text-sm text-gray-600">
                                    Quantity: {order.quantity}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-black ${
                                      isPaid
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {order.payment_status || "pending"}
                                  </span>

                                  {order.archived && (
                                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-black text-gray-700">
                                      Archived
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-2 text-sm">
                                <p>
                                  <span className="font-bold text-gray-500">
                                    Customer:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {customer?.full_name ||
                                      "Customer name not found"}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-bold text-gray-500">
                                    Email:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {customer?.email || "Email not found"}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-bold text-gray-500">
                                    Phone:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {customer?.phone || "Phone not found"}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-bold text-gray-500">
                                    State:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {customer?.state || "State not found"}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-bold text-gray-500">
                                    Amount:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {formatPrice(order.amount)}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-bold text-gray-500">
                                    Method:
                                  </span>{" "}
                                  <span className="font-black text-[#052E24]">
                                    {order.payment_method || "Not selected"}
                                  </span>
                                </p>
                              </div>

                              {orderTickets.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-black text-gray-500">
                                    Tickets
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {orderTickets.map((ticket) => (
                                      <span
                                        key={ticket.id}
                                        className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#052E24]"
                                      >
                                        {ticket.ticket_number}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 grid gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="w-full rounded-full bg-white px-4 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#D6A84F]"
                                >
                                  View Details
                                </button>

                                {isPaid && !order.archived && (
                                  <button
                                    type="button"
                                    onClick={() => archiveOrder(order.id)}
                                    className="w-full rounded-full bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-800 hover:text-white"
                                  >
                                    Archive Order
                                  </button>
                                )}

                                {order.archived && (
                                  <button
                                    type="button"
                                    onClick={() => unarchiveOrder(order.id)}
                                    className="w-full rounded-full bg-blue-100 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                  >
                                    Restore Order
                                  </button>
                                )}

                                {!isPaid && (
                                  <button
                                    type="button"
                                    onClick={() => markOrderAsPaid(order)}
                                    className="w-full rounded-full bg-[#D6A84F] px-4 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                                  >
                                    Mark Paid & Generate Tickets
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </article>

                  <article className="rounded-3xl bg-[#052E24] p-6 text-white shadow-xl md:p-8">
                    <h2 className="text-3xl font-black text-[#D6A84F]">
                      Winners
                    </h2>

                    <p className="mt-2 text-white/70">
                      Winner records from Supabase.
                    </p>

                    <div className="mt-6 space-y-4">
                      {winners.length === 0 ? (
                        <div className="rounded-2xl bg-white/10 p-4 text-sm font-bold text-white/70">
                          No winners found.
                        </div>
                      ) : (
                        winners.map((winner) => (
                          <div
                            key={winner.id}
                            className="rounded-2xl bg-white/10 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-white">
                                  {winner.winner_name}
                                </p>

                                <p className="mt-1 text-sm text-white/70">
                                  {winner.location || "Nigeria"}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  winner.published
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {winner.published ? "Published" : "Draft"}
                              </span>
                            </div>

                            <p className="mt-3 rounded-full bg-[#D6A84F] px-3 py-1 text-sm font-black text-[#052E24]">
                              Won {winner.prize}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                </section>
              </div>
            </>
          )}
        </section>

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
              {(() => {
                const customer = getCustomerProfile(selectedOrder.user_id);
                const competitionTitle = getCompetitionTitle(
                  selectedOrder.competition_id
                );
                const selectedOrderTickets = entries.filter(
                  (entry) => entry.order_id === selectedOrder.id
                );
                const isPaid = selectedOrder.payment_status === "paid";

                return (
                  <>
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start">
                      <div>
                        <p className="text-sm font-black text-[#D6A84F]">
                          Order Details
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-[#052E24]">
                          Order {selectedOrder.id.slice(0, 8)}
                        </h2>

                        <p className="mt-2 text-gray-600">
                          {competitionTitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        className="rounded-full bg-[#FAF7EF] px-5 py-3 text-sm font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                      >
                        Close
                      </button>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div className="rounded-3xl bg-[#FAF7EF] p-5">
                        <h3 className="text-xl font-black text-[#052E24]">
                          Customer
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">
                          <p>
                            <span className="font-bold text-gray-500">
                              Name:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {customer?.full_name || "Not found"}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Email:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {customer?.email || "Not found"}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Phone:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {customer?.phone || "Not found"}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              State:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {customer?.state || "Not found"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-[#FAF7EF] p-5">
                        <h3 className="text-xl font-black text-[#052E24]">
                          Payment
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">
                          <p>
                            <span className="font-bold text-gray-500">
                              Status:
                            </span>{" "}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {selectedOrder.payment_status || "pending"}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Method:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {selectedOrder.payment_method || "Not selected"}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Amount:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {formatPrice(selectedOrder.amount)}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Quantity:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {selectedOrder.quantity}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-[#FAF7EF] p-5">
                        <h3 className="text-xl font-black text-[#052E24]">
                          Dates
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">
                          <p>
                            <span className="font-bold text-gray-500">
                              Created:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {formatDateTime(selectedOrder.created_at)}
                            </span>
                          </p>

                          <p>
                            <span className="font-bold text-gray-500">
                              Paid:
                            </span>{" "}
                            <span className="font-black text-[#052E24]">
                              {formatDateTime(selectedOrder.paid_at)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-[#FAF7EF] p-5">
                        <h3 className="text-xl font-black text-[#052E24]">
                          Ticket Numbers
                        </h3>

                        {selectedOrderTickets.length === 0 ? (
                          <p className="mt-4 text-sm font-bold text-gray-600">
                            No tickets generated yet.
                          </p>
                        ) : (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedOrderTickets.map((ticket) => (
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

                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => {
                          markOrderAsPaid(selectedOrder);
                          setSelectedOrder(null);
                        }}
                        className="mt-6 w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                      >
                        Mark Paid & Generate Tickets
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </AdminGuard>
  );
}