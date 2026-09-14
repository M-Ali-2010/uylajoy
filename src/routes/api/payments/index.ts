import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createPayment, getUserPayments, getPaymentById, PRICING } from "@/lib/server/payments";
import { getCurrentUser } from "@/lib/server/auth";
import { z } from "zod";

const createPaymentSchema = z.object({
  propertyId: z.string().uuid(),
  provider: z.enum(["payme", "click"]),
  paymentType: z.enum(["featured", "premium", "boost"]),
  duration: z.enum(["7days", "14days", "30days"]).optional(),
});

export const Route = createFileRoute("/api/payments/")({
  server: {
    handlers: {
      // Get user's payments
      GET: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);

          if (!user) {
            return json(
              {
                success: false,
                error: "Unauthorized",
              },
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const paymentId = url.searchParams.get("id");

          if (paymentId) {
            const payment = await getPaymentById(paymentId);

            if (!payment || payment.userId !== user.id) {
              return json(
                {
                  success: false,
                  error: "Payment not found",
                },
                { status: 404 },
              );
            }

            return json({
              success: true,
              payment,
            });
          }

          const payments = await getUserPayments(user.id);

          return json({
            success: true,
            payments,
          });
        } catch (error) {
          return json(
            {
              success: false,
              error: "Failed to fetch payments",
            },
            { status: 500 },
          );
        }
      },

      // Create new payment
      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);

          if (!user) {
            return json(
              {
                success: false,
                error: "Unauthorized",
              },
              { status: 401 },
            );
          }

          const body = await request.json();
          const validated = createPaymentSchema.parse(body);

          const result = await createPayment({
            userId: user.id,
            ...validated,
          });

          return json({
            success: true,
            payment: result.payment,
            paymentUrl: result.paymentUrl,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return json(
              {
                success: false,
                error: "Validation failed",
                details: error.errors,
              },
              { status: 400 },
            );
          }

          const message = error instanceof Error ? error.message : "Failed to create payment";
          return json(
            {
              success: false,
              error: message,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
