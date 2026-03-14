"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  Mail,
  MapPin,
  Calendar,
  Users,
  Plane,
} from "lucide-react";

interface Invitation {
  id: string;
  role: string;
  message: string | null;
  createdAt: string;
  itinerary: {
    id: string;
    title: string;
    destination: string;
    coverImage: string;
    totalDays: number;
    travelers: number;
  };
  sender: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invitations")
      .then((res) => res.json())
      .then((data) => {
        setInvitations(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleRespond = async (id: string, action: "accept" | "decline") => {
    setResponding(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        if (action === "accept") {
          const inv = invitations.find((i) => i.id === id);
          if (inv) {
            router.push(`/itinerary/${inv.itinerary.id}/view`);
          }
        }
      }
    } catch {
      // Handle error
    }
    setResponding(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAF8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              Trip Invitations
            </h1>
            <p className="mt-2 text-slate-500">
              Accept invitations to join travel groups
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Mail className="h-6 w-6" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Plane className="h-8 w-8" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">
              No Pending Invitations
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              When someone invites you to join their trip, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Cover image */}
                  <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0">
                    <img
                      src={inv.itinerary.coverImage}
                      alt={inv.itinerary.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {inv.itinerary.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {inv.itinerary.destination}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 capitalize">
                        {inv.role}
                      </span>
                    </div>

                    {/* Sender info */}
                    <div className="mt-3 flex items-center gap-2">
                      {inv.sender.image ? (
                        <img
                          src={inv.sender.image}
                          alt={inv.sender.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                          {inv.sender.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-sm text-slate-600">
                        <strong>{inv.sender.name}</strong> invited you
                      </span>
                    </div>

                    {inv.message && (
                      <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 italic border border-slate-100">
                        &quot;{inv.message}&quot;
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {inv.itinerary.totalDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {inv.itinerary.travelers} travelers
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleRespond(inv.id, "accept")}
                        disabled={responding === inv.id}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {responding === inv.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(inv.id, "decline")}
                        disabled={responding === inv.id}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
