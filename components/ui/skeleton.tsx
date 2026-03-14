import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-border)]/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[tm-skeleton_1.4s_ease-in-out_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
