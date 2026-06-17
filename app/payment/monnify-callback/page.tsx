"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VerifyResponse = {
  success: boolean;
  pending?: boolean;
  message?: string;
  orderId?: string;
};

export default function MonnifyCallbackPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Confirming your bank transfer...");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function verifyPayment() {
      const params = new URLSearchParams(window.location.search);
      const callbackOrderId = params.get("orderId") || "";
      const transactionReference =
        params.get("transactionReference") || params.get("paymentReference") || "";

      if (!callbackOrderId && !transactionReference) {
        setIsVerifying(false);
        setMessage("Payment reference was not found.");
        return;
      }

      try {
        const response = await fetch("/api/monnify/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: callbackOrderId,
            transactionReference,
          }),
        });

        const result = (await response.json()) as VerifyResponse;

        if (cancelled) return;

        if (result.success) {
          setIsVerifying(false);
          setIsSuccess(true);
          setMessage(result.message || "Payment confirmed successfully.");
          setOrderId(result.orderId || callbackOrderId);
          return;
        }

        if ((response.status === 202 || result.pending) && attempts < 8) {
          attempts += 1;
          setMessage(result.message || "Waiting for bank confirmation...");
          window.setTimeout(verifyPayment, 4000);
          return;
        }

        setIsVerifying(false);
        setIsSuccess(false);
        setMessage(result.message || "Payment has not been confirmed.");
      } catch (error) {
        console.error("Monnify callback error:", error);

        if (!cancelled) {
          setIsVerifying(false);
          setIsSuccess(false);
          setMessage("Unable to verify the transfer. Please check My Entries shortly or contact support.");
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl md:p-12">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            isVerifying
              ? "bg-yellow-100 text-yellow-700"
              : isSuccess
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isVerifying ? "…" : isSuccess ? "✓" : "!"}
        </div>

        <p className="mt-8 font-black text-[#D6A84F]">Bank Transfer Verification</p>
        <h1 className="mt-3 text-4xl font-black text-[#052E24] md:text-5xl">
          {isVerifying
            ? "Checking your transfer..."
            : isSuccess
            ? "Payment confirmed"
            : "Payment not confirmed"}
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-600">{message}</p>

        {orderId && (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
            Order ID: {orderId.slice(0, 8)}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/my-entries"
            className="rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            View My Entries
          </Link>
          <Link
            href="/competitions"
            className="rounded-full border border-[#052E24] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            Back to Competitions
          </Link>
        </div>
      </section>
    </main>
  );
}
