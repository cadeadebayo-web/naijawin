export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">

      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Privacy</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Privacy Policy.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            This page explains how user information will be collected, used and
            protected.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl bg-white p-8 leading-8 shadow-lg">
          <p>
            This is a placeholder privacy policy. Before public launch, it should
            be reviewed to align with Nigerian data protection requirements.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            1. Information We Collect
          </h2>
          <p className="mt-3">
            We may collect names, email addresses, phone numbers, payment
            references, entry records and support messages.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            2. How We Use Information
          </h2>
          <p className="mt-3">
            Information may be used to manage accounts, process entries, confirm
            payments, contact winners and provide support.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            3. Payment Information
          </h2>
          <p className="mt-3">
            Payment processing will be handled by approved payment providers.
            Card details should not be stored directly on this website.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            4. Data Protection
          </h2>
          <p className="mt-3">
            Reasonable technical and organisational measures should be used to
            protect user information.
          </p>
        </div>
      </section>
    </main>
  );
}