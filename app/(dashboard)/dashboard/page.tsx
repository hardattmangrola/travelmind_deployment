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

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-xl md:p-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold md:text-4xl">
            Welcome back, {userName} ✨
          </h1>
          <p className="max-w-lg text-base text-indigo-100">
            Where would you like to go next? Let AI plan your perfect trip.
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="E.g. 5 days in Bali with beaches and temples..."
                className="w-full rounded-xl bg-white/15 px-10 py-3 text-sm text-white placeholder:text-indigo-200 backdrop-blur-sm outline-none ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-white/40"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow transition hover:bg-indigo-50"
            >
              Plan Trip
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Trips", value: stats.totalTrips, icon: Map, color: "text-indigo-600 bg-indigo-50" },
          { label: "Active", value: stats.activeTrips, icon: Plane, color: "text-emerald-600 bg-emerald-50" },
          { label: "Countries", value: stats.countriesVisited, icon: Star, color: "text-amber-600 bg-amber-50" },
          { label: "Days Planned", value: stats.totalDays, icon: Calendar, color: "text-violet-600 bg-violet-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trips */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your Trips</h2>
          <Link
            href="/planner"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New Trip
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Plane className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">No trips yet</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Plan your first AI-powered trip and it will appear here.
            </p>
            <Link
              href="/planner"
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Sparkles className="h-4 w-4" />
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/itinerary/${trip.id}/view`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-36">
                  <img
                    src={trip.coverImage}
                    alt={trip.destination}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    trip.status === "active"
                      ? "bg-emerald-500 text-white"
                      : trip.status === "completed"
                        ? "bg-slate-500 text-white"
                        : "bg-amber-400 text-amber-900"
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{trip.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {trip.destination} · {trip.totalDays} days · {trip.travelers} <Users className="inline h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Destinations */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Popular Destinations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularDestinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => router.push(`/planner?destination=${encodeURIComponent(dest.name.split(",")[0])}`)}
              className="group relative overflow-hidden rounded-2xl text-left"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="h-40 w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-sm font-semibold">
                  {dest.flag} {dest.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
