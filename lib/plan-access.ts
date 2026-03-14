import { prisma } from "@/lib/db";

type Feature = "collaboration" | "invitations" | "chat" | "polls" | "shared_itinerary";

const PRO_ONLY_FEATURES: Feature[] = [
  "collaboration",
  "invitations",
  "chat",
  "polls",
  "shared_itinerary",
];

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

export async function getUserPlan(userId: string): Promise<"basic" | "pro"> {
  const rows = await prisma.$queryRaw<SubscriptionRow[]>`
    SELECT plan, status
    FROM subscription
    WHERE "userId" = ${userId}
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `;

  const subscription = rows[0];

  if (normalizePlan(subscription?.plan) === "pro" && isActiveSubscription(subscription?.status)) {
    return "pro";
  }

  return "basic";
}

export function canAccessFeature(plan: string, feature: Feature): boolean {
  if (plan === "pro") return true;
  return !PRO_ONLY_FEATURES.includes(feature);
}

export async function checkFeatureAccess(userId: string, feature: Feature): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return canAccessFeature(plan, feature);
}
