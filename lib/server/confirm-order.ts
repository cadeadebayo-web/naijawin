import { createClient } from "@supabase/supabase-js";

type OrderRecord = {
  id: string;
  user_id: string | null;
  competition_id: string | null;
  quantity: number;
  amount: number;
  payment_status: string | null;
};

type CompetitionRecord = {
  id: string;
  max_entries: number;
  entries_sold: number;
};

function generateTicketNumber(index: number) {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const indexPart = String(index + 1).padStart(2, "0");
  return `NW-${randomPart}-${indexPart}`;
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server credentials are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function confirmOrderPaid(input: {
  orderId?: string;
  paymentReference?: string;
  provider: string;
  verifiedAmount: number;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  let orderQuery = supabaseAdmin
    .from("orders")
    .select("id, user_id, competition_id, quantity, amount, payment_status");

  orderQuery = input.orderId
    ? orderQuery.eq("id", input.orderId)
    : orderQuery.eq("payment_reference", input.paymentReference || "");

  const { data: orderData, error: orderError } = await orderQuery.single();

  if (orderError || !orderData) {
    throw new Error("Order not found for this payment.");
  }

  const order = orderData as OrderRecord;

  if (order.payment_status === "paid") {
    return { orderId: order.id, alreadyPaid: true };
  }

  if (Number(input.verifiedAmount) < Number(order.amount)) {
    throw new Error("The verified payment amount is lower than the order total.");
  }

  if (!order.user_id || !order.competition_id) {
    throw new Error("Order is missing its user or competition link.");
  }

  const { data: competitionData, error: competitionError } = await supabaseAdmin
    .from("competitions")
    .select("id, max_entries, entries_sold")
    .eq("id", order.competition_id)
    .single();

  if (competitionError || !competitionData) {
    throw new Error("Competition not found.");
  }

  const competition = competitionData as CompetitionRecord;

  const { data: existingTickets, error: existingTicketsError } =
    await supabaseAdmin.from("entries").select("id").eq("order_id", order.id);

  if (existingTicketsError) {
    throw new Error(existingTicketsError.message);
  }

  if (!existingTickets || existingTickets.length === 0) {
    const remainingEntries = Math.max(
      competition.max_entries - competition.entries_sold,
      0
    );

    if (order.quantity > remainingEntries) {
      throw new Error(
        "Payment was received, but there are not enough tickets remaining. Admin review is required."
      );
    }

    const ticketsToCreate = Array.from({ length: order.quantity }).map(
      (_, index) => ({
        user_id: order.user_id,
        competition_id: order.competition_id,
        order_id: order.id,
        ticket_number: generateTicketNumber(index),
        status: "confirmed",
      })
    );

    const { error: ticketError } = await supabaseAdmin
      .from("entries")
      .insert(ticketsToCreate);

    if (ticketError) {
      throw new Error(ticketError.message);
    }

    const { error: competitionUpdateError } = await supabaseAdmin
      .from("competitions")
      .update({ entries_sold: competition.entries_sold + order.quantity })
      .eq("id", competition.id);

    if (competitionUpdateError) {
      throw new Error(competitionUpdateError.message);
    }
  }

  const { error: orderUpdateError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      payment_provider: input.provider,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(orderUpdateError.message);
  }

  return { orderId: order.id, alreadyPaid: false };
}
