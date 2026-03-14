"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Cloud,
  DollarSign,
  MapPin,
  Shield,
  Sparkles,
  Sun,
  Users,
  Loader2,
  Hotel,
  Plane,
  Star,
  Clock,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";

export default function ProposalPage() {
  const router = useRouter();
  const { generatedItinerary, isGenerating } = useTripStore();
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!generatedItinerary && !isGenerating) {
      router.push("/planner");
    }
  }, [generatedItinerary, isGenerating, router]);

  // Fetch hotels and flights once itinerary is generated
  useEffect(() => {
    if (!generatedItinerary) return;
    setLoadingExtras(true);

    const itin = generatedItinerary;
    const fetchExtras = async () => {
      try {
        // Fetch hotels
        const hotelRes = await fetch(
          `/api/hotels?city=${encodeURIComponent(itin.destination)}&checkin=${itin.startDate || ""}&checkout=${itin.endDate || ""}&guests=${itin.travelers || 2}`
        );
        if (hotelRes.ok) {
          const d = await hotelRes.json();
          setHotels(Array.isArray(d) ? d.slice(0, 4) : []);
        }
      } catch {}
      try {
        // Fetch flights
        const flightRes = await fetch(
          `/api/flights?dep=DEL&arr=${encodeURIComponent(itin.destination?.slice(0, 3)?.toUpperCase() || "")}&date=${itin.startDate || ""}`
        );
        if (flightRes.ok) {
          const d = await flightRes.json();
          setFlights(Array.isArray(d) ? d.slice(0, 4) : []);
        }
      } catch {}
      setLoadingExtras(false);
    };
    fetchExtras();
  }, [generatedItinerary]);

  if (isGenerating || !generatedItinerary) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Crafting your perfect itinerary...</p>
          <p className="mt-1 text-sm text-slate-500">This may take a moment while we gather data</p>
        </div>
      </div>
    );
  }

  const itin = generatedItinerary;
  const days = Array.isArray(itin.days) ? itin.days : [];

  const handleAccept = async () => {
    setSaving(true);
    try {
      await fetch(`/api/itinerary/${itin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      router.push(`/itinerary/${itin.id}/view`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/planner")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Planner
        </button>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Draft Proposal
        </span>
      </div>

      {/* Trip Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">{itin.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-indigo-100">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {itin.destination}{itin.country ? `, ${itin.country}` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {itin.totalDays} days
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {itin.travelers} travelers
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            {itin.totalBudget?.toLocaleString()} {itin.currency}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {itin.cityInfo?.safetyScore && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <Shield className="h-3 w-3" />
              Safety: {itin.cityInfo.safetyScore}/10
            </span>
          )}
          {itin.weather?.[0] && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              {itin.weather[0].condition === "Clear" ? <Sun className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {itin.weather[0].condition} {itin.weather[0].tempMax}°C
            </span>
          )}
          {itin.exchangeRate && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <DollarSign className="h-3 w-3" />
              1 USD = {itin.exchangeRate.toFixed(2)} {itin.currency}
            </span>
          )}
        </div>
      </div>

      {/* Weather */}
      {itin.weather && itin.weather.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Weather Forecast</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {itin.weather.slice(0, 7).map((w: any) => (
              <div key={w.date} className="flex min-w-[100px] shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <span className="text-xs text-slate-500">
                  {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="mt-1 text-lg">
                  {w.condition === "Clear" ? "☀️" : w.condition === "Rainy" ? "🌧️" : w.condition === "Partly Cloudy" ? "⛅" : "☁️"}
                </span>
                <span className="mt-1 text-xs font-medium text-slate-900">{w.tempMin}° – {w.tempMax}°</span>
                <span className="text-[10px] text-slate-400">{w.condition}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-Day Itinerary */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Day-by-Day Itinerary</h2>
        <div className="space-y-4">
          {days.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  Day {day.day || dayIndex + 1}: {day.title || "Exploration"}
                </h3>
                {day.date && <span className="text-xs text-slate-400">{day.date}</span>}
              </div>
              <div className="space-y-3">
                {(day.activities || []).map((act: any, actIndex: number) => (
                  <div key={actIndex} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                      {act.time || `${9 + actIndex}:00`}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{act.name}</p>
                      {act.description && <p className="mt-0.5 text-xs text-slate-500">{act.description}</p>}
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                        {act.category && (
                          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">{act.category}</span>
                        )}
                        {act.duration && <span>{act.duration} min</span>}
                        {act.estimatedCost > 0 && <span>~₹{act.estimatedCost}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotels Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Hotel className="h-5 w-5 text-amber-500" />
          Recommended Hotels
        </h2>
        {loadingExtras ? (
          <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Finding hotels...</span>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {hotels.map((hotel: any, i: number) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="h-32 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={hotel.image || hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{hotel.name}</h4>
                  {hotel.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" /> {hotel.address}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {hotel.rating || hotel.starRating || "4.0"}
                    </div>
                    <span className="text-sm font-bold text-indigo-600">
                      ₹{hotel.pricePerNight || hotel.min_price || "—"}/night
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <Hotel className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No hotels found. Try searching manually.</p>
          </div>
        )}
      </section>

      {/* Flights Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Plane className="h-5 w-5 text-indigo-500" />
          Available Flights
        </h2>
        {loadingExtras ? (
          <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Searching flights...</span>
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-3">
            {flights.map((flight: any, i: number) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Plane className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {flight.airline?.name || flight.airline || "Airline"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {flight.departure?.iata || flight.dep_iata || "—"} → {flight.arrival?.iata || flight.arr_iata || "—"}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {flight.departure?.scheduled?.slice(11, 16) || flight.dep_time || "—"}
                    </span>
                    <span>{flight.flight?.iata || flight.flight_iata || ""}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-indigo-600">
                    {flight.price ? `₹${flight.price}` : "Check"}
                  </p>
                  <span className="text-[10px] text-slate-400">{flight.status || "Scheduled"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <Plane className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No flights found for this route.</p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          onClick={handleAccept}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Accept & Create Trip
        </button>
        <button
          onClick={() => router.push("/planner")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
