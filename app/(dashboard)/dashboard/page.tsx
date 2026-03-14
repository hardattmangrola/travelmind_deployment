"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Map,
  Plane,
  Sparkles,
  Star,
  Calendar,
  Users,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";

interface UserItinerary {
  id: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  travelers: number;
  status: string;
}

const popularDestinations = [
  { name: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", flag: "🇮🇩" },
  { name: "Paris, France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", flag: "🇫🇷" },
  { name: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", flag: "🇯🇵" },
  { name: "Santorini, Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80", flag: "🇬🇷" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<UserItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTrips(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const userName = session?.user?.name?.split(" ")[0] || "Traveler";

  const stats = {
    totalTrips: trips.length,
    activeTrips: trips.filter((t) => t.status === "active").length,
    countriesVisited: new Set(trips.map((t) => t.country)).size,
    totalDays: trips.reduce((sum, t) => sum + t.totalDays, 0),
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/planner?destination=${encodeURIComponent(searchQuery)}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="space-y-12 pb-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-white)] px-6 py-8 shadow-[var(--shadow-lg)] md:px-10 md:py-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(244,164,96,0.18),transparent_46%),radial-gradient(circle_at_88%_86%,rgba(227,83,54,0.12),transparent_38%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <p className="tm-label">DASHBOARD</p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Welcome back, {userName}
            </h1>
            <p className="max-w-xl text-[16px] leading-[1.65] text-[color:var(--color-text-secondary)]">
              Continue shaping your next escape with beautifully organized trips, thoughtful recommendations, and an itinerary that feels effortless.
            </p>
            <form onSubmit={handleSearch} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--color-earth)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g. 5 days in Bali with beaches and temples"
                  className="tm-input h-11 rounded-full border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-11 pr-4"
                />
              </label>
              <button
                type="submit"
                className="tm-btn-primary w-full sm:w-auto"
              >
                <span>Plan Trip</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Trips", value: stats.totalTrips, icon: Map },
              { label: "Active", value: stats.activeTrips, icon: Plane },
              { label: "Countries", value: stats.countriesVisited, icon: Star },
              { label: "Days Planned", value: stats.totalDays, icon: Calendar },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-xs)]"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)]">
                  <stat.icon className="h-[18px] w-[18px]" />
                </div>
                <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[color:var(--color-text-tertiary)]">
                  {stat.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-[color:var(--color-text-primary)]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="tm-label">YOUR JOURNEYS</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--color-text-primary)] md:text-[30px]">
              Your Trips
            </h2>
          </div>
          <Link href="/planner" className="tm-btn-secondary">
            <Plus className="mr-1 h-4 w-4" />
            New Trip
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-white)] px-8 py-14 text-center shadow-[var(--shadow-sm)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)]">
              <Plane className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-[22px] font-semibold text-[color:var(--color-text-primary)]">
              No trips yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-[1.65] text-[color:var(--color-text-secondary)]">
              Plan your first AI-powered itinerary and we will keep everything beautifully organized right here.
            </p>
            <Link href="/planner" className="tm-btn-primary mt-6 inline-flex">
              <Sparkles className="mr-2 h-4 w-4" />
              Plan your first trip
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {trips.map((trip) => (
              <motion.div key={trip.id} variants={item}>
                <Link
                  href={`/itinerary/${trip.id}/view`}
                  className="group block overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-white)] shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={trip.coverImage}
                      alt={trip.destination}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,15,8,0.58)] via-[rgba(28,15,8,0.12)] to-transparent" />
                    <span
                      className={[
                        "absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]",
                        trip.status === "active"
                          ? "border-[color:var(--color-primary)] bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)]"
                          : trip.status === "completed"
                            ? "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)]"
                            : "border-[color:var(--color-sand)] bg-[color:var(--color-sand-light)] text-[color:var(--color-earth)]",
                      ].join(" ")}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="line-clamp-1 text-[19px] font-semibold text-[color:var(--color-text-primary)]">
                      {trip.title}
                    </h3>
                    <p className="text-[14px] leading-[1.5] text-[color:var(--color-text-secondary)]">
                      {trip.destination} · {trip.totalDays} days · {trip.travelers}{" "}
                      <Users className="mb-0.5 inline h-[14px] w-[14px]" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section variants={item} className="space-y-5">
        <div>
          <p className="tm-label">INSPIRE ME</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--color-text-primary)] md:text-[30px]">
            Popular Destinations
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularDestinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => router.push(`/planner?destination=${encodeURIComponent(dest.name.split(",")[0])}`)}
              className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-white)] text-left shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,15,8,0.64)] via-[rgba(28,15,8,0.2)] to-transparent" />
              <div className="absolute inset-x-3 bottom-3 rounded-[var(--radius-sm)] border border-[rgba(244,164,96,0.35)] bg-[rgba(253,240,224,0.92)] px-3 py-2">
                <p className="line-clamp-1 text-[14px] font-medium text-[color:var(--color-earth)]">
                  {dest.flag} {dest.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
