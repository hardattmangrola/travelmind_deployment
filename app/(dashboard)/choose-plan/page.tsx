"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Cloud,
  Crown,
  FileText,
  Globe,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

type PlanId = "basic" | "pro";

interface PlanFeature {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  included: boolean;
}

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    tagline: "Perfect for solo travelers",
    icon: Zap,
    features: [
      { text: "AI-powered itinerary generation", icon: Brain, included: true },
      { text: "Hotel and flight search", icon: Globe, included: true },
      { text: "Wishlist and favorites", icon: Heart, included: true },
      { text: "Budget tracking", icon: BarChart3, included: true },
      { text: "PDF export", icon: FileText, included: true },
      { text: "Weather and city info", icon: Cloud, included: true },
      { text: "Smart recommendations", icon: Sparkles, included: true },
      { text: "Group collaboration", icon: Users, included: false },
      { text: "Shared itineraries", icon: Shield, included: false },
      { text: "Real-time group chat", icon: MessageCircle, included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    tagline: "For groups and power planners",
    icon: Crown,
    popular: true,
    features: [
      { text: "AI-powered itinerary generation", icon: Brain, included: true },
      { text: "Hotel and flight search", icon: Globe, included: true },
      { text: "Wishlist and favorites", icon: Heart, included: true },
      { text: "Budget tracking", icon: BarChart3, included: true },
      { text: "PDF export", icon: FileText, included: true },
      { text: "Weather and city info", icon: Cloud, included: true },
      { text: "Smart recommendations", icon: Sparkles, included: true },
      { text: "Group collaboration", icon: Users, included: true },
      { text: "Shared itineraries", icon: Shield, included: true },
      { text: "Real-time group chat", icon: MessageCircle, included: true },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function ChoosePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanId | null>(null);

  const handleChoosePlan = async (plan: PlanId) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await res.json();
      if (data.url) {
        if (plan === "basic") {
          router.push(data.url);
          return;
        }
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(null);
    }
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl border border-(--color-border) bg-white p-6 shadow-(--shadow-lg) md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,rgba(244,164,96,0.18),transparent_42%),radial-gradient(circle_at_92%_85%,rgba(227,83,54,0.14),transparent_36%)]" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-(--color-text-tertiary)">
              PLAN OPTIONS
            </p>
            <h1 className="font-display text-3xl font-bold text-(--color-text-primary) md:text-4xl">
              Choose your plan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary)">
              Pick the plan that fits your trip style. You can start free and upgrade when you want collaborative planning.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,164,96,0.45)] bg-(--color-sand-light) px-4 py-2 text-xs font-semibold text-(--color-earth)">
            <Sparkles className="h-3.5 w-3.5" />
            Secure checkout via Stripe
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isLoading = loading === plan.id;
          const isFree = plan.price === 0;

          return (
            <motion.article
              key={plan.id}
              variants={itemVariants}
              className="relative flex h-full flex-col overflow-hidden rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm) transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
            >
              <div className="mb-3 h-6">
                {plan.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(244,164,96,0.45)] bg-(--color-sand-light) px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-(--color-earth)">
                    <Crown className="h-3 w-3" />
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(244,164,96,0.35)] bg-(--color-sand-light) text-(--color-earth)">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-(--color-text-primary)">{plan.name}</h2>
                  <p className="mt-1 text-xs text-(--color-text-secondary)">{plan.tagline}</p>
                </div>

                <div className="text-right">
                  {isFree ? (
                    <span className="text-3xl font-bold text-primary">Free</span>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-primary">${plan.price}</p>
                      <p className="text-xs text-(--color-text-tertiary)">per month</p>
                    </>
                  )}
                </div>
              </div>

              <ul className="mb-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <li
                      key={`${plan.id}-${feature.text}`}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          feature.included
                            ? "bg-[rgba(56,142,60,0.12)] text-[rgb(56,142,60)]"
                            : "bg-[rgba(158,158,158,0.16)] text-[rgb(158,158,158)]"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                        ) : (
                          <X className="h-3.5 w-3.5" strokeWidth={2.6} />
                        )}
                      </span>

                      <span
                        className={`flex items-center gap-1.5 ${
                          feature.included
                            ? "text-(--color-text-primary)"
                            : "text-(--color-text-tertiary) line-through"
                        }`}
                      >
                        <FeatureIcon className="h-3.5 w-3.5" />
                        {feature.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => handleChoosePlan(plan.id)}
                disabled={loading !== null}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${
                  plan.id === "pro"
                    ? "bg-primary text-white hover:bg-(--color-primary-hover)"
                    : "border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-sand-light)"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isFree ? "Activating..." : "Redirecting to payment..."}
                  </>
                ) : (
                  <>
                    {isFree ? "Start with Basic" : "Upgrade to Pro"}
                    {plan.id === "pro" ? <Crown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </>
                )}
              </button>
            </motion.article>
          );
        })}
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-xs text-(--color-text-secondary)"
      >
        <p className="inline-flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" />
          Payments are secured by Stripe. You can change plans anytime.
        </p>
      </motion.section>
    </motion.div>
  );
}