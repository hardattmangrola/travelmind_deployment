import type { BudgetBreakdown } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetBarProps {
  breakdown: BudgetBreakdown;
}

export function BudgetBar({ breakdown }: BudgetBarProps) {
  const { accommodation, activities, food, transport, total, currency } =
    breakdown;

  const safeTotal =
    total || accommodation + activities + food + transport || 1;

  const segments = [
    {
      key: "accommodation",
      label: "Accommodation",
      value: accommodation,
      color: "bg-indigo-500",
      dotColor: "bg-indigo-500",
    },
    {
      key: "activities",
      label: "Activities",
      value: activities,
      color: "bg-amber-500",
      dotColor: "bg-amber-500",
    },
    {
      key: "food",
      label: "Food",
      value: food,
      color: "bg-emerald-500",
      dotColor: "bg-emerald-500",
    },
    {
      key: "transport",
      label: "Transport",
      value: transport,
      color: "bg-rose-500",
      dotColor: "bg-rose-500",
    },
  ];

  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full w-full">
          {segments.map((segment) => {
            const width = Math.max(
              3,
              Math.round((segment.value / safeTotal) * 100),
            );
            return (
              <div
                key={segment.key}
                className={segment.color}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="flex items-center gap-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${segment.dotColor}`}
            />
            <span className="text-slate-500">{segment.label}</span>
            <span className="ml-auto font-medium text-slate-800">
              {formatCurrency(segment.value, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-lg font-semibold text-emerald-500">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

