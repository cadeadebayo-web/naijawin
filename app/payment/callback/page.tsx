import { Suspense } from "react";
import PaymentCallbackClient from "./PaymentCallbackClient";

export const dynamic = "force-dynamic";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
          <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-xl md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-4xl text-yellow-700">
              ...
            </div>

            <p className="mt-8 font-black text-[#D6A84F]">
              Payment Verification
            </p>

            <h1 className="mt-3 text-4xl font-black text-[#052E24] md:text-5xl">
              Loading payment result...
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Please wait while we prepare your payment verification page.
            </p>
          </section>
        </main>
      }
    >
      <PaymentCallbackClient />
    </Suspense>
  );
}