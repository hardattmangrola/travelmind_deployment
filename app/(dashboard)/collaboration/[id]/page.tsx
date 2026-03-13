"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Users, UserPlus, Lightbulb, ThumbsUp, ThumbsDown, Plus, 
  MessageCircle, Send
} from "lucide-react";
import { sampleTrips, goaActivities } from "@/lib/placeholder-data";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PageProps {
  params: { id: string };
}

export default function CollaborationPage({ params }: PageProps) {
  const trip = sampleTrips[0];
  const [messages, setMessages] = useState([
    { id: 1, userId: "u2", name: "Priya Patel", text: "Are we still doing the Dudhsagar trek?", time: "10:30 AM" },
    { id: 2, userId: "me", name: "You", text: "Yes! But maybe on day 3 instead?", time: "10:32 AM" },
    { id: 3, userId: "u3", name: "Rohan", text: "I'm good with Day 3.", time: "10:45 AM" },
    { id: 4, userId: "u2", name: "Priya Patel", text: "Can we add one more beach day?", time: "11:00 AM" },
    { id: 5, userId: "me", name: "You", text: "I'll look for some options now.", time: "11:05 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), userId: "me", name: "You", text: chatInput, time: "Just now" }]);
    setChatInput("");
  };

  const suggestions = [
    { ...goaActivities[1], suggestedBy: "Priya", time: "2h ago", votesUp: 3, votesDown: 0 },
    { ...goaActivities[4], suggestedBy: "Rohan", time: "5h ago", votesUp: 1, votesDown: 2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{trip.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Collaboration Room</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-sm">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-700">3 online</span>
        </div>
      </div>

      {/* 3 COLUMN LAYOUT */}
      <div className="mx-auto mt-6 grid grid-cols-1 gap-6 px-6 lg:grid-cols-3">
        
        {/* COLUMN 1: Collaborators */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="size-4" />
              Team
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {trip.collaborators.length}
            </span>
          </div>

          <div className="space-y-4">
            {trip.collaborators.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className={cn("flex size-10 items-center justify-center rounded-full text-white font-bold text-sm shadow-sm", c.role === 'owner' ? 'bg-indigo-500' : 'bg-amber-500')}>
                    {c.name.charAt(0)}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 size-3 rounded-full border-2 border-white",
                    i < 3 ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className={cn("text-xs mt-0.5", i >= 3 ? "text-slate-400" : "text-emerald-600")}>
                    {i < 3 ? "Online now" : "Last seen 2m ago"}
                  </p>
                </div>
                <span className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  c.role === 'owner' ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-50 text-slate-600 border border-slate-200"
                )}>
                  {c.role}
                </span>
              </div>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600">
                <UserPlus className="size-4" />
                Invite someone
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900">
              <DialogHeader>
                <DialogTitle>Invite to Trip</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <input type="email" placeholder="Email address" className="w-full rounded-xl border border-slate-200 p-3 text-sm" />
                <button className="w-full rounded-xl bg-indigo-600 py-2.5 text-white text-sm font-medium hover:bg-indigo-700">Send Invite</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* COLUMN 2: Suggestions */}
        <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-[600px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Lightbulb className="size-4" />
              Suggestions
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {suggestions.length}
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pb-20 scrollbar-hide">
            {suggestions.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition hover:border-slate-200">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] text-indigo-700 font-bold">
                      {s.suggestedBy.charAt(0)}
                    </div>
                    <span><strong className="text-slate-700">{s.suggestedBy}</strong> suggested</span>
                  </div>
                  <span>{s.time}</span>
                </div>

                <div className="mt-3 flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <Image src={s.image} alt={s.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{s.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200 text-slate-600 capitalize">{s.category}</span>
                      <span className="font-semibold text-indigo-600">{formatCurrency(s.price, s.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                      <ThumbsUp className="size-3.5" /> {s.votesUp}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                      <ThumbsDown className="size-3.5" /> {s.votesDown}
                    </button>
                  </div>
                  <button className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                    Add to Trip
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-5 bottom-5">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow">
              <Plus className="size-4" />
              Suggest an Activity
            </button>
          </div>
        </div>

        {/* COLUMN 3: Discussion */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-[600px]">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 shrink-0 mb-4">
            <MessageCircle className="size-4" />
            Discussion
          </h2>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide flex flex-col">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col max-w-[85%]", m.userId === "me" ? "self-end items-end" : "self-start items-start")}>
                {m.userId !== "me" && (
                  <div className="flex items-center gap-1.5 mb-1 pl-1">
                    <div className="size-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">{m.name}</span>
                  </div>
                )}
                
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  m.userId === "me" 
                    ? "bg-indigo-600 text-white rounded-tr-sm" 
                    : "bg-slate-100 text-slate-900 rounded-tl-sm border border-slate-200"
                )}>
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 shrink-0 flex items-center gap-3 border-t border-slate-100 pt-4">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <button 
              onClick={handleSend}
              className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
