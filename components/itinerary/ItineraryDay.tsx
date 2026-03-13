"use client";

import { Cloud, Sun, Moon, CloudSun, GripVertical, MessageSquare, Trash, Plus } from "lucide-react";
import type { ItineraryDay as ItineraryDayType, ItineraryItem, ItinerarySlot } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ItineraryDayProps {
  day: ItineraryDayType;
  onUpdateAction: (day: ItineraryDayType) => void;
}

export function ItineraryDay({ day, onUpdateAction }: ItineraryDayProps) {
  // We'll organize slots by morning, afternoon, evening
  const getSlot = (period: "morning" | "afternoon" | "evening"): ItinerarySlot => {
    return day.slots.find(s => s.period === period) || { period, items: [] };
  };

  const morningSlot = getSlot("morning");
  const afternoonSlot = getSlot("afternoon");
  const eveningSlot = getSlot("evening");

  const [dateStr, setDateStr] = useState("Monday, Jan 15"); // This normally parses day.date
  
  const getCategoryColor = (type: string) => {
    switch (type) {
      case "hotel": return "bg-indigo-100 text-indigo-600";
      case "activity": return "bg-emerald-100 text-emerald-600";
      case "event": return "bg-amber-100 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const renderSlot = (period: "morning" | "afternoon" | "evening", slot: ItinerarySlot) => {
    const Icon = period === "morning" ? Sun : (period === "afternoon" ? CloudSun : Moon);
    
    return (
      <div className="mb-6 last:mb-0">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="size-4 text-slate-500" />
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-medium">
            {period}
          </h4>
        </div>
        
        <div className="space-y-2">
          {slot.items.map((item) => (
            <div 
              key={item.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300"
            >
              <button className="cursor-grab text-slate-400 group-hover:text-slate-600">
                <GripVertical className="size-4" />
              </button>
              
              <div className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                {item.startTime}
              </div>
              
              <div className={cn("size-8 rounded-lg flex items-center justify-center", getCategoryColor(item.type))}>
                <div className="size-4 bg-current rounded-full opacity-50" />
              </div>
              
              <div className="flex-1 truncate text-sm font-medium text-slate-900">
                {item.data.name}
              </div>
              
              <div className="text-xs text-slate-500">
                {/* Assuming duration is on the data object, else we map */}
                {item.endTime}
              </div>
              
              <div className="font-medium text-xs text-emerald-600">
                {item.estimatedCost > 0 ? formatCurrency(item.estimatedCost, item.currency) : "Free"}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="p-1 text-slate-400 hover:text-indigo-600 rounded">
                  <MessageSquare className="size-4" />
                </button>
                <button className="p-1 text-slate-400 hover:text-rose-500 rounded">
                  <Trash className="size-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 transition-all hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600">
            <Plus className="size-4" />
            Add activity to {period}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{dateStr}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
            <Sun className="size-3.5" />
            <span>28°C · Sunny</span>
          </div>
          <span className="text-sm font-medium text-slate-500">
            Day Total: {formatCurrency(day.totalCost, "INR")}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {renderSlot("morning", morningSlot)}
        {renderSlot("afternoon", afternoonSlot)}
        {renderSlot("evening", eveningSlot)}
      </div>
    </div>
  );
}
