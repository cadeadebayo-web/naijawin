"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminGuardProps = {
  children: React.ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function checkAdminAccess() {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserEmail("");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAdmin(profile?.role === "admin");
      setIsLoading(false);
    }

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] px-5 py-20 text-[#111827]">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-4xl font-black text-[#052E24]">
            Checking admin access...
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we verify your account permissions.
          </p>
        </section>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-black text-[#D6A84F]">Admin Area</p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Login required.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
              You must login with an admin account before accessing this page.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-8 py-4 font-black text-[#052E24] transition hover:bg-white"
            >
              Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">
        <section className="bg-[#052E24] px-5 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-black text-[#D6A84F]">Access Denied</p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Admin access required.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
              You are logged in as {userEmail}, but this account does not have
              admin permission.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-[#D6A84F] px-8 py-4 font-black text-[#052E24] transition hover:bg-white"
            >
              Back to Homepage
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}