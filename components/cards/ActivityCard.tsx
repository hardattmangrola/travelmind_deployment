import Image from "next/image";
import {
  Clock,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import type { Activity } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ActivityCardProps {
  activity: Activity;
  onWishlistToggle?: (isWishlisted: boolean) => void;
  onAddToTrip?: () => void;
}

export function ActivityCard({
  activity,
  onWishlistToggle,
  onAddToTrip,
}: ActivityCardProps) {
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  const handleToggleWishlist = () => {
    const next = !wishlisted;
    setWishlisted(next);
    if (onWishlistToggle) {
      onWishlistToggle(next);
    }
  };

  return (
    <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100">
      <div className="relative h-40">
        <Image
          src={activity.image}
          alt={activity.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 288px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-500 shadow-sm">
          <Star className="h-3 w-3 text-amber-400" />
          <span className="text-[11px] text-slate-800">
            {activity.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:bg-white",
            wishlisted && "text-rose-500",
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <p className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {activity.category}
          </p>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">
            {activity.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {activity.city}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{activity.duration} min</span>
          </div>
          {activity.price > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              {formatCurrency(activity.price, activity.currency)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onAddToTrip}
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          Add to Trip
        </button>
      </div>
    </div>
  );
}

