"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Competitions",
    href: "/competitions",
  },
  {
    label: "How It Works",
    href: "/how-it-works",
  },
  {
    label: "Winners",
    href: "/winners",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  async function checkUserAndRole() {
    setIsCheckingUser(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserEmail("");
      setIsAdmin(false);
      setIsCheckingUser(false);
      return;
    }

    setUserEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
    setIsCheckingUser(false);
  }

  useEffect(() => {
    checkUserAndRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUserAndRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail("");
    setIsAdmin(false);
    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#D6A84F]/30 bg-[linear-gradient(90deg,#FFFDF7_0%,#FAF7EF_42%,#F4E6C5_100%)] text-[#052E24] shadow-[0_14px_45px_rgba(5,46,36,0.14)] backdrop-blur">
      <div className="h-1 bg-[linear-gradient(90deg,#052E24,#D6A84F,#052E24)]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-2xl bg-white/70 px-3 py-2 shadow-[0_10px_26px_rgba(5,46,36,0.08)] ring-1 ring-[#D6A84F]/20 transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(5,46,36,0.12)]"
          onClick={() => setMenuOpen(false)}
          aria-label="NaijaWin home"
        >
          <img
            src="/images/branding/naijawin-logo-main.png"
            alt="NaijaWin"
            className="h-12 w-[185px] object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center rounded-full border border-[#052E24]/10 bg-white/72 px-2 py-2 text-sm font-black shadow-inner md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {userEmail && (
            <Link
              href="/my-entries"
              className="rounded-full px-4 py-2 text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              My Entries
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-[#052E24] transition hover:bg-[#052E24] hover:text-white"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isCheckingUser ? (
            <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-[#052E24]/60 shadow-sm">
              Checking...
            </span>
          ) : userEmail ? (
            <>
              <span className="max-w-[170px] truncate rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-[#052E24]/75 shadow-sm ring-1 ring-[#052E24]/5">
                {userEmail}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-black text-[#052E24] transition hover:bg-white hover:text-[#D6A84F]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-black text-[#052E24] transition hover:bg-white hover:text-[#D6A84F]"
            >
              Login
            </Link>
          )}

          <Link
            href="/competitions"
            className="rounded-full bg-[#D6A84F] px-6 py-3 text-sm font-black text-[#052E24] shadow-[0_10px_25px_rgba(214,168,79,0.34)] transition hover:-translate-y-0.5 hover:bg-[#052E24] hover:text-white"
          >
            Enter Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#052E24]/10 bg-white text-2xl font-black text-[#052E24] shadow-sm md:hidden"
          aria-label="Open mobile menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#D6A84F]/25 bg-[#FFFDF7] px-5 pb-5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-sm font-black text-[#052E24] shadow-sm transition hover:bg-[#D6A84F]"
              >
                {link.label}
              </Link>
            ))}

            {userEmail && (
              <Link
                href="/my-entries"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-sm font-black text-[#052E24] shadow-sm transition hover:bg-[#D6A84F]"
              >
                My Entries
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-sm font-black text-[#052E24] shadow-sm transition hover:bg-[#D6A84F]"
              >
                Admin
              </Link>
            )}

            {isCheckingUser ? (
              <div className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-sm font-black text-[#052E24]/70 shadow-sm">
                Checking login...
              </div>
            ) : userEmail ? (
              <>
                <div className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-sm font-bold text-[#052E24]/75 shadow-sm">
                  Logged in as {userEmail}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl bg-red-100 px-5 py-4 text-left text-sm font-black text-red-700 transition hover:bg-red-600 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-[#D6A84F]/25 bg-white px-5 py-4 text-center text-sm font-black text-[#052E24] shadow-sm transition hover:bg-[#D6A84F]"
              >
                Login
              </Link>
            )}

            <Link
              href="/competitions"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-[#D6A84F] px-5 py-4 text-center text-sm font-black text-[#052E24] shadow-md transition hover:bg-[#052E24] hover:text-white"
            >
              Enter Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
