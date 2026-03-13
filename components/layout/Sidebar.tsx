"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  Heart,
  LayoutDashboard,
  Map,
  Plane,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sampleTrips } from "@/lib/placeholder-data";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Plan a Trip", icon: Sparkles, href: "/planner", highlighted: true },
  { label: "Explore", icon: Search, href: "/search" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "My Trips", icon: Map, href: "/planner" },
] as const;

type Status = "draft" | "active" | "completed";

function getStatusDotColor(status: Status): string {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "completed":
      return "bg-slate-400";
    case "draft":
    default:
      return "bg-amber-400";
  }
}

function getFlagEmoji(country: string): string {
  if (country === "India") return "🇮🇳";
  if (country === "Indonesia") return "🇮🇩";
  if (country === "France") return "🇫🇷";
  return "🌍";
}

export function Sidebar() {
  const pathname = usePathname();
  const recentTrips = sampleTrips.slice(0, 3);

  const userName = "John Doe";
  const userEmail = "john.doe@example.com";

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-slate-200 bg-white/95 px-4 py-4 md:flex">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
          <Plane className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          TravelMind
        </span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {/* Menu section */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold tracking-[0.16em] text-slate-400">
            MENU
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/" || pathname.startsWith(item.href)
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900",
                    isActive && "bg-slate-100 text-slate-900",
                    item.highlighted &&
                      !isActive &&
                      "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trips section */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold tracking-[0.16em] text-slate-400">
            TRIPS
          </p>
          <div className="space-y-2">
            {recentTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/itinerary/${trip.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      getStatusDotColor(trip.status as Status),
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="max-w-[9rem] truncate text-[11px] font-medium text-slate-800">
                      {trip.title}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {trip.destination} {getFlagEmoji(trip.country)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold tracking-[0.16em] text-slate-400">
            ACCOUNT
          </p>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom user card + upgrade */}
      <div className="mt-auto space-y-3 rounded-2xl bg-slate-50 p-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            JD
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-slate-900">
              {userName}
            </span>
            <span className="text-xs text-slate-500">{userEmail}</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            Free
          </span>
        </div>
        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-sm font-medium text-white shadow-md transition hover:from-indigo-500 hover:to-purple-500"
        >
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}

