"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Compass,
  Landmark,
  Loader2,
  MapPin,
  Shield,
  Sparkles,
  Sun,
  Ticket,
  Globe,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

interface CityInfo {
  name: string;
  country: string;
  safetyScore: number;
  costOfLiving: number;
  qualityOfLife: number;
  currency: string;
  timezone: string;
  language: string;
}

interface PlaceItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  image: string;
  city: string;
}

interface EventItem {
  id: string;
  name: string;
  date: string;
  category: string;
  venue: string;
  description: string;
}

interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
}

interface DestinationGuide {
  history: string;
  bestTime: string;
  highlights: string[];
  activities: string[];
  localFood: string[];
  transportTips: string[];
  currency: string;
}

const guides: Record<string, DestinationGuide> = {
  bali: {
    history:
      "Bali has evolved from an ancient Hindu-Balinese kingdom into one of Southeast Asia's most iconic cultural destinations. Its temples, rituals, dance traditions, and artisan communities still shape daily life across the island.",
    bestTime: "April to October for dry weather, beach days, and outdoor activities.",
    highlights: ["Uluwatu Temple", "Tegallalang Rice Terraces", "Ubud Art Market", "Tanah Lot", "Nusa Penida day trip"],
    activities: ["Temple hopping", "Surfing in Canggu", "Sunrise trek on Mount Batur", "Balinese cooking classes", "Waterfall exploration"],
    localFood: ["Nasi Campur", "Babi Guling", "Satay Lilit", "Lawar"],
    transportTips: ["Book private drivers for full-day tours", "Use ride-hailing apps in town areas", "Avoid peak scooter traffic at sunset"],
    currency: "IDR",
  },
  paris: {
    history:
      "From Roman Lutetia to the medieval capital of France and the center of art, revolution, and modern fashion, Paris carries layers of history in its architecture, museums, and neighborhoods.",
    bestTime: "April to June and September to October for pleasant weather and manageable crowds.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Notre-Dame area", "Seine river walk"],
    activities: ["Museum circuits", "Cafe-hopping", "River cruise", "Vintage market visits", "Day trip to Versailles"],
    localFood: ["Croissant", "Steak frites", "Onion soup", "Macarons"],
    transportTips: ["Use metro carnet/pass for savings", "Walk central arrondissements", "Reserve major museum time slots in advance"],
    currency: "EUR",
  },
  tokyo: {
    history:
      "Tokyo grew from the Edo shogunate seat into one of the world's most advanced megacities, where historic shrines and traditional districts coexist with futuristic neighborhoods and technology hubs.",
    bestTime: "March to May for cherry blossoms and October to November for clear autumn weather.",
    highlights: ["Senso-ji Temple", "Shibuya Crossing", "Meiji Shrine", "Tsukiji Outer Market", "Tokyo Skytree"],
    activities: ["Food alley tours", "Anime and gaming districts", "Onsen day trips", "Night photography walks", "Seasonal festivals"],
    localFood: ["Sushi", "Ramen", "Yakitori", "Monjayaki"],
    transportTips: ["Use IC card for easy transit", "Take trains over taxis", "Keep station names in Japanese and English"],
    currency: "JPY",
  },
  santorini: {
    history:
      "Santorini's volcanic origin and Bronze Age settlements shaped its dramatic cliffs and caldera villages. Centuries of maritime trade and Cycladic architecture made it one of Greece's best-known islands.",
    bestTime: "May to early July and September for warm weather without peak-season congestion.",
    highlights: ["Oia sunset viewpoints", "Fira old town", "Akrotiri archaeological site", "Red Beach", "Caldera cruise"],
    activities: ["Catamaran sailing", "Cliffside village walks", "Wine tasting", "Beach hopping", "Photography tours"],
    localFood: ["Tomatokeftedes", "Fava", "Fresh seafood", "Baklava"],
    transportTips: ["Use local buses for key towns", "Book sunset restaurants early", "Prefer morning visits for photo spots"],
    currency: "EUR",
  },
};

function toTitleCase(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugToCity(slug: string) {
  return toTitleCase(slug.replace(/-/g, " "));
}

function fallbackGuide(city: string): DestinationGuide {
  return {
    history: `${city} has a rich blend of local heritage and modern travel culture. Historic districts, public landmarks, and evolving neighborhoods together create a destination worth exploring in depth.`,
    bestTime: "Check shoulder seasons for better weather and lighter crowds.",
    highlights: ["Historic old town", "Main city square", "Top viewpoint", "Waterfront area", "Local market"],
    activities: ["Walking tours", "Local food tastings", "Museums and galleries", "Nature excursions", "Nightlife exploration"],
    localFood: ["Regional street food", "Traditional main course", "Local desserts"],
    transportTips: ["Use public transit for city routes", "Start major attractions early", "Keep offline maps downloaded"],
    currency: "USD",
  };
}

export default function DestinationDetailsPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const slug = params.slug;
  const city = searchParams.get("city") || slugToCity(slug);
  const country = searchParams.get("country") || "";
  const image =
    searchParams.get("image") ||
    `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80&auto=format&fit=crop`;
  const flag = searchParams.get("flag") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const guide = useMemo(() => guides[slug] || fallbackGuide(city), [slug, city]);

  useEffect(() => {
    let mounted = true;

    const loadDestinationData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const geoRes = await fetch(`/api/geocode?query=${encodeURIComponent(`${city}${country ? `, ${country}` : ""}`)}`);
        const geoData = geoRes.ok ? await geoRes.json() : [];
        const topMatch = Array.isArray(geoData) ? geoData[0] : null;

        if (!topMatch?.lat || !topMatch?.lng) {
          throw new Error("We could not find this destination on the map.");
        }

        const lat = topMatch.lat;
        const lng = topMatch.lng;

        const [cityRes, placesRes, eventsRes, weatherRes] = await Promise.all([
          fetch(`/api/city-info?city=${encodeURIComponent(city)}`),
          fetch(`/api/places?lat=${lat}&lng=${lng}&limit=18`),
          fetch(`/api/events?lat=${lat}&lng=${lng}&limit=8`),
          fetch(`/api/weather?lat=${lat}&lng=${lng}`),
        ]);

        const cityData = cityRes.ok ? await cityRes.json() : null;
        const placesData = placesRes.ok ? await placesRes.json() : [];
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const weatherData = weatherRes.ok ? await weatherRes.json() : [];

        if (!mounted) return;

        setCityInfo(cityData);
        setPlaces(Array.isArray(placesData) ? placesData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setWeather(Array.isArray(weatherData) ? weatherData : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load destination details.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadDestinationData();

    return () => {
      mounted = false;
    };
  }, [city, country]);

  useEffect(() => {
    const targetCurrency = cityInfo?.currency || guide.currency || "USD";

    if (targetCurrency === "USD") {
      setExchangeRate(1);
      return;
    }

    fetch(`/api/currency?from=USD&to=${encodeURIComponent(targetCurrency)}`)
      .then((res) => (res.ok ? res.json() : { rate: null }))
      .then((data) => setExchangeRate(typeof data.rate === "number" ? data.rate : null))
      .catch(() => setExchangeRate(null));
  }, [cityInfo?.currency, guide.currency]);

  const tourismSpots = places.slice(0, 9);

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item: any = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center rounded-xl border border-(--color-border) bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-(--color-text-secondary)">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[rgba(227,83,54,0.35)] bg-[rgba(227,83,54,0.08)] p-6 text-[rgb(176,48,48)]">
        <p className="font-semibold">Could not load this destination.</p>
        <p className="mt-1 text-sm">{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[rgba(176,48,48,0.35)] px-3 py-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-xl border border-[rgba(244,164,96,0.35)] bg-white shadow-(--shadow-lg)"
      >
        <img src={image} alt={city} className="h-64 w-full object-cover md:h-72" />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(28,15,8,0.84)] via-[rgba(28,15,8,0.28)] to-transparent" />

        <div className="absolute left-4 top-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/75">Destination Guide</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            {flag ? `${flag} ` : ""}
            {city}
            {country ? `, ${country}` : ""}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/85">
            Explore tourism hotspots, cultural history, activities, events, weather, and practical travel information in one place.
          </p>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-(--color-border) bg-white p-4 shadow-(--shadow-xs)">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Safety</p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-(--color-text-primary)">
            <Shield className="h-5 w-5 text-primary" />
            {cityInfo?.safetyScore?.toFixed?.(1) || "-"}/10
          </p>
        </div>
        <div className="rounded-lg border border-(--color-border) bg-white p-4 shadow-(--shadow-xs)">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Cost of Living</p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-(--color-text-primary)">
            <Wallet className="h-5 w-5 text-primary" />
            {cityInfo?.costOfLiving?.toFixed?.(1) || "-"}/10
          </p>
        </div>
        <div className="rounded-lg border border-(--color-border) bg-white p-4 shadow-(--shadow-xs)">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Quality of Life</p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-(--color-text-primary)">
            <Sparkles className="h-5 w-5 text-primary" />
            {cityInfo?.qualityOfLife?.toFixed?.(1) || "-"}/10
          </p>
        </div>
        <div className="rounded-lg border border-(--color-border) bg-white p-4 shadow-(--shadow-xs)">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Timezone</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-(--color-text-primary)">
            <Clock3 className="h-4 w-4 text-primary" />
            {cityInfo?.timezone || "-"}
          </p>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
          <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">History and Culture</h2>
          <p className="mt-3 text-sm leading-7 text-(--color-text-secondary)">{guide.history}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Best Time To Visit</p>
              <p className="mt-1 text-sm text-(--color-text-primary)">{guide.bestTime}</p>
            </div>
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Language and Currency</p>
              <p className="mt-1 text-sm text-(--color-text-primary)">
                {cityInfo?.language || "English"} • {cityInfo?.currency || guide.currency}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
          <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Travel Essentials</h2>
          <ul className="mt-3 space-y-2 text-sm text-(--color-text-secondary)">
            {guide.transportTips.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">Currency Snapshot</p>
            <p className="mt-1 text-sm text-(--color-text-primary)">
              {exchangeRate
                ? `1 USD ≈ ${exchangeRate.toFixed(2)} ${cityInfo?.currency || guide.currency}`
                : "Live exchange rate unavailable right now."}
            </p>
          </div>
        </article>
      </motion.section>

      <motion.section variants={item} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Top Tourism Spots</h2>
          <span className="rounded-full border border-[rgba(244,164,96,0.4)] bg-(--color-sand-light) px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-(--color-earth)">
            {tourismSpots.length} spots
          </span>
        </div>

        {tourismSpots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tourismSpots.map((spot) => (
              <article
                key={spot.id}
                className="overflow-hidden rounded-lg border border-(--color-border) bg-white shadow-(--shadow-xs) transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
              >
                <img src={spot.image} alt={spot.name} className="h-40 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <p className="line-clamp-1 font-semibold text-(--color-text-primary)">{spot.name}</p>
                  <p className="line-clamp-2 text-xs text-(--color-text-secondary)">{spot.description || "Popular tourist destination."}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-(--color-earth)">
                      <Compass className="h-3.5 w-3.5" />
                      {spot.category || "attraction"}
                    </span>
                    <span className="text-(--color-text-tertiary)">{spot.rating?.toFixed?.(1) || "4.0"}/5</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-sm text-(--color-text-secondary)">
            Tourism spots are currently unavailable for this destination.
          </div>
        )}
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
          <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Activities To Do</h2>
          <ul className="mt-3 grid gap-2 text-sm text-(--color-text-secondary) sm:grid-cols-2">
            {guide.activities.map((activity) => (
              <li key={activity} className="inline-flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {activity}
              </li>
            ))}
          </ul>

          <h3 className="mt-5 font-semibold text-(--color-text-primary)">Local Food To Try</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {guide.localFood.map((food) => (
              <span
                key={food}
                className="rounded-full border border-[rgba(244,164,96,0.35)] bg-(--color-sand-light) px-3 py-1 text-xs font-medium text-(--color-earth)"
              >
                {food}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
          <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Weather Outlook</h2>
          {weather.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {weather.slice(0, 6).map((w) => (
                <div key={w.date} className="rounded-md border border-(--color-border) bg-(--color-surface) p-2.5 text-center">
                  <p className="text-[10px] text-(--color-text-tertiary)">
                    {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">{w.tempMin}° - {w.tempMax}°</p>
                  <p className="text-[10px] text-(--color-text-secondary)">{w.condition}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-(--color-text-secondary)">Weather forecast unavailable.</p>
          )}
        </article>
      </motion.section>

      <motion.section variants={item} className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Upcoming Events and Experiences</h2>
        {events.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.id} className="rounded-lg border border-(--color-border) bg-white p-4 shadow-(--shadow-xs)">
                <p className="line-clamp-1 font-semibold text-(--color-text-primary)">{event.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-(--color-text-secondary)">
                  <Calendar className="h-3.5 w-3.5" />
                  {event.date || "Date TBA"}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-(--color-text-secondary)">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.venue || city}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-(--color-text-secondary)">{event.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[rgba(244,164,96,0.35)] bg-(--color-sand-light) px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-(--color-earth)">
                  <Ticket className="h-3 w-3" />
                  {event.category || "event"}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-sm text-(--color-text-secondary)">
            No major events were found for this location right now.
          </div>
        )}
      </motion.section>

      <motion.section variants={item} className="rounded-xl border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
        <h2 className="font-display text-xl font-semibold text-(--color-text-primary)">Quick Planning Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/planner?destination=${encodeURIComponent(city)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary-hover)"
          >
            <Sun className="h-4 w-4" />
            Plan a Trip Here
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-text-primary) transition-colors hover:bg-(--color-sand-light)"
          >
            <Globe className="h-4 w-4" />
            Explore Flights and Hotels
          </Link>
          <Link
            href="/wishlist"
            className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-text-primary) transition-colors hover:bg-(--color-sand-light)"
          >
            <Landmark className="h-4 w-4" />
            Save Places to Wishlist
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}
