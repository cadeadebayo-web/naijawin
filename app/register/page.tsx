"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function validateForm() {
    if (!fullName.trim()) {
      return "Full name is required.";
    }

    if (!email.trim()) {
      return "Email address is required.";
    }

    if (!phone.trim()) {
      return "Phone number is required.";
    }

    if (!stateValue.trim()) {
      return "State is required.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  }

  async function handleRegister() {
    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          state: stateValue,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        state: stateValue,
        role: "user",
      });

      if (profileError) {
        setIsSubmitting(false);
        setErrorMessage(profileError.message);
        return;
      }
    }

    setMessage("Account created successfully. Redirecting to My Entries...");

    setTimeout(() => {
      router.push("/my-entries");
    }, 1000);

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="font-black text-[#D6A84F]">Create Account</p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-[#052E24] md:text-6xl">
            Join NaijaWin and start entering competitions.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
            Create your account to save your entries, view ticket numbers, track
            orders and receive winner notifications.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-2xl font-black text-[#D6A84F]">✓</p>

              <h2 className="mt-3 font-black text-[#052E24]">
                Save Your Entries
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep your order history and ticket numbers in one secure
                account.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-2xl font-black text-[#D6A84F]">✓</p>

              <h2 className="mt-3 font-black text-[#052E24]">Winner Alerts</h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Receive updates when draws are completed and winners are
                announced.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <h2 className="text-3xl font-black text-[#052E24]">Register</h2>

          <p className="mt-2 text-gray-600">
            Enter your details below to create your account.
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
                htmlFor="fullName"
                className="block text-sm font-black text-[#052E24]"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

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
                htmlFor="phone"
                className="block text-sm font-black text-[#052E24]"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Example: 08012345678"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-black text-[#052E24]"
              >
                State
              </label>

              <select
                id="state"
                value={stateValue}
                onChange={(event) => setStateValue(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#D6A84F]"
              >
                <option value="">Select your state</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja / FCT">Abuja / FCT</option>
                <option value="Rivers">Rivers</option>
                <option value="Oyo">Oyo</option>
                <option value="Kano">Kano</option>
                <option value="Kaduna">Kaduna</option>
                <option value="Ogun">Ogun</option>
                <option value="Anambra">Anambra</option>
                <option value="Enugu">Enugu</option>
                <option value="Kwara">Kwara</option>
                <option value="Other">Other</option>
              </select>
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
                placeholder="Create a password"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
              />
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#D6A84F] px-6 py-4 font-black text-[#052E24] transition hover:bg-[#052E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[#052E24] underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}