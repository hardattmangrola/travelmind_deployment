"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Calendar, Map, MapPin, Plane, Star, Users } from "lucide-react";
import Link from "next/link";

interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  totalDays: number;
  travelers: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setTrips(Array.isArray(data) ? data : []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const user = session?.user;
  const stats = {
    totalTrips: trips.length,
    countries: new Set(trips.map((t) => t.country)).size,
    daysPlanned: trips.reduce((s, t) => s + t.totalDays, 0),
  };

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Profile Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {user?.image ? (
          <img src={user.image} alt={user.name || ""} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
            {getInitials(user?.name || "U")}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h1>
          <p className="text-sm text-slate-500">{user?.email || ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Trips", value: stats.totalTrips, icon: Map },
          { label: "Countries", value: stats.countries, icon: Star },
          { label: "Days", value: stats.daysPlanned, icon: Calendar },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <s.icon className="mx-auto h-5 w-5 text-indigo-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trips */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">My Trips</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{[1,2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />)}</div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <Plane className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No trips yet</p>
            <Link href="/planner" className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">Plan your first trip</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/itinerary/${trip.id}/view`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md">
                <div className="relative h-32">
                  <img src={trip.coverImage} alt={trip.destination} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${trip.status === "active" ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-900"}`}>{trip.status}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{trip.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{trip.destination} · {trip.totalDays} days</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
