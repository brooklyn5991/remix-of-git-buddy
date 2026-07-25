import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { extractFulfillFromMetadata, fulfillPaystackReservation } from "@/lib/paystack-fulfill.server";

export const Route = createFileRoute("/api/public/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Not configured", { status: 500 });

        const raw = await request.text();
        const sig = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(raw).digest("hex");
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: {
          event?: string;
          data?: {
            reference: string;
            status: string;
            amount: number;
            currency: string;
            customer?: { email?: string };
            metadata?: Record<string, unknown> | string | null;
          };
        };
        try { payload = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }

        // Only act on successful charges.
        if (payload.event !== "charge.success" || !payload.data) {
          return new Response("Ignored", { status: 200 });
        }

        const input = extractFulfillFromMetadata(payload.data);
        if (!input) {
          console.error("paystack webhook: missing metadata", payload.data.reference);
          return new Response("Missing metadata", { status: 200 });
        }

        try {
          await fulfillPaystackReservation(input);
        } catch (e) {
          console.error("paystack webhook fulfill failed", e);
          return new Response("Fulfill failed", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
