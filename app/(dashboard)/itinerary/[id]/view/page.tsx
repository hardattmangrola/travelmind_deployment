"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UserPlus,
  Share2,
  MapPin,
  Receipt,
  Clock,
  Users,
  Calendar,
  MessageCircle,
  Loader2,
  X,
  Send,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Timeline } from "@/components/itinerary/Timeline";
import { formatCurrency } from "@/lib/utils";
import { GroupChat } from "@/components/chat/GroupChat";
import { useSession } from "@/lib/auth-client";
import { downloadPdf } from "@/lib/pdf-service";
import { Download } from "lucide-react";

export default function ViewItineraryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/itinerary/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setTrip(data);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/dashboard");
      });
  }, [id, router]);

  if (isLoading || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const days = Array.isArray(trip.days) ? trip.days : [];
  const spent =
    days.reduce((acc: number, day: any) => acc + (day.totalCost || 0), 0) ||
    trip.totalBudget;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    setInviteStatus(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itineraryId: id,
          email: inviteEmail.trim(),
          role: inviteRole,
          message: inviteMsg.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteStatus({ type: "success", text: `Invitation sent to ${inviteEmail}!` });
        setInviteEmail("");
        setInviteMsg("");
      } else {
        setInviteStatus({ type: "error", text: data.error || "Failed to send" });
      }
    } catch {
      setInviteStatus({ type: "error", text: "Network error" });
    }
    setInviteSending(false);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadPdf("itinerary-content", `${trip.title.replace(/\s+/g, '-').toLowerCase()}-itinerary.pdf`);
    } catch (error) {
      console.error("Failed to download PDF", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="itinerary-content" className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* HERO */}
      <div className="relative h-64 overflow-hidden rounded-b-3xl">
        <Image
          src={
            trip.coverImage ||
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=90"
          }
          alt={trip.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="text-white">
            <h1 className="font-display text-4xl font-bold">{trip.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-200">
              <MapPin className="size-4" />
              {trip.destination}
              {trip.country ? `, ${trip.country}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <button
              onClick={() => setIsInviteOpen(true)}
              data-html2canvas-ignore="true"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20"
            >
              <UserPlus className="size-4" />
              Invite
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              data-html2canvas-ignore="true"
              className="flex items-center gap-2 rounded-xl bg-indigo-600/90 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-indigo-500 border border-indigo-500/50 shadow-lg shadow-indigo-500/20"
            >
              <MessageCircle className="size-4" />
              Group Chat
            </button>

            <button 
              data-html2canvas-ignore="true"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20"
            >
              <Share2 className="size-4" />
              Share
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              data-html2canvas-ignore="true"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-5 lg:px-12">
        {/* LEFT COLUMN: Timeline */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-[#E8E8E2] bg-white p-6 shadow-sm">
            <Timeline days={days} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Map Card Placeholder */}
          <div className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white shadow-sm">
            <div className="relative h-72 w-full bg-slate-50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <MapPin className="mb-2 size-8 text-indigo-500" />
                <p className="font-medium text-slate-700">Interactive Map</p>
              </div>
            </div>
          </div>

          {/* Trip Info Card */}
          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Trip Details</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="size-4" /> Start Date
                </span>
                <span className="font-medium text-slate-900">{trip.startDate}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock className="size-4" /> Duration
                </span>
                <span className="font-medium text-slate-900">
                  {trip.totalDays} Days
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users className="size-4" /> Travelers
                </span>
                <span className="font-medium text-slate-900">
                  {trip.travelers} people
                </span>
              </li>
              <li className="flex justify-between mt-4 gap-2 pt-4 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Receipt className="size-4" /> Est. Budget
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(trip.totalBudget, trip.currency)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* GroupChat Slide-over */}
      <GroupChat
        itineraryId={id as string}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Invite to Trip
              </h2>
              <button
                onClick={() => {
                  setIsInviteOpen(false);
                  setInviteStatus(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <div className="flex gap-2">
                  {["editor", "viewer"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition ${
                        inviteRole === r
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  placeholder="Hey! Join me on this trip..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {inviteStatus && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    inviteStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {inviteStatus.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {inviteStatus.text}
                </div>
              )}

              <button
                onClick={handleInvite}
                disabled={inviteSending || !inviteEmail.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {inviteSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
