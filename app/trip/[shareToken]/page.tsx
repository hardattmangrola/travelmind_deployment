"use client";

import { MapPin, Receipt, Clock, Users, Calendar, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sampleTrips } from "@/lib/placeholder-data";
import { Timeline } from "@/components/itinerary/Timeline";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: { shareToken: string };
}

export default function SharedItineraryPage({ params }: PageProps) {
  const trip = sampleTrips[0]; // Normally fetch trip by shareToken
  const spent = trip.days.reduce((acc, day) => acc + day.totalCost, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* MINIMAL NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <LayoutDashboard className="size-4" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">TravelMind</span>
        </Link>
        <Link 
          href="/signup"
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
        >
          Plan your own trip
        </Link>
      </nav>

      {/* READ-ONLY BANNER */}
      <div className="bg-amber-50 border-b border-amber-200 py-2.5 text-center text-sm font-medium text-amber-700">
        This is a shared itinerary · Read only
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-5xl pt-6">
        
        {/* HERO */}
        <div className="relative h-64 md:h-80 overflow-hidden mx-6 rounded-3xl shadow-sm border border-slate-200">
          <Image 
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
            <div className="text-white">
              <span className="inline-block mb-3 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white border border-white/20">
                Shared Trip
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{trip.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-base md:text-lg text-slate-200 font-medium">
                <MapPin className="size-5" />
                {trip.destination}, {trip.country}
              </p>
            </div>
          </div>
        </div>

        {/* TWO COLUMN CONTENT */}
        <div className="mt-8 grid grid-cols-1 gap-6 px-6 lg:grid-cols-5">
          
          {/* LEFT COLUMN: Timeline */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
               <Timeline days={trip.days} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Map Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-72 w-full bg-slate-50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <MapPin className="mb-2 size-8 text-indigo-500" />
                  <p className="font-medium text-slate-700">Interactive Map</p>
                  <p className="mt-1 text-xs text-slate-400">Map loads in Phase 9</p>
                </div>
                
                {/* Fake pins */}
                <div className="absolute left-[30%] top-[40%] flex flex-col items-center">
                  <div className="size-3 rounded-full bg-amber-500 shadow-md ring-4 ring-white" />
                </div>
                <div className="absolute right-[40%] top-[60%] flex flex-col items-center">
                  <div className="size-3 rounded-full bg-indigo-500 shadow-md ring-4 ring-white" />
                </div>
              </div>
            </div>

            {/* Trip Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
               <h3 className="font-semibold text-slate-900 mb-4 text-lg">Trip Details</h3>
               <ul className="space-y-4">
                 <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <span className="text-slate-600 flex items-center gap-2 text-sm font-medium"><Calendar className="size-4 text-indigo-500"/> Dates</span>
                   <span className="font-semibold text-slate-900 text-sm">Jan 16 - 20, 2026</span>
                 </li>
                 <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <span className="text-slate-600 flex items-center gap-2 text-sm font-medium"><Clock className="size-4 text-indigo-500"/> Duration</span>
                   <span className="font-semibold text-slate-900 text-sm">{trip.totalDays} Days</span>
                 </li>
                 <li className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <span className="text-slate-600 flex items-center gap-2 text-sm font-medium"><Users className="size-4 text-indigo-500"/> Travelers</span>
                   <span className="font-semibold text-slate-900 text-sm">{trip.travelers} people</span>
                 </li>
               </ul>

               <div className="mt-6 border-t border-slate-200 pt-6">
                 <p className="text-sm font-medium text-slate-500 mb-2 mt-0">Total Trip Cost</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-slate-900">
                     {formatCurrency(spent, trip.currency)}
                   </p>
                   <p className="text-sm font-medium text-slate-400 opacity-80">≈ $361 USD</p>
                 </div>
               </div>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
