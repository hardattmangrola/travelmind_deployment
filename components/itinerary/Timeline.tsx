"use client";

import { Clock, MapPin, Sun } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface AiActivity {
  name: string;
  description?: string;
  time?: string;
  duration?: number;
  category?: string;
  estimatedCost?: number;
  lat?: number;
  lng?: number;
}

interface AiDay {
  day?: number;
  dayNumber?: number;
  date?: string;
  title?: string;
  activities?: AiActivity[];
  // Legacy format support
  slots?: any[];
  weather?: any;
  hotel?: any;
  totalCost?: number;
}

interface TimelineProps {
  days: AiDay[];
}

const categoryColors: Record<string, string> = {
  culture: "bg-indigo-50 text-indigo-700 border-indigo-200",
  beach: "bg-cyan-50 text-cyan-700 border-cyan-200",
  restaurant: "bg-amber-50 text-amber-700 border-amber-200",
  museum: "bg-violet-50 text-violet-700 border-violet-200",
  adventure: "bg-red-50 text-red-700 border-red-200",
  nightlife: "bg-pink-50 text-pink-700 border-pink-200",
  shopping: "bg-emerald-50 text-emerald-700 border-emerald-200",
  nature: "bg-green-50 text-green-700 border-green-200",
  wellness: "bg-teal-50 text-teal-700 border-teal-200",
};

export function Timeline({ days }: TimelineProps) {
  if (!days || !Array.isArray(days) || days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <p className="text-sm">No itinerary days to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {days.map((day, dIdx) => {
        const dayNum = day.day || day.dayNumber || dIdx + 1;
        const activities = day.activities || [];

        return (
          <div key={dIdx}>
            {/* Day header */}
            <div className="mb-4 flex items-baseline gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {dayNum}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {day.title || `Day ${dayNum}`}
                </h3>
                {day.date && (
                  <p className="text-xs text-slate-500">{day.date}</p>
                )}
              </div>
            </div>

            {/* Activities list */}
            <div className="relative ml-4 pl-8">
              {/* Timeline line */}
              <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-slate-200" />

              {activities.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">No activities planned</p>
              ) : (
                activities.map((activity, aIdx) => (
                  <div key={aIdx} className="relative mb-4">
                    {/* Timeline dot */}
                    <div className="absolute -left-[34px] top-5 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-white z-10" />

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{activity.name}</h4>
                          {activity.description && (
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activity.time && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-100">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {activity.time}
                              </span>
                            )}
                            {activity.duration && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-100">
                                {activity.duration}m
                              </span>
                            )}
                            {activity.category && (
                              <span className={cn(
                                "rounded-lg px-2 py-1 text-xs font-medium border capitalize",
                                categoryColors[activity.category] || "bg-slate-50 text-slate-600 border-slate-200"
                              )}>
                                {activity.category}
                              </span>
                            )}
                            {activity.estimatedCost != null && activity.estimatedCost > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                                ₹{activity.estimatedCost.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
