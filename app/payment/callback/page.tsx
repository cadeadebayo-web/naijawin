"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  success: boolean;
  message?: string;
  orderId?: string;
};

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setIsVerifying(false);
        setIsSuccess(false);
        setMessage("Payment reference was not found.");
        return;
      }

      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const result = (await response.json()) as VerifyResponse;

        setIsVerifying(false);
        setIsSuccess(Boolean(result.success));
        setMessage(result.message || "Payment verification completed.");
        setOrderId(result.orderId || "");
      } catch (error) {
        console.error("Payment callback error:", error);
        setIsVerifying(false);
        setIsSuccess(false);
        setMessage("Unable to verify payment. Please contact support.");
      }
    }

    verifyPayment();
  }, [reference]);

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

        <p className="mt-8 font-black text-[#D6A84F]">
          Payment Verification
        </p>

        <h1 className="mt-3 text-4xl font-black text-[#052E24] md:text-5xl">
          {isVerifying
            ? "Checking your payment..."
            : isSuccess
            ? "Payment confirmed"
            : "Payment not confirmed"}
        </h1>

        <p className="mt-5 text-lg leading-8 text-gray-600">{message}</p>

        {reference && (
          <div className="mt-6 rounded-2xl bg-[#FAF7EF] p-4 text-sm font-bold text-gray-600">
            Paystack Reference:
            <br />
            <span className="break-all text-[#052E24]">{reference}</span>
          </div>
        )}

        {orderId && (
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
            Order ID: {orderId.slice(0, 8)}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/competitions"
            className="rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            Back to Competitions
          </Link>

          <Link
            href="/account"
            className="rounded-full border border-[#052E24] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
          >
            View My Account
          </Link>
        </div>
      </section>
    </main>
  );
}