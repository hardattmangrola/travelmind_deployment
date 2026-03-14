"use client";

import { useState, useEffect } from "react";
import { Poll, PollCard } from "./PollCard";
import { Loader2, Plus } from "lucide-react";

interface GroupVotingProps {
  itineraryId: string;
  currentUserId: string;
}

export function GroupVoting({ itineraryId, currentUserId }: GroupVotingProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New poll form state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolls = async () => {
    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls`);
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [itineraryId]);

  const handleCreatePoll = async () => {
    const validOptions = options.filter(o => o.trim() !== "");
    if (!question.trim() || validOptions.length < 2) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: validOptions }),
      });
      if (res.ok) {
        setQuestion("");
        setOptions(["", ""]);
        setIsCreating(false);
        fetchPolls(); // Refresh polls
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    // Optimistic UI updates could go here
    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        // Re-fetch polls strictly to get updated counts and avatars accurately
        fetchPolls();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Group Polls</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Poll
        </button>
      </div>

      {isCreating && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Ask a question (e.g. Which hotel?)"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-4"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="space-y-3 mb-4">
            {options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
              />
            ))}
            <button
              onClick={() => setOptions([...options, ""])}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              + Add another option
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePoll}
              disabled={submitting || !question.trim() || options.filter(o => o.trim()).length < 2}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Post Poll
            </button>
          </div>
        </div>
      )}

      {polls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-500 text-balance">
            No polls yet. Ask your group a question to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
