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
  Heart,
  CheckCircle2,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

// Map common city/destination names to their IATA airport codes
function getCityIataCode(destination: string): string {
  const cityMap: Record<string, string> = {
    // India
    "ahmedabad": "AMD", "mumbai": "BOM", "delhi": "DEL", "new delhi": "DEL",
    "bangalore": "BLR", "bengaluru": "BLR", "chennai": "MAA", "kolkata": "CCU",
    "hyderabad": "HYD", "pune": "PNQ", "jaipur": "JAI", "goa": "GOI",
    "lucknow": "LKO", "kochi": "COK", "cochin": "COK", "thiruvananthapuram": "TRV",
    "varanasi": "VNS", "srinagar": "SXR", "udaipur": "UDR", "jodhpur": "JDH",
    "amritsar": "ATQ", "patna": "PAT", "bhopal": "BHO", "indore": "IDR",
    "chandigarh": "IXC", "nagpur": "NAG", "coimbatore": "CJB", "mangalore": "IXE",
    // International Asia
    "dubai": "DXB", "abu dhabi": "AUH", "singapore": "SIN", "bangkok": "BKK",
    "kuala lumpur": "KUL", "tokyo": "NRT", "seoul": "ICN", "hong kong": "HKG",
    "shanghai": "PVG", "beijing": "PEK", "bali": "DPS", "jakarta": "CGK",
    "manila": "MNL", "hanoi": "HAN", "colombo": "CMB", "kathmandu": "KTM",
    "dhaka": "DAC", "doha": "DOH", "muscat": "MCT", "riyadh": "RUH",
    // Europe
    "london": "LHR", "paris": "CDG", "amsterdam": "AMS", "frankfurt": "FRA",
    "munich": "MUC", "zurich": "ZRH", "geneva": "GVA", "rome": "FCO",
    "milan": "MXP", "barcelona": "BCN", "madrid": "MAD", "lisbon": "LIS",
    "vienna": "VIE", "prague": "PRG", "istanbul": "IST", "athens": "ATH",
    "berlin": "BER", "brussels": "BRU", "dublin": "DUB", "helsinki": "HEL",
    "oslo": "OSL", "stockholm": "ARN", "copenhagen": "CPH", "warsaw": "WAW",
    // Americas
    "new york": "JFK", "los angeles": "LAX", "san francisco": "SFO",
    "chicago": "ORD", "miami": "MIA", "toronto": "YYZ", "vancouver": "YVR",
    "sao paulo": "GRU", "mexico city": "MEX",
    // Oceania / Africa
    "sydney": "SYD", "melbourne": "MEL", "auckland": "AKL",
    "cairo": "CAI", "nairobi": "NBO", "johannesburg": "JNB",
    // Regions / tourism names
    "swiss alps": "ZRH", "switzerland": "ZRH", "maldives": "MLE",
    "mauritius": "MRU", "seychelles": "SEZ", "phuket": "HKT",
  };

  const key = destination.toLowerCase().trim();
  if (cityMap[key]) return cityMap[key];

  // Try partial matching (if destination contains a known city name)
  for (const [city, code] of Object.entries(cityMap)) {
    if (key.includes(city) || city.includes(key)) return code;
  }

  // Fallback: take first 3 characters  
  return destination.slice(0, 3).toUpperCase();
}

export default function ProposalPage() {
  const router = useRouter();
  const { generatedItinerary, isGenerating } = useTripStore();
  const { addItem, isInWishlist, fetchItems, isLoaded } = useWishlistStore();
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

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
        // Fetch hotels — using correct param names: destination, checkin, checkout
        const hotelRes = await fetch(
          `/api/hotels?destination=${encodeURIComponent(itin.destination)}&checkin=${itin.startDate || ""}&checkout=${itin.endDate || ""}&guests=${itin.travelers || 2}&currency=${itin.currency || "USD"}`
        );
        if (hotelRes.ok) {
          const d = await hotelRes.json();
          setHotels(Array.isArray(d) ? d.slice(0, 6) : []);
        }
      } catch {}
      try {
        // Fetch flights — using correct param names: dep_iata, arr_iata, date
        const destCode = getCityIataCode(itin.destination || "");
        const flightRes = await fetch(
          `/api/flights?dep_iata=DEL&arr_iata=${encodeURIComponent(destCode)}&date=${itin.startDate || ""}`
        );
        if (flightRes.ok) {
          const d = await flightRes.json();
          setFlights(Array.isArray(d) ? d.slice(0, 6) : []);
        }
      } catch {}
      setLoadingExtras(false);
    };
    fetchExtras();
  }, [generatedItinerary]);

  // Sync wishlisted state
  useEffect(() => {
    if (!isLoaded) return;
    const ids = new Set<string>();
    hotels.forEach((h) => {
      if (isInWishlist(h.externalId || h.id)) ids.add(h.externalId || h.id);
    });
    flights.forEach((f) => {
      const fId = f.flightNumber || f.flight?.iata || "";
      if (fId && isInWishlist(fId)) ids.add(fId);
    });
    setWishlistedIds(ids);
  }, [isLoaded, hotels, flights, isInWishlist]);

  const handleAddHotelWishlist = async (hotel: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const extId = hotel.externalId || hotel.id;
    if (wishlistedIds.has(extId) || addingId) return;
    setAddingId(extId);
    const result = await addItem(
      "hotel",
      {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        rating: hotel.rating || hotel.stars,
        pricePerNight: hotel.pricePerNight,
        currency: hotel.currency,
        images: hotel.images,
        image: hotel.images?.[0],
      },
      extId,
      generatedItinerary?.id
    );
    if (result) setWishlistedIds((prev) => new Set(prev).add(extId));
    setAddingId(null);
  };

  const handleAddFlightWishlist = async (flight: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const fId = flight.flightNumber || flight.flight?.iata || "";
    if (!fId || wishlistedIds.has(fId) || addingId) return;
    setAddingId(fId);
    const result = await addItem(
      "flight",
      {
        name: `${flight.airline || "Airline"} ${fId}`,
        airline: flight.airline,
        flightNumber: fId,
        departure: flight.departure,
        arrival: flight.arrival,
        status: flight.status,
      },
      fId,
      generatedItinerary?.id
    );
    if (result) setWishlistedIds((prev) => new Set(prev).add(fId));
    setAddingId(null);
  };

  if (isGenerating || !generatedItinerary) {
    return (
      <div className="flex min-h-125 flex-col items-center justify-center gap-4 rounded-xl border border-(--color-border) bg-white px-6 py-14 shadow-(--shadow-sm)">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[rgba(244,164,96,0.3)] border-t-primary" />
          <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-(--color-text-primary)">Crafting your perfect itinerary...</p>
          <p className="mt-1 text-sm text-(--color-text-secondary)">This may take a moment while we gather data.</p>
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
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/planner")}
          className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors duration-150 hover:bg-(--color-surface) hover:text-(--color-text-primary)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Planner
        </button>
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(244,164,96,0.4)] bg-(--color-sand-light) px-3 py-1 text-xs font-semibold text-(--color-earth)">
          <Sparkles className="h-3 w-3" />
          Draft Proposal
        </span>
      </div>

      {/* Trip Overview Card */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(244,164,96,0.35)] bg-linear-to-br from-[rgba(163,80,45,0.95)] to-[rgba(227,83,54,0.9)] p-6 text-white shadow-(--shadow-lg) md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(circle_at_88%_88%,rgba(255,255,255,0.14),transparent_36%)]" />
        <h1 className="relative font-display text-2xl font-bold md:text-3xl">{itin.title}</h1>
        <div className="relative mt-3 flex flex-wrap gap-4 text-sm text-white/90">
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

        <div className="relative mt-4 flex flex-wrap gap-2">
          {itin.cityInfo?.safetyScore && (
            <span className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs">
              <Shield className="h-3 w-3" />
              Safety: {itin.cityInfo.safetyScore}/10
            </span>
          )}
          {itin.weather?.[0] && (
            <span className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs">
              {itin.weather[0].condition === "Clear" ? <Sun className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {itin.weather[0].condition} {itin.weather[0].tempMax}°C
            </span>
          )}
          {itin.exchangeRate && (
            <span className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs">
              <DollarSign className="h-3 w-3" />
              1 USD = {itin.exchangeRate.toFixed(2)} {itin.currency}
            </span>
          )}
        </div>
      </div>

      {/* Weather */}
      {itin.weather && itin.weather.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-(--color-text-primary)">Weather Forecast</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {itin.weather.slice(0, 7).map((w: any) => (
              <div key={w.date} className="flex min-w-27 shrink-0 flex-col items-center rounded-lg border border-(--color-border) bg-white p-3 text-center shadow-(--shadow-xs)">
                <span className="text-xs text-(--color-text-secondary)">
                  {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="mt-1 text-lg">
                  {w.condition === "Clear" ? "☀️" : w.condition === "Rainy" ? "🌧️" : w.condition === "Partly Cloudy" ? "⛅" : "☁️"}
                </span>
                <span className="mt-1 text-xs font-semibold text-(--color-text-primary)">{w.tempMin}° - {w.tempMax}°</span>
                <span className="text-[10px] text-(--color-text-tertiary)">{w.condition}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-Day Itinerary */}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-(--color-text-primary)">Day-by-Day Itinerary</h2>
        <div className="space-y-4">
          {days.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-(--color-text-primary)">
                  Day {day.day || dayIndex + 1}: {day.title || "Exploration"}
                </h3>
                {day.date && <span className="text-xs text-(--color-text-tertiary)">{day.date}</span>}
              </div>
              <div className="space-y-3">
                {(day.activities || []).map((act: any, actIndex: number) => (
                  <div key={actIndex} className="flex items-start gap-3 rounded-lg border border-[rgba(244,164,96,0.22)] bg-(--color-surface) p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-light) text-xs font-bold text-(--color-earth)">
                      {act.time || `${9 + actIndex}:00`}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-(--color-text-primary)">{act.name}</p>
                      {act.description && <p className="mt-0.5 text-xs text-(--color-text-secondary)">{act.description}</p>}
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-(--color-text-tertiary)">
                        {act.category && (
                          <span className="rounded-full border border-(--color-border) bg-white px-2 py-0.5">{act.category}</span>
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
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-(--color-text-primary)">
          <Hotel className="h-5 w-5 text-(--color-earth)" />
          Recommended Hotels
        </h2>
        {loadingExtras ? (
          <div className="flex items-center justify-center gap-2 py-6 text-(--color-text-secondary)">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Finding hotels...</span>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel: any, i: number) => {
              const extId = hotel.externalId || hotel.id;
              const isWishlisted = wishlistedIds.has(extId);
              const isAdding = addingId === extId;
              return (
                <div
                  key={i}
                  onClick={() => router.push(`/hotels/${hotel.externalId || hotel.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-(--color-border) bg-white shadow-(--shadow-xs) transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(244,164,96,0.4)] hover:shadow-(--shadow-md)"
                >
                  <div className="h-36 w-full overflow-hidden bg-(--color-surface)">
                    <img
                      src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleAddHotelWishlist(hotel, e)}
                    disabled={isWishlisted || !!addingId}
                    className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition ${
                      isWishlisted
                        ? "bg-rose-500 text-white"
                        : "bg-white/90 text-(--color-text-tertiary) hover:bg-white hover:text-rose-500"
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                    )}
                  </button>
                  <div className="p-4">
                    <h4 className="line-clamp-1 text-sm font-semibold text-(--color-text-primary)">{hotel.name}</h4>
                    {(hotel.city || hotel.description) && (
                      <p className="mt-0.5 line-clamp-1 flex items-center gap-1 text-xs text-(--color-text-secondary)">
                        <MapPin className="h-3 w-3 shrink-0" /> {hotel.city || hotel.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-(--color-earth)">
                        <Star className="h-3 w-3 fill-(--color-sand) text-(--color-sand)" />
                        {hotel.rating || hotel.stars || "4.0"}
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {hotel.pricePerNight ? `₹${hotel.pricePerNight}/night` : "View Details →"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) py-8 text-center">
            <Hotel className="mx-auto h-8 w-8 text-(--color-text-tertiary)" />
            <p className="mt-2 text-sm text-(--color-text-secondary)">No hotels found. Try searching manually.</p>
          </div>
        )}
      </section>

      {/* Flights Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-(--color-text-primary)">
          <Plane className="h-5 w-5 text-primary" />
          Available Flights
        </h2>
        {loadingExtras ? (
          <div className="flex items-center justify-center gap-2 py-6 text-(--color-text-secondary)">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Searching flights...</span>
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-3">
            {flights.map((flight: any, i: number) => {
              const fId = flight.flightNumber || flight.flight?.iata || "";
              const isWishlisted = fId ? wishlistedIds.has(fId) : false;
              const isAdding = addingId === fId;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (fId) router.push(`/flights/${fId}`);
                  }}
                  className={`group flex items-center gap-4 rounded-xl border border-(--color-border) bg-white p-4 shadow-(--shadow-xs) transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(244,164,96,0.4)] hover:shadow-(--shadow-md) ${fId ? "cursor-pointer" : ""}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-sand-light) text-(--color-earth)">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--color-text-primary)">
                      {flight.airline?.name || flight.airline || "Airline"}
                    </p>
                    <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                      {flight.departure?.iata || flight.dep_iata || "—"} → {flight.arrival?.iata || flight.arr_iata || "—"}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {flight.departure?.scheduled?.slice(11, 16) || flight.dep_time || "—"}
                      </span>
                      <span>{fId || ""}</span>
                      <span className="rounded-full bg-[rgba(56,142,60,0.12)] px-2 py-0.5 text-[10px] font-medium text-[rgb(56,142,60)]">
                        {flight.status || "Scheduled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {flight.price ? `₹${flight.price}` : "Check"}
                      </p>
                    </div>
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleAddFlightWishlist(flight, e)}
                      disabled={isWishlisted || !!addingId || !fId}
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${
                        isWishlisted
                          ? "bg-rose-500 text-white"
                          : "border border-(--color-border) bg-(--color-surface) text-(--color-text-tertiary) hover:bg-[rgba(244,164,96,0.14)] hover:text-rose-500"
                      }`}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) py-8 text-center">
            <Plane className="mx-auto h-8 w-8 text-(--color-text-tertiary)" />
            <p className="mt-2 text-sm text-(--color-text-secondary)">No flights found for this route.</p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
        <button
          onClick={handleAccept}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-xs) transition-colors duration-150 hover:bg-(--color-primary-hover) disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Accept & Create Trip
        </button>
        <button
          onClick={() => router.push("/planner")}
          className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-6 py-3 text-sm font-medium text-(--color-text-secondary) transition-colors duration-150 hover:bg-(--color-sand-light) hover:text-(--color-text-primary)"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
