"use client";

import Image from "next/image";
import { Clock, MapPin, Star, X, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Activity } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

interface WishlistCardProps {
  activity: Activity;
  savedDate: string;
  votes: number;
  onRemove?: () => void;
  onAddToItinerary?: () => void;
}

export function WishlistCard({
  activity,
  savedDate,
  votes,
  onRemove,
  onAddToItinerary,
}: WishlistCardProps) {
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);

  const handleUpvote = () => setVoteStatus(prev => prev === "up" ? null : "up");
  const handleDownvote = () => setVoteStatus(prev => prev === "down" ? null : "down");

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 280px, 288px"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
        
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-500 shadow-sm">
          <Star className="size-3 text-amber-400" />
          <span className="text-[11px] text-slate-800">
            {activity.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:bg-rose-500/20 hover:text-rose-500"
          aria-label="Remove from wishlist"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <p className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {activity.category}
          </p>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">
            {activity.name}
          </h3>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-slate-400" />
              <span className="truncate">{activity.city}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Saved {savedDate}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-slate-400" />
            <span>{activity.duration} min</span>
          </div>
          {activity.price > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
              {formatCurrency(activity.price, activity.currency)}
            </span>
          )}
        </div>

        {/* Voting row */}
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          <button 
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
              voteStatus === "up" ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <ThumbsUp className={cn("size-3.5", voteStatus === "up" && "fill-current")} />
            <span>{voteStatus === "up" ? votes + 1 : votes}</span>
          </button>
          <button 
            onClick={handleDownvote}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
              voteStatus === "down" ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <ThumbsDown className={cn("size-3.5", voteStatus === "down" && "fill-current")} />
            <span>0</span>
          </button>
          <span className="ml-auto text-[10px] text-slate-400">
            Team votes
          </span>
        </div>

        <button
          type="button"
          onClick={onAddToItinerary}
          className="mt-3 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800"
        >
          Add to Itinerary
        </button>
      </div>
    </motion.div>
  );
}
