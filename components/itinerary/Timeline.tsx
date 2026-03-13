"use client";

import { Clock, MapPin, BedDouble, Sun, Navigation } from "lucide-react";
import Image from "next/image";
import { cn, formatCurrency } from "@/lib/utils";
import type { ItineraryDay } from "@/types";

interface TimelineProps {
  days: ItineraryDay[];
}

export function Timeline({ days }: TimelineProps) {
  return (
    <div className="space-y-12">
      {days.map((day, dIdx) => (
        <div key={day.dayNumber}>
          <h3 className="mb-4 text-xl font-bold text-slate-900">
            Day {day.dayNumber} — {day.date}
          </h3>
          
          {day.weather && (
            <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 p-3 shadow-sm border border-slate-200">
              <Sun className="size-6 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">{day.weather.condition}</p>
                <p className="text-xs text-slate-500">
                  {day.weather.tempMax}° / {day.weather.tempMin}° • {day.weather.precipitationChance}% rain
                </p>
              </div>
            </div>
          )}

          <div className="relative pl-10">
            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-slate-200" />

            {/* If there's a hotel for the day, show it as a special first block */}
            {day.hotel && (
              <div className="relative mb-6 ml-4">
                <div className="absolute -left-[42px] top-4 flex size-5 items-center justify-center rounded-full border-2 border-amber-500 bg-white z-10" />
                
                <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden shadow-sm transition-all hover:border-amber-300">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0">
                      <Image 
                        src={day.hotel.images[0]} 
                        alt={day.hotel.name} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, 192px"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Your Stay
                      </span>
                      <h4 className="mt-2 font-semibold text-slate-900">{day.hotel.name}</h4>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="size-3.5" />
                        {day.hotel.city}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {day.hotel.amenities.slice(0, 3).map(amenity => (
                          <span key={amenity} className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm border border-amber-100">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {day.slots.map((slot) => (
              <div key={slot.period} className="mb-4">
                {slot.items.map((item, iIdx) => (
                  <div key={item.id} className="relative mb-4 ml-4">
                    <div className="absolute -left-[40px] top-6 h-4 w-4 rounded-full border-2 border-indigo-500 bg-white z-10" />
                    
                    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300">
                      
                      <div className="flex shrink-0 flex-row sm:flex-col items-center gap-2 sm:w-16 pt-1">
                        <span className="text-xs font-bold text-slate-900">{item.startTime}</span>
                        <div className="hidden sm:block h-8 w-px bg-slate-200" />
                        <span className="text-xs font-medium text-slate-500">{item.endTime}</span>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{item.data.name}</h4>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {item.data.description}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-3">
                           <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 flex-wrap border border-slate-100 shadow-sm">
                            <Clock className="size-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">
                              {"duration" in item.data ? item.data.duration + "m" : "Flexible"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 flex-wrap border border-emerald-100 shadow-sm">
                            <span className="text-xs font-bold text-emerald-700">
                              {item.estimatedCost > 0 ? formatCurrency(item.estimatedCost, item.currency) : "Free"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-3 sm:mt-0 h-24 w-full sm:h-20 sm:w-24 shrink-0 overflow-hidden rounded-xl">
                        <Image 
                          src={'image' in item.data ? item.data.image : item.data.images[0]} 
                          alt={item.data.name} 
                          fill 
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
