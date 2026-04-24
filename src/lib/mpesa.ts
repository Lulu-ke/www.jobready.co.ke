/**
 * M-Pesa Daraja STK Push Integration Library
 * Supports both SANDBOX and PRODUCTION environments.
 *
 * Usage:
 *   import { initiateSTKPush, getAccessToken, getBusinessShortCode } from '@/lib/mpesa';
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface STKPushParams {
  phone: string;
  amount: number;
  description: string;
  userId?: string;
  isProduction?: boolean;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

interface DarajaErrorResponse {
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
  responseCode?: string;
  responseDescription?: string;
}

interface OAuthToken {
  access_token: string;
  expires_in: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Kenyan phone number to the 254… format that Daraja expects. */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, "");

  if (cleaned.startsWith("254") && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length === 10)
    return "254" + cleaned.slice(1);
  if (
    cleaned.startsWith("7") &&
    cleaned.length === 9
  )
    return "254" + cleaned;
  if (
    cleaned.startsWith("1") &&
    cleaned.length === 9
  )
    return "254" + cleaned;

  return cleaned;
}

/** Return "YYYYMMDDHHmmss" for the current moment in East-Africa Time. */
function getTimestamp(): string {
  const now = new Date();
  // EAT is UTC+3
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const y = eat.getFullYear();
  const mo = String(eat.getMonth() + 1).padStart(2, "0");
  const d = String(eat.getDate()).padStart(2, "0");
  const h = String(eat.getHours()).padStart(2, "0");
  const mi = String(eat.getMinutes()).padStart(2, "0");
  const s = String(eat.getSeconds()).padStart(2, "0");
  return `${y}${mo}${d}${h}${mi}${s}`;
}

/**
 * Generate the base64-encoded password required by the STK Push endpoint.
 *
 * Password = Base64(Shortcode + Passkey + Timestamp)
 */
function generatePassword(
  businessShortCode: string,
  passkey: string,
  timestamp: string,
): string {
  const raw = businessShortCode + passkey + timestamp;
  return Buffer.from(raw).toString("base64");
}

// ---------------------------------------------------------------------------
// Token cache – avoid hitting the OAuth endpoint on every request
// ---------------------------------------------------------------------------

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // epoch ms

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Retrieve a valid OAuth access token from the Daraja API.
 * The token is cached in-memory for 50 minutes (tokens last 60 min).
 *
 * @param isProduction  When true, uses the production Daraja endpoint.
 */
export async function getAccessToken(
  isProduction?: boolean,
): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const production = isProduction ?? process.env.NODE_ENV === "production";

  const baseUrl = production
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const consumerKey = production
    ? process.env.MPESA_PROD_CONSUMER_KEY
    : process.env.MPESA_SANDBOX_CONSUMER_KEY;

  const consumerSecret = production
    ? process.env.MPESA_PROD_CONSUMER_SECRET
    : process.env.MPESA_SANDBOX_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      `Missing M-Pesa credentials for ${
        production ? "production" : "sandbox"
      } mode. Set ${
        production
          ? "MPESA_PROD_CONSUMER_KEY / MPESA_PROD_CONSUMER_SECRET"
          : "MPESA_SANDBOX_CONSUMER_KEY / MPESA_SANDBOX_CONSUMER_SECRET"
      } in environment variables.`,
    );
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );

  const res = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Failed to obtain M-Pesa OAuth token (HTTP ${res.status}): ${body}`,
    );
  }

  const data = (await res.json()) as OAuthToken;

  if (!data.access_token) {
    throw new Error("M-Pesa OAuth response did not contain an access_token.");
  }

  // Cache for 50 minutes (token lifespan is 60 min)
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + 50 * 60 * 1000;

  return cachedToken;
}

/**
 * Return the business shortcode to use for STK Push.
 * Sandbox always uses the Daraja test shortcode 174379.
 * Production reads from the MPESA_PROD_BUSINESS_SHORTCODE env var (default 5511376).
 */
export function getBusinessShortCode(isProduction?: boolean): string {
  const production = isProduction ?? process.env.NODE_ENV === "production";
  if (!production) return "174379";
  return process.env.MPESA_PROD_BUSINESS_SHORTCODE || "5511376";
}

/**
 * Initiate an M-Pesa STK (Lipa Na M-Pesa Online) Push request.
 *
 * @returns The Daraja STK Push response containing MerchantRequestID,
 *          CheckoutRequestID, ResponseCode and ResponseDescription.
 */
export async function initiateSTKPush(
  params: STKPushParams,
): Promise<STKPushResponse> {
  const { phone, amount, description, userId, isProduction } = params;

  const production = isProduction ?? process.env.NODE_ENV === "production";

  // ---- Resolve credentials ------------------------------------------------
  const accessToken = await getAccessToken(production);
  const businessShortCode = getBusinessShortCode(production);
  const passkey = production
    ? process.env.MPESA_PROD_PASSKEY
    : process.env.MPESA_SANDBOX_PASSKEY;

  if (!passkey) {
    throw new Error(
      `Missing M-Pesa passkey for ${
        production ? "production" : "sandbox"
      } mode. Set ${
        production ? "MPESA_PROD_PASSKEY" : "MPESA_SANDBOX_PASSKEY"
      } in environment variables.`,
    );
  }

  // ---- Build STK Push payload ---------------------------------------------
  const timestamp = getTimestamp();
  const password = generatePassword(businessShortCode, passkey, timestamp);
  const formattedPhone = formatPhoneNumber(phone);

  const callbackUrl = `${process.env.NEXTAUTH_URL || "https://www.jobready.co.ke"}/api/mpesa/callback`;

  const body: Record<string, unknown> = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: production
      ? (process.env.MPESA_PROD_TRANSACTION_TYPE || "CustomerBuyGoodsOnline")
      : "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: production
      ? (process.env.MPESA_PROD_PARTY_B || "9393975")
      : businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: userId || "GUEST",
    TransactionDesc: description.slice(0, 13), // Daraja limits to 13 chars
  };

  const baseUrl = production
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await res.json()) as STKPushResponse &
    DarajaErrorResponse;

  if (!res.ok || data.ResponseCode === undefined) {
    const errMsg =
      data.errorMessage ||
      data.responseDescription ||
      "Unknown error from Daraja API";
    throw new Error(
      `M-Pesa STK Push failed: ${errMsg} (errorCode: ${data.errorCode ?? data.responseCode ?? res.status})`,
    );
  }

  return {
    MerchantRequestID: data.MerchantRequestID,
    CheckoutRequestID: data.CheckoutRequestID,
    ResponseCode: data.ResponseCode,
    ResponseDescription: data.ResponseDescription,
  };
}
