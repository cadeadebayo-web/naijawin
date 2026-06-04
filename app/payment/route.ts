import { NextResponse } from "next/server";

type VerifyResponse = {
  success: boolean;
  message?: string;
  orderId?: string;
};

function renderPaymentHtml({
  success,
  title,
  message,
  reference,
  orderId,
}: {
  success: boolean;
  title: string;
  message: string;
  reference: string;
  orderId: string;
}) {
  const icon = success ? "✓" : "!";
  const iconBg = success ? "#DCFCE7" : "#FEE2E2";
  const iconColor = success ? "#15803D" : "#B91C1C";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | NaijaWin</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #FAF7EF;
      color: #111827;
    }

    main {
      min-height: 100vh;
      padding: 80px 20px;
      box-sizing: border-box;
    }

    section {
      max-width: 760px;
      margin: 0 auto;
      background: white;
      border-radius: 28px;
      padding: 48px 32px;
      text-align: center;
      box-shadow: 0 18px 40px rgba(0,0,0,0.12);
    }

    .icon {
      width: 80px;
      height: 80px;
      border-radius: 999px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${iconBg};
      color: ${iconColor};
      font-size: 42px;
      font-weight: 900;
    }

    .label {
      margin-top: 32px;
      color: #D6A84F;
      font-weight: 900;
    }

    h1 {
      margin: 16px 0 0;
      color: #052E24;
      font-size: 48px;
      line-height: 1.1;
      font-weight: 900;
    }

    p {
      font-size: 18px;
      line-height: 1.7;
      color: #4B5563;
    }

    .box {
      margin-top: 24px;
      background: #FAF7EF;
      border-radius: 18px;
      padding: 18px;
      font-size: 14px;
      font-weight: 700;
      color: #4B5563;
      word-break: break-word;
    }

    .success-box {
      background: #ECFDF5;
      color: #047857;
    }

    .buttons {
      margin-top: 32px;
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    a {
      display: inline-block;
      text-decoration: none;
      border-radius: 999px;
      padding: 16px 28px;
      font-weight: 900;
    }

    .primary {
      background: #D6A84F;
      color: #052E24;
    }

    .secondary {
      border: 1px solid #052E24;
      color: #052E24;
    }

    @media (max-width: 640px) {
      h1 {
        font-size: 36px;
      }

      section {
        padding: 36px 20px;
      }
    }
  </style>
</head>
<body>
  <main>
    <section>
      <div class="icon">${icon}</div>

      <div class="label">Payment Verification</div>

      <h1>${title}</h1>

      <p>${message}</p>

      ${
        reference
          ? `<div class="box">Paystack Reference:<br /><strong>${reference}</strong></div>`
          : ""
      }

      ${
        orderId
          ? `<div class="box success-box">Order ID: <strong>${orderId.slice(
              0,
              8
            )}</strong></div>`
          : ""
      }

      <div class="buttons">
        <a class="primary" href="/competitions">Back to Competitions</a>
        <a class="secondary" href="/my-entries">View My Entries</a>
      </div>
    </section>
  </main>
</body>
</html>`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const reference = requestUrl.searchParams.get("reference") || "";

  if (!reference) {
    return new NextResponse(
      renderPaymentHtml({
        success: false,
        title: "Payment not confirmed",
        message: "Payment reference was not found.",
        reference: "",
        orderId: "",
      }),
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  try {
    const verifyUrl = new URL("/api/paystack/verify", requestUrl.origin);

    const response = await fetch(verifyUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference }),
      cache: "no-store",
    });

    const result = (await response.json()) as VerifyResponse;

    const success = Boolean(response.ok && result.success);

    return new NextResponse(
      renderPaymentHtml({
        success,
        title: success ? "Payment confirmed" : "Payment not confirmed",
        message:
          result.message ||
          (success
            ? "Payment verified successfully."
            : "Unable to verify payment."),
        reference,
        orderId: result.orderId || "",
      }),
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Payment callback route error:", error);

    return new NextResponse(
      renderPaymentHtml({
        success: false,
        title: "Payment not confirmed",
        message: "Unable to verify payment. Please contact support.",
        reference,
        orderId: "",
      }),
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}