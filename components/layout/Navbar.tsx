"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plane, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Destinations", href: "/search" },
  { label: "Itineraries", href: "/dashboard" },
  { label: "Chat", href: "/chat" },
  { label: "Invitations", href: "/invitations" },
  { label: "Planner", href: "/planner" },
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/signin";
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,255,255,0.95)] backdrop-blur-md">
      <div className="tm-container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(244,164,96,0.4)] bg-[color:var(--color-sand-light)] text-primary shadow-[var(--shadow-xs)]">
            <Plane className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            TravelMind
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[15px] font-medium text-[color:var(--color-text-secondary)] transition-all duration-150 ease-out hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-earth)]",
                  isActive && "bg-[color:var(--color-sand-light)] font-semibold text-[color:var(--color-earth)]",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-white)] text-[color:var(--color-text-secondary)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)] hover:bg-[color:var(--color-sand-light)] hover:text-[color:var(--color-earth)]"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-white)] px-4 py-2 text-[15px] font-medium text-[color:var(--color-earth)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)] hover:bg-[color:var(--color-sand-light)]"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {getInitials(session.user?.name || "U")}
                  </div>
                )}
                <span className="max-w-[100px] truncate">
                  {session.user?.name || "Dashboard"}
                </span>
              </Link>
            </div>
          ) : (
            <Link href="/signup" className="tm-btn-primary py-2.5">
              Sign Up
            </Link>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-white)] text-[color:var(--color-earth)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)] hover:bg-[color:var(--color-sand-light)] md:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[var(--radius-lg)] border-[color:var(--color-border)] bg-[color:var(--color-white)] p-0" showCloseButton={false}>
            <SheetHeader className="px-6 pt-6 pb-2 text-left">
              <SheetTitle className="font-display text-2xl text-primary">TravelMind</SheetTitle>
              <SheetDescription className="text-[color:var(--color-text-secondary)]">Plan your next trip with confidence.</SheetDescription>
            </SheetHeader>
            <nav className="space-y-1 px-4 pb-6">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block min-h-11 rounded-[var(--radius-md)] px-4 py-3 text-[15px] text-[color:var(--color-earth)] transition-colors duration-150 ease-out hover:bg-[color:var(--color-surface)]",
                      isActive && "bg-[color:var(--color-sand-light)] font-semibold text-[color:var(--color-earth)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-sand-light)] px-4 py-3 text-[15px] font-medium text-[color:var(--color-earth)] transition-all duration-150 ease-out hover:border-[color:var(--color-sand)]"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Sign Out
                </button>
              ) : (
                <Link href="/signup" className="tm-btn-primary mt-3 w-full">
                  Sign Up
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
