import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { initializeMonnifyTransfer } from "@/lib/server/monnify";

type InitializeBody = {
  orderId?: string;
  email?: string;
  customerName?: string;
  competitionTitle?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitializeBody;

    if (!body.orderId || !body.email) {
      return NextResponse.json(
        { success: false, message: "Order ID and customer email are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Supabase server credentials are missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, amount, payment_status")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: "Order could not be found." },
        { status: 404 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { success: false, message: "This order has already been paid." },
        { status: 409 }
      );
    }

    if (!order.amount || order.amount <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid order amount is required." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const paymentReference = `NW-MF-${order.id}-${Date.now()}`;
    const redirectUrl = `${baseUrl}/payment/monnify-callback?orderId=${encodeURIComponent(order.id)}`;

    const result = await initializeMonnifyTransfer({
      amount: Number(order.amount),
      customerName: body.customerName || body.email,
      customerEmail: body.email,
      paymentReference,
      paymentDescription:
        body.competitionTitle || "NaijaWin competition entry payment",
      redirectUrl,
    });

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_method: "transfer",
        payment_provider: "monnify",
        payment_reference: result.transactionReference,
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      transactionReference: result.transactionReference,
    });
  } catch (error) {
    console.error("Monnify initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to initialize Monnify bank transfer.",
      },
      { status: 500 }
    );
  }
}
