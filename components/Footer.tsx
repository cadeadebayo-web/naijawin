import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111827] px-5 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-2xl font-black">
            Naija<span className="text-[#D6A84F]">Win</span>
          </p>

          <p className="mt-2 text-sm text-white/60">
            Premium prize competitions built for Nigeria.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-white/70">
          <Link href="/terms" className="hover:text-[#D6A84F]">
            Terms
          </Link>

          <Link href="/privacy" className="hover:text-[#D6A84F]">
            Privacy
          </Link>

          <Link href="/terms" className="hover:text-[#D6A84F]">
            Responsible Play
          </Link>

          <Link href="/contact" className="hover:text-[#D6A84F]">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}