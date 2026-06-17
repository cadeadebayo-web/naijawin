import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { confirmOrderPaid } from "@/lib/server/confirm-order";
import { getMonnifyTransaction } from "@/lib/server/monnify";

type VerifyBody = { orderId?: string; transactionReference?: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Supabase server credentials are missing." },
        { status: 500 }
      );
    }

    if (!body.orderId && !body.transactionReference) {
      return NextResponse.json(
        { success: false, message: "Order or transaction reference is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let transactionReference = body.transactionReference || "";
    const orderId = body.orderId || "";

    if (orderId) {
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select("id, payment_reference, payment_status")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        return NextResponse.json(
          { success: false, message: "Order could not be found." },
          { status: 404 }
        );
      }

      if (order.payment_status === "paid") {
        return NextResponse.json({
          success: true,
          message: "Payment confirmed successfully.",
          orderId: order.id,
        });
      }

      transactionReference = order.payment_reference || transactionReference;
    }

    if (!transactionReference) {
      return NextResponse.json(
        { success: false, message: "Monnify transaction reference is missing." },
        { status: 400 }
      );
    }

    const transaction = await getMonnifyTransaction(transactionReference);

    if (transaction.paymentStatus !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          pending: transaction.paymentStatus === "PENDING",
          message:
            transaction.paymentStatus === "PENDING"
              ? "Transfer is still awaiting confirmation. This page will retry automatically."
              : `Payment is not confirmed. Status: ${transaction.paymentStatus || "UNKNOWN"}.`,
        },
        { status: transaction.paymentStatus === "PENDING" ? 202 : 400 }
      );
    }

    const result = await confirmOrderPaid({
      orderId: orderId || undefined,
      paymentReference: transactionReference,
      provider: "monnify",
      verifiedAmount: Number(transaction.amountPaid || 0),
    });

    return NextResponse.json({
      success: true,
      message: "Bank transfer confirmed and your entries have been generated.",
      orderId: result.orderId,
    });
  } catch (error) {
    console.error("Monnify verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify Monnify payment.",
      },
      { status: 500 }
    );
  }
}
