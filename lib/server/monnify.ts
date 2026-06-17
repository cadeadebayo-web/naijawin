import crypto from "crypto";

const DEFAULT_SANDBOX_BASE_URL = "https://sandbox.monnify.com";
const DEFAULT_LIVE_BASE_URL = "https://api.monnify.com";

export type MonnifyTransaction = {
  transactionReference?: string;
  paymentReference?: string;
  paymentStatus?: string;
  amountPaid?: number;
  totalPayable?: number;
  currencyCode?: string;
  paymentMethod?: string;
};

function getBaseUrl() {
  const configured = process.env.MONNIFY_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return process.env.MONNIFY_ENVIRONMENT === "live"
    ? DEFAULT_LIVE_BASE_URL
    : DEFAULT_SANDBOX_BASE_URL;
}

function getCredentials() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const contractCode = process.env.MONNIFY_CONTRACT_CODE;

  if (!apiKey || !secretKey || !contractCode) {
    throw new Error(
      "Monnify credentials are missing. Add MONNIFY_API_KEY, MONNIFY_SECRET_KEY and MONNIFY_CONTRACT_CODE."
    );
  }

  return { apiKey, secretKey, contractCode };
}

export async function getMonnifyAccessToken() {
  const { apiKey, secretKey } = getCredentials();
  const basicToken = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const response = await fetch(`${getBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();
  const accessToken = payload?.responseBody?.accessToken;

  if (!response.ok || !payload?.requestSuccessful || !accessToken) {
    throw new Error(payload?.responseMessage || "Unable to authenticate with Monnify.");
  }

  return accessToken as string;
}

export async function initializeMonnifyTransfer(input: {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  redirectUrl: string;
}) {
  const accessToken = await getMonnifyAccessToken();
  const { contractCode } = getCredentials();

  const response = await fetch(
    `${getBaseUrl()}/api/v1/merchant/transactions/init-transaction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        paymentReference: input.paymentReference,
        paymentDescription: input.paymentDescription,
        currencyCode: "NGN",
        contractCode,
        redirectUrl: input.redirectUrl,
        paymentMethods: ["ACCOUNT_TRANSFER"],
      }),
      cache: "no-store",
    }
  );

  const payload = await response.json();
  const body = payload?.responseBody;

  if (
    !response.ok ||
    !payload?.requestSuccessful ||
    !body?.checkoutUrl ||
    !body?.transactionReference
  ) {
    throw new Error(payload?.responseMessage || "Unable to initialize Monnify payment.");
  }

  return {
    checkoutUrl: body.checkoutUrl as string,
    transactionReference: body.transactionReference as string,
    paymentReference: (body.paymentReference || input.paymentReference) as string,
  };
}

export async function getMonnifyTransaction(transactionReference: string) {
  const accessToken = await getMonnifyAccessToken();

  const response = await fetch(
    `${getBaseUrl()}/api/v2/transactions/${encodeURIComponent(transactionReference)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.requestSuccessful || !payload?.responseBody) {
    throw new Error(payload?.responseMessage || "Unable to verify Monnify transaction.");
  }

  return payload.responseBody as MonnifyTransaction;
}

function safeEqualHex(left: string, right: string) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function verifyMonnifySignature(rawBody: string, signature: string | null) {
  const secretKey = process.env.MONNIFY_SECRET_KEY;

  if (!secretKey || !signature) {
    return false;
  }

  const hmacSignature = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  const legacySignature = crypto
    .createHash("sha512")
    .update(`${secretKey}${rawBody}`)
    .digest("hex");

  return (
    safeEqualHex(signature.toLowerCase(), hmacSignature.toLowerCase()) ||
    safeEqualHex(signature.toLowerCase(), legacySignature.toLowerCase())
  );
}
