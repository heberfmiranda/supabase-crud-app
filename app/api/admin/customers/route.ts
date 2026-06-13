import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const customers = await stripe.customers.list({ limit: 100 });

  const result = await Promise.all(
    customers.data.map(async (customer) => {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
      });

      const sub = subscriptions.data[0];
      let invoices: { id: string; amount: number; status: string; date: number; due?: number | null }[] = [];

      if (sub) {
        const inv = await stripe.invoices.list({ customer: customer.id, limit: 12 });
        invoices = inv.data.map((i) => ({
          id: i.id,
          amount: i.amount_due,
          status: i.status ?? "unknown",
          date: i.created,
          due: i.due_date,
        }));
      }

      return {
        customer_id: customer.id,
        email: customer.email,
        plan: sub ? (sub.status === "active" ? "premium" : "free") : "free",
        subscription_status: sub?.status ?? null,
        subscription_start: sub?.start_date ?? null,
        current_period_end: sub ? (sub as unknown as { current_period_end: number }).current_period_end : null,
        invoices,
      };
    })
  );

  return NextResponse.json(result);
}
