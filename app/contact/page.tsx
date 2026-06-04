export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">

      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Contact Us</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Need help? We are here for you.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Contact our support team for help with competitions, payments,
            entries or winner information.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-3xl font-black text-[#052E24]">
            Support Details
          </h2>

          <div className="mt-6 space-y-4 text-gray-700">
            <p>
              <span className="font-black text-[#052E24]">Email:</span>{" "}
              support@naijawin.com
            </p>

            <p>
              <span className="font-black text-[#052E24]">Phone:</span>{" "}
              +234 000 000 0000
            </p>

            <p>
              <span className="font-black text-[#052E24]">WhatsApp:</span>{" "}
              +234 000 000 0000
            </p>

            <p>
              <span className="font-black text-[#052E24]">Support Hours:</span>{" "}
              Monday - Saturday, 9am - 6pm
            </p>
          </div>
        </div>

        <form className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-3xl font-black text-[#052E24]">
            Send a Message
          </h2>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
            />

            <textarea
              placeholder="Your message"
              rows={6}
              className="w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-[#D6A84F]"
            />

            <button
              type="button"
              className="w-full rounded-full bg-[#052E24] px-6 py-4 font-black text-white transition hover:bg-[#D6A84F] hover:text-[#052E24]"
            >
              Send Message
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}