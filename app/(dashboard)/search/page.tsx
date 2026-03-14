"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
} from "lucide-react";
import Masonry from "@/components/Masonry";

interface Activity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  city?: string;
  price?: number;
  currency?: string;
  duration?: number;
  rating?: number;
  image?: string;
  description?: string;
}

const categories = ["All", "culture", "beach", "restaurant", "museum", "adventure", "nightlife", "shopping", "nature", "wellness"];

const fallbackMasonryItems = [
  {
    id: "fallback-bali",
    title: "Bali",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    height: 260,
    url: "https://www.google.com/search?q=Bali+travel+guide",
  },
  {
    id: "fallback-paris",
    title: "Paris",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    height: 300,
    url: "https://www.google.com/search?q=Paris+travel+guide",
  },
  {
    id: "fallback-tokyo",
    title: "Tokyo",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    height: 240,
    url: "https://www.google.com/search?q=Tokyo+travel+guide",
  },
  {
    id: "fallback-santorini",
    title: "Santorini",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    height: 280,
    url: "https://www.google.com/search?q=Santorini+travel+guide",
  },
  {
    id: "fallback-goa",
    title: "Goa",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    height: 250,
    url: "https://www.google.com/search?q=Goa+travel+guide",
  },
  {
    id: "fallback-kyoto",
    title: "Kyoto",
    img: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80",
    height: 290,
    url: "https://www.google.com/search?q=Kyoto+travel+guide",
  },
];

function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fallbackRepeatCount] = useState(() => 2 + Math.floor(Math.random() * 2));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    const rawInput = query.trim();
    const [cityPart, countryPart] = rawInput.split(",").map((part) => part.trim());
    const city = cityPart || rawInput;
    const country = countryPart || "";
    const slug = toSlug(city);

    router.push(
      `/dashboard/destination/${slug}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
    );
  };

  const filteredActivities =
    selectedCategory === "All"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  const masonryItems = useMemo(
    () =>
      filteredActivities.slice(0, 18).map((activity, index) => ({
        id: `${activity.id}-${index}`,
        title: activity.name,
        img:
          activity.image ||
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
        height: 220 + ((index * 47) % 120),
        url: `https://www.google.com/search?q=${encodeURIComponent(
          `${activity.name} ${activity.city || query}`
        )}`,
      })),
    [filteredActivities, query]
  );

  const repeatedFallbackItems = useMemo(() => {
    const repeated = Array.from({ length: fallbackRepeatCount }, (_, repeatIndex) =>
      shuffleArray(fallbackMasonryItems).map((item, index) => ({
        ...item,
        id: `${item.id}-r${repeatIndex}-${index}`,
        height: item.height + ((repeatIndex + index) % 3) * 24,
      }))
    ).flat();

    return shuffleArray(repeated);
  }, [fallbackRepeatCount]);

  const displayedMasonryItems = masonryItems.length > 0 ? masonryItems : repeatedFallbackItems;

  return (
    <div className="space-y-3">
      {/* Top bar: Search + Filters */}
      <div className="space-y-3 px-1 py-1">
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
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-10 py-2.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) outline-none transition focus:border-(--color-sand) focus:ring-1 focus:ring-[rgba(244,164,96,0.3)]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--color-primary-hover) disabled:opacity-60"
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
                  ? "border-[rgba(244,164,96,0.5)] bg-(--color-sand-light) font-medium text-(--color-earth)"
                  : "border-(--color-border) bg-transparent text-(--color-text-secondary) hover:bg-(--color-surface)"
              }`}
            >
              {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
              Visual Highlights
            </p>
            <p className="text-[11px] text-(--color-text-tertiary)">
              {masonryItems.length > 0 ? "Showing search results" : "Showing featured destinations"}
            </p>
          </div>
          <div className="relative h-[75vh] min-h-140 w-full overflow-y-auto overflow-x-hidden pr-1">
            <Masonry
              items={displayedMasonryItems}
              ease="power3.out"
              duration={0.6}
              stagger={0.05}
              animateFrom="bottom"
              scaleOnHover
              hoverScale={0.95}
              blurToFocus
              colorShiftOnHover={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
