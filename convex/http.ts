import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhooks/midtrans",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      const orderId = body.order_id;
      const statusCode = body.status_code;
      const grossAmount = body.gross_amount;
      const signatureKey = body.signature_key;

      if (!serverKey) {
        console.error("MIDTRANS_SERVER_KEY not configured");
        return new Response("Payment integration not configured", { status: 500 });
      }

      if (!orderId || !statusCode || !grossAmount || !signatureKey || !body.transaction_status) {
        return new Response("Missing required fields", { status: 400 });
      }

      const signatureInput = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const digest = await crypto.subtle.digest(
        "SHA-512",
        new TextEncoder().encode(signatureInput)
      );
      const expectedSignature = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature !== signatureKey.toLowerCase()) {
        return new Response("Unauthorized", { status: 401 });
      }

      await ctx.runMutation(internal.midtrans.handlePaymentNotification, {
        midtransOrderId: orderId,
        transactionStatus: body.transaction_status,
        transactionId: body.transaction_id,
        fraudStatus: body.fraud_status,
        grossAmount,
      });

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response("Internal error", { status: 500 });
    }
  }),
});

export default http;
