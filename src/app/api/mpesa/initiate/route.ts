import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initiateSTKPush } from "@/lib/mpesa";

/**
 * POST /api/mpesa/initiate
 *
 * Initiates an M-Pesa STK Push (Lipa Na M-Pesa Online) payment.
 *
 * Request body:
 *   phone    – string  (Kenyan phone number, e.g. "0712345678")
 *   amount   – number  (positive integer, KES)
 *   purpose  – string  (e.g. "scan_credits", "pro_subscription", "sponsored_ad")
 *   userId?  – string  (optional – linked user id)
 *   email?   – string  (optional – for anonymous tracking)
 */
export async function POST(req: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. Parse & validate request body
    // -----------------------------------------------------------------------
    const raw = await req.json();
    const { phone, amount, purpose, userId, email } = raw as {
      phone?: string;
      amount?: number;
      purpose?: string;
      userId?: string;
      email?: string;
    };

    // Phone validation – must be 10+ digits starting with 0 / 7 / 1 / +254
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 },
      );
    }

    const cleanedPhone = phone.replace(/[\s\-\+]/g, "");
    const phoneRegex =
      /^(\+?254|0)?[71]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid phone number. Provide a valid Kenyan number (e.g. 0712345678).",
        },
        { status: 400 },
      );
    }

    // Amount validation – must be a positive number
    if (
      !amount ||
      typeof amount !== "number" ||
      isNaN(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "A valid positive amount is required." },
        { status: 400 },
      );
    }

    // Purpose validation
    if (!purpose || typeof purpose !== "string" || purpose.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Payment purpose is required." },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // 2. Determine environment
    // -----------------------------------------------------------------------
    const isProduction = process.env.NODE_ENV === "production";

    // -----------------------------------------------------------------------
    // 3. Call M-Pesa STK Push
    // -----------------------------------------------------------------------
    const stkResult = await initiateSTKPush({
      phone: cleanedPhone,
      amount,
      description: purpose.trim(),
      userId,
      isProduction,
    });

    // If Daraja returned a non-zero ResponseCode the request was not accepted
    if (stkResult.ResponseCode !== "0") {
      return NextResponse.json(
        {
          success: false,
          error: stkResult.ResponseDescription || "STK Push request was rejected by M-Pesa.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // 4. Persist the payment record
    // -----------------------------------------------------------------------
    const payment = await db.mpesaPayment.create({
      data: {
        phone: cleanedPhone,
        amount: Math.round(amount),
        purpose: purpose.trim(),
        merchantReqId: stkResult.MerchantRequestID,
        checkoutReqId: stkResult.CheckoutRequestID,
        status: "PENDING",
        userId: userId || null,
      },
    });

    // -----------------------------------------------------------------------
    // 5. Return success
    // -----------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      merchantRequestId: payment.merchantReqId,
      checkoutRequestId: payment.checkoutReqId,
      paymentId: payment.id,
    });
  } catch (error: unknown) {
    console.error("[M-Pesa STK Push Error]", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
