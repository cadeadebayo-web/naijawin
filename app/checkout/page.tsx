"use client";
export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentMethod = "card" | "transfer" | "ussd";

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
};

type PaymentInitializeResponse = {
  success: boolean;
  authorizationUrl?: string;
  checkoutUrl?: string;
  accessCode?: string;
  reference?: string;
  transactionReference?: string;
  message?: string;
};

const paymentMethods = [
  {
    id: "card",
    title: "Card Payment",
    description: "Pay securely with your debit card through Paystack.",
  },
  {
    id: "transfer",
    title: "Instant Bank Transfer",
    description: "Pay through Monnify and receive automatic confirmation.",
  },
  {
    id: "ussd",
    title: "USSD",
    description: "Pay quickly using Paystack-supported USSD options.",
  },
] as const;

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

function CheckoutContent() {
  const searchParams = useSearchParams();

  const competitionSlug = searchParams.get("competition") || "toyota-corolla";
  const quantityFromUrl = Number(searchParams.get("quantity") || "1");

  const quantity =
    Number.isFinite(quantityFromUrl) && quantityFromUrl > 0
      ? quantityFromUrl
      : 1;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("transfer");

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCompetition() {
      setIsLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id || "");
      setUserEmail(user?.email || "");

      const { data, error } = await supabase
        .from("competitions")
        .select(
          "id, slug, title, category, image_url, icon, ticket_price, max_entries, entries_sold, draw_date, status"
        )
        .eq("slug", competitionSlug)
        .eq("status", "active")
        .single();

      if (error) {
        setErrorMessage(error.message);
        setCompetition(null);
      } else {
        setCompetition(data as Competition);
      }

      setIsLoading(false);
    }

    loadCompetition();
  }, [competitionSlug]);

  const remainingEntries = competition
    ? Math.max(competition.max_entries - competition.entries_sold, 0)
    : 0;

  const safeQuantity = competition
    ? Math.min(quantity, remainingEntries)
    : quantity;

  const totalAmount = useMemo(() => {
    if (!competition) {
      return 0;
    }

    return competition.ticket_price * safeQuantity;
  }, [competition, safeQuantity]);

  const amountLabel = formatPrice(totalAmount);

  async function handleCreatePendingOrder() {
    if (!competition) {
      setErrorMessage("Competition could not be loaded.");
      return;
    }

    const availableEntries = Math.max(
      competition.max_entries - competition.entries_sold,
      0
    );

    if (availableEntries <= 0) {
      setErrorMessage("This competition is sold out.");
      return;
    }

    if (quantity > availableEntries) {
      setErrorMessage(
        `Only ${availableEntries} ticket${
          availableEntries === 1 ? "" : "s"
        } remaining for this competition. Please go back and reduce your quantity.`
      );
      return;
    }

    if (!userId || !userEmail) {
      setErrorMessage(
        "Please login or create an account before creating an order."
      );
      return;
    }

    if (totalAmount <= 0 && selectedMethod !== "transfer") {
      setErrorMessage("Online payment requires an amount greater than zero.");
      return;
    }

    setIsCreatingOrder(true);
    setErrorMessage("");
    setOrderCreated(false);
    setCreatedOrderId("");

    const paymentProvider =
      selectedMethod === "transfer" ? "monnify" : "paystack";

    const temporaryReference = `NW-${Date.now()}`;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        competition_id: competition.id,
        quantity: safeQuantity,
        amount: totalAmount,
        payment_method: selectedMethod,
        payment_provider: paymentProvider,
        payment_reference: temporaryReference,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (orderError) {
      setIsCreatingOrder(false);
      setErrorMessage(orderError.message);
      return;
    }

    const orderId = orderData.id;

    setCreatedOrderId(orderId);
    setOrderCreated(true);

    try {
      const initializeEndpoint =
        selectedMethod === "transfer"
          ? "/api/monnify/initialize"
          : "/api/paystack/initialize";

      const response = await fetch(initializeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: totalAmount,
          orderId,
          competitionTitle: competition.title,
          customerName: userEmail,
        }),
      });

      const result = (await response.json()) as PaymentInitializeResponse;
      const redirectUrl =
        selectedMethod === "transfer"
          ? result.checkoutUrl
          : result.authorizationUrl;

      if (!response.ok || !result.success || !redirectUrl) {
        setIsCreatingOrder(false);
        setOrderCreated(false);
        setErrorMessage(
          result.message ||
            (selectedMethod === "transfer"
              ? "Unable to start Monnify bank transfer."
              : "Unable to start Paystack payment.")
        );
        return;
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Payment checkout error:", error);
      setIsCreatingOrder(false);
      setOrderCreated(false);
      setErrorMessage(
        selectedMethod === "transfer"
          ? "Unable to connect to Monnify. Please try again."
          : "Unable to connect to Paystack. Please try again."
      );
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Loading checkout...
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we load your selected competition.
          </p>
        </section>
      </main>
    );
  }

  if (!competition) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Checkout unavailable
          </h1>

          <p className="mt-3 text-gray-600">
            We could not load this competition for checkout.
          </p>

          {errorMessage && (
            <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          )}

          <Link
            href="/competitions"
            className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-6 py-3 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            Back to Competitions
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="bg-[#052E24] px-5 py-14 text-white md:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/competitions/${competition.slug}`}
            className="mb-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#D6A84F] transition hover:bg-white hover:text-[#052E24]"
          >
            ← Back to Competition
          </Link>

          <p className="font-black text-[#D6A84F]">Secure Checkout</p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Complete your entry securely.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Choose instant bank transfer through Monnify, or use Paystack for
            card and USSD checkout.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <article className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="relative h-72 bg-[#052E24]">
              <Image
                src={competition.image_url || "/images/toyota-corolla.png"}
                alt={competition.title}
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D6A84F] text-4xl">
                  {competition.icon || "🎁"}
                </div>

                <p className="font-black text-[#D6A84F]">
                  {competition.category}
                </p>

                <h2 className="mt-2 text-3xl font-black leading-tight">
                  {competition.title}
                </h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-black text-[#052E24]">
                Checkout Details
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Your selected competition and ticket quantity have been loaded
                securely from Supabase.
              </p>
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-3xl font-black text-[#052E24]">
              Choose Payment Method
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Bank transfer redirects you to Monnify for an automatically
              confirmed transfer. Card and USSD continue through Paystack.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setOrderCreated(false);
                      setCreatedOrderId("");
                      setErrorMessage("");
                    }}
                    className={`rounded-3xl border p-5 text-left transition ${
                      isSelected
                        ? "border-[#D6A84F] bg-[#052E24] text-white"
                        : "border-gray-200 bg-[#FAF7EF] text-[#052E24] hover:border-[#D6A84F]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black">{method.title}</h3>

                        <p
                          className={`mt-2 text-sm leading-6 ${
                            isSelected ? "text-white/75" : "text-gray-600"
                          }`}
                        >
                          {method.description}
                        </p>
                      </div>

                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                          isSelected
                            ? "border-[#D6A84F] bg-[#D6A84F] text-[#052E24]"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>

          {selectedMethod === "transfer" && (
            <article className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="font-black text-[#D6A84F]">
                    Instant Bank Transfer
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#052E24]">
                    Transfer exactly {amountLabel}
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    After you continue, Monnify will display a secure temporary
                    bank account for this order. Your payment will be confirmed
                    automatically after the transfer is received.
                  </p>
                </div>

                <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
                  Automatic confirmation
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-dashed border-[#D6A84F] bg-[#FAF7EF] p-6">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Payment provider</p>
                    <p className="mt-1 text-xl font-black text-[#052E24]">
                      Monnify
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Order amount</p>
                    <p className="mt-1 text-xl font-black text-[#052E24]">
                      {amountLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Confirmation</p>
                    <p className="mt-1 text-xl font-black text-[#052E24]">
                      Automatic
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-4 text-sm leading-6 text-gray-600">
                  The temporary account is created only after you click the
                  payment button. Transfer the exact amount shown before the
                  payment session expires.
                </div>
              </div>
            </article>
          )}

          {selectedMethod === "card" && (
            <article className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
              <p className="font-black text-[#D6A84F]">Card Payment</p>

              <h2 className="mt-2 text-3xl font-black text-[#052E24]">
                Pay securely with Paystack
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                When you confirm, we will create a pending order and redirect
                you to Paystack to complete card payment securely.
              </p>

              <div className="mt-6 rounded-3xl bg-[#FAF7EF] p-6">
                <p className="text-sm text-gray-500">Security</p>

                <p className="mt-2 font-bold text-[#052E24]">
                  Card details are handled by Paystack. NaijaWin does not store
                  card numbers.
                </p>
              </div>
            </article>
          )}

          {selectedMethod === "ussd" && (
            <article className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
              <p className="font-black text-[#D6A84F]">USSD Payment</p>

              <h2 className="mt-2 text-3xl font-black text-[#052E24]">
                Pay with USSD through Paystack
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                When you confirm, Paystack will show supported USSD payment
                options where available.
              </p>

              <div className="mt-6 rounded-3xl bg-[#FAF7EF] p-6">
                <p className="text-sm text-gray-500">Next step</p>

                <p className="mt-2 text-xl font-black text-[#052E24]">
                  Continue to Paystack checkout
                </p>
              </div>
            </article>
          )}

          <article className="rounded-3xl bg-[#052E24] p-6 text-white shadow-lg md:p-8">
            <h2 className="text-3xl font-black text-[#D6A84F]">
              What happens after payment?
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black text-[#D6A84F]">1</p>
                <h3 className="mt-3 font-black">Order Created</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  A pending order is saved in Supabase.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black text-[#D6A84F]">2</p>
                <h3 className="mt-3 font-black">Payment Completed</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Paystack confirms online payments after checkout.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-2xl font-black text-[#D6A84F]">3</p>
                <h3 className="mt-3 font-black">Tickets Generated</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Tickets are generated once payment is confirmed.
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl lg:sticky lg:top-24">
          <h2 className="text-2xl font-black text-[#052E24]">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-[#FAF7EF] p-5">
              <p className="text-sm text-gray-500">Competition</p>

              <p className="mt-1 font-black text-[#052E24]">
                {competition.title}
              </p>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="font-bold text-gray-600">Ticket price</span>

              <span className="font-black text-[#052E24]">
                {formatPrice(competition.ticket_price)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="font-bold text-gray-600">Quantity</span>

              <span className="font-black text-[#052E24]">{safeQuantity}</span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="font-bold text-gray-600">Draw date</span>

              <span className="font-black text-[#052E24]">
                {formatDate(competition.draw_date)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-black text-[#052E24]">Total</span>

              <span className="text-3xl font-black text-[#052E24]">
                {amountLabel}
              </span>
            </div>
          </div>

          {userEmail ? (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-700">
              <span className="font-black">Logged in as:</span> {userEmail}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
              <span className="font-black">Login required:</span> Please login
              or create an account before creating an order.

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full bg-[#052E24] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-[#D6A84F] px-5 py-3 text-center text-sm font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {competition && quantity > remainingEntries && (
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
              Only {remainingEntries} ticket
              {remainingEntries === 1 ? "" : "s"} remaining. Please go back and
              reduce your quantity before creating an order.
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {orderCreated && selectedMethod === "transfer" && (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              Order created. Redirecting to Monnify for bank transfer...
              <br />
              Order ID: {createdOrderId.slice(0, 8)}
            </div>
          )}

          {orderCreated && selectedMethod !== "transfer" && (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              Order created. Redirecting to Paystack...
            </div>
          )}

          <button
            type="button"
            onClick={handleCreatePendingOrder}
            disabled={
              isCreatingOrder ||
              orderCreated ||
              !userId ||
              !competition ||
              remainingEntries <= 0 ||
              quantity > remainingEntries
            }
            className="mt-8 w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!userId
              ? "Login Required"
              : isCreatingOrder && selectedMethod === "transfer"
              ? "Connecting to Monnify..."
              : isCreatingOrder
              ? "Connecting to Paystack..."
              : orderCreated && selectedMethod === "transfer"
              ? "Redirecting to Monnify..."
              : selectedMethod === "transfer"
              ? "Continue to Instant Bank Transfer"
              : "Continue to Paystack"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Bank transfers are confirmed automatically through Monnify. Card
            and USSD payments continue through Paystack.
          </p>

          <div className="mt-6 rounded-2xl bg-[#FAF7EF] p-4 text-sm leading-6 text-gray-600">
            <span className="font-black text-[#052E24]">Security note:</span>{" "}
            Card and USSD payments are handled by Paystack. Instant bank
            transfers are handled and verified by Monnify.
          </div>
        </aside>
      </section>
    </main>
  );
}
export default function CheckoutPage() {
    return (
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
            <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
              <h1 className="text-4xl font-black text-[#052E24]">
                Loading checkout...
              </h1>
  
              <p className="mt-3 text-gray-600">
                Please wait while we prepare your checkout page.
              </p>
            </section>
          </main>
        }
      >
        <CheckoutContent />
      </Suspense>
    );
  }