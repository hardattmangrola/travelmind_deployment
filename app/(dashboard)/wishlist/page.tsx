"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WishlistCard } from "@/components/cards/WishlistCard";
import { goaActivities } from "@/lib/placeholder-data";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

const TABS = ["All", "Hotels", "Activities", "Events"];

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [items, setItems] = useState(goaActivities.slice(0, 5));

  const handleRemove = (id: string) => {
    // Optimistically remove the item
    const itemToRemove = items.find(i => i.id === id);
    setItems(items.filter(item => item.id !== id));
    
    toast("Removed from wishlist", {
      action: {
        label: "Undo",
        onClick: () => {
          if (itemToRemove) {
            setItems(prev => [...prev, itemToRemove]);
          }
        },
      },
    });
  };

  const handleAddToItinerary = (id: string) => {
    toast.success("Added to itinerary");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER */}
      <div className="flex flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="size-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} items saved
          </p>
        </div>
        <button className="flex h-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm hover:shadow">
          <Sparkles className="size-4" />
          Create Trip from Wishlist
        </button>
      </div>

      {/* TAB BAR */}
      <div className="mt-6 border-b border-slate-200 px-6">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-all",
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {items.length === 0 ? (
        <div className="mt-24 flex flex-col items-center justify-center px-6 text-center">
          <Heart className="size-20 text-slate-200" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Nothing saved yet
          </h2>
          <p className="mt-2 text-slate-500">
            Start exploring and save items you love
          </p>
          <Link 
            href="/search"
            className="mt-6 rounded-xl border border-indigo-200 bg-white px-6 py-2.5 text-sm font-medium text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-300"
          >
            Explore Activities
          </Link>
        </div>
      ) : (
        <div className="mt-6 px-6 pb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {items.map((activity, index) => (
                <div key={activity.id} className="flex justify-center">
                  <WishlistCard
                    activity={activity}
                    savedDate="Jan 10"
                    votes={0}
                    onRemove={() => handleRemove(activity.id)}
                    onAddToItinerary={() => handleAddToItinerary(activity.id)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
