import crypto from "crypto";
import { NextResponse } from "next/server";
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

async function confirmPaidOrder(reference: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return {
      success: false,
      message: "Supabase server credentials are missing.",
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: orderData, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, competition_id, quantity, amount, payment_status")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !orderData) {
    return {
      success: false,
      message: "Order not found for this payment reference.",
    };
  }

  const order = orderData as OrderRecord;

  if (order.payment_status === "paid") {
    return {
      success: true,
      message: "Order already paid.",
      orderId: order.id,
    };
  }

  if (!order.user_id || !order.competition_id) {
    return {
      success: false,
      message: "Order is missing user or competition link.",
    };
  }

  const { data: competitionData, error: competitionError } = await supabaseAdmin
    .from("competitions")
    .select("id, max_entries, entries_sold")
    .eq("id", order.competition_id)
    .single();

  if (competitionError || !competitionData) {
    return {
      success: false,
      message: "Competition not found.",
    };
  }

  const competition = competitionData as CompetitionRecord;

  const remainingEntries = Math.max(
    competition.max_entries - competition.entries_sold,
    0
  );

  if (order.quantity > remainingEntries) {
    return {
      success: false,
      message:
        "Payment received, but not enough tickets remain. Manual admin review required.",
    };
  }

  const { data: existingTickets, error: existingTicketsError } =
    await supabaseAdmin
      .from("entries")
      .select("id")
      .eq("order_id", order.id);

  if (existingTicketsError) {
    return {
      success: false,
      message: existingTicketsError.message,
    };
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
      return {
        success: false,
        message: ticketError.message,
      };
    }

    const newEntriesSold = competition.entries_sold + order.quantity;

    const { error: competitionUpdateError } = await supabaseAdmin
      .from("competitions")
      .update({ entries_sold: newEntriesSold })
      .eq("id", competition.id);

    if (competitionUpdateError) {
      return {
        success: false,
        message: competitionUpdateError.message,
      };
    }
  }

  const { error: orderUpdateError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    return {
      success: false,
      message: orderUpdateError.message,
    };
  }

  return {
    success: true,
    message: "Order confirmed successfully.",
    orderId: order.id,
  };
}

export async function POST(request: Request) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { success: false, message: "Paystack secret key is missing." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing Paystack signature." },
        { status: 401 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha512", paystackSecretKey)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return NextResponse.json({
        success: true,
        message: `Ignored event: ${event.event}`,
      });
    }

    const reference = event.data?.reference;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Missing payment reference." },
        { status: 400 }
      );
    }

    const result = await confirmPaidOrder(reference);

    if (!result.success) {
      console.error("Paystack webhook processing failed:", result.message);

      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while handling Paystack webhook.",
      },
      { status: 500 }
    );
  }
}