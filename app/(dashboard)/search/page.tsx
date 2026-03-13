"use client";

import { useState } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ChevronDown 
} from "lucide-react";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { goaActivities } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CATEGORIES = [
  "All", "Beaches", "Restaurants", "Adventure", 
  "Culture", "Nightlife", "Shopping", "Nature", "Wellness"
];

export default function SearchPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (activityId: string, isWishlisted: boolean) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (isWishlisted) {
        next.add(activityId);
        toast.success("Added to wishlist", {
          description: "Item saved to your trip wishlist."
        });
      } else {
        next.delete(activityId);
        toast.info("Removed from wishlist");
      }
      return next;
    });
  };

  const handleAddToTrip = () => {
    toast.success("Added to trip successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* PAGE HEADER */}
      <div className="px-6 pt-8">
        <h1 className="text-3xl font-bold text-slate-900">Explore Activities</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover verified hotels, experiences and events
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mt-6 max-w-2xl px-6">
        <div className="relative flex items-center">
          <Search className="absolute left-10 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search destinations, hotels, activities..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-28 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filters</span>
            {showFilters && (
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="mt-4 px-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          <div className="flex shrink-0 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === category
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-transparent text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="h-6 w-px shrink-0 bg-slate-200" />

          <div className="flex shrink-0 gap-3">
            <Select defaultValue="any-price">
              <SelectTrigger className="h-9 w-35 rounded-xl border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-price">Any Price</SelectItem>
                <SelectItem value="under-500">Under ₹500</SelectItem>
                <SelectItem value="500-2000">₹500–₹2,000</SelectItem>
                <SelectItem value="above-2000">Above ₹2,000</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="any-rating">
              <SelectTrigger className="h-9 w-[130px] rounded-xl border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-rating">Any Rating</SelectItem>
                <SelectItem value="4-star">4+ Stars</SelectItem>
                <SelectItem value="4.5-star">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="relevance">
              <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="mt-6 flex items-center justify-between px-6">
        <p className="text-sm font-medium text-slate-500">
          Showing 12 results for Goa
        </p>
        <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "grid" 
                ? "bg-slate-100 text-indigo-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "list" 
                ? "bg-slate-100 text-indigo-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
            aria-label="List view"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className={cn(
        "mt-4 px-6",
        viewMode === "grid"
          ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "flex flex-col gap-4"
      )}>
        {goaActivities.slice(0, 12).map((activity) => (
          <div key={activity.id} className={viewMode === "grid" ? "flex justify-center" : ""}>
            <ActivityCard 
              activity={activity} 
              onWishlistToggle={(isWishlisted) => handleWishlistToggle(activity.id, isWishlisted)}
              onAddToTrip={() => handleAddToTrip()}
            />
          </div>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      <button className="mx-auto mt-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600">
        Load more results
        <ChevronDown className="size-4" />
      </button>
    </div>
  );
}
