"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function validateForm() {
    if (!email.trim()) {
      return "Email address is required.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    return "";
  }

  async function handleLogin() {
    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Login successful. Redirecting to My Entries...");

    setTimeout(() => {
      router.push("/my-entries");
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="font-black text-[#D6A84F]">Welcome Back</p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-[#052E24] md:text-6xl">
            Login to view your entries and ticket numbers.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
            Access your NaijaWin account to manage competition entries, track
            payments and view draw results.
          </p>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-black text-[#052E24]">
              Account Benefits
            </h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-[#FAF7EF] p-4">
                <p className="font-black text-[#052E24]">
                  View ticket numbers
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  See confirmed tickets after successful payment.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7EF] p-4">
                <p className="font-black text-[#052E24]">Track your entries</p>

                <p className="mt-1 text-sm text-gray-600">
                  Keep records of all competitions you have entered.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7EF] p-4">
                <p className="font-black text-[#052E24]">
                  Receive winner updates
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Get notified when draws are completed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <h2 className="text-3xl font-black text-[#052E24]">Login</h2>

          <p className="mt-2 text-gray-600">
            Enter your email and password to continue.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-black text-[#052E24]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-black text-[#052E24]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="h-4 w-4" />
                Remember me
              </label>

              <Link href="#" className="font-black text-[#052E24] underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            New to NaijaWin?{" "}
            <Link
              href="/register"
              className="font-black text-[#052E24] underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}