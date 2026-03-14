"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Search,
  Sparkles,
  Heart,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

interface DashboardLayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Explore", icon: Search, href: "/search" },
  { label: "Plan", icon: Sparkles, href: "/planner" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
] as const;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { newCount } = useWishlistStore();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-cream)]">
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-white)] px-8 py-7 shadow-[var(--shadow-sm)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-[color:var(--color-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar />

      <SidebarInset className="min-h-screen bg-[color:var(--color-cream)]">
        <main className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pb-24 pt-6 lg:px-10 md:pb-10 md:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-[rgba(255,255,255,0.95)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/" || pathname.startsWith(item.href)
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-1 flex-col items-center gap-1 text-xs font-medium transition-colors duration-150 ease-out",
                  isActive ? "text-[color:var(--color-earth)]" : "text-[color:var(--color-text-tertiary)]",
                )}
              >
                <div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 ease-out",
                    isActive ? "border border-[color:rgba(244,164,96,0.35)] bg-[color:var(--color-sand-light)]" : "bg-transparent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label === "Wishlist" && newCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white shadow-xs ring-2 ring-white">
                      {newCount > 9 ? "9+" : newCount}
                    </span>
                  )}
                </div>
                <span className={cn(isActive ? "opacity-100" : "opacity-80")}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </SidebarProvider>
  );
}
