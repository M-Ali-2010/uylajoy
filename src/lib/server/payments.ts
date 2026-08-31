import { eq, and, desc } from "drizzle-orm";
import { db, payments, properties } from "@/db";
import { createHash } from "crypto";

// Payment pricing in UZS (tiyin for Payme, sum for Click)
export const PRICING = {
  featured: {
    "7days": 50000_00, // 50,000 UZS in tiyin
    "14days": 90000_00,
    "30days": 150000_00,
  },
  premium: {
    "7days": 100000_00,
    "14days": 180000_00,
    "30days": 300000_00,
  },
  boost: {
    single: 25000_00, // Single boost
  },
};

// Types
export type PaymentProvider = "payme" | "click";
export type PaymentType = "featured" | "premium" | "boost";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";

export interface CreatePaymentInput {
  userId: string;
  propertyId: string;
  provider: PaymentProvider;
  paymentType: PaymentType;
  duration?: "7days" | "14days" | "30days";
}

// Payme configuration
const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID;
const PAYME_SECRET_KEY = process.env.PAYME_SECRET_KEY;
const PAYME_TEST_KEY = process.env.PAYME_TEST_KEY;
const PAYME_IS_TEST = process.env.PAYME_IS_TEST === "true";

// Click configuration
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID;
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY;

// Create payment
export async function createPayment(input: CreatePaymentInput) {
  const { userId, propertyId, provider, paymentType, duration = "7days" } = input;

  // Calculate amount
  let amount: number;
  if (paymentType === "boost") {
    amount = PRICING.boost.single;
  } else {
    amount = PRICING[paymentType][duration];
  }

  // Create payment record
  const [payment] = await db
    .insert(payments)
    .values({
      userId,
      propertyId,
      provider,
      paymentType,
      amount,
      currency: "UZS",
      status: "pending",
      metadata: { duration },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
    })
    .returning();

  // Generate payment URL based on provider
  let paymentUrl: string;

  if (provider === "payme") {
    paymentUrl = generatePaymeUrl(payment.id, amount);
  } else {
    paymentUrl = generateClickUrl(payment.id, amount);
  }

  return {
    payment,
    paymentUrl,
  };
}

// Generate Payme checkout URL
function generatePaymeUrl(orderId: string, amount: number): string {
  const merchantId = PAYME_MERCHANT_ID;
  const params = {
    m: merchantId,
    ac: { order_id: orderId },
    a: amount, // Amount in tiyin
    l: "uz", // Language
    c: `${process.env.APP_URL}/api/payments/payme/callback`,
  };

  const encoded = Buffer.from(JSON.stringify(params)).toString("base64");

  if (PAYME_IS_TEST) {
    return `https://checkout.test.paycom.uz/${encoded}`;
  }
  return `https://checkout.paycom.uz/${encoded}`;
}

// Generate Click checkout URL
function generateClickUrl(orderId: string, amount: number): string {
  const amountInSum = Math.round(amount / 100); // Convert from tiyin to sum

  const params = new URLSearchParams({
    service_id: CLICK_SERVICE_ID!,
    merchant_id: CLICK_MERCHANT_ID!,
    amount: amountInSum.toString(),
    transaction_param: orderId,
    return_url: `${process.env.APP_URL}/payments/success`,
    error_url: `${process.env.APP_URL}/payments/error`,
  });

  return `https://my.click.uz/services/pay?${params.toString()}`;
}

// Process Payme callback
export async function processPaymeCallback(data: Record<string, unknown>) {
  const { method, params } = data as { method: string; params: Record<string, unknown> };

  switch (method) {
    case "CheckPerformTransaction":
      return await paymeCheckPerformTransaction(params);
    case "CreateTransaction":
      return await paymeCreateTransaction(params);
    case "PerformTransaction":
      return await paymePerformTransaction(params);
    case "CancelTransaction":
      return await paymeCancelTransaction(params);
    case "CheckTransaction":
      return await paymeCheckTransaction(params);
    default:
      return { error: { code: -32601, message: "Method not found" } };
  }
}

async function paymeCheckPerformTransaction(params: Record<string, unknown>) {
  const account = params.account as { order_id: string };
  const orderId = account?.order_id;
  const amount = params.amount as number;

  if (!orderId) {
    return { error: { code: -31050, message: "Order ID not found" } };
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, orderId))
    .limit(1);

  if (!payment) {
    return { error: { code: -31050, message: "Order not found" } };
  }

  if (payment.status !== "pending") {
    return { error: { code: -31051, message: "Order already processed" } };
  }

  if (payment.amount !== amount) {
    return { error: { code: -31001, message: "Invalid amount" } };
  }

  if (payment.expiresAt && payment.expiresAt < new Date()) {
    return { error: { code: -31008, message: "Order expired" } };
  }

  return { result: { allow: true } };
}

async function paymeCreateTransaction(params: Record<string, unknown>) {
  const account = params.account as { order_id: string };
  const orderId = account?.order_id;
  const transactionId = params.id as string;
  const time = params.time as number;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, orderId))
    .limit(1);

  if (!payment) {
    return { error: { code: -31050, message: "Order not found" } };
  }

  if (payment.transactionId && payment.transactionId !== transactionId) {
    return { error: { code: -31051, message: "Transaction already exists" } };
  }

  await db
    .update(payments)
    .set({
      transactionId,
      status: "processing",
      updatedAt: new Date(),
    })
    .where(eq(payments.id, orderId));

  return {
    result: {
      create_time: time,
      transaction: orderId,
      state: 1,
    },
  };
}

async function paymePerformTransaction(params: Record<string, unknown>) {
  const transactionId = params.id as string;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);

  if (!payment) {
    return { error: { code: -31003, message: "Transaction not found" } };
  }

  if (payment.status === "completed") {
    return {
      result: {
        perform_time: payment.completedAt?.getTime(),
        transaction: payment.id,
        state: 2,
      },
    };
  }

  if (payment.status !== "processing") {
    return { error: { code: -31008, message: "Invalid transaction state" } };
  }

  // Complete payment
  await db
    .update(payments)
    .set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Apply payment effect (feature/premium/boost the property)
  await applyPaymentEffect(payment);

  return {
    result: {
      perform_time: Date.now(),
      transaction: payment.id,
      state: 2,
    },
  };
}

async function paymeCancelTransaction(params: Record<string, unknown>) {
  const transactionId = params.id as string;
  const reason = params.reason as number;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);

  if (!payment) {
    return { error: { code: -31003, message: "Transaction not found" } };
  }

  await db
    .update(payments)
    .set({
      status: "cancelled",
      errorCode: reason.toString(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  return {
    result: {
      cancel_time: Date.now(),
      transaction: payment.id,
      state: -1,
    },
  };
}

async function paymeCheckTransaction(params: Record<string, unknown>) {
  const transactionId = params.id as string;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);

  if (!payment) {
    return { error: { code: -31003, message: "Transaction not found" } };
  }

  let state = 1;
  if (payment.status === "completed") state = 2;
  if (payment.status === "cancelled") state = -1;

  return {
    result: {
      create_time: payment.createdAt.getTime(),
      perform_time: payment.completedAt?.getTime() || 0,
      cancel_time: payment.status === "cancelled" ? payment.updatedAt.getTime() : 0,
      transaction: payment.id,
      state,
      reason: payment.errorCode ? parseInt(payment.errorCode) : null,
    },
  };
}

// Process Click callback
export async function processClickPrepare(data: Record<string, unknown>) {
  const { merchant_trans_id, amount, action, sign_string, sign_time } = data as {
    merchant_trans_id: string;
    amount: string;
    action: number;
    sign_string: string;
    sign_time: string;
  };

  // Verify signature
  const expectedSign = createHash("md5")
    .update(`${data.click_trans_id}${data.service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`)
    .digest("hex");

  if (sign_string !== expectedSign) {
    return { error: -1, error_note: "Invalid signature" };
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, merchant_trans_id))
    .limit(1);

  if (!payment) {
    return { error: -5, error_note: "Order not found" };
  }

  if (payment.status !== "pending") {
    return { error: -4, error_note: "Order already processed" };
  }

  const amountInTiyin = parseFloat(amount) * 100;
  if (payment.amount !== amountInTiyin) {
    return { error: -2, error_note: "Invalid amount" };
  }

  return {
    click_trans_id: data.click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: payment.id,
    error: 0,
    error_note: "Success",
  };
}

export async function processClickComplete(data: Record<string, unknown>) {
  const { merchant_trans_id, click_trans_id, error } = data as {
    merchant_trans_id: string;
    click_trans_id: string;
    error: number;
  };

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, merchant_trans_id))
    .limit(1);

  if (!payment) {
    return { error: -5, error_note: "Order not found" };
  }

  if (error !== 0) {
    await db
      .update(payments)
      .set({
        status: "failed",
        externalId: click_trans_id.toString(),
        errorCode: error.toString(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return {
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: payment.id,
      error: 0,
      error_note: "Payment failed",
    };
  }

  await db
    .update(payments)
    .set({
      status: "completed",
      externalId: click_trans_id.toString(),
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Apply payment effect
  await applyPaymentEffect(payment);

  return {
    click_trans_id,
    merchant_trans_id,
    merchant_confirm_id: payment.id,
    error: 0,
    error_note: "Success",
  };
}

// Apply payment effect to property
async function applyPaymentEffect(payment: typeof payments.$inferSelect) {
  if (!payment.propertyId) return;

  const metadata = payment.metadata as { duration?: string } | null;
  const duration = metadata?.duration || "7days";

  let days = 7;
  if (duration === "14days") days = 14;
  if (duration === "30days") days = 30;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);

  const updates: Partial<typeof properties.$inferInsert> = {
    updatedAt: new Date(),
  };

  switch (payment.paymentType) {
    case "featured":
      updates.isFeatured = true;
      updates.featuredUntil = expiryDate;
      break;
    case "premium":
      updates.isPremium = true;
      updates.premiumUntil = expiryDate;
      break;
    case "boost":
      // Reset view count to simulate boost effect
      // In production, you might want a more sophisticated boost mechanism
      updates.viewCount = 0;
      updates.publishedAt = new Date(); // Re-publish to appear as new
      break;
  }

  await db
    .update(properties)
    .set(updates)
    .where(eq(properties.id, payment.propertyId));
}

// Get user payments
export async function getUserPayments(userId: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));

  return result;
}

// Get payment by ID
export async function getPaymentById(paymentId: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  return payment;
}
