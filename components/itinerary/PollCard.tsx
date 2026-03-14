"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2 } from "lucide-react";

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: Vote[];
}

export interface Poll {
  id: string;
  itineraryId: string;
  question: string;
  createdBy: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  options: PollOption[];
}

interface PollCardProps {
  poll: Poll;
  currentUserId: string;
  onVote: (pollId: string, optionId: string) => Promise<void>;
}

export function PollCard({ poll, currentUserId, onVote }: PollCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  const handleVote = async (optionId: string) => {
    setIsVoting(true);
    await onVote(poll.id, optionId);
    setIsVoting(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{poll.question}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVotedMe = option.votes.some((v) => v.userId === currentUserId);

          return (
            <div
              key={option.id}
              onClick={() => !isVoting && handleVote(option.id)}
              className={`relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-colors ${
                hasVotedMe
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {/* Progress background indicator */}
              <div 
                className="absolute inset-y-0 left-0 bg-indigo-100/50 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
              
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex shrink-0 h-5 w-5 items-center justify-center rounded-full border ${
                    hasVotedMe ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                  }`}>
                    {hasVotedMe && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm font-medium truncate ${hasVotedMe ? "text-indigo-900" : "text-slate-700"}`}>
                    {option.text}
                  </span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {percentage}%
                  </span>
                  {voteCount > 0 && (
                    <div className="relative flex -space-x-2 overflow-hidden">
                      {option.votes.map((vote) => (
                        <Avatar key={vote.id} className="inline-block h-6 w-6 border-2 border-white">
                          <AvatarImage src={vote.user.image || undefined} alt={vote.user.name} />
                          <AvatarFallback className="text-[10px]">
                            {vote.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Avatar className="h-5 w-5">
          <AvatarImage src={poll.author?.image || undefined} alt={poll.author?.name} />
          <AvatarFallback>{poll.author?.name?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
        <span>Asked by {poll.author?.name}</span>
      </div>
    </div>
  );
}
