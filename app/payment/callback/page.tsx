import PaymentCallbackClient from "./PaymentCallbackClient";

export const dynamic = "force-dynamic";

type PaymentCallbackPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function PaymentCallbackPage({
  searchParams,
}: PaymentCallbackPageProps) {
  const params = await searchParams;
  const reference = params.reference || "";

  return <PaymentCallbackClient reference={reference} />;
}