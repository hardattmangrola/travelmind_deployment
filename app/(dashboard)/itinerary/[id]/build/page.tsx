"use client";

import { useState } from "react";
import { Calendar, Users, PiggyBank, AlertTriangle, AlertCircle, GripVertical, Plus } from "lucide-react";
import Image from "next/image";
import { sampleTrips, goaActivities } from "@/lib/placeholder-data";
import { cn, formatCurrency } from "@/lib/utils";
import { ItineraryDay } from "@/components/itinerary/ItineraryDay";

// In Next.js 15 App router, page params are promises by default or unwrapped based on context. 
// We'll just define the interface for standard dynamic routes.
interface PageProps {
  params: { id: string };
}

export default function BuildItineraryPage({ params }: PageProps) {
  const trip = sampleTrips[0];
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [tripTitle, setTripTitle] = useState(trip.title);
  const [budget, setBudget] = useState(trip.totalBudget.toString());

  // Derive some placeholder calculations
  const spent = trip.days.reduce((acc, day) => acc + day.totalCost, 0);
  const totalBudget = parseInt(budget) || 0;
  const remaining = totalBudget - spent;
  const progressPct = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;
  
  const wishlistItems = goaActivities.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex bg-white text-slate-900 md:left-64 md:top-[73px]">
      {/* LEFT SIDEBAR */}
      <div className="hidden shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto pb-24 md:block md:w-80">
        <div className="p-4 pt-6">
          {/* Trip Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <input 
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded px-1 -ml-1 transition-all"
            />
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇮🇳</span>
                <span className="font-medium text-slate-900">{trip.destination}, {trip.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-slate-400" />
                <span>Jan 16 - Jan 20, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-slate-400" />
                <span>{trip.travelers} Travelers</span>
              </div>
              <div className="mt-2 inline-flex w-fit items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {trip.travelStyle.charAt(0).toUpperCase() + trip.travelStyle.slice(1)} Pace
              </div>
            </div>
          </div>

          {/* Budget Tracker */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-2 font-medium text-slate-900">
              <PiggyBank className="size-4 text-slate-400" />
              Budget Tracker
            </h3>
            
            <div className="mt-4">
              <label className="text-xs text-slate-500">Total Budget (INR)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Spent</p>
                <p className="font-bold text-slate-900">{formatCurrency(spent, trip.currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Remaining</p>
                <p className={cn(
                  "font-medium",
                  remaining < 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                  {formatCurrency(Math.abs(remaining), trip.currency)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  progressPct > 90 ? "bg-rose-500" : progressPct > 75 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {remaining < 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertTriangle className="size-4 shrink-0" />
                <p>Over budget by {formatCurrency(Math.abs(remaining), trip.currency)}</p>
              </div>
            )}
          </div>

          {/* Wishlist Panel */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">From Wishlist</h3>
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                {wishlistItems.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {wishlistItems.map(item => (
                <div key={item.id} className="group relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 pr-10 shadow-sm transition-all hover:border-indigo-300">
                  <div className="cursor-grab p-1 text-slate-400 group-hover:text-slate-600">
                    <GripVertical className="size-4" />
                  </div>
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{formatCurrency(item.price, "INR")}</p>
                  </div>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 p-1.5 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-900">
                    <Plus className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400 italic">
              Note: drag-and-drop to be added in Phase 8 with @dnd-kit
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-white px-6 pt-6 pb-24">
        <h1 
          className="text-3xl font-bold text-slate-900 hover:bg-slate-50 rounded-xl px-2 py-1 -mx-2 w-fit cursor-text transition-colors"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setTripTitle(e.currentTarget.textContent || "")}
        >
          {tripTitle}
        </h1>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {trip.days.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={cn(
                "flex min-w-25 flex-col items-center justify-center rounded-xl px-4 py-2 transition-all",
                activeDayIdx === idx
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span className="font-medium text-sm">Day {day.dayNumber}</span>
              <span className="text-xs opacity-80 mt-0.5">{day.date.substring(5).replace('-', '/')}</span>
            </button>
          ))}
          <button className="flex min-w-25 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-transparent px-4 py-2 text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600">
            <Plus className="size-4" />
            <span className="text-xs font-medium">Add Day</span>
          </button>
        </div>

        <div className="mt-2 max-w-4xl">
          <ItineraryDay 
            day={trip.days[activeDayIdx] || trip.days[0]} 
            onUpdateAction={() => {}} 
          />
        </div>
      </div>

      {/* SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md md:left-[calc(256px+20rem)]">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="size-4" />
          <span className="text-sm font-medium">3 unsaved changes</span>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300">
            Preview
          </button>
          <button className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow">
            Save Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
