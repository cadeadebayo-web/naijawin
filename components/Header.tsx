"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Competitions", href: "/competitions" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Winners", href: "/winners" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#052E24]/95 text-white shadow-xl backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 text-2xl font-black tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#D6A84F] text-sm text-[#052E24] shadow-lg transition group-hover:rotate-6">
            NW
          </span>
          Naija<span className="-ml-2 text-[#D6A84F]">Win</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-2 text-sm font-bold md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-[#D6A84F]"
            >
              {link.label}
            </Link>
          ))}

          {userEmail && (
            <Link
              href="/my-entries"
              className="rounded-full px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-[#D6A84F]"
            >
              My Entries
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-[#D6A84F]"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isCheckingUser ? (
            <span className="text-sm font-bold text-white/60">Checking...</span>
          ) : userEmail ? (
            <>
              <span className="max-w-[150px] truncate rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/75">
                {userEmail}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-black text-white transition hover:text-[#D6A84F]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-black text-white transition hover:text-[#D6A84F]"
            >
              Login
            </Link>
          )}

          <Link
            href="/competitions"
            className="rounded-full bg-[#D6A84F] px-5 py-2.5 text-sm font-black text-[#052E24] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
          >
            Enter Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-2xl font-black text-white md:hidden"
          aria-label="Open mobile menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#052E24] px-5 pb-5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
              >
                {link.label}
              </Link>
            ))}

            {userEmail && (
              <Link
                href="/my-entries"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
              >
                My Entries
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
              >
                Admin
              </Link>
            )}

            {isCheckingUser ? (
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white/70">
                Checking login...
              </div>
            ) : userEmail ? (
              <>
                <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-bold text-white/70">
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
                className="rounded-2xl bg-white/10 px-5 py-4 text-center text-sm font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
              >
                Login
              </Link>
            )}

            <Link
              href="/competitions"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-[#D6A84F] px-5 py-4 text-center text-sm font-black text-[#052E24] transition hover:bg-white"
            >
              Enter Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
