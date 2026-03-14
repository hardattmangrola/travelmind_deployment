"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UserPlus,
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
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Timeline } from "@/components/itinerary/Timeline";
import { formatCurrency } from "@/lib/utils";
import { GroupChat } from "@/components/chat/GroupChat";
import { useSession } from "@/lib/auth-client";
import { downloadPdf } from "@/lib/pdf-service";
import { Download } from "lucide-react";
import { TripCalendar } from "@/components/itinerary/TripCalendar";
import { TripTimeline } from "@/components/itinerary/TripTimeline";
import { ItineraryMapRegion } from "@/components/itinerary/ItineraryMapRegion";

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
  const [activeView, setActiveView] = useState<"timeline" | "calendar">("timeline");
  const [userPlan, setUserPlan] = useState<"basic" | "pro">("basic");

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

  // Fetch user plan
  useEffect(() => {
    fetch("/api/user/plan", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { plan: "basic" }))
      .then((data) => setUserPlan(data.plan || "basic"))
      .catch(() => {});
  }, []);

  if (isLoading || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center rounded-xl border border-(--color-border) bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const days = Array.isArray(trip.days) ? trip.days : [];
  const spent =
    days.reduce((acc: number, day: any) => acc + (day.totalCost || 0), 0) ||
    trip.totalBudget;

  const isPro = userPlan === "pro";

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
    <div id="itinerary-content" className="min-h-screen bg-(--color-cream) pb-24">
      {/* HERO */}
      <div className="relative h-64 overflow-hidden rounded-xl border border-[rgba(244,164,96,0.3)] shadow-(--shadow-lg)">
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
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(28,15,8,0.85)] via-[rgba(28,15,8,0.38)] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="text-white">
            <h1 className="font-display text-4xl font-bold">{trip.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
              <MapPin className="size-4" />
              {trip.destination}
              {trip.country ? `, ${trip.country}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-medium">
            {/* Invite — Pro only */}
            {isPro ? (
              <button
                onClick={() => setIsInviteOpen(true)}
                data-html2canvas-ignore="true"
                className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <UserPlus className="size-4" />
                Invite
              </button>
            ) : (
              <Link
                href="/choose-plan"
                data-html2canvas-ignore="true"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-white/55 backdrop-blur-md"
              >
                <Lock className="size-3.5" />
                Invite
              </Link>
            )}

            {/* Group Chat — Pro only */}
            {isPro ? (
              <button
                onClick={() => setIsChatOpen(true)}
                data-html2canvas-ignore="true"
                className="flex items-center gap-2 rounded-lg border border-[rgba(244,164,96,0.4)] bg-[rgba(227,83,54,0.9)] px-4 py-2 text-white backdrop-blur-md shadow-[0_10px_24px_rgba(163,80,45,0.28)] transition-colors hover:bg-[rgba(227,83,54,1)]"
              >
                <MessageCircle className="size-4" />
                Group Chat
              </button>
            ) : (
              <Link
                href="/choose-plan"
                data-html2canvas-ignore="true"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-white/55 backdrop-blur-md"
              >
                <Lock className="size-3.5" />
                Group Chat
              </Link>
            )}

            {/* Download PDF — always available */}
            {activeView === "timeline" && (
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                data-html2canvas-ignore="true"
                className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-6 lg:px-12 space-y-6">
        
        {/* TOP ROW: Info & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center rounded-xl border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
            <h3 className="mb-4 font-display text-lg font-semibold text-(--color-text-primary)">Trip Overview</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="flex items-center gap-2 text-(--color-text-secondary)">
                  <Calendar className="size-4" /> Start Date
                </span>
                <span className="font-medium text-(--color-text-primary)">{trip.startDate}</span>
              </li>
              <li className="flex justify-between">
                <span className="flex items-center gap-2 text-(--color-text-secondary)">
                  <Clock className="size-4" /> Duration
                </span>
                <span className="font-medium text-(--color-text-primary)">
                  {trip.totalDays} Days
                </span>
              </li>
              <li className="flex justify-between">
                <span className="flex items-center gap-2 text-(--color-text-secondary)">
                  <Users className="size-4" /> Travelers
                </span>
                <span className="font-medium text-(--color-text-primary)">
                  {trip.travelers} people
                </span>
              </li>
              <li className="mt-4 flex justify-between gap-2 border-t border-(--color-border) pt-4">
                <span className="flex items-center gap-2 text-(--color-text-secondary)">
                  <Receipt className="size-4" /> Est. Budget
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(trip.totalBudget, trip.currency)}
                </span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl border border-(--color-border) bg-white shadow-(--shadow-sm) lg:col-span-2">
            <ItineraryMapRegion days={days} destination={trip.destination} country={trip.country} />
          </div>
        </div>

        {/* MAIN CONTENT — Full Width (no polls sidebar) */}
        <div className="space-y-6">
          {/* View Toggle */}
          <div className="flex w-full items-center justify-center sm:justify-start">
            <div 
              className="flex rounded-lg border border-(--color-border) bg-white p-1 shadow-(--shadow-xs)" 
              data-html2canvas-ignore="true"
            >
              <button
                onClick={() => setActiveView("timeline")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeView === "timeline"
                    ? "bg-(--color-sand-light) text-(--color-earth) shadow-(--shadow-xs)"
                    : "text-(--color-text-secondary) hover:bg-(--color-surface) hover:text-(--color-text-primary)"
                }`}
              >
                <MapPin className="size-4" />
                Timeline
              </button>
              <button
                onClick={() => setActiveView("calendar")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeView === "calendar"
                    ? "bg-(--color-sand-light) text-(--color-earth) shadow-(--shadow-xs)"
                    : "text-(--color-text-secondary) hover:bg-(--color-surface) hover:text-(--color-text-primary)"
                }`}
              >
                <Calendar className="size-4" />
                Calendar
              </button>
            </div>
          </div>

          {activeView === "calendar" ? (
            <TripCalendar itineraryId={id as string} days={days} />
          ) : (
            <TripTimeline days={days} />
          )}
        </div>
      </div>

      {/* GroupChat Slide-over — only render for pro */}
      {isPro && (
        <GroupChat
          itineraryId={id as string}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Invite Modal — only render for pro */}
      {isPro && isInviteOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-(--color-border) bg-white p-6 shadow-(--shadow-xl)">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-(--color-text-primary)">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite to Trip
              </h2>
              <button
                onClick={() => {
                  setIsInviteOpen(false);
                  setInviteStatus(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-tertiary) transition-colors hover:bg-(--color-surface) hover:text-(--color-text-secondary)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-(--color-text-primary)">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-lg border border-(--color-border) bg-white px-4 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-sand) focus:ring-2 focus:ring-[rgba(244,164,96,0.28)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-(--color-text-primary)">
                  Role
                </label>
                <div className="flex gap-2">
                  {["editor", "viewer"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition ${
                        inviteRole === r
                          ? "border-[rgba(244,164,96,0.45)] bg-(--color-sand-light) text-(--color-earth)"
                          : "border-(--color-border) bg-white text-(--color-text-secondary) hover:bg-(--color-surface)"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-(--color-text-primary)">
                  Personal Message (optional)
                </label>
                <textarea
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  placeholder="Hey! Join me on this trip..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-(--color-border) bg-white px-4 py-2.5 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-sand) focus:ring-2 focus:ring-[rgba(244,164,96,0.28)]"
                />
              </div>

              {inviteStatus && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    inviteStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[rgba(227,83,54,0.12)] text-[rgb(176,48,48)]"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-(--shadow-xs) transition-colors hover:bg-(--color-primary-hover) disabled:opacity-60"
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
