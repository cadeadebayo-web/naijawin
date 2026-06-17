import { NextResponse } from "next/server";
import { confirmOrderPaid } from "@/lib/server/confirm-order";
import {
  getMonnifyTransaction,
  verifyMonnifySignature,
} from "@/lib/server/monnify";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature");

    if (!verifyMonnifySignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, message: "Invalid Monnify signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventData = event?.eventData || event?.data || {};
    const transactionReference = eventData?.transactionReference;
    const paymentStatus = eventData?.paymentStatus;

    if (!transactionReference) {
      return NextResponse.json({ success: true, message: "Event acknowledged." });
    }

    if (paymentStatus && paymentStatus !== "PAID") {
      return NextResponse.json({
        success: true,
        message: `Ignored Monnify payment status: ${paymentStatus}`,
      });
    }

    const verifiedTransaction = await getMonnifyTransaction(transactionReference);

    if (verifiedTransaction.paymentStatus !== "PAID") {
      return NextResponse.json({
        success: true,
        message: "Transaction is not yet paid.",
      });
    }

    const result = await confirmOrderPaid({
      paymentReference: transactionReference,
      provider: "monnify",
      verifiedAmount: Number(verifiedTransaction.amountPaid || 0),
    });

    return NextResponse.json({
      success: true,
      message: "Monnify payment processed successfully.",
      orderId: result.orderId,
    });
  } catch (error) {
    console.error("Monnify webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process Monnify webhook.",
      },
      { status: 500 }
    );
  }
}
