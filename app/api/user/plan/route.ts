import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

function normalizePlan(plan?: string | null): "basic" | "pro" {
  const value = (plan || "").toLowerCase().trim();
  if (value === "pro" || value === "premium") return "pro";
  return "basic";
}

function isActiveSubscription(status?: string | null): boolean {
  const value = (status || "").toLowerCase().trim();
  return value === "active" || value === "trialing";
}

type SubscriptionRow = {
  plan: string | null;
  status: string | null;
};

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { plan: "basic" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    const rows = await prisma.$queryRaw<SubscriptionRow[]>`
      SELECT plan, status
      FROM subscription
      WHERE "userId" = ${session.user.id}
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    const subscription = rows[0];

    const plan =
      normalizePlan(subscription?.plan) === "pro" && isActiveSubscription(subscription?.status)
        ? "pro"
        : "basic";

    return NextResponse.json(
      { plan },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch {
    return NextResponse.json(
      { plan: "basic" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
}
