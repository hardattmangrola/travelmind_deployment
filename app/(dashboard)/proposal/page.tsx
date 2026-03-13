"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CloudSun,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HotelCard } from "@/components/cards/HotelCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { BudgetBar } from "@/components/budget/BudgetBar";
import {
  goaActivities,
  goaBudgetBreakdown,
  goaCityInfo,
  sampleTrips,
} from "@/lib/placeholder-data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { ItineraryDay, ItineraryItem } from "@/types";

const LOADING_STEPS = [
  "Analyzing your preferences...",
  "Finding verified hotels...",
  "Discovering local activities...",
  "Checking weather & events...",
  "Building your day-by-day plan...",
] as const;

export default function ProposalPage() {
  const router = useRouter();
  const trip = sampleTrips[0];
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stepIndex, setStepIndex] = useState<number>(0);

  useEffect(() => {
    const totalDuration = 2000;
    const interval = 500;
    const steps = Math.min(
      LOADING_STEPS.length - 1,
      Math.floor(totalDuration / interval),
    );

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps) {
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(timer);
    }, totalDuration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  if (!trip) {
    return null;
  }

  const heroTitle = "Your Goa Adventure";

  const completionIconForPeriod = (period: string) => {
    if (period === "morning") return Sun;
    if (period === "evening") return Star;
    return CloudSun;
  };

  const renderItineraryItems = (items: ItineraryItem[]) => {
    return items.map((item) => {
      return (
        <div
          key={item.id}
          className="flex items-start gap-3 border-b border-slate-200 py-3 last:border-0"
        >
          <div className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800">
            {item.startTime}–{item.endTime}
          </div>
          <div className="mt-0.5 flex flex-1 flex-col gap-1">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <Star className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {"name" in item.data ? (item.data as { name: string }).name : "Experience"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.type === "activity"
                    ? "Activity"
                    : item.type === "hotel"
                    ? "Hotel"
                    : item.type === "event"
                    ? "Event"
                    : "Transport"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {item.estimatedCost > 0 && (
                  <span className="text-xs font-medium text-emerald-600">
                    {formatCurrency(item.estimatedCost, item.currency)}
                  </span>
                )}
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:text-rose-500"
                  aria-label="Toggle wishlist"
                >
                  <Heart className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
          <div className="absolute inset-3 rounded-full border-2 border-indigo-300" />
          <div className="absolute inset-6 rounded-full border-2 border-indigo-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 animate-pulse text-indigo-500" />
          </div>
        </div>
        <p className="mt-6 text-xl font-semibold text-slate-900">
          Crafting your perfect itinerary...
        </p>
        <div className="mt-4 space-y-1 text-sm text-slate-500">
          {LOADING_STEPS.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-2"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                {index < stepIndex ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : index === stepIndex ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hotels = [trip.days[0]?.hotel, trip.days[2]?.hotel].filter(
    Boolean,
  ) as NonNullable<ItineraryDay["hotel"]>[];
  const activities = goaActivities.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Hero banner */}
      <section className="mx-auto mt-6 h-72 max-w-6xl px-6">
        <div className="relative h-full overflow-hidden rounded-3xl shadow-sm">
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1120px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <button
            type="button"
            onClick={() => router.push("/planner")}
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to planner</span>
          </button>

          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite collaborator</span>
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-8">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {heroTitle}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
                <CalendarDays className="h-3.5 w-3.5" />
                Jan 16 – Jan 20
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
                <Users className="h-3.5 w-3.5" />
                2 travelers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
                <Wallet className="h-3.5 w-3.5" />
                ₹30,000 budget
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
                <Star className="h-3.5 w-3.5" />
                Relaxed style
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trip overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Trip overview
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We&apos;ve designed a relaxed 5-day escape in Goa that balances
              beaches, local food, and light nightlife. Your days start slow
              with scenic walks, build into curated activities and events, and
              end with sunset views and coastal dinners — all optimized for
              travel time and your budget.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">5</p>
                  <p className="text-xs text-slate-500">Days planned</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">2</p>
                  <p className="text-xs text-slate-500">Primary stays</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">12</p>
                  <p className="text-xs text-slate-500">Key activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Day-by-day plan
              </h2>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                5 days
              </span>
            </div>

            <div className="mt-4">
              <Accordion
                type="single"
                collapsible
                className="divide-y divide-slate-200 border border-slate-200 rounded-xl"
                defaultValue="day-1"
              >
                {trip.days.map((day) => {
                  const weather = day.weather;
                  const totalCost = day.totalCost;
                  return (
                    <AccordionItem
                      key={day.dayNumber}
                      value={`day-${day.dayNumber}`}
                      className="border-0"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex w-full items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xs font-semibold text-indigo-600">
                            Day {day.dayNumber}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">
                              {formatDate(day.date, "weekday")}
                            </span>
                            {weather && (
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                <CloudSun className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  {weather.condition} · {weather.tempMin}–{weather.tempMax}
                                  °C
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                            <Wallet className="h-3.5 w-3.5" />
                            <span>
                              {formatCurrency(totalCost, trip.currency)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-0">
                        <div className="space-y-4">
                          {day.slots.map((slot) => {
                            if (slot.items.length === 0) {
                              return null;
                            }
                            const Icon = completionIconForPeriod(slot.period);
                            const label =
                              slot.period === "morning"
                                ? "Morning"
                                : slot.period === "afternoon"
                                ? "Afternoon"
                                : "Evening";
                            return (
                              <div key={slot.period}>
                                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{label}</span>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                  {renderItineraryItems(slot.items)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>

          {/* Hotels */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Recommended hotels
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                />
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Activities &amp; experiences
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: summary */}
        <div className="space-y-4 lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇮🇳</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {goaCityInfo.name}, {goaCityInfo.country}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(trip.startDate, "short")} –{" "}
                    {formatDate(trip.endDate, "short")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Estimated budget
                </p>
                <div className="mt-3">
                  <BudgetBar breakdown={goaBudgetBreakdown} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  ≈ $361 USD · Rate: 1 USD = ₹83.2
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Safety score</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-emerald-500">
                    {(goaCityInfo.safetyScore * 10).toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${goaCityInfo.safetyScore * 10}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Based on local safety, transport, and healthcare indicators.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create this trip</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-slate-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Regenerate itinerary</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/planner")}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Edit preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

