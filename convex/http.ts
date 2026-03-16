import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhooks/xendit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify callback token
    const callbackToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    const headerToken = request.headers.get("x-callback-token");

    if (callbackToken && headerToken !== callbackToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await request.json();

      const xenditInvoiceId = body.id ?? body.external_id;
      const status = body.status;
      const paymentId = body.payment_id;

      if (!xenditInvoiceId || !status) {
        return new Response("Missing required fields", { status: 400 });
      }

      await ctx.runMutation(internal.xendit.handleWebhookPayment, {
        xenditInvoiceId,
        status,
        paymentId,
      });

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response("Internal error", { status: 500 });
    }
  }),
});

export default http;
