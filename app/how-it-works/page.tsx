const steps = [
  {
    title: "Choose a Competition",
    text: "Browse available competitions and select the prize you want to enter for.",
  },
  {
    title: "Select Your Tickets",
    text: "Choose how many tickets you want. The total amount will be calculated automatically.",
  },
  {
    title: "Answer the Question",
    text: "Some competitions may include a simple skill-based question before entry.",
  },
  {
    title: "Pay Securely",
    text: "Pay using card, bank transfer or USSD when payment is activated.",
  },
  {
    title: "Receive Ticket Numbers",
    text: "After successful payment, your ticket numbers will be generated and saved to your account.",
  },
  {
    title: "Watch the Draw",
    text: "Winners will be selected through a transparent draw process and published on the website.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#FAF7EF] text-[#111827]">

      <section className="bg-[#052E24] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-black text-[#D6A84F]">Simple Process</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Enter competitions in a few simple steps.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            The process is designed to be simple, clear and easy for Nigerian
            users on both mobile and desktop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#052E24] text-xl font-black text-[#D6A84F]">
                {index + 1}
              </div>

              <h2 className="text-2xl font-black text-[#052E24]">
                {step.title}
              </h2>

              <p className="mt-3 leading-7 text-gray-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}