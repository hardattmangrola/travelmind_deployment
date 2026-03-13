import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ActivityCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string, locale = "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, format: "short" | "long" | "weekday" = "short") {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  const optionsMap: Record<"short" | "long" | "weekday", Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "short", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    weekday: { weekday: "short", day: "numeric", month: "short" },
  };

  return new Intl.DateTimeFormat("en-IN", optionsMap[format]).format(parsedDate);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

export function getDaysBetween(start: Date | string, end: Date | string) {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay) + 1);
}

export function getCategoryColor(category: ActivityCategory) {
  const colorMap: Record<ActivityCategory, string> = {
    beach: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    restaurant: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    museum: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    adventure: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    culture: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    nightlife: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    shopping: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    nature: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    wellness: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  };

  return colorMap[category];
}

export function getCategoryIcon(category: ActivityCategory) {
  const iconMap: Record<ActivityCategory, string> = {
    beach: "Waves",
    restaurant: "UtensilsCrossed",
    museum: "Landmark",
    adventure: "Mountain",
    culture: "Masks",
    nightlife: "Music",
    shopping: "ShoppingBag",
    nature: "Trees",
    wellness: "HeartPulse",
  };

  return iconMap[category];
}

export function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    active: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  return colorMap[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

export function generateShareToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
