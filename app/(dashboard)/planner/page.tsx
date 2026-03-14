"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";

const interestOptions = [
  "Beaches", "Temples", "Nightlife", "Food", "History",
  "Adventure", "Nature", "Shopping", "Art", "Wellness",
  "Photography", "Sports", "Wildlife", "Architecture", "Festivals",
];

const travelStyles = [
  { value: "relaxed", label: "Relaxed", emoji: "🧘" },
  { value: "balanced", label: "Balanced", emoji: "⚖️" },
  { value: "packed", label: "Action-Packed", emoji: "🏃" },
  { value: "luxury", label: "Luxury", emoji: "✨" },
  { value: "budget", label: "Budget", emoji: "💰" },
];

const examplePrompts = [
  "5 days in Bali with beaches, temples and local food",
  "A romantic week in Paris with museums and fine dining",
  "4 days adventure trip in Swiss Alps with hiking",
  "Cultural exploration of Kyoto during cherry blossom season",
];

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { generateItinerary, isGenerating, error, clearError } = useTripStore();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(50000);
  const [currency, setCurrency] = useState("INR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get("destination")) {
      setDestination(searchParams.get("destination")!);
    }
  }, [searchParams]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!destination.trim()) return;

    const result = await generateItinerary({
      destination: destination.trim(),
      description: description.trim(),
      budget,
      currency,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      travelers,
      travelStyle,
      interests,
    });

    if (result) {
      router.push(`/proposal`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Plan Your Dream Trip</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us about your ideal trip and AI will create a personalized itinerary
        </p>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap justify-center gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              const dest = prompt.split(" in ")[1]?.split(" with ")[0] || "";
              setDestination(dest);
              setDescription(prompt);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Destination *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Describe your trip</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your ideal trip — what activities, types of food, experiences..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dates + Travelers */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Travelers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Budget + Currency */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Budget</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={1000}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Travel Style</label>
          <div className="flex flex-wrap gap-2">
            {travelStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setTravelStyle(style.value)}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  travelStyle === style.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {style.emoji} {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest.toLowerCase())}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  interests.includes(interest.toLowerCase())
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating || !destination.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate My Itinerary
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
