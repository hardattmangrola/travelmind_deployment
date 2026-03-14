"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  MapPin,
  Search,
  Star,
  Clock,
  X,
} from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  ),
});

interface Activity {
  id: string;
  name: string;
  city: string;
  category: string;
  price: number;
  currency: string;
  duration: number;
  rating: number;
  image: string;
  description: string;
  lat: number;
  lng: number;
}

const categories = ["All", "culture", "beach", "restaurant", "museum", "adventure", "nightlife", "shopping", "nature", "wellness"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India default
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const geoRes = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      const geoData = geoRes.ok ? await geoRes.json() : [];

      if (!geoData.length) {
        setActivities([]);
        setIsLoading(false);
        return;
      }

      const { lat, lng } = geoData[0];
      setMapCenter([parseFloat(lat), parseFloat(lng)]);

      const placesRes = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&limit=30`
      );
      const placesData = placesRes.ok ? await placesRes.json() : [];
      setActivities(Array.isArray(placesData) ? placesData : []);
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities =
    selectedCategory === "All"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Top bar: Search + Filters */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="hidden sm:block text-lg font-bold text-slate-900 whitespace-nowrap">Explore</h1>
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a destination (e.g. Goa, Bali, Paris)..."
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                selectedCategory === cat
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map area — takes full remaining height */}
      <div className="relative flex-1">
        {!hasSearched ? (
          <div className="flex h-full flex-col items-center justify-center bg-slate-50 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 mb-4">
              <MapPin className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Search to Explore</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">
              Type a destination above and hit Search to see activities on the map
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex h-full flex-col items-center justify-center bg-slate-50">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">Searching activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center bg-slate-50 text-center">
            <MapPin className="h-10 w-10 text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No activities found</p>
            <p className="mt-1 text-xs text-slate-400">Try a different destination or category</p>
          </div>
        ) : (
          <>
            <ActivityMap
              activities={filteredActivities}
              center={mapCenter}
              onHover={setHoveredActivity}
              onLeave={() => setHoveredActivity(null)}
            />

            {/* Activity count badge */}
            <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg border border-slate-200 backdrop-blur-sm">
              {filteredActivities.length} activities found
            </div>

            {/* Hovered activity card */}
            {hoveredActivity && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex gap-4 p-4">
                  <img
                    src={hoveredActivity.image}
                    alt={hoveredActivity.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{hoveredActivity.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{hoveredActivity.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {hoveredActivity.rating?.toFixed(1) || "4.0"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {hoveredActivity.duration} min
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {hoveredActivity.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
