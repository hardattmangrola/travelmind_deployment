"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, parse } from "date-fns";
import { Plane, Building, MapPin, Utensils, CalendarDays, Loader2 } from "lucide-react";
import { Activity } from "./TripCalendar";

export function TripTimeline({ itineraryId }: { itineraryId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/itinerary/${itineraryId}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [itineraryId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
        <p className="text-sm font-medium text-slate-500">
          No activities planned yet. Add some to see your journey timeline!
        </p>
      </div>
    );
  }

  // Group by date
  const grouped = activities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  // Sort dates
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Trip Journey</h2>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 py-4 space-y-12">
        {sortedDates.map((dateStr, dayIndex) => {
          const dayActivities = grouped[dateStr].sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return a.startTime.localeCompare(b.startTime);
          });

          const dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());
          const formattedDate = format(dateObj, 'EEEE, MMM do');

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Day Header Marker */}
              <div className="absolute -left-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 ring-4 ring-white" />
              <div className="ml-8 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  <CalendarDays className="h-4 w-4" />
                  Day {dayIndex + 1} • {formattedDate}
                </span>
              </div>

              {/* Activity Cards */}
              <div className="space-y-6 ml-6">
                {dayActivities.map((act, actIndex) => {
                  let Icon = MapPin;
                  let bgClass = "bg-slate-100 text-slate-600";
                  let borderClass = "border-slate-200";

                  switch (act.type) {
                    case "flight":
                      Icon = Plane;
                      bgClass = "bg-sky-100 text-sky-600";
                      borderClass = "border-sky-200";
                      break;
                    case "hotel":
                      Icon = Building;
                      bgClass = "bg-amber-100 text-amber-600";
                      borderClass = "border-amber-200";
                      break;
                    case "sightseeing":
                      Icon = MapPin;
                      bgClass = "bg-emerald-100 text-emerald-600";
                      borderClass = "border-emerald-200";
                      break;
                    case "dining":
                      Icon = Utensils;
                      bgClass = "bg-pink-100 text-pink-600";
                      borderClass = "border-pink-200";
                      break;
                  }

                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dayIndex * 0.1) + (actIndex * 0.05), duration: 0.4 }}
                      className="relative"
                    >
                      {/* Sub-node connector line/dot */}
                      <div className="absolute -left-[33px] top-4 flex h-3 w-3 items-center justify-center rounded-full bg-white border-2 border-slate-300" />
                      
                      <div className={`p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition cursor-default ${borderClass}`}>
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-900">{act.title}</h4>
                              {act.startTime && (
                                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                  {act.startTime} {act.endTime ? `- ${act.endTime}` : ''}
                                </span>
                              )}
                            </div>
                            {act.location && (
                              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {act.location}
                              </p>
                            )}
                            {act.description && (
                              <div className="mt-2 text-sm text-slate-600">
                                {act.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
