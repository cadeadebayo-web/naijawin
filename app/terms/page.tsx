export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">

      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Legal</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Terms and Conditions.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            This page will contain the rules for using the platform and entering
            competitions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl bg-white p-8 leading-8 shadow-lg">
          <p>
            These draft terms are placeholders. Before public launch, this page
            should be reviewed by a qualified Nigerian legal adviser.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            1. Eligibility
          </h2>
          <p className="mt-3">
            Users must meet the eligibility requirements stated for each
            competition before entering.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            2. Competition Entries
          </h2>
          <p className="mt-3">
            Entries are only confirmed after successful payment or valid free
            entry processing, depending on the competition rules.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            3. Winner Selection
          </h2>
          <p className="mt-3">
            Winners will be selected through a transparent draw process and
            published on the website.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            4. Payments
          </h2>
          <p className="mt-3">
            Payment options may include card, bank transfer, USSD or other
            supported local payment methods.
          </p>

          <h2 className="mt-8 text-2xl font-black text-[#052E24]">
            5. Legal Review
          </h2>
          <p className="mt-3">
            This business model may require legal and regulatory approval before
            public launch in Nigeria.
          </p>
        </div>
      </section>
    </main>
  );
}