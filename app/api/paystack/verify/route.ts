import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PaystackVerifyBody = {
  reference?: string;
};

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

export async function POST(request: Request) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { success: false, message: "Paystack secret key is missing." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Supabase server credentials are missing. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as PaystackVerifyBody;
    const reference = body.reference;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required." },
        { status: 400 }
      );
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json(
        {
          success: false,
          message: verifyData.message || "Unable to verify payment.",
        },
        { status: 400 }
      );
    }

    const transaction = verifyData.data;

    if (transaction.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment status is ${transaction.status}.`,
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        "id, user_id, competition_id, quantity, amount, payment_status"
      )
      .eq("payment_reference", reference)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found for this payment reference.",
        },
        { status: 404 }
      );
    }

    const order = orderData as OrderRecord;

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment was already confirmed.",
        orderId: order.id,
      });
    }

    if (!order.user_id || !order.competition_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order is missing user or competition link.",
        },
        { status: 400 }
      );
    }

    const expectedAmountInKobo = Math.round(order.amount * 100);

    if (transaction.amount !== expectedAmountInKobo) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount does not match the order amount.",
        },
        { status: 400 }
      );
    }

    const { data: competitionData, error: competitionError } =
      await supabaseAdmin
        .from("competitions")
        .select("id, max_entries, entries_sold")
        .eq("id", order.competition_id)
        .single();

    if (competitionError || !competitionData) {
      return NextResponse.json(
        { success: false, message: "Competition not found." },
        { status: 404 }
      );
    }

    const competition = competitionData as CompetitionRecord;

    const remainingEntries = Math.max(
      competition.max_entries - competition.entries_sold,
      0
    );

    if (order.quantity > remainingEntries) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verified, but there are not enough tickets remaining. Please contact support.",
        },
        { status: 400 }
      );
    }

    const { data: existingTickets, error: existingTicketsError } =
      await supabaseAdmin
        .from("entries")
        .select("id")
        .eq("order_id", order.id);

    if (existingTicketsError) {
      return NextResponse.json(
        { success: false, message: existingTicketsError.message },
        { status: 500 }
      );
    }

    if (!existingTickets || existingTickets.length === 0) {
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
        return NextResponse.json(
          { success: false, message: ticketError.message },
          { status: 500 }
        );
      }
    }

    const newEntriesSold = competition.entries_sold + order.quantity;

    const { error: competitionUpdateError } = await supabaseAdmin
      .from("competitions")
      .update({ entries_sold: newEntriesSold })
      .eq("id", competition.id);

    if (competitionUpdateError) {
      return NextResponse.json(
        { success: false, message: competitionUpdateError.message },
        { status: 500 }
      );
    }

    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      return NextResponse.json(
        { success: false, message: orderUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying payment.",
      },
      { status: 500 }
    );
  }
}