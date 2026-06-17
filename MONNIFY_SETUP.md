# NaijaWin Monnify bank-transfer setup

This update adds Monnify for automatic bank-transfer confirmation while leaving the existing Paystack card and USSD flow in place.

## 1. Add environment variables

Copy these values from the Monnify dashboard under API Keys & Contracts:

- `MONNIFY_API_KEY`
- `MONNIFY_SECRET_KEY`
- `MONNIFY_CONTRACT_CODE`
- `MONNIFY_ENVIRONMENT=sandbox`
- `MONNIFY_BASE_URL=https://sandbox.monnify.com`

Keep `NEXT_PUBLIC_SITE_URL` set to your deployed website URL on Vercel.

## 2. Configure the webhook

In the Monnify dashboard, set the Transaction Completion webhook URL to:

`https://YOUR-DOMAIN/api/monnify/webhook`

For local development, use the Monnify sandbox simulator and a publicly reachable tunnel if webhook testing is required.

## 3. Test flow

1. Log in to NaijaWin.
2. Select a competition and quantity.
3. Choose **Instant Bank Transfer**.
4. Click **Continue to Instant Bank Transfer**.
5. Monnify opens a bank-transfer-only checkout.
6. Complete the sandbox payment.
7. The callback and webhook verify the payment server-side.
8. The order is marked paid and entries are generated automatically.

## 4. Go live later

After Monnify approves the account, replace sandbox credentials with live credentials and set:

- `MONNIFY_ENVIRONMENT=live`
- `MONNIFY_BASE_URL=https://api.monnify.com`

Do not expose the secret key in client-side code.
