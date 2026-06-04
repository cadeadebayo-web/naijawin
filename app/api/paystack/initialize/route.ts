import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type InitializePaymentBody = {
  email?: string;
  amount?: number;
  orderId?: string;
  competitionTitle?: string;
  customerName?: string;
};

function getSupabaseJwtRole(token: string) {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return "";
    }

    const decodedPayload = JSON.parse(
      Buffer.from(payloadPart, "base64").toString("utf8")
    );

    return decodedPayload.role || "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack secret key is missing.",
        },
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

    const supabaseKeyRole = getSupabaseJwtRole(supabaseServiceRoleKey);

    if (supabaseKeyRole !== "service_role") {
      return NextResponse.json(
        {
          success: false,
          message:
            "SUPABASE_SERVICE_ROLE_KEY is not the service_role key. You may have pasted the anon key by mistake.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as InitializePaymentBody;

    const email = body.email;
    const amount = body.amount;
    const orderId = body.orderId;
    const competitionTitle = body.competitionTitle || "NaijaWin Competition";
    const customerName = body.customerName || "NaijaWin Customer";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer email is required.",
        },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid payment amount is required.",
        },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const amountInKobo = Math.round(amount * 100);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const callbackUrl = `${baseUrl}/payment/callback`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          currency: "NGN",
          callback_url: callbackUrl,
          metadata: {
            order_id: orderId,
            competition_title: competitionTitle,
            customer_name: customerName,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            paystackData.message ||
            "Unable to initialize Paystack payment.",
        },
        { status: 400 }
      );
    }

    const reference = paystackData.data.reference;

    const { data: updatedOrder, error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_provider: "paystack",
        payment_reference: reference,
      })
      .eq("id", orderId)
      .select("id, payment_reference")
      .single();

    if (updateOrderError) {
      return NextResponse.json(
        {
          success: false,
          message: `Order update failed: ${updateOrderError.message}`,
        },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order was not updated. Order ID may be incorrect.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while initializing payment.",
      },
      { status: 500 }
    );
  }
}