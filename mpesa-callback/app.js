/**
 * JobReady Kenya — Standalone M-Pesa Callback Handler
 *
 * Runs on api.jobready.co.ke via cPanel Node.js (Phusion Passenger).
 * Connects to MySQL on localhost — the same DB used by the main Vercel app.
 *
 * Routes:
 *   POST /mpesa-callback  — Receives Safaricom STK Push results
 *   GET  /health           — Health check (DB ping)
 */

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Parse JSON bodies (Safaricom sends application/json)
app.use(express.json({ strict: false }));

// Request logging
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------------------------------------------
// MySQL Connection Pool
// ---------------------------------------------------------------------------

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
});

/**
 * Execute a query against the connection pool.
 * Automatically releases the connection back to the pool.
 */
async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Test DB connection on startup
(async () => {
  try {
    const [rows] = await pool.execute("SELECT 1 AS ok");
    console.log("[DB] MySQL connection successful.");
  } catch (err) {
    console.error("[DB] MySQL connection FAILED:", err.message);
    process.exit(1);
  }
})();

// ---------------------------------------------------------------------------
// Phone Normalizer
// ---------------------------------------------------------------------------

/**
 * Normalize a Kenyan phone number to 254XXXXXXXXX format.
 * Mirrors the logic from src/lib/phone.ts in the main app.
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  const cleaned = phone.replace(/[\s\-()]/g, "");

  if (/^254[71]\d{8}$/.test(cleaned)) return cleaned;
  if (/^\+254[71]\d{8}$/.test(cleaned)) return cleaned.slice(1);
  if (/^0[71]\d{8}$/.test(cleaned)) return "254" + cleaned.slice(1);
  if (/^[71]\d{8}$/.test(cleaned)) return "254" + cleaned;

  return null;
}

// ---------------------------------------------------------------------------
// M-Pesa Callback Handler
// ---------------------------------------------------------------------------

/**
 * POST /mpesa-callback
 *
 * Receives the STK Push callback from Safaricom.
 * Body structure (from Daraja):
 *   {
 *     "Body": {
 *       "stkCallback": {
 *         "MerchantRequestID": "...",
 *         "CheckoutRequestID": "...",
 *         "ResultCode": 0,        // 0 = success, non-zero = failure
 *         "ResultDesc": "...",
 *         "CallbackMetadata": {
 *           "Item": [
 *             { "Name": "Amount",       "Value": 100 },
 *             { "Name": "MpesaReceiptNumber", "Value": "SJL4RR3P5V" },
 *             { "Name": "PhoneNumber",  "Value": 254712345678 }
 *           ]
 *         }
 *       }
 *     }
 *   }
 */
app.post("/mpesa-callback", async (req, res) => {
  // ALWAYS respond 200 immediately to Safaricom — never leave them hanging
  // (We process async after sending the response)

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const body = req.body;
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback || !stkCallback.CheckoutRequestID) {
      console.error("[MPESA] Invalid callback — missing stkCallback or CheckoutRequestID");
      return;
    }

    const {
      MerchantRequestID: merchantReqId,
      CheckoutRequestID: checkoutReqId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
      CallbackMetadata: callbackMetadata,
    } = stkCallback;

    console.log(`[MPESA] Callback received — checkoutReqId: ${checkoutReqId}, resultCode: ${resultCode}`);

    // -----------------------------------------------------------------------
    // 1. Find the payment record
    // -----------------------------------------------------------------------
    const payments = await query(
      "SELECT * FROM MpesaPayment WHERE checkoutReqId = ? LIMIT 1",
      [checkoutReqId]
    );

    if (!payments || payments.length === 0) {
      console.error(`[MPESA] No payment found for checkoutReqId: ${checkoutReqId}`);
      return;
    }

    const payment = payments[0];

    // Skip if already processed (idempotency)
    if (payment.status === "SUCCESS" || payment.status === "FAILED") {
      console.log(`[MPESA] Payment already processed (status: ${payment.status}), skipping.`);
      return;
    }

    // -----------------------------------------------------------------------
    // 2. Handle success
    // -----------------------------------------------------------------------
    if (resultCode === 0) {
      // Extract metadata
      const items = callbackMetadata?.Item || [];
      const getMeta = (name) => {
        const item = items.find((i) => i.Name === name);
        return item?.Value;
      };

      const amount = Number(getMeta("Amount") ?? payment.amount);
      const mpesaReceiptNumber = String(getMeta("MpesaReceiptNumber") ?? "");
      const phoneNumber = String(getMeta("PhoneNumber") ?? payment.phone);

      console.log(`[MPESA] SUCCESS — receipt: ${mpesaReceiptNumber}, amount: ${amount}, phone: ${phoneNumber}`);

      // -------------------------------------------------------------------
      // 2a. Branch on purpose
      // -------------------------------------------------------------------
      const purpose = payment.purpose || "scan_credits";

      if (purpose === "pro_subscription") {
        await handleProSubscription(payment, amount, mpesaReceiptNumber);
      } else if (purpose === "cv_builder_access") {
        // Future: grant CV builder access
        await handleGenericSuccess(payment, amount, mpesaReceiptNumber, merchantReqId, resultDesc, body);
      } else if (purpose === "sponsored_ad") {
        // Future: activate sponsored job ad
        await handleGenericSuccess(payment, amount, mpesaReceiptNumber, merchantReqId, resultDesc, body);
      } else {
        // Default: scan credits
        await handleScanCredits(payment, amount, mpesaReceiptNumber, phoneNumber, merchantReqId, resultDesc, body);
      }

    } else {
      // -------------------------------------------------------------------
      // 3. Handle failure
      // -------------------------------------------------------------------
      await query(
        `UPDATE MpesaPayment SET status = ?, resultDesc = ?, callbackRaw = ?, merchantReqId = ?, updatedAt = NOW() WHERE id = ?`,
        ["FAILED", resultDesc, JSON.stringify(body), merchantReqId || null, payment.id]
      );

      console.log(`[MPESA] FAILED — checkoutReqId: ${checkoutReqId}, code: ${resultCode}, desc: ${resultDesc}`);
    }

  } catch (error) {
    console.error("[MPESA] Unhandled error processing callback:", error);
  }
});

// ---------------------------------------------------------------------------
// Purpose Handlers
// ---------------------------------------------------------------------------

/**
 * Handle scan credits purchase — creates a ScanCredit record.
 */
async function handleScanCredits(payment, amount, mpesaReceiptNumber, phoneNumber, merchantReqId, resultDesc, rawBody) {
  const normalizedPhone = normalizePhone(phoneNumber) || payment.phone;

  // Create scan credit
  const creditId = generateId();
  await query(
    `INSERT INTO ScanCredit (id, userId, phone, totalScans, scansUsed, scanType, amountPaid, mpesaRef, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [creditId, payment.userId || null, normalizedPhone, 4, 0, "ANONYMOUS_PAID", amount, mpesaReceiptNumber, true]
  );

  // Update payment
  await query(
    `UPDATE MpesaPayment SET status = ?, mpesaRef = ?, resultDesc = ?, callbackRaw = ?, merchantReqId = ?, creditId = ?, updatedAt = NOW() WHERE id = ?`,
    ["SUCCESS", mpesaReceiptNumber, resultDesc, JSON.stringify(rawBody), merchantReqId || null, creditId, payment.id]
  );

  console.log(`[MPESA] Scan credit created — creditId: ${creditId}, phone: ${normalizedPhone}`);
}

/**
 * Handle Pro subscription activation/extension.
 */
async function handleProSubscription(payment, amount, mpesaReceiptNumber) {
  // Check for existing active subscription
  const subs = await query(
    `SELECT * FROM ProSubscription WHERE userId = ?`,
    [payment.userId]
  );

  const existingSub = subs && subs.length > 0 ? subs[0] : null;

  if (existingSub && existingSub.status === "ACTIVE" && new Date(existingSub.currentPeriodEnd) > new Date()) {
    // Extend existing subscription by 30 days
    await query(
      `UPDATE ProSubscription SET currentPeriodEnd = DATE_ADD(currentPeriodEnd, INTERVAL 30 DAY), amountPaid = amountPaid + ?, mpesaRef = ?, updatedAt = NOW() WHERE id = ?`,
      [amount, mpesaReceiptNumber, existingSub.id]
    );
    console.log(`[MPESA] Pro subscription EXTENDED — userId: ${payment.userId}`);
  } else if (payment.userId) {
    // Create or reactivate subscription
    if (existingSub) {
      // Reactivate expired/cancelled subscription
      await query(
        `UPDATE ProSubscription SET status = 'ACTIVE', amountPaid = ?, mpesaRef = ?, dailyScanLimit = 4, scansToday = 0, currentPeriodStart = NOW(), currentPeriodEnd = DATE_ADD(NOW(), INTERVAL 30 DAY), updatedAt = NOW() WHERE id = ?`,
        [amount, mpesaReceiptNumber, existingSub.id]
      );
    } else {
      // Create new subscription
      const subId = generateId();
      await query(
        `INSERT INTO ProSubscription (id, userId, status, amountPaid, mpesaRef, dailyScanLimit, scansToday, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt)
         VALUES (?, ?, 'ACTIVE', ?, ?, 4, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW())`,
        [subId, payment.userId, amount, mpesaReceiptNumber]
      );
    }
    console.log(`[MPESA] Pro subscription CREATED/REACTIVATED — userId: ${payment.userId}`);
  }

  // Update payment
  await query(
    `UPDATE MpesaPayment SET status = ?, mpesaRef = ?, callbackRaw = ?, updatedAt = NOW() WHERE id = ?`,
    ["SUCCESS", mpesaReceiptNumber, JSON.stringify({}), payment.id]
  );
}

/**
 * Generic success handler — for purposes that don't need special side effects
 * (just marks the payment as SUCCESS).
 */
async function handleGenericSuccess(payment, amount, mpesaReceiptNumber, merchantReqId, resultDesc, rawBody) {
  await query(
    `UPDATE MpesaPayment SET status = ?, mpesaRef = ?, resultDesc = ?, callbackRaw = ?, merchantReqId = ?, updatedAt = NOW() WHERE id = ?`,
    ["SUCCESS", mpesaReceiptNumber, resultDesc, JSON.stringify(rawBody), merchantReqId || null, payment.id]
  );

  console.log(`[MPESA] Generic success — purpose: ${payment.purpose}, paymentId: ${payment.id}`);
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 AS ok");
    res.json({
      status: "healthy",
      service: "jobready-mpesa-callback",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      service: "jobready-mpesa-callback",
      db: "error",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message, err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ---------------------------------------------------------------------------
// Generate CUID-like ID (compatible with the main app's Prisma @default(cuid()))
// ---------------------------------------------------------------------------

function generateId() {
  // CUID2 format: starts with 'c', followed by random alphanumeric (24 chars total)
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 23; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

// When running under Phusion Passenger, don't call app.listen()
// Passenger will invoke the export and manage the lifecycle.
if (typeof module !== "undefined" && module.exports) {
  module.exports = app;
}

// For direct node execution (development / non-Passenger environments)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[SERVER] M-Pesa callback handler running on port ${PORT}`);
    console.log(`[SERVER] POST /mpesa-callback`);
    console.log(`[SERVER] GET  /health`);
  });
}
