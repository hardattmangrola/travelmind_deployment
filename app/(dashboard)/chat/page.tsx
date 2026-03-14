"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plane, Clock, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { GroupChat } from "@/components/chat/GroupChat";

export default function ChatPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/itinerary/user")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItineraries(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load itineraries for chat", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAF8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Trip Chats</h1>
            <p className="mt-2 text-slate-500">Discuss plans with your travel buddies</p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <MessageCircle className="h-6 w-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : itineraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Plane className="h-8 w-8" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">No Trips Yet</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Create a trip or get invited to one to start chatting with your travel group.
            </p>
            <Link href="/planner" className="tm-btn-primary mt-6 px-6 py-2.5">
              Plan a Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer"
                onClick={() => setActiveChatId(itinerary.id)}
              >
                <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={itinerary.coverImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"}
                    alt={itinerary.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-semibold truncate">{itinerary.title}</h3>
                    <p className="text-xs text-slate-200 opacity-90">{itinerary.destination}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      {itinerary.totalDays} Days
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="mr-2 h-4 w-4 text-slate-400" />
                      {itinerary.travelers} Travelers
                    </div>
                  </div>

                  <button 
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatId(itinerary.id);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GroupChat
        itineraryId={activeChatId as string}
        isOpen={!!activeChatId}
        onClose={() => setActiveChatId(null)}
      />
    </div>
  );
}
